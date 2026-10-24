import { APP_NAME, PROJECT, STEPS, TECHNIQUES, FILTERS } from './data.js';
import {
  loadState, saveState, resetState, currentStepId, stepStatus, completeStep,
  toggleSaved, markViewed, appendChat, filterTechniques,
  setVideoMeta, clearVideo, setAnalysis, setSegmentStep, adoptAnalysis, discardAnalysis, segmentForStep,
} from './store.js';
import { askCoach } from './coach.js';
import { getAiStatus, postJson, resetStatusCache } from './api.js';
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
  search: { query: '', craft: 'Alle', level: 'Alle' },
  videoUrl: null,
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
  ['#/', 'Dashboard', 'dashboard'],
  ['#/project', 'Project', 'project'],
  ['#/video', 'Video-analyse', 'video'],
  ['#/zoeken', 'Technieken', 'zoeken'],
  ['#/opgeslagen', 'Opgeslagen', 'opgeslagen'],
];

function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  const [name, arg] = hash.split('/');
  if (name === 'stap') return { name: 'stap', id: Number(arg) };
  if (['project', 'video', 'zoeken', 'opgeslagen'].includes(name)) return { name };
  return { name: 'dashboard' };
}

function renderNav(r) {
  const active = r.name === 'stap' ? 'project' : r.name;
  $('#nav').innerHTML = `<ul>${NAV.map(([href, label, key]) =>
    `<li><a href="${href}" ${key === active ? 'aria-current="page"' : ''}>${label}${key === 'opgeslagen' && state.saved.length ? ` <span class="count" aria-label="${state.saved.length} opgeslagen">${state.saved.length}</span>` : ''}</a></li>`).join('')}</ul>`;
}

function render({ focus = true } = {}) {
  stopDemo();
  const r = route();
  renderNav(r);
  if (r.name === 'stap') {
    const step = stepById(r.id);
    if (!step) { location.hash = '#/project'; return; }
    renderTutorial(step);
  } else if (r.name === 'project') renderProject();
  else if (r.name === 'video') renderVideoPage();
  else if (r.name === 'zoeken') renderSearch();
  else if (r.name === 'opgeslagen') renderSaved();
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
  return `<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}" aria-label="Voortgang: ${done} van ${total} stappen"><span style="width:${pct}%"></span></div>`;
}

// Eenvoudige illustratie van de vouwfase (geen echte foto of video).
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
  return `<svg viewBox="0 0 260 180" role="img" aria-label="Illustratie van de vouwfase (placeholder)" class="loom">${body}</svg>`;
}

/* ---------- 1. Dashboard ---------- */

function videoSummary() {
  if (!state.video) return 'Nog geen video geüpload.';
  const a = state.analysis;
  const status = !a ? 'nog niet geanalyseerd' : a.adopted ? 'analyse gebruikt in je leerpad' : 'analyse klaar, nog niet overgenomen';
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
      <p class="eyebrow">Welkom terug</p>
      <h1>Fijn dat je er weer bent.</h1>
      <p class="lede">Je bepaalt zelf het tempo. Ga verder waar je gebleven was, of kijk eerst een uitleg terug.</p>
    </section>

    <section class="card project-card" aria-labelledby="active-title">
      <div class="project-art">${paperArt(Math.min(done + 1, 8))}</div>
      <div class="project-body">
        <p class="eyebrow">Actief project</p>
        <h2 id="active-title">${esc(PROJECT.title)}</h2>
        <p class="muted">${step ? `Stap ${step.id} van ${total}` : 'Alle stappen afgerond'} · ${done} van ${total} stappen klaar</p>
        ${progressBar(done, total)}
        <p class="next"><strong>Volgende actie:</strong> ${step ? `${esc(step.title)} (± ${step.minutes} min). ${esc(step.demoCaption)}` : 'Bekijk je project nog eens of begin met iets nieuws.'}</p>
        <div class="row">
          ${step
            ? `<a class="btn btn-primary" href="#/stap/${step.id}">Verder met mijn project</a>`
            : `<a class="btn btn-primary" href="#/project">Naar mijn project</a>`}
          <a class="btn" href="#/project">Bekijk leerpad</a>
        </div>
      </div>
    </section>

    <div class="cards">
      <section class="card" aria-labelledby="video-title">
        <h2 id="video-title" class="h3">Referentievideo</h2>
        <p class="${state.video ? '' : 'muted'}">${videoSummary()}</p>
        <a class="link" href="#/video">${state.video ? 'Naar video-analyse' : 'Video uploaden en analyseren'}</a>
      </section>
      <section class="card" aria-labelledby="saved-title">
        <h2 id="saved-title" class="h3">Opgeslagen technieken</h2>
        ${savedTech.length
          ? `<ul class="plain">${savedTech.slice(0, 3).map((t) => `<li><strong>${esc(t.name)}</strong><span class="muted"> · ${esc(t.craft)}, ${esc(t.level)}</span></li>`).join('')}</ul>
             <a class="link" href="#/opgeslagen">Alles bekijken</a>`
          : `<p class="muted">Nog niets opgeslagen. <a class="link" href="#/zoeken">Zoek een techniek</a>.</p>`}
      </section>
      <section class="card" aria-labelledby="recent-title">
        <h2 id="recent-title" class="h3">Recent bekeken demonstraties</h2>
        ${recent.length
          ? `<ul class="plain">${recent.map((s) => `<li><a class="link" href="#/stap/${s.id}">Stap ${s.id}: ${esc(s.demoTitle)}</a></li>`).join('')}</ul>`
          : `<p class="muted">Je hebt nog geen demonstraties bekeken.</p>`}
      </section>
    </div>`;
}

/* ---------- 2. Projectwerkruimte ---------- */

function renderProject() {
  const done = state.completed.length;
  const total = STEPS.length;
  const cur = currentStepId(state);
  const minutesLeft = STEPS.filter((s) => !state.completed.includes(s.id)).reduce((a, s) => a + s.minutes, 0);

  main.innerHTML = `
    <section class="project-head">
      <div class="project-art small">${paperArt(Math.min(done + 1, 8))}</div>
      <div>
        <p class="eyebrow">Project · ${esc(PROJECT.level)} · ${esc(PROJECT.totalTime)}</p>
        <h1>${esc(PROJECT.title)}</h1>
        <p class="lede">${esc(PROJECT.summary)}</p>
        ${progressBar(done, total)}
        <p class="muted">${done} van ${total} stappen klaar${cur ? ` · nog ± ${minutesLeft} min te gaan (voorbeeldschatting)` : ''}</p>
        ${cur ? `<a class="btn btn-primary" href="#/stap/${cur}">${state.chats[cur] || state.recent.includes(cur) ? 'Stap voortzetten' : 'Stap starten'}: ${esc(stepById(cur).title)}</a>` : `<p class="notice ok">Alle stappen zijn afgerond. Goed gedaan!</p>`}
      </div>
    </section>

    <section aria-labelledby="path-title">
      <h2 id="path-title" class="h3">Leerpad</h2>
      <ol class="path">
        ${STEPS.map((s) => {
          const st = stepStatus(state, s.id);
          const label = { done: 'Afgerond', current: 'Huidige stap', upcoming: 'Komt nog' }[st];
          const action = st === 'done' ? 'Opnieuw openen' : st === 'current' ? 'Starten' : 'Alvast bekijken';
          const seg = segmentForStep(state, s.id);
          return `<li class="path-item ${st}">
            <span class="dot" aria-hidden="true">${st === 'done' ? '✓' : s.id}</span>
            <div class="path-text">
              <strong>${esc(s.title)}</strong>
              <span class="muted">${label} · ± ${s.minutes} min${seg ? ` · videofragment ${fmt(seg.start)}–${fmt(seg.end)}` : ''}</span>
            </div>
            <a class="btn ${st === 'current' ? 'btn-primary' : ''}" href="#/stap/${s.id}" aria-label="${action}: ${esc(s.title)}">${action}</a>
          </li>`;
        }).join('')}
      </ol>
    </section>`;
}

/* ---------- 3-5. Tutorial, begeleider, reflectie ---------- */

function demoMarkup(step) {
  if (ui.videoUrl) {
    const seg = segmentForStep(state, step.id);
    return `<section class="demo" aria-labelledby="demo-title">
      <div class="video-wrap"><video id="vid" controls playsinline preload="metadata" src="${ui.videoUrl}">Je browser kan deze video niet afspelen.</video></div>
      <div class="demo-info">
        <h2 id="demo-title" class="h4">${esc(step.demoTitle)}</h2>
        ${seg
          ? `<p><strong>Fragment uit jouw video:</strong> ${esc(seg.title)} (${fmt(seg.start)}–${fmt(seg.end)}) <span class="badge soft">${state.analysis.source === 'ai' ? 'AI-analyse' : 'voorbeeld'}</span></p>
             ${seg.description ? `<p class="muted">${esc(seg.description)}</p>` : ''}`
          : `<p class="muted">Deze stap is nog niet aan een fragment van je video gekoppeld. <a class="link" href="#/video">Naar video-analyse</a></p>`}
      </div>
      <div class="controls">
        ${seg ? `<button type="button" class="btn btn-primary" data-segplay="${seg.start},${seg.end}">▶ Speel dit fragment</button>
        <button type="button" class="btn" data-segplay="${seg.start},${seg.end}">↺ Herhaal fragment</button>` : ''}
      </div>
    </section>`;
  }
  return `<section class="demo" aria-labelledby="demo-title">
    <div class="demo-stage" id="demo-stage"></div>
    <div class="demo-info">
      <h2 id="demo-title" class="h4">${esc(step.demoTitle)}</h2>
      <p class="muted">Gesimuleerde demonstratie: dit is een placeholder, geen echte video. <a class="link" href="#/video">Upload je eigen video</a> om die hier te gebruiken.</p>
    </div>
    <div class="controls">
      <button type="button" class="btn btn-primary" id="play" aria-pressed="false">▶ Afspelen</button>
      <button type="button" class="btn" id="replay">↺ Herhaal deze demonstratie</button>
      <label class="scrub"><span class="sr">Positie in de demonstratie</span>
        <input type="range" id="scrub" min="0" max="${step.demoSeconds}" value="0" step="1" aria-valuetext="0:00 van ${fmt(step.demoSeconds)}">
      </label>
      <span class="time" id="time" aria-hidden="true">0:00 / ${fmt(step.demoSeconds)}</span>
    </div>
  </section>`;
}

function renderTutorial(step) {
  const st = stepStatus(state, step.id);
  const isDone = st === 'done';
  ui.pos = 0;
  ui.playing = false;
  ui.phase = 'learn';
  ui.choice = '';
  ui.note = '';
  state = markViewed(state, step.id);
  persist();

  const prev = STEPS.find((s) => s.id === step.id - 1);
  const next = STEPS.find((s) => s.id === step.id + 1);

  main.innerHTML = `
    <nav class="crumbs" aria-label="Kruimelpad"><a href="#/project">${esc(PROJECT.title)}</a> <span aria-hidden="true">/</span> Stap ${step.id} van ${STEPS.length}</nav>
    <div class="tutorial">
      <div class="tut-main">
        <header>
          <p class="eyebrow">Stap ${step.id} · ± ${step.minutes} min ${isDone ? '· <span class="badge">Afgerond</span>' : st === 'upcoming' ? '· <span class="badge soft">Nog niet aan de beurt</span>' : ''}</p>
          <h1>${esc(step.title)}</h1>
        </header>

        ${demoMarkup(step)}

        <section aria-labelledby="inst-title" class="card">
          <h2 id="inst-title" class="h3">Zo ga je te werk</h2>
          <ol class="instr" id="instr">
            ${step.instructions.map((t, i) => `<li data-i="${i}">${esc(t)}</li>`).join('')}
          </ol>
          <p class="tip"><strong>Let op:</strong> ${esc(step.tip)}</p>
        </section>

        <section id="finish" aria-labelledby="fin-title" class="card"></section>

        <div class="step-nav">
          ${prev ? `<a class="btn btn-quiet" href="#/stap/${prev.id}">← Vorige stap</a>` : '<span></span>'}
          <a class="btn btn-quiet" href="#/project">Terug naar project</a>
          ${next ? `<a class="btn btn-quiet" href="#/stap/${next.id}">Volgende stap →</a>` : '<span></span>'}
        </div>
      </div>

      <aside class="coach-panel" aria-labelledby="coach-title">
        <div class="coach-head">
          <h2 id="coach-title" class="h3">Begeleider</h2>
          <span class="chip" id="coach-chip">Prototype</span>
        </div>
        <p class="muted small" id="coach-note">Even kijken of de AI verbonden is…</p>
        <div id="coach-log" class="log" role="log" aria-live="polite" aria-label="Gesprek met de begeleider"></div>
        <div class="quick">
          <button type="button" class="btn" data-coach="explain">Leg anders uit</button>
          <button type="button" class="btn" data-coach="hint">Geef een hint</button>
        </div>
        <form id="ask" class="ask">
          <label for="q">Vraag de begeleider</label>
          <div class="ask-row">
            <input id="q" name="q" type="text" autocomplete="off" placeholder="Bijvoorbeeld: mijn vouw wordt scheef" maxlength="300">
            <button class="btn btn-primary" type="submit">Verstuur</button>
          </div>
        </form>
      </aside>
    </div>`;

  if ($('#demo-stage')) drawDemo(step);
  bindVideo($('#vid'));
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
    chip.textContent = 'Claude verbonden';
    chip.classList.add('on');
    note.textContent = 'Antwoorden komen van Claude via de server. De begeleider ziet je papier niet en doet niets in je project; jij beslist.';
  } else {
    chip.textContent = 'Prototype';
    chip.classList.remove('on');
    note.textContent = 'AI niet verbonden: antwoorden komen uit lokale voorbeeldregels. De begeleider doet niets in je project; jij beslist.';
  }
}

/* Video-element: speel een fragment en stop aan het einde */

function bindVideo(vid) {
  if (!vid) return;
  vid.addEventListener('timeupdate', () => {
    const end = Number(vid.dataset.end);
    if (end && vid.currentTime >= end) { vid.pause(); vid.dataset.end = ''; }
  });
}

function playSegment(start, end) {
  const vid = $('#vid');
  if (!vid) return;
  vid.dataset.end = String(end);
  vid.currentTime = start;
  vid.play().catch(() => {});
}

/* Demonstratie-placeholder met lokale afspeel/pauze-simulatie (alleen zonder geüploade video) */

function drawDemo(step) {
  const stage = $('#demo-stage');
  if (!stage) return;
  const frac = ui.pos / step.demoSeconds;
  const idx = Math.min(step.instructions.length - 1, Math.floor(frac * step.instructions.length));
  stage.innerHTML = `${paperArt(step.id)}
    <div class="demo-caption"><span class="demo-badge">${ui.playing ? 'Speelt (simulatie)' : ui.pos >= step.demoSeconds ? 'Afgelopen' : ui.pos > 0 ? 'Gepauzeerd' : 'Klaar om te starten'}</span>
    <p>${esc(step.demoCaption)}</p></div>`;
  $('#time').textContent = `${fmt(ui.pos)} / ${fmt(step.demoSeconds)}`;
  const scrub = $('#scrub');
  scrub.value = ui.pos;
  scrub.setAttribute('aria-valuetext', `${fmt(ui.pos)} van ${fmt(step.demoSeconds)}`);
  const play = $('#play');
  play.textContent = ui.playing ? '❚❚ Pauzeren' : ui.pos >= step.demoSeconds ? '▶ Opnieuw afspelen' : ui.pos > 0 ? '▶ Hervatten' : '▶ Afspelen';
  play.setAttribute('aria-pressed', String(ui.playing));
  document.querySelectorAll('#instr li').forEach((li, i) => li.classList.toggle('active', (ui.playing || ui.pos > 0) && i === idx));
}

function stopDemo() {
  clearInterval(ui.timer);
  ui.timer = null;
  ui.playing = false;
}

function startDemo(step) {
  if (ui.pos >= step.demoSeconds) ui.pos = 0;
  ui.playing = true;
  clearInterval(ui.timer);
  // 1 simulatieseconde per 150 ms: snel doorlopen, maar zichtbaar.
  ui.timer = setInterval(() => {
    ui.pos = Math.min(step.demoSeconds, ui.pos + 1);
    if (ui.pos >= step.demoSeconds) stopDemo();
    drawDemo(step);
  }, 150);
  drawDemo(step);
}

/* Afronden + reflectie: voortgang verandert alleen na expliciete bevestiging */

function renderFinish(step) {
  const box = $('#finish');
  const done = state.completed.includes(step.id);
  const saved = state.reflections[step.id];

  if (ui.phase === 'done') {
    const next = STEPS.find((s) => !state.completed.includes(s.id));
    box.innerHTML = `
      <h2 id="fin-title" class="h3">Stap afgerond</h2>
      <p class="notice ok" role="status">Mooi, “${esc(step.title)}” staat nu als afgerond. Je voortgang is bijgewerkt: ${state.completed.length} van ${STEPS.length} stappen.</p>
      ${next ? `<div class="prep"><p class="eyebrow">Voorbereiding op de volgende stap</p>
        <p><strong>Stap ${next.id}: ${esc(next.title)}</strong> (± ${next.minutes} min)</p>
        <p class="muted">${esc(next.tip)}</p></div>
        <div class="row">
          <a class="btn btn-primary" href="#/stap/${next.id}">Door met stap ${next.id}</a>
          <a class="btn" href="#/project">Terug naar project</a>
        </div>`
        : `<p>Dit was de laatste stap. Je project is klaar.</p><div class="row"><a class="btn btn-primary" href="#/project">Terug naar project</a></div>`}`;
    return;
  }

  if (ui.phase === 'reflect') {
    const r = step.reflection;
    box.innerHTML = `
      <h2 id="fin-title" class="h3">Even terugkijken</h2>
      <form id="reflect" novalidate>
        <fieldset>
          <legend>${esc(r.question)}</legend>
          ${r.options.map((o) => `<label class="opt"><input type="radio" name="choice" value="${esc(o)}" ${ui.choice === o ? 'checked' : ''}> <span>${esc(o)}</span></label>`).join('')}
        </fieldset>
        <label for="note" class="field-label">Wil je er iets bij schrijven? (optioneel)</label>
        <textarea id="note" rows="3" maxlength="500">${esc(ui.note)}</textarea>
        <div class="row">
          <button type="submit" class="btn btn-primary">Bevestig en rond stap af</button>
          <button type="button" class="btn" id="skip-reflect">Reflectie overslaan en afronden</button>
          <button type="button" class="btn btn-quiet" id="back-practice">Nog niet, terug naar oefenen</button>
        </div>
      </form>`;
    return;
  }

  if (done) {
    box.innerHTML = `
      <h2 id="fin-title" class="h3">Deze stap is afgerond</h2>
      ${saved && !saved.skipped
        ? `<p><strong>Jouw reflectie:</strong> ${esc(saved.choice || 'geen keuze')}${saved.note ? ` · “${esc(saved.note)}”` : ''}</p>`
        : '<p class="muted">Je hebt de reflectie overgeslagen.</p>'}
      <p class="muted">Je kunt de uitleg altijd opnieuw bekijken.</p>`;
  } else {
    box.innerHTML = `
      <h2 id="fin-title" class="h3">Zelf proberen</h2>
      <p>Neem de tijd om het zelf uit te proberen. Pas als jij dat aangeeft, tel ik de stap mee in je voortgang.</p>
      <div class="row">
        <button type="button" class="btn btn-primary" id="tried">Ik heb dit geprobeerd</button>
        <button type="button" class="btn" id="mark-done">Markeer als afgerond</button>
      </div>`;
  }
}

function finishStep(step, reflection) {
  state = completeStep(state, step.id, reflection);
  persist();
  ui.phase = 'done';
  renderFinish(step);
  renderNav(route());
  toast('Stap afgerond en opgeslagen');
  $('#fin-title')?.setAttribute('tabindex', '-1');
  $('#fin-title')?.focus();
}

/* Coachgesprek */

function renderCoachLog(step) {
  const log = $('#coach-log');
  if (!log) return;
  const msgs = state.chats[step.id] || [];
  log.innerHTML = msgs.map((m) => `<div class="msg ${m.from}">
    <span class="who">${m.from === 'you' ? 'Jij' : `Begeleider · ${m.simulated === false ? 'Claude' : 'voorbeeld'}`}</span>
    <p>${esc(m.text)}</p>
    ${m.followUp ? `<p class="follow">${esc(m.followUp)}</p>` : ''}
    ${m.notice ? `<p class="small muted">${esc(m.notice)}</p>` : ''}
  </div>`).join('') + (pending > 0 ? '<div class="msg coach"><span class="who">Begeleider</span><p class="muted">Denkt na…</p></div>' : '');
  log.scrollTop = log.scrollHeight;
}

// Berichten worden na elkaar afgehandeld, zodat er niets verloren gaat.
let chain = Promise.resolve();
let pending = 0;
function talk(step, kind, question = '') {
  pending++;
  chain = chain.then(() => talkNow(step, kind, question)).finally(() => { pending--; });
  return chain;
}

async function talkNow(step, kind, question = '') {
  const history = state.chats[step.id] || [];
  if (kind === 'question') state = appendChat(state, step.id, [{ from: 'you', text: question }]);
  if (kind === 'explain') state = appendChat(state, step.id, [{ from: 'you', text: 'Leg anders uit.' }]);
  if (kind === 'hint') state = appendChat(state, step.id, [{ from: 'you', text: 'Geef een hint.' }]);
  if (route().id === step.id) renderCoachLog(step);
  try {
    const reply = await askCoach({ kind, step, question, history, segment: segmentForStep(state, step.id) });
    state = appendChat(state, step.id, [{ from: 'coach', kind, text: reply.text, followUp: reply.followUp, simulated: reply.simulated, notice: reply.notice }]);
  } catch {
    state = appendChat(state, step.id, [{ from: 'coach', simulated: true, text: 'Er ging iets mis bij de begeleider. Probeer het nog eens.' }]);
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

/* ---------- Video-analyse ---------- */

function renderVideoPage() {
  main.innerHTML = `
    <section>
      <p class="eyebrow">Video-analyse</p>
      <h1>Analyseer een bestaande video</h1>
      <p class="lede">Upload een instructievideo van de papieren kraanvogel. De interface haalt er beelden uit en laat een AI voorstellen welke fragmenten bij welke stap horen. Jij beslist wat je overneemt.</p>
      <div id="ai-banner" class="notice" role="status">Even kijken of de AI verbonden is…</div>
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
      ? `AI verbonden (${esc(s.model || 'Claude')}). Bij analyseren worden ${ANALYSE_FRAMES} losse beelden uit je video via je server naar de Claude API gestuurd. De video zelf blijft in je browser.`
      : `AI niet verbonden. Je kunt de video wel uploaden en afspelen, maar een echte analyse vraagt een draaiende server met <code>ANTHROPIC_API_KEY</code> (zie README). Zonder AI kun je een duidelijk gemarkeerde voorbeeldanalyse bekijken.`;
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
      <h2 class="h3">1. Kies je video</h2>
      <p class="muted">Bijvoorbeeld een bestaande tutorial van een origami-kraanvogel (MP4 of WebM). De video wordt in je browser bewaard en niet geüpload.</p>
      <label class="file-pick btn btn-primary" for="vfile">Video kiezen</label>
      <input id="vfile" class="sr-file" type="file" accept="video/*">`;
    return;
  }
  card.innerHTML = `
    <h2 class="h3">1. Jouw video</h2>
    <div class="video-wrap"><video id="vid" controls playsinline preload="metadata" src="${ui.videoUrl}">Je browser kan deze video niet afspelen.</video></div>
    <p class="muted small">${esc(v.name)} · ${fmt(v.duration)} · ${mb(v.size)}</p>
    <div class="row">
      <button type="button" class="btn btn-primary" id="analyze" ${ui.analyzing || !lastAi.connected ? 'disabled' : ''}>Analyseer video met AI</button>
      ${lastAi.connected ? '' : '<button type="button" class="btn" id="sample" ' + (ui.analyzing ? 'disabled' : '') + '>Voorbeeldanalyse tonen (gesimuleerd)</button>'}
      <label class="file-pick btn" for="vfile">Andere video kiezen</label>
      <input id="vfile" class="sr-file" type="file" accept="video/*">
      <button type="button" class="btn btn-danger" id="remove-video">Video verwijderen</button>
    </div>
    ${lastAi.connected ? '' : '<p class="muted small">De knop “Analyseer video met AI” wordt actief zodra de AI is verbonden.</p>'}`;
  bindVideo($('#vid'));
}

function drawAnalysis() {
  const panel = $('#an-panel');
  if (!panel) return;
  const a = state.analysis;
  if (!a) {
    panel.innerHTML = state.video
      ? '<div class="card"><h2 class="h3">2. Analyse</h2><p class="muted">Nog geen analyse. Start de analyse hierboven.</p></div>'
      : '';
    return;
  }
  const dur = state.video?.duration || a.segments.at(-1)?.end || 1;
  panel.innerHTML = `
    <div class="card">
      <h2 class="h3">2. Voorgestelde fragmenten ${a.source === 'ai' ? '<span class="badge">AI-analyse</span>' : '<span class="badge soft">gesimuleerd voorbeeld</span>'}</h2>
      <p>${esc(a.summary)}</p>
      ${(a.warnings || []).map((w) => `<p class="notice small">${esc(w)}</p>`).join('')}
      <div class="timeline" aria-label="Tijdlijn van de fragmenten">
        ${a.segments.map((s) => `<button type="button" class="seg-mark ${s.stepId ? '' : 'none'}" style="left:${(s.start / dur) * 100}%;width:${Math.max(1.5, ((s.end - s.start) / dur) * 100)}%" data-seek="${s.start},${s.end}" title="${esc(s.title)} (${fmt(s.start)}–${fmt(s.end)})" aria-label="Speel ${esc(s.title)}, ${fmt(s.start)} tot ${fmt(s.end)}"></button>`).join('')}
      </div>
      <ul class="segs">
        ${a.segments.map((s) => `<li class="seg">
          <div class="seg-top">
            <button type="button" class="btn" data-seek="${s.start},${s.end}">▶ ${fmt(s.start)}–${fmt(s.end)}</button>
            <strong>${esc(s.title)}</strong>
            ${s.uncertain ? '<span class="badge soft">onzeker</span>' : ''}
          </div>
          ${s.description ? `<p>${esc(s.description)}</p>` : ''}
          ${s.tip ? `<p class="muted small">Aandachtspunt: ${esc(s.tip)}</p>` : ''}
          <label for="seg-${s.id}" class="field-label">Hoort bij stap</label>
          <select id="seg-${s.id}" data-seg-step="${s.id}">
            <option value="">Geen stap</option>
            ${STEPS.map((st) => `<option value="${st.id}" ${s.stepId === st.id ? 'selected' : ''}>Stap ${st.id}: ${esc(st.title)}</option>`).join('')}
          </select>
        </li>`).join('')}
      </ul>
      <div class="row">
        ${a.adopted
          ? '<p class="notice ok" role="status">Deze fragmenten staan nu in je leerpad. Open een stap om het fragment af te spelen.</p>'
          : '<button type="button" class="btn btn-primary" id="adopt">Gebruik deze fragmenten in mijn leerpad</button>'}
        <button type="button" class="btn" id="discard">Analyse verwijderen</button>
      </div>
      <p class="muted small">Je beslist wat je overneemt. De AI wijzigt niets aan je voortgang.</p>
    </div>`;
}

async function onVideoChosen(file) {
  if (!file) return;
  if (!file.type.startsWith('video/')) { setStatus('Dit is geen videobestand.', true); return; }
  if (file.size > 800 * 1048576) { setStatus('Deze video is te groot (maximaal 800 MB).', true); return; }
  setStatus('Video wordt gelezen…');
  try {
    const info = await readVideoInfo(file);
    const stored = await saveVideo(file);
    if (ui.videoUrl) URL.revokeObjectURL(ui.videoUrl);
    ui.videoUrl = URL.createObjectURL(file);
    state = setVideoMeta(state, { name: file.name, size: file.size, type: file.type, duration: info.duration });
    persist();
    setStatus(stored ? '' : 'De video werkt nu, maar kon niet worden bewaard voor na het herladen.', !stored);
    drawVideoCard();
    drawAnalysis();
    renderNav(route());
  } catch (e) {
    setStatus(e.message || 'De video kon niet worden gelezen.', true);
  }
}

async function runAnalysis() {
  if (ui.analyzing) return;
  const blob = await loadVideo();
  if (!blob) { setStatus('De video is niet meer beschikbaar. Kies hem opnieuw.', true); return; }
  ui.analyzing = true;
  drawVideoCard();
  try {
    setStatus(`Beelden uit de video halen (0/${ANALYSE_FRAMES})…`);
    const { duration, frames } = await extractFrames(blob, {
      count: ANALYSE_FRAMES,
      onProgress: (i, n) => setStatus(`Beelden uit de video halen (${i}/${n})…`),
    });
    setStatus('De AI bekijkt de beelden. Dit duurt meestal even…');
    const res = await postJson('/api/analyze-video', {
      duration,
      frames,
      project: { title: PROJECT.title, steps: STEPS.map((s) => ({ id: s.id, title: s.title })) },
    });
    state = setAnalysis(state, { source: 'ai', model: res.model, createdAt: Date.now(), summary: res.summary, warnings: res.warnings, framesUsed: res.framesUsed, segments: res.segments });
    persist();
    setStatus('');
    toast('Analyse klaar. Controleer de fragmenten voor je ze overneemt.');
  } catch (e) {
    setStatus(`Analyse mislukt: ${e.message}`, true);
  } finally {
    ui.analyzing = false;
    drawVideoCard();
    drawAnalysis();
  }
}

/* ---------- 6. Zoeken en opgeslagen ---------- */

function techCard(t, { inSaved = false } = {}) {
  const isSaved = state.saved.includes(t.id);
  return `<li class="card tech">
    <div>
      <h3 class="h4">${esc(t.name)}</h3>
      <p class="muted small">${esc(t.craft)} · ${esc(t.level)} · ${esc(t.material)}</p>
      <p>${esc(t.description)}</p>
    </div>
    <div class="row">
      <button type="button" class="btn" data-open="${t.id}">Openen</button>
      ${inSaved
        ? `<button type="button" class="btn btn-danger" data-save="${t.id}" aria-label="Verwijder ${esc(t.name)} uit opgeslagen">Verwijderen</button>`
        : `<button type="button" class="btn ${isSaved ? 'btn-on' : ''}" data-save="${t.id}" aria-pressed="${isSaved}">${isSaved ? '✓ Opgeslagen' : 'Opslaan'}</button>`}
    </div>
  </li>`;
}

function renderSearch() {
  const s = ui.search;
  main.innerHTML = `
    <section>
      <p class="eyebrow">Technieken</p>
      <h1>Zoek een techniek</h1>
      <p class="lede">Voorbeeldtechnieken uit een lokale lijst. Er wordt niets van internet opgehaald.</p>
      <form id="filters" class="filters" role="search" aria-label="Technieken filteren">
        <div><label for="f-q">Zoeken</label><input id="f-q" type="search" value="${esc(s.query)}" placeholder="Naam, materiaal of omschrijving"></div>
        <div><label for="f-c">Soort</label><select id="f-c">${FILTERS.crafts.map((c) => `<option ${c === s.craft ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        <div><label for="f-l">Niveau</label><select id="f-l">${FILTERS.levels.map((c) => `<option ${c === s.level ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
      </form>
      <p id="count" class="muted" role="status"></p>
      <ul id="results" class="grid"></ul>
    </section>`;
  drawResults();
}

function drawResults() {
  const list = filterTechniques(TECHNIQUES, ui.search);
  $('#count').textContent = `${list.length} ${list.length === 1 ? 'resultaat' : 'resultaten'}`;
  $('#results').innerHTML = list.length
    ? list.map((t) => techCard(t)).join('')
    : '<li class="muted">Niets gevonden. Pas je zoekopdracht of filter aan.</li>';
}

function renderSaved() {
  const list = TECHNIQUES.filter((t) => state.saved.includes(t.id));
  main.innerHTML = `
    <section>
      <p class="eyebrow">Opgeslagen</p>
      <h1>Jouw technieken</h1>
      <p class="lede">Technieken die je hebt bewaard. Je kunt ze hier openen of weer verwijderen.</p>
      ${list.length
        ? `<ul id="saved-list" class="grid">${list.map((t) => techCard(t, { inSaved: true })).join('')}</ul>`
        : `<div class="card empty"><p>Je hebt nog niets opgeslagen.</p><a class="btn btn-primary" href="#/zoeken">Technieken zoeken</a></div>`}
    </section>`;
}

/* ---------- Dialoog ---------- */

function openTechnique(id) {
  const t = TECHNIQUES.find((x) => x.id === id);
  if (!t) return;
  const dlg = $('#dialog');
  const isSaved = state.saved.includes(id);
  dlg.innerHTML = `
    <h2 id="dialog-title" class="h3">${esc(t.name)}</h2>
    <p class="muted small">${esc(t.craft)} · ${esc(t.level)} · ${esc(t.material)}</p>
    <p>${esc(t.description)}</p>
    <p class="notice">Dit is voorbeeldinhoud in het prototype. Een uitgebreide uitleg of demonstratie komt later.</p>
    <div class="row">
      <button class="btn ${isSaved ? 'btn-on' : 'btn-primary'}" data-save="${t.id}" data-close="1">${isSaved ? 'Verwijder uit opgeslagen' : 'Opslaan'}</button>
      <button class="btn" data-close="1">Sluiten</button>
    </div>`;
  dlg.showModal();
}

function confirmReset() {
  const dlg = $('#dialog');
  dlg.innerHTML = `
    <h2 id="dialog-title" class="h3">Demo resetten?</h2>
    <p>Je voortgang, reflecties, gesprekken, opgeslagen technieken en de geüploade video met analyse worden gewist en de demo begint opnieuw.</p>
    <div class="row">
      <button class="btn btn-danger" id="do-reset">Ja, reset de demo</button>
      <button class="btn" data-close="1">Annuleren</button>
    </div>`;
  dlg.showModal();
}

/* ---------- Gebeurtenissen (delegatie) ---------- */

function refreshLists() {
  const r = route();
  if (r.name === 'zoeken') drawResults();
  else if (r.name === 'opgeslagen') renderSaved();
  else if (r.name === 'dashboard') renderDashboard();
}

document.addEventListener('click', async (e) => {
  const t = e.target.closest('button, a');
  if (!t) return;
  const r = route();
  const step = r.name === 'stap' ? stepById(r.id) : null;

  if (t.id === 'reset-demo') return confirmReset();
  if (t.id === 'do-reset') {
    state = resetState();
    await deleteVideo();
    if (ui.videoUrl) URL.revokeObjectURL(ui.videoUrl);
    ui.videoUrl = null;
    setStatus('');
    $('#dialog').close();
    toast('Demo is gereset');
    if (location.hash === '#/' || location.hash === '') render(); else location.hash = '#/';
    return;
  }
  if (t.dataset.close) {
    if (t.dataset.save) { state = toggleSaved(state, t.dataset.save); persist(); renderNav(route()); refreshLists(); toast(state.saved.includes(t.dataset.save) ? 'Techniek opgeslagen' : 'Uit opgeslagen verwijderd'); }
    $('#dialog').close();
    return;
  }
  if (t.dataset.open) return openTechnique(t.dataset.open);
  if (t.dataset.save) {
    const id = t.dataset.save;
    state = toggleSaved(state, id);
    persist();
    renderNav(route());
    toast(state.saved.includes(id) ? 'Techniek opgeslagen' : 'Uit opgeslagen verwijderd');
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
  if (t.id === 'adopt') { state = adoptAnalysis(state); persist(); drawAnalysis(); toast('Fragmenten overgenomen in je leerpad'); return; }
  if (t.id === 'discard') { state = discardAnalysis(state); persist(); drawAnalysis(); toast('Analyse verwijderd'); return; }
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
    toast('Video verwijderd');
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

  if (t.id === 'play') { ui.playing ? (stopDemo(), drawDemo(step)) : startDemo(step); return; }
  if (t.id === 'replay') { stopDemo(); ui.pos = 0; startDemo(step); return; }
  if (t.dataset.coach) return talk(step, t.dataset.coach);
  if (t.id === 'tried' || t.id === 'mark-done') { ui.phase = 'reflect'; renderFinish(step); $('#fin-title').setAttribute('tabindex', '-1'); $('#fin-title').focus(); return; }
  if (t.id === 'back-practice') { ui.phase = 'learn'; renderFinish(step); return; }
  if (t.id === 'skip-reflect') return finishStep(step, { skipped: true });
});

document.addEventListener('submit', (e) => {
  const r = route();
  const step = r.name === 'stap' ? stepById(r.id) : null;
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
  if (e.target.id === 'scrub') {
    const step = stepById(route().id);
    if (!step) return;
    stopDemo();
    ui.pos = Number(e.target.value);
    drawDemo(step);
  }
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
    toast('Koppeling aangepast. Bevestig opnieuw om te gebruiken.');
  }
});

$('#dialog').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
window.addEventListener('hashchange', () => render());
window.addEventListener('pagehide', stopDemo);

/* ---------- Start ---------- */

async function init() {
  document.title = `${APP_NAME} · origami-coach (prototype)`;
  if (state.video) {
    const blob = await loadVideo();
    if (blob) ui.videoUrl = URL.createObjectURL(blob);
    else { state = clearVideo(state); persist(); }
  }
  render({ focus: false });
  getAiStatus().then((s) => {
    const note = $('#foot-note');
    if (note) note.textContent = s.connected
      ? `AI verbonden (${s.model}). Antwoorden en videoanalyse komen van Claude via de server; elk antwoord toont zijn bron.`
      : 'Prototype: AI niet verbonden. De begeleider gebruikt voorbeeldantwoorden en een echte videoanalyse is niet beschikbaar.';
  });
}
init();
