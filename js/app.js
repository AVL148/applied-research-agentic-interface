import { APP_NAME, PROJECT, STEPS, TECHNIQUES, FILTERS, VIDEO_SPEED } from './data.js';
import {
  loadState, saveState, resetState, currentStepId, stepStatus, completeStep,
  toggleSaved, markViewed, resetLearningPlan, appendChat, filterTechniques,
  setVideoMeta, clearVideo, setAnalysis, setSegmentStep, adoptAnalysis, discardAnalysis, segmentForStep,
} from './store.js';
import { askCoach } from './coach.js';
import { getAiStatus, postJson, resetStatusCache } from './api.js';
import { t as tr, LANG, LANGS, setLang } from './i18n.js';
import { GUIDES, PLANS } from './guides.js';
import { drawing } from './diagrams.js';
import { saveVideo, loadVideo, deleteVideo, readVideoInfo, extractFrames, sampleAnalysis } from './video.js';

let state = loadState();
const persist = () => saveState(state);

// Tijdelijke UI-staat (niet bewaard)
const ui = {
  playing: false,
  pos: 0,
  timer: null,
  phase: 'learn', // 'learn' | 'reflect' | 'done'
  choice: '',
  note: '',
  search: { query: '', craft: 'All', level: 'All' },
  videoUrl: null,
  plan: {},
  analyzing: false,
  status: '',
  statusIsError: false,
};

const $ = (sel, root = document) => root.querySelector(sel);
const main = $('#main');

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const stepById = (id) => STEPS.find((s) => s.id === id);
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- Navigatie ---------- */

const NAV = [
  ['#/', tr('Dashboard'), 'dashboard'],
  ['#/project', tr('Project'), 'project'],
  ['#/video', tr('Video analysis'), 'video'],
  ['#/techniques', tr('Techniques'), 'techniques'],
  ['#/saved', tr('Saved'), 'saved'],
];

function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  const [name, arg] = hash.split('/');
  if (name === 'step') return { name: 'step', id: Number(arg) };
  if (name === 'technique') return { name: 'technique', id: arg };
  if (['project', 'video', 'techniques', 'saved'].includes(name)) return { name };
  return { name: 'dashboard' };
}

function renderNav(r) {
  const active = r.name === 'step' ? 'project' : r.name === 'technique' ? 'techniques' : r.name;
  $('#nav').innerHTML = `<ul>${NAV.map(([href, label, key]) =>
    `<li><a href="${href}" ${key === active ? 'aria-current="page"' : ''}>${label}${key === 'opgeslagen' && state.saved.length ? ` <span class="count" aria-label="${state.saved.length} saved">${state.saved.length}</span>` : ''}</a></li>`).join('')}</ul>`;
}

function render({ focus = true } = {}) {
  const r = route();
  renderNav(r);
  if (r.name === 'step') {
    const step = stepById(r.id);
    if (!step) { location.hash = '#/project'; return; }
    renderTutorial(step);
  } else if (r.name === 'technique') {
    if (!TECHNIQUES.find((t) => t.id === r.id)) { location.hash = '#/techniques'; return; }
    renderTechnique(r.id);
  } else if (r.name === 'project') renderProject();
  else if (r.name === 'video') renderVideoPage();
  else if (r.name === 'techniques') renderSearch();
  else if (r.name === 'saved') renderSaved();
  else renderDashboard();
  if (focus) {
    const h = $('h1', main);
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    window.scrollTo({ top: 0 });
  }
}

/* ---------- Gedeelde onderdelen ---------- */

function progressBar(done, total) {
  const pct = Math.round((done / total) * 100);
  return `<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}" aria-label="Progress: ${done} of ${total} steps"><span style="width:${pct}%"></span></div>`;
}

// Simple illustration of the folding stage (not a real photo or video).
function paperArt(stage = 1) {
  const crease = 'stroke="#8b6b4a" stroke-width="1.6" stroke-dasharray="5 4" fill="none"';
  const paper = 'fill="#e8c9a0" stroke="#8b6b4a" stroke-width="3" stroke-linejoin="round"';
  const dark = 'fill="#c98a5a" stroke="#8b6b4a" stroke-width="3" stroke-linejoin="round"';
  let body;
  if (stage <= 2) {
    body = `<rect x="60" y="20" width="140" height="140" ${paper}/>
      <line x1="60" y1="20" x2="200" y2="160" ${crease}/><line x1="200" y1="20" x2="60" y2="160" ${crease}/>
      ${stage >= 2 ? `<line x1="130" y1="20" x2="130" y2="160" ${crease}/><line x1="60" y1="90" x2="200" y2="90" ${crease}/>` : ''}`;
  } else if (stage === 3) {
    body = `<rect x="80" y="40" width="100" height="100" ${paper}/><line x1="130" y1="40" x2="130" y2="140" ${crease}/>
      <polygon points="130,140 105,95 155,95" ${dark}/>`;
  } else if (stage <= 5) {
    body = `<polygon points="130,14 190,92 130,166 70,92" ${paper}/><line x1="130" y1="14" x2="130" y2="166" ${crease}/>
      <line x1="70" y1="92" x2="190" y2="92" ${crease}/>`;
  } else if (stage === 6) {
    body = `<polygon points="130,14 175,92 150,166 130,120 110,166 85,92" ${paper}/><line x1="130" y1="14" x2="130" y2="120" ${crease}/>`;
  } else if (stage === 7) {
    body = `<polygon points="130,50 175,92 205,40 195,110 150,150 110,150 60,110 55,40 85,92" ${paper}/>`;
  } else {
    body = `<polygon points="125,95 80,40 20,70 105,115" ${dark}/><polygon points="135,95 180,40 240,70 155,115" ${dark}/>
      <polygon points="95,130 130,95 165,130 130,170" ${paper}/><polygon points="130,100 120,60 138,52 134,100" ${paper}/>
      <polygon points="128,170 108,176 132,150" ${paper}/>`;
  }
  return `<svg viewBox="0 0 260 180" role="img" aria-label="${tr('Illustration of the folding stage (placeholder)')}" class="loom">${body}</svg>`;
}

/* ---------- 1. Dashboard ---------- */

function videoSummary() {
  if (!state.video) return tr('No video uploaded yet.');
  const a = state.analysis;
  const status = !a ? tr('not analysed yet') : a.adopted ? tr('analysis used in your learning path') : tr('analysis ready, not adopted yet');
  return `${esc(state.video.name)} · ${fmt(state.video.duration)} · ${status}`;
}

function renderDashboard() {
  const done = state.completed.length;
  const total = STEPS.length;
  const cur = currentStepId(state);
  const step = cur ? stepById(cur) : null;
  const savedTech = TECHNIQUES.filter((t) => state.saved.includes(t.id));
  const recent = state.recent.map(stepById).filter(Boolean);

  main.innerHTML = `
    <section class="hero">
      <p class="eyebrow">${tr('Welcome back')}</p>
      <h1>${tr('Good to see you again.')}</h1>
      <p class="lede">${tr('You set the pace. Carry on where you left off, or look back at an explanation first.')}</p>
    </section>

    <section class="card project-card" aria-labelledby="active-title">
      <div class="project-art">${paperArt(Math.min(done + 1, STEPS.length))}</div>
      <div class="project-body">
        <p class="eyebrow">${tr('Active project')}</p>
        <h2 id="active-title">${esc(PROJECT.title)}</h2>
        <p class="muted">${step ? tr('Step {id} of {total}', { id: step.id, total }) : tr('All steps completed')} · ${tr('{done} of {total} steps done', { done, total })}</p>
        ${progressBar(done, total)}
        <p class="next"><strong>${tr('Next action:')}</strong> ${step ? `${esc(step.title)}. ${esc(step.demoCaption)}` : tr('Look at your project again or start something new.')}</p>
        <div class="row">
          ${step
            ? `<a class="btn btn-primary" href="#/step/${step.id}">${tr('Continue my project')}</a>`
            : `<a class="btn btn-primary" href="#/project">${tr('Go to my project')}</a>`}
          <a class="btn" href="#/project">${tr('View learning path')}</a>
        </div>
      </div>
    </section>

    <div class="cards">
      <section class="card" aria-labelledby="video-title">
        <h2 id="video-title" class="h3">${tr('Reference video')}</h2>
        <p class="${state.video ? '' : 'muted'}">${videoSummary()}</p>
        <a class="link" href="#/video">${state.video ? 'Go to video analysis' : 'Upload and analyse a video'}</a>
      </section>
      <section class="card" aria-labelledby="saved-title">
        <h2 id="saved-title" class="h3">${tr('Saved techniques')}</h2>
        ${savedTech.length
          ? `<ul class="plain">${savedTech.slice(0, 3).map((t) => `<li><strong>${esc(t.name)}</strong><span class="muted"> · ${esc(tr(t.craft))}, ${esc(tr(t.level))}</span></li>`).join('')}</ul>
             <a class="link" href="#/saved">${tr('View all')}</a>`
          : `<p class="muted">${tr('Nothing saved yet.')} <a class="link" href="#/techniques">${tr('Find a technique')}</a>.</p>`}
      </section>
      <section class="card" aria-labelledby="recent-title">
        <h2 id="recent-title" class="h3">${tr('Recently viewed demonstrations')}</h2>
        ${recent.length
          ? `<ul class="plain">${recent.map((s) => `<li><a class="link" href="#/step/${s.id}">Step ${s.id}: ${esc(s.demoTitle)}</a></li>`).join('')}</ul>`
          : `<p class="muted">${tr('You have not viewed any demonstrations yet.')}</p>`}
      </section>
    </div>`;
}

/* ---------- 2. Project workspace ---------- */

function renderProject() {
  const done = state.completed.length;
  const total = STEPS.length;
  const cur = currentStepId(state);

  main.innerHTML = `
    <section class="project-head">
      <div class="project-art small">${paperArt(Math.min(done + 1, STEPS.length))}</div>
      <div>
        <p class="eyebrow">Project · ${esc(PROJECT.level)}</p>
        <h1>${esc(PROJECT.title)}</h1>
        <p class="lede">${esc(PROJECT.summary)}</p>
        ${progressBar(done, total)}
        <p class="muted">${tr('{done} of {total} steps done', { done, total })}</p>
        ${cur ? `<a class="btn btn-primary" href="#/step/${cur}">${state.chats[cur] || state.recent.includes(cur) ? tr('Continue step') : tr('Start step')}: ${esc(stepById(cur).title)}</a>` : `<p class="notice ok">${tr('All steps are completed. Well done!')}</p>`}
      </div>
    </section>

    <section aria-labelledby="path-title">
      <h2 id="path-title" class="h3">${tr('Learning path')}</h2>
      <ol class="path">
        ${STEPS.map((s) => {
          const st = stepStatus(state, s.id);
          const label = { done: tr('Completed'), current: tr('Current step'), upcoming: tr('Coming up') }[st];
          const action = st === 'done' ? tr('Open again') : st === 'current' ? tr('Start') : tr('Preview');
          const seg = segmentForStep(state, s.id);
          return `<li class="path-item ${st}">
            <span class="dot" aria-hidden="true">${st === 'done' ? '✓' : s.id}</span>
            <div class="path-text">
              <strong>${esc(s.title)}</strong>
              <span class="muted">${label}${seg ? ` · ${tr('video segment')} ${fmt(seg.start)}–${fmt(seg.end)}` : ''}</span>
            </div>
            <a class="btn ${st === 'current' ? 'btn-primary' : ''}" href="#/step/${s.id}" aria-label="${action}: ${esc(s.title)}">${action}</a>
          </li>`;
        }).join('')}
      </ol>
    </section>`;
}

/* ---------- Step-by-step plan with drawings ---------- */

const plansFor = (key) => (key[0] === 't' ? GUIDES[key]?.steps : PLANS[Number(key.slice(1))]) || [];

function stepperMarkup(key) {
  const frames = plansFor(key);
  if (!frames.length) return '';
  const i = Math.max(0, Math.min(ui.plan[key] ?? 0, frames.length - 1));
  const f = frames[i];
  return `<div class="stepper" data-key="${key}">
    <div class="sp-view">${drawing(f.shapes, tr('Drawing for step {i}: {title}', { i: i + 1, title: f.title }))}</div>
    <div class="sp-body">
      <p class="eyebrow">${tr('Step {i} of {n}', { i: i + 1, n: frames.length })}</p>
      <h3 class="h4">${esc(f.title)}</h3>
      <p>${esc(f.text)}</p>
      ${f.tip ? `<p class="tip"><strong>${tr('Tip:')}</strong> ${esc(f.tip)}</p>` : ''}
      <div class="row">
        <button type="button" class="btn" data-sp="prev" ${i === 0 ? 'disabled' : ''}>${tr('← Previous')}</button>
        <button type="button" class="btn btn-primary" data-sp="next" ${i === frames.length - 1 ? 'disabled' : ''}>${tr('Next →')}</button>
      </div>
    </div>
    <ol class="sp-thumbs" aria-label="${tr('All steps')}">${frames.map((fr, j) =>
      `<li><button type="button" class="thumb ${j === i ? 'on' : ''}" data-sp="go" data-i="${j}" ${j === i ? 'aria-current="step"' : ''} aria-label="${tr('Step {i}: {title}', { i: j + 1, title: fr.title })}">${drawing(fr.shapes, '')}<span>${j + 1}</span></button></li>`).join('')}</ol>
  </div>`;
}

function renderTechnique(id) {
  const t = TECHNIQUES.find((x) => x.id === id);
  const g = GUIDES[id];
  const isSaved = state.saved.includes(id);
  main.innerHTML = `
    <nav class="crumbs" aria-label="${tr('Breadcrumb')}"><a href="#/techniques">${tr('Techniques')}</a> <span aria-hidden="true">/</span> ${esc(t.name)}</nav>
    <article class="guide">
      <header>
        <p class="eyebrow">${esc(tr(t.craft))} · ${esc(tr(t.level))} · ${esc(t.material)}</p>
        <h1>${esc(t.name)}</h1>
        <p class="lede">${esc(g ? g.goal : t.description)}</p>
        <div class="row">
          <button type="button" class="btn ${isSaved ? 'btn-on' : ''}" data-save="${t.id}" aria-pressed="${isSaved}">${isSaved ? `✓ ${tr('Saved')}` : tr('Save')}</button>
          <a class="btn btn-quiet" href="#/techniques">${tr('← All techniques')}</a>
        </div>
      </header>
      ${g ? `
      <section class="card" aria-labelledby="needs-t"><h2 id="needs-t" class="h3">${tr('What do you need?')}</h2>
        <ul>${g.needs.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></section>
      <section aria-labelledby="plan-t"><h2 id="plan-t" class="h3">${tr('Step-by-step plan')}</h2>${stepperMarkup(id)}</section>
      <section class="card" aria-labelledby="mist-t"><h2 id="mist-t" class="h3">${tr('Common mistakes')}</h2>
        <ul>${g.mistakes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></section>
      <section class="card small" aria-labelledby="src-t"><h2 id="src-t" class="h4">${tr('Sources')}</h2>
        <p class="muted">${tr('The drawings were made for this interface in the usual diagram style: a dashed line is a valley fold, a dash-dot line is a mountain fold, a dotted grey line is hidden paper behind, and an arrow is the movement.')}</p>
        ${g.sources.length
          ? `<ul>${g.sources.map((s) => `<li><a class="link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a></li>`).join('')}</ul>`
          : `<p class="muted">${tr('This is a research technique of this prototype; there is no external source for it.')}</p>`}
      </section>` : `<p class="notice">${tr('There is no step-by-step plan for this technique yet.')}</p>`}
    </article>`;
}

function moveStepper(btn) {
  const box = btn.closest('.stepper');
  if (!box) return;
  const key = box.dataset.key;
  const n = plansFor(key).length;
  const cur = ui.plan[key] ?? 0;
  const act = btn.dataset.sp;
  ui.plan[key] = act === 'prev' ? Math.max(0, cur - 1) : act === 'next' ? Math.min(n - 1, cur + 1) : Number(btn.dataset.i);
  box.outerHTML = stepperMarkup(key);
  const again = main.querySelector(`.stepper[data-key="${key}"]`);
  const target = act === 'go' ? again.querySelector(`.thumb[data-i="${ui.plan[key]}"]`) : again.querySelector(`[data-sp="${act}"]:not([disabled])`) || again.querySelector('.btn-primary');
  target?.focus({ preventScroll: true });
}

/* ---------- 3-5. Tutorial, coach, reflection ---------- */

function demoMarkup(step) {
  if (ui.videoUrl) {
    const seg = segmentForStep(state, step.id);
    return `<section class="demo" aria-labelledby="demo-title">
      <div class="video-wrap"><video id="vid" controls playsinline preload="metadata" src="${ui.videoUrl}">${tr('Your browser cannot play this video.')}</video></div>
      <div class="demo-info">
        <h2 id="demo-title" class="h4">${esc(step.demoTitle)}</h2>
        ${seg
          ? `<p><strong>${tr('Segment from the video:')}</strong> ${esc(seg.title)} (${fmt(seg.start)}–${fmt(seg.end)}) <span class="badge soft">${seg.source === 'reference' ? tr('fixed layout') : state.analysis?.source === 'ai' ? tr('AI analysis') : tr('sample')}</span></p>
             ${seg.description ? `<p class="muted">${esc(seg.description)}</p>` : ''}`
          : `<p class="muted">${tr('This step is not linked to a segment of your video yet.')} <a class="link" href="#/video">${tr('Go to video analysis')}</a></p>`}
      </div>
      <div class="controls">
        ${seg ? `<button type="button" class="btn btn-primary" data-segplay="${seg.start},${seg.end}">▶ ${tr('Play this segment')}</button>
        <button type="button" class="btn" data-segplay="${seg.start},${seg.end}">↺ ${tr('Repeat segment')}</button>` : ''}
      </div>
    </section>`;
  }
  return `<section class="card extra" aria-labelledby="demo-title">
    <h2 id="demo-title" class="h4">${tr('Extra: your own video for this step')}</h2>
    <p class="muted">${tr('The step-by-step plan above works without a video. If you do want a video alongside, upload it under Video analysis: the video then jumps to the right part for this step.')}</p>
    <a class="btn" href="#/video">${tr('Go to video analysis')}</a>
  </section>`;
}

function renderTutorial(step) {
  const st = stepStatus(state, step.id);
  const isDone = st === 'done';
  ui.phase = 'learn';
  ui.choice = '';
  ui.note = '';
  state = markViewed(state, step.id);
  persist();

  const prev = STEPS.find((s) => s.id === step.id - 1);
  const next = STEPS.find((s) => s.id === step.id + 1);

  main.innerHTML = `
    <nav class="crumbs" aria-label="${tr('Breadcrumb')}"><a href="#/project">${esc(PROJECT.title)}</a> <span aria-hidden="true">/</span> ${tr('Step {id} of {total}', { id: step.id, total: STEPS.length })}</nav>
    <div class="tutorial">
      <div class="tut-main">
        <header>
          <p class="eyebrow">${tr('Step')} ${step.id} ${isDone ? `· <span class="badge">${tr('Completed')}</span>` : st === 'upcoming' ? `· <span class="badge soft">${tr('Not your turn yet')}</span>` : ''}</p>
          <h1>${esc(step.title)}</h1>
        </header>

        <section aria-labelledby="plan-title" class="plan">
          <h2 id="plan-title" class="h3">${tr('Step-by-step plan with drawings')}</h2>
          ${stepperMarkup('s' + step.id)}
        </section>

        <section aria-labelledby="inst-title" class="card">
          <h2 id="inst-title" class="h3">${tr('How to proceed')}</h2>
          <ol class="instr" id="instr">
            ${step.instructions.map((t, i) => `<li data-i="${i}">${esc(t)}</li>`).join('')}
          </ol>
          <p class="tip"><strong>${tr('Note:')}</strong> ${esc(step.tip)}</p>
        </section>

        ${demoMarkup(step)}

        <section id="finish" aria-labelledby="fin-title" class="card"></section>

        <div class="step-nav">
          ${prev ? `<a class="btn btn-quiet" href="#/step/${prev.id}">${tr('← Previous step')}</a>` : '<span></span>'}
          <a class="btn btn-quiet" href="#/project">${tr('Back to project')}</a>
          ${next ? `<a class="btn btn-quiet" href="#/step/${next.id}">${tr('Next step →')}</a>` : '<span></span>'}
        </div>
      </div>

      <aside class="coach-panel" aria-labelledby="coach-title">
        <div class="coach-head">
          <h2 id="coach-title" class="h3">${tr('Coach')}</h2>
          <span class="chip" id="coach-chip">${tr('Prototype')}</span>
        </div>
        <p class="muted small" id="coach-note">${tr('Checking whether the AI is connected…')}</p>
        <div id="coach-log" class="log" role="log" aria-live="polite" aria-label="${tr('Conversation with the coach')}"></div>
        <div class="quick">
          <button type="button" class="btn" data-coach="explain">${tr('Explain differently')}</button>
          <button type="button" class="btn" data-coach="hint">${tr('Give me a hint')}</button>
        </div>
        <form id="ask" class="ask">
          <label for="q">${tr('Ask the coach')}</label>
          <div class="ask-row">
            <input id="q" name="q" type="text" autocomplete="off" placeholder="${tr('For example: my fold is coming out crooked')}" maxlength="300">
            <button class="btn btn-primary" type="submit">${tr('Send')}</button>
          </div>
        </form>
      </aside>
    </div>`;

  bindVideo($('#vid'), segmentForStep(state, step.id));
  renderFinish(step);
  renderCoachLog(step);
  getAiStatus().then(updateCoachInfo);
  if (!(state.chats[step.id] || []).length) welcome(step);
}

function updateCoachInfo(status) {
  const chip = $('#coach-chip');
  const note = $('#coach-note');
  if (!chip || !note) return;
  if (status.connected) {
    chip.textContent = tr('Claude connected');
    chip.classList.add('on');
    note.textContent = tr('Answers come from Claude via the server. The coach cannot see your paper and does nothing in your project; you decide.');
  } else {
    chip.textContent = tr('Prototype');
    chip.classList.remove('on');
    note.textContent = tr('AI not connected: answers come from local sample rules. The coach does nothing in your project; you decide.');
  }
}

/* Video element: play a segment and stop at the end */

function bindVideo(vid, seg = null) {
  if (!vid) return;
  vid.defaultPlaybackRate = VIDEO_SPEED;
  const start = () => {
    vid.playbackRate = VIDEO_SPEED;
    if (seg) {
      vid.currentTime = seg.start;
      vid.dataset.end = String(seg.end);
    }
  };
  if (vid.readyState >= 1) start(); else vid.addEventListener('loadedmetadata', start, { once: true });
  vid.addEventListener('timeupdate', () => {
    const end = Number(vid.dataset.end);
    if (end && vid.currentTime >= end) { vid.pause(); vid.dataset.end = ''; }
  });
  // Opnieuw afspelen na het einde van het fragment: niet meteen weer stoppen.
  vid.addEventListener('play', () => {
    const end = Number(vid.dataset.end);
    if (end && vid.currentTime >= end - 0.3) vid.dataset.end = '';
  });
}

function playSegment(start, end) {
  const vid = $('#vid');
  if (!vid) return;
  vid.dataset.end = String(end);
  vid.currentTime = start;
  vid.playbackRate = VIDEO_SPEED;
  vid.play().catch(() => {});
}

/* Finish + reflection: progress only changes after explicit confirmation */

function renderFinish(step) {
  const box = $('#finish');
  const done = state.completed.includes(step.id);
  const saved = state.reflections[step.id];

  if (ui.phase === 'done') {
    const next = STEPS.find((s) => !state.completed.includes(s.id));
    box.innerHTML = `
      <h2 id="fin-title" class="h3">${tr('Step completed')}</h2>
      <p class="notice ok" role="status">${tr('Nice, “{title}” is now marked as completed. Your progress has been updated: {done} of {total} steps.', { title: esc(step.title), done: state.completed.length, total: STEPS.length })}</p>
      ${next ? `<div class="prep"><p class="eyebrow">${tr('Preparing for the next step')}</p>
        <p><strong>${tr('Step')} ${next.id}: ${esc(next.title)}</strong></p>
        <p class="muted">${esc(next.tip)}</p></div>
        <div class="row">
          <a class="btn btn-primary" href="#/step/${next.id}">${tr('Continue with step {id}', { id: next.id })}</a>
          <a class="btn" href="#/project">${tr('Back to project')}</a>
        </div>`
        : `<p>${tr('That was the last step. Your project is done.')}</p><div class="row"><a class="btn btn-primary" href="#/project">${tr('Back to project')}</a></div>`}`;
    return;
  }

  if (ui.phase === 'reflect') {
    const r = step.reflection;
    box.innerHTML = `
      <h2 id="fin-title" class="h3">${tr('A quick look back')}</h2>
      <form id="reflect" novalidate>
        <fieldset>
          <legend>${esc(r.question)}</legend>
          ${r.options.map((o) => `<label class="opt"><input type="radio" name="choice" value="${esc(o)}" ${ui.choice === o ? 'checked' : ''}> <span>${esc(o)}</span></label>`).join('')}
        </fieldset>
        <label for="note" class="field-label">${tr('Would you like to add a note? (optional)')}</label>
        <textarea id="note" rows="3" maxlength="500">${esc(ui.note)}</textarea>
        <div class="row">
          <button type="submit" class="btn btn-primary">${tr('Confirm and complete step')}</button>
          <button type="button" class="btn" id="skip-reflect">${tr('Skip reflection and complete')}</button>
          <button type="button" class="btn btn-quiet" id="back-practice">${tr('Not yet, back to practising')}</button>
        </div>
      </form>`;
    return;
  }

  if (done) {
    box.innerHTML = `
      <h2 id="fin-title" class="h3">${tr('This step is completed')}</h2>
      ${saved && !saved.skipped
        ? `<p><strong>${tr('Your reflection:')}</strong> ${esc(saved.choice || 'no choice')}${saved.note ? ` · “${esc(saved.note)}”` : ''}</p>`
        : `<p class="muted">${tr('You skipped the reflection.')}</p>`}
      <p class="muted">${tr('You can always look at the explanation again.')}</p>`;
  } else {
    box.innerHTML = `
      <h2 id="fin-title" class="h3">${tr('Try it yourself')}</h2>
      <p>${tr('Take your time to try it yourself. Only when you say so does the step count towards your progress.')}</p>
      <div class="row">
        <button type="button" class="btn btn-primary" id="tried">${tr('I have tried this')}</button>
        <button type="button" class="btn" id="mark-done">${tr('Mark as completed')}</button>
      </div>`;
  }
}

function finishStep(step, reflection) {
  state = completeStep(state, step.id, reflection);
  persist();
  ui.phase = 'done';
  renderFinish(step);
  renderNav(route());
  toast(tr('Step completed and saved'));
  $('#fin-title')?.setAttribute('tabindex', '-1');
  $('#fin-title')?.focus();
}

/* Coach conversation */

function renderCoachLog(step) {
  const log = $('#coach-log');
  if (!log) return;
  const msgs = state.chats[step.id] || [];
  log.innerHTML = msgs.map((m) => `<div class="msg ${m.from}">
    <span class="who">${m.from === 'you' ? 'You' : `Coach · ${m.simulated === false ? 'Claude' : 'sample'}`}</span>
    <p>${esc(m.text)}</p>
    ${m.followUp ? `<p class="follow">${esc(m.followUp)}</p>` : ''}
    ${m.notice ? `<p class="small muted">${esc(m.notice)}</p>` : ''}
  </div>`).join('') + (pending > 0 ? `<div class="msg coach"><span class="who">${tr('Coach')}</span><p class="muted">${tr('Thinking…')}</p></div>` : '');
  log.scrollTop = log.scrollHeight;
}

// Berichten worden na elkaar afgehandeld, zodat er niets verloren gaat.
let chain = Promise.resolve();
let pending = 0;
function talk(step, kind, question = '') {
  pending++;
  chain = chain.then(() => talkNow(step, kind, question));
  return chain;
}

async function talkNow(step, kind, question = '') {
  const history = state.chats[step.id] || [];
  if (kind === 'question') state = appendChat(state, step.id, [{ from: 'you', text: question }]);
  if (kind === 'explain') state = appendChat(state, step.id, [{ from: 'you', text: tr('Explain differently.') }]);
  if (kind === 'hint') state = appendChat(state, step.id, [{ from: 'you', text: tr('Give me a hint.') }]);
  if (route().id === step.id) renderCoachLog(step);
  try {
    const reply = await askCoach({ kind, step, question, history, segment: segmentForStep(state, step.id) });
    state = appendChat(state, step.id, [{ from: 'coach', kind, text: reply.text, followUp: reply.followUp, simulated: reply.simulated, notice: reply.notice }]);
  } catch {
    state = appendChat(state, step.id, [{ from: 'coach', simulated: true, text: tr('Something went wrong with the coach. Please try again.') }]);
  } finally {
    pending = Math.max(0, pending - 1); // update first, then draw
  }
  persist();
  if (route().id === step.id) renderCoachLog(step);
}

async function welcome(step) {
  const reply = await askCoach({ kind: 'welcome', step });
  state = appendChat(state, step.id, [{ from: 'coach', kind: 'welcome', text: reply.text, simulated: true }]);
  persist();
  if (route().id === step.id) renderCoachLog(step);
}

/* ---------- Video analysis ---------- */

function renderVideoPage() {
  main.innerHTML = `
    <section>
      <p class="eyebrow">${tr('Video analysis')}</p>
      <h1>${tr('Analyse an existing video')}</h1>
      <p class="lede">${tr('Upload an instruction video of the paper crane. The video jumps to the right part for every step. Optionally, the interface takes frames from it and lets an AI suggest which segments belong to which step. You decide what to adopt.')}</p>
      <div id="ai-banner" class="notice" role="status">${tr('Checking whether the AI is connected…')}</div>
      <div id="vid-card" class="card"></div>
      <p id="an-status" class="notice" role="status" aria-live="polite" hidden></p>
      <div id="an-panel"></div>
    </section>`;
  drawVideoCard();
  drawAnalysis();
  setStatus(ui.status, ui.statusIsError);
  getAiStatus().then((s) => {
    const b = $('#ai-banner');
    if (!b) return;
    b.className = `notice ${s.connected ? 'ok' : ''}`;
    b.innerHTML = s.connected
      ? tr('AI connected ({model}). When you analyse, {n} single frames from your video are sent via your server to the Claude API. The video itself stays in your browser.', { model: esc(s.model || 'Claude'), n: ANALYSE_FRAMES })
      : tr('AI not connected. You can still upload and play the video, but a real analysis needs a running server with <code>ANTHROPIC_API_KEY</code> (see README). Without AI you can view a clearly marked sample analysis.');
    drawVideoCard(s);
  });
}

const ANALYSE_FRAMES = 10;

function setStatus(text, isError = false) {
  ui.status = text;
  ui.statusIsError = isError;
  const el = $('#an-status');
  if (!el) return;
  el.hidden = !text;
  el.textContent = text;
  el.className = `notice ${isError ? 'err' : ''}`;
  el.setAttribute('role', isError ? 'alert' : 'status');
}

let lastAi = { connected: false };
function drawVideoCard(ai) {
  if (ai) lastAi = ai;
  const card = $('#vid-card');
  if (!card) return;
  const v = state.video;
  if (!v || !ui.videoUrl) {
    card.innerHTML = `
      <h2 class="h3">${tr('1. Choose your video')}</h2>
      <p class="muted">${tr('For example an existing origami crane tutorial (MP4 or WebM). The video is kept in your browser and is not uploaded.')}</p>
      <label class="file-pick btn btn-primary" for="vfile">${tr('Choose video')}</label>
      <input id="vfile" class="sr-file" type="file" accept="video/*">`;
    return;
  }
  card.innerHTML = `
    <h2 class="h3">${tr('1. Your video')}</h2>
    <div class="video-wrap"><video id="vid" controls playsinline preload="metadata" src="${ui.videoUrl}">${tr('Your browser cannot play this video.')}</video></div>
    <p class="muted small">${esc(v.name)} · ${fmt(v.duration)} · ${mb(v.size)}</p>
    <div class="row">
      <button type="button" class="btn btn-primary" id="analyze" ${ui.analyzing || !lastAi.connected ? 'disabled' : ''}>${tr('Analyse video with AI')}</button>
      ${lastAi.connected ? '' : `<button type="button" class="btn" id="sample" ${ui.analyzing ? 'disabled' : ''}>${tr('Show sample analysis (simulated)')}</button>`}
      <label class="file-pick btn" for="vfile">${tr('Choose another video')}</label>
      <input id="vfile" class="sr-file" type="file" accept="video/*">
      <button type="button" class="btn btn-danger" id="remove-video">${tr('Remove video')}</button>
    </div>
    ${lastAi.connected ? '' : `<p class="muted small">${tr('The “Analyse video with AI” button becomes active as soon as the AI is connected.')}</p>`}`;
  bindVideo($('#vid'));
}

function drawAnalysis() {
  const panel = $('#an-panel');
  if (!panel) return;
  const a = state.analysis;
  if (!a) {
    panel.innerHTML = state.video
      ? `<div class="card"><h2 class="h3">${tr('2. Analysis')}</h2><p class="muted">${tr('No analysis yet. Start the analysis above.')}</p></div>`
      : '';
    return;
  }
  const dur = state.video?.duration || a.segments.at(-1)?.end || 1;
  panel.innerHTML = `
    <div class="card">
      <h2 class="h3">${tr('2. Suggested segments')} ${a.source === 'ai' ? `<span class="badge">${tr('AI analysis')}</span>` : `<span class="badge soft">${tr('simulated sample')}</span>`}</h2>
      <p>${esc(a.summary)}</p>
      ${(a.warnings || []).map((w) => `<p class="notice small">${esc(w)}</p>`).join('')}
      <div class="timeline" aria-label="${tr('Timeline of the segments')}">
        ${a.segments.map((s) => `<button type="button" class="seg-mark ${s.stepId ? '' : 'none'}" style="left:${(s.start / dur) * 100}%;width:${Math.max(1.5, ((s.end - s.start) / dur) * 100)}%" data-seek="${s.start},${s.end}" title="${esc(s.title)} (${fmt(s.start)}–${fmt(s.end)})" aria-label="Play ${esc(s.title)}, ${fmt(s.start)} to ${fmt(s.end)}"></button>`).join('')}
      </div>
      <ul class="segs">
        ${a.segments.map((s) => `<li class="seg">
          <div class="seg-top">
            <button type="button" class="btn" data-seek="${s.start},${s.end}">▶ ${fmt(s.start)}–${fmt(s.end)}</button>
            <strong>${esc(s.title)}</strong>
            ${s.uncertain ? '<span class="badge soft">uncertain</span>' : ''}
          </div>
          ${s.description ? `<p>${esc(s.description)}</p>` : ''}
          ${s.tip ? `<p class="muted small">Point of attention: ${esc(s.tip)}</p>` : ''}
          <label for="seg-${s.id}" class="field-label">${tr('Belongs to step')}</label>
          <select id="seg-${s.id}" data-seg-step="${s.id}">
            <option value="">${tr('No step')}</option>
            ${STEPS.map((st) => `<option value="${st.id}" ${s.stepId === st.id ? 'selected' : ''}>Step ${st.id}: ${esc(st.title)}</option>`).join('')}
          </select>
        </li>`).join('')}
      </ul>
      <div class="row">
        ${a.adopted
          ? `<p class="notice ok" role="status">${tr('These segments are now in your learning path. Open a step to play the segment.')}</p>`
          : `<button type="button" class="btn btn-primary" id="adopt">${tr('Use these segments in my learning path')}</button>`}
        <button type="button" class="btn" id="discard">${tr('Remove analysis')}</button>
      </div>
      <p class="muted small">${tr('You decide what to adopt. The AI changes nothing about your progress.')}</p>
    </div>`;
}

async function onVideoChosen(file) {
  if (!file) return;
  if (!file.type.startsWith('video/')) { setStatus(tr('This is not a video file.'), true); return; }
  if (file.size > 800 * 1048576) { setStatus(tr('This video is too large (maximum 800 MB).'), true); return; }
  setStatus(tr('Reading video…'));
  try {
    const info = await readVideoInfo(file);
    const stored = await saveVideo(file);
    if (ui.videoUrl) URL.revokeObjectURL(ui.videoUrl);
    ui.videoUrl = URL.createObjectURL(file);
    state = setVideoMeta(state, { name: file.name, size: file.size, type: file.type, duration: info.duration });
    persist();
    setStatus(stored ? '' : tr('The video works now, but could not be saved for after a reload.'), !stored);
    drawVideoCard();
    drawAnalysis();
    renderNav(route());
  } catch (e) {
    setStatus(e.message || tr('The video could not be read.'), true);
  }
}

async function runAnalysis() {
  if (ui.analyzing) return;
  const blob = await loadVideo();
  if (!blob) { setStatus(tr('The video is no longer available. Please choose it again.'), true); return; }
  ui.analyzing = true;
  drawVideoCard();
  try {
    setStatus(tr('Taking frames from the video ({i}/{n})…', { i: 0, n: ANALYSE_FRAMES }));
    const { duration, frames } = await extractFrames(blob, {
      count: ANALYSE_FRAMES,
      onProgress: (i, n) => setStatus(tr('Taking frames from the video ({i}/{n})…', { i, n })),
    });
    setStatus(tr('The AI is looking at the frames. This usually takes a moment…'));
    const res = await postJson('/api/analyze-video', {
      lang: LANG,
      duration,
      frames,
      project: { title: PROJECT.title, steps: STEPS.map((s) => ({ id: s.id, title: s.title })) },
    });
    state = setAnalysis(state, { source: 'ai', model: res.model, createdAt: Date.now(), summary: res.summary, warnings: res.warnings, framesUsed: res.framesUsed, segments: res.segments });
    persist();
    setStatus('');
    toast(tr('Analysis ready. Check the segments before you adopt them.'));
  } catch (e) {
    setStatus(tr('Analysis failed: {msg}', { msg: e.message }), true);
  } finally {
    ui.analyzing = false;
    drawVideoCard();
    drawAnalysis();
  }
}

/* ---------- 6. Search and saved ---------- */

function techCard(t, { inSaved = false } = {}) {
  const isSaved = state.saved.includes(t.id);
  return `<li class="card tech">
    <div>
      <h3 class="h4">${esc(t.name)}</h3>
      <p class="muted small">${esc(tr(t.craft))} · ${esc(tr(t.level))} · ${esc(t.material)}</p>
      <p>${esc(t.description)}</p>
    </div>
    <div class="row">
      <a class="btn btn-primary" href="#/technique/${t.id}">${tr('Step-by-step plan')}</a>
      ${inSaved
        ? `<button type="button" class="btn btn-danger" data-save="${t.id}" aria-label="Remove ${esc(t.name)} from saved">${tr('Remove')}</button>`
        : `<button type="button" class="btn ${isSaved ? 'btn-on' : ''}" data-save="${t.id}" aria-pressed="${isSaved}">${isSaved ? `✓ ${tr('Saved')}` : tr('Save')}</button>`}
    </div>
  </li>`;
}

function renderSearch() {
  const s = ui.search;
  main.innerHTML = `
    <section>
      <p class="eyebrow">${tr('Techniques')}</p>
      <h1>${tr('Find a technique')}</h1>
      <p class="lede">${tr('Click a technique for a step-by-step plan with drawings: what you need, how to fold it and which mistakes are common.')}</p>
      <form id="filters" class="filters" role="search" aria-label="${tr('Filter techniques')}">
        <div><label for="f-q">${tr('Search')}</label><input id="f-q" type="search" value="${esc(s.query)}" placeholder="${tr('Name, material or description')}"></div>
        <div><label for="f-c">${tr('Type')}</label><select id="f-c">${FILTERS.crafts.map((c) => `<option value="${c}" ${c === s.craft ? 'selected' : ''}>${tr(c)}</option>`).join('')}</select></div>
        <div><label for="f-l">${tr('Level')}</label><select id="f-l">${FILTERS.levels.map((c) => `<option value="${c}" ${c === s.level ? 'selected' : ''}>${tr(c)}</option>`).join('')}</select></div>
      </form>
      <p id="count" class="muted" role="status"></p>
      <ul id="results" class="grid"></ul>
    </section>`;
  drawResults();
}

function drawResults() {
  const list = filterTechniques(TECHNIQUES, ui.search);
  $('#count').textContent = list.length === 1 ? tr('{n} result', { n: 1 }) : tr('{n} results', { n: list.length });
  $('#results').innerHTML = list.length
    ? list.map((t) => techCard(t)).join('')
    : `<li class="muted">${tr('Nothing found. Change your search or filter.')}</li>`;
}

function renderSaved() {
  const list = TECHNIQUES.filter((t) => state.saved.includes(t.id));
  main.innerHTML = `
    <section>
      <p class="eyebrow">${tr('Saved')}</p>
      <h1>${tr('Your techniques')}</h1>
      <p class="lede">${tr('Techniques you have saved. You can open or remove them here.')}</p>
      ${list.length
        ? `<ul id="saved-list" class="grid">${list.map((t) => techCard(t, { inSaved: true })).join('')}</ul>`
        : `<div class="card empty"><p>${tr('You have not saved anything yet.')}</p><a class="btn btn-primary" href="#/techniques">${tr('Find techniques')}</a></div>`}
    </section>`;
}

/* ---------- Dialog ---------- */

function resetUi({ keepSearch = false } = {}) {
  ui.plan = {};
  ui.phase = 'learn';
  ui.choice = '';
  ui.note = '';
  pending = 0;
  if (!keepSearch) ui.search = { query: '', craft: 'All', level: 'All' };
}

function confirmResetPlan() {
  const dlg = $('#dialog');
  dlg.innerHTML = `
    <h2 id="dialog-title" class="h3">${tr('Reset the learning plan?')}</h2>
    <p>${tr('Your progress, reflections, conversations and step positions are erased and you start again at step 1. Your video, its analysis and your saved techniques are kept.')}</p>
    <div class="row">
      <button class="btn btn-danger" id="do-reset-plan">${tr('Yes, reset the learning plan')}</button>
      <button class="btn" data-close="1">${tr('Cancel')}</button>
    </div>`;
  dlg.showModal();
}

function confirmReset() {
  const dlg = $('#dialog');
  dlg.innerHTML = `
    <h2 id="dialog-title" class="h3">${tr('Reset the demo?')}</h2>
    <p>${tr('Everything is erased: progress, reflections, conversations, saved techniques and the uploaded video with its analysis. You start again from zero.')}</p>
    <div class="row">
      <button class="btn btn-danger" id="do-reset">${tr('Yes, reset the demo')}</button>
      <button class="btn" data-close="1">${tr('Cancel')}</button>
    </div>`;
  dlg.showModal();
}

/* ---------- Events (delegation) ---------- */

function refreshLists() {
  const r = route();
  if (r.name === 'techniques') drawResults();
  else if (r.name === 'saved') renderSaved();
  else if (r.name === 'dashboard') renderDashboard();
  else if (r.name === 'technique') renderTechnique(r.id);
}

document.addEventListener('click', async (e) => {
  const t = e.target.closest('button, a');
  if (!t) return;
  const r = route();
  const step = r.name === 'step' ? stepById(r.id) : null;

  if (t.id === 'reset-demo') return confirmReset();
  if (t.id === 'do-reset') {
    state = resetState();
    await deleteVideo();
    if (ui.videoUrl) URL.revokeObjectURL(ui.videoUrl);
    ui.videoUrl = null;
    resetUi();
    setStatus('');
    $('#dialog').close();
    toast(tr('Demo has been reset'));
    if (location.hash === '#/' || location.hash === '') render(); else location.hash = '#/';
    return;
  }
  if (t.id === 'reset-plan') return confirmResetPlan();
  if (t.id === 'do-reset-plan') {
    state = resetLearningPlan(state);
    persist();
    resetUi({ keepSearch: true });
    $('#dialog').close();
    toast(tr('Learning plan has been reset'));
    renderNav(route());
    if (location.hash === '#/' || location.hash === '') render(); else location.hash = '#/';
    return;
  }
  if (t.dataset.close) {
    if (t.dataset.save) { state = toggleSaved(state, t.dataset.save); persist(); renderNav(route()); refreshLists(); toast(state.saved.includes(t.dataset.save) ? tr('Technique saved') : tr('Removed from saved')); }
    $('#dialog').close();
    return;
  }
  if (t.dataset.sp) return moveStepper(t);
  if (t.dataset.save) {
    const id = t.dataset.save;
    state = toggleSaved(state, id);
    persist();
    renderNav(route());
    toast(state.saved.includes(id) ? tr('Technique saved') : tr('Removed from saved'));
    refreshLists();
    return;
  }

  // Video-analyse
  if (t.id === 'analyze') return runAnalysis();
  if (t.id === 'sample') {
    state = setAnalysis(state, { ...sampleAnalysis(state.video.duration, STEPS), createdAt: Date.now() });
    persist();
    drawAnalysis();
    return;
  }
  if (t.id === 'adopt') { state = adoptAnalysis(state); persist(); drawAnalysis(); toast(tr('Segments adopted in your learning path')); return; }
  if (t.id === 'discard') { state = discardAnalysis(state); persist(); drawAnalysis(); toast(tr('Analysis removed')); return; }
  if (t.id === 'remove-video') {
    await deleteVideo();
    if (ui.videoUrl) URL.revokeObjectURL(ui.videoUrl);
    ui.videoUrl = null;
    state = clearVideo(state);
    persist();
    setStatus('');
    drawVideoCard();
    drawAnalysis();
    renderNav(route());
    toast(tr('Video removed'));
    return;
  }
  if (t.dataset.seek) {
    const [s, en] = t.dataset.seek.split(',').map(Number);
    playSegment(s, en);
    $('#vid')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return;
  }
  if (t.dataset.segplay) { const [s, en] = t.dataset.segplay.split(',').map(Number); playSegment(s, en); return; }

  if (!step) return;

  if (t.dataset.coach) return talk(step, t.dataset.coach);
  if (t.id === 'tried' || t.id === 'mark-done') { ui.phase = 'reflect'; renderFinish(step); $('#fin-title').setAttribute('tabindex', '-1'); $('#fin-title').focus(); return; }
  if (t.id === 'back-practice') { ui.phase = 'learn'; renderFinish(step); return; }
  if (t.id === 'skip-reflect') return finishStep(step, { skipped: true });
});

document.addEventListener('submit', (e) => {
  const r = route();
  const step = r.name === 'step' ? stepById(r.id) : null;
  if (e.target.id === 'ask' && step) {
    e.preventDefault();
    const input = $('#q');
    const q = input.value.trim();
    if (!q) { input.focus(); return; }
    input.value = '';
    talk(step, 'question', q);
  }
  if (e.target.id === 'reflect' && step) {
    e.preventDefault();
    const choice = new FormData(e.target).get('choice') || '';
    const note = $('#note').value.trim();
    finishStep(step, choice || note ? { choice, note } : { skipped: true });
  }
  if (e.target.id === 'filters') e.preventDefault();
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'f-q') { ui.search.query = e.target.value; drawResults(); }
  if (e.target.id === 'note') ui.note = e.target.value;
  if (e.target.name === 'choice') ui.choice = e.target.value;
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'f-c') { ui.search.craft = e.target.value; drawResults(); }
  if (e.target.id === 'f-l') { ui.search.level = e.target.value; drawResults(); }
  if (e.target.id === 'vfile') { const f = e.target.files?.[0]; e.target.value = ''; onVideoChosen(f); }
  if (e.target.dataset.segStep !== undefined) {
    state = setSegmentStep(state, e.target.dataset.segStep, Number(e.target.value) || null);
    persist();
    drawAnalysis();
    toast(tr('Link changed. Confirm again to use it.'));
  }
});

$('#dialog').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
window.addEventListener('hashchange', () => render());

/* ---------- Start ---------- */

function applyStatic() {
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = tr(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-label]').forEach((el) => { el.setAttribute('aria-label', tr(el.dataset.i18nLabel)); });
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = tr('Origami crane research interface for comparing a standard video with an AI-supported analysis of a crane folding process.');
  const sel = $('#lang');
  if (sel) {
    sel.innerHTML = Object.entries(LANGS).map(([code, name]) => `<option value="${code}" ${code === LANG ? 'selected' : ''}>${name}</option>`).join('');
    sel.addEventListener('change', () => { setLang(sel.value); location.reload(); });
  }
}

async function init() {
  applyStatic();
  document.title = `${APP_NAME} · ${tr('origami coach (prototype)')}`;
  if (state.video) {
    const blob = await loadVideo();
    if (blob) ui.videoUrl = URL.createObjectURL(blob);
    else { state = clearVideo(state); persist(); }
  }
  render({ focus: false });
  getAiStatus().then((s) => {
    const note = $('#foot-note');
    if (note) note.textContent = s.connected
      ? tr('AI connected ({model}). Answers and video analysis come from Claude via the server; each answer shows its source.', { model: s.model })
      : tr('Prototype: AI not connected. The coach uses sample answers and a real video analysis is not available.');
  });
}
init();
