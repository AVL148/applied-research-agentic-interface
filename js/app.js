:root {
  --bg: #f6f1e7;
  --surface: #fffdf8;
  --surface-2: #efe7d6;
  --ink: #26312b;
  --muted: #5d675f;
  --line: #ddd2bd;
  --green: #2f4a3a;
  --green-ink: #ffffff;
  --green-soft: #dfe9dd;
  --clay: #b4684f;
  --ochre: #c98a5a;
  --sage: #8aa07c;
  --danger: #8f3a2b;
  --radius: 14px;
  --shadow: 0 1px 2px rgba(38, 49, 43, .06), 0 6px 18px rgba(38, 49, 43, .05);
  font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
}

* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-size: 1.0625rem;
  line-height: 1.55;
}
h1, h2, h3, h4, .brand, .eyebrow, .btn, label, legend, .chip, .badge, nav {
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
}
h1 { font-family: "Iowan Old Style", Palatino, Georgia, serif; font-weight: 600; font-size: clamp(1.7rem, 4.5vw, 2.4rem); line-height: 1.15; margin: .1em 0 .4em; letter-spacing: -.01em; }
h2 { margin: 0 0 .5em; font-size: 1.4rem; line-height: 1.2; }
.h3 { font-size: 1.15rem; font-weight: 650; margin: 0 0 .6em; }
.h4 { font-size: 1rem; font-weight: 650; margin: 0 0 .25em; }
p { margin: 0 0 .8em; }
a { color: var(--green); }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.skip { position: absolute; left: -999px; top: 0; background: var(--green); color: #fff; padding: .6rem 1rem; z-index: 100; }
.skip:focus { left: .5rem; top: .5rem; }

:focus-visible { outline: 3px solid #1d6fb8; outline-offset: 2px; border-radius: 6px; }
h1:focus, h2:focus { outline: none; }

.shell { max-width: 1160px; margin: 0 auto; padding: 0 1.25rem 2rem; }
.topbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding: 1.1rem 0; border-bottom: 1px solid var(--line); margin-bottom: 1.6rem; }
.brand { font-size: 1.05rem; font-weight: 700; text-decoration: none; color: var(--green); letter-spacing: -.02em; line-height: 1.3; }
.brand span { color: var(--clay); margin: 0 .05em; }
nav ul { list-style: none; display: flex; gap: .25rem; margin: 0; padding: 0; flex-wrap: wrap; }
nav a { display: inline-block; padding: .5rem .85rem; border-radius: 999px; text-decoration: none; color: var(--ink); font-size: .95rem; font-weight: 500; }
nav a:hover { background: var(--surface-2); }
nav a[aria-current="page"] { background: var(--green); color: var(--green-ink); }
.count { background: var(--clay); color: #fff; border-radius: 999px; font-size: .75rem; padding: .05rem .45rem; margin-left: .2rem; }

.eyebrow { text-transform: uppercase; letter-spacing: .08em; font-size: .75rem; font-weight: 600; color: var(--clay); margin: 0 0 .4rem; }
.lede { font-size: 1.15rem; color: var(--muted); max-width: 60ch; }
.muted { color: var(--muted); }
.small { font-size: .9rem; }

.card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 1.25rem; box-shadow: var(--shadow); margin-bottom: 1.1rem; }
.row { display: flex; gap: .6rem; flex-wrap: wrap; align-items: center; margin-top: .6rem; }

.btn {
  appearance: none; border: 1.5px solid var(--line); background: var(--surface); color: var(--ink);
  font-size: .95rem; font-weight: 600; padding: .65rem 1.05rem; border-radius: 10px; cursor: pointer;
  min-height: 44px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; line-height: 1.2;
}
.btn:hover { border-color: var(--green); }
.btn-primary { background: var(--green); border-color: var(--green); color: var(--green-ink); }
.btn-primary:hover { background: #243b2e; }
.btn-quiet { border-color: transparent; background: transparent; color: var(--green); }
.btn-quiet:hover { background: var(--surface-2); border-color: transparent; }
.btn-danger { color: var(--danger); border-color: #d8b3aa; }
.btn-on { background: var(--green-soft); border-color: var(--green); color: var(--green); }

.hero { padding: .5rem 0 1.4rem; }

.project-card { display: grid; grid-template-columns: 260px 1fr; gap: 1.5rem; align-items: center; padding: 1.4rem; }
.project-art, .project-art.small { background: var(--surface-2); border-radius: 12px; padding: .8rem; }
.project-art.small { width: 260px; flex: none; }
.loom { display: block; width: 100%; height: auto; }
.project-body h2 { font-size: 1.7rem; margin-bottom: .2rem; }
.next { margin: .9rem 0 .4rem; }
.bar { height: 10px; background: var(--surface-2); border-radius: 999px; overflow: hidden; margin: .7rem 0; }
.bar span { display: block; height: 100%; background: var(--green); border-radius: 999px; transition: width .4s ease; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem; }
.plain { list-style: none; margin: 0 0 .6rem; padding: 0; }
.plain li { padding: .4rem 0; border-bottom: 1px solid var(--line); }
.plain li:last-child { border-bottom: 0; }
.link { font-weight: 600; }

.project-head { display: flex; gap: 1.6rem; align-items: center; margin-bottom: 1.8rem; }

.path { list-style: none; margin: 0; padding: 0; position: relative; }
.path-item { display: grid; grid-template-columns: 40px 1fr auto; gap: .9rem; align-items: center; padding: .85rem 1rem; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; margin-bottom: .5rem; }
.path-item.current { border-color: var(--green); box-shadow: 0 0 0 2px var(--green-soft); }
.path-item.upcoming { opacity: .92; }
.dot { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; font: 700 .95rem ui-sans-serif, system-ui, sans-serif; background: var(--surface-2); color: var(--muted); border: 1px solid var(--line); }
.done .dot { background: var(--green); color: #fff; border-color: var(--green); }
.current .dot { background: #fff; color: var(--green); border-color: var(--green); }
.path-text { display: flex; flex-direction: column; min-width: 0; }

.crumbs { font: .9rem ui-sans-serif, system-ui, sans-serif; color: var(--muted); margin-bottom: .6rem; }
.tutorial { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 1.5rem; align-items: start; }
.coach-panel { position: sticky; top: 1rem; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 1.1rem; box-shadow: var(--shadow); }
.coach-head { display: flex; justify-content: space-between; align-items: center; gap: .5rem; }
.coach-head .h3 { margin: 0; }
.chip, .badge { font-size: .72rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; background: var(--surface-2); color: var(--muted); padding: .2rem .55rem; border-radius: 999px; }
.badge { background: var(--green); color: #fff; }
.badge.soft { background: var(--surface-2); color: var(--muted); }

.demo { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; margin-bottom: 1.1rem; box-shadow: var(--shadow); }
.demo-stage { background: linear-gradient(160deg, #e9dfcd, #d9e3d4); padding: 1.2rem; display: grid; grid-template-columns: minmax(180px, 280px) 1fr; gap: 1.2rem; align-items: center; min-height: 195px; }
.demo-badge { display: inline-block; background: rgba(255, 255, 255, .8); border: 1px solid var(--line); border-radius: 999px; padding: .2rem .7rem; font: 600 .8rem ui-sans-serif, system-ui, sans-serif; }
.demo-caption p { font-size: 1.1rem; margin: 0; }
.demo-info { padding: .9rem 1.2rem 0; }
.controls { display: flex; flex-wrap: wrap; align-items: center; gap: .6rem; padding: .6rem 1.2rem 1.2rem; }
.scrub { flex: 1 1 160px; min-width: 120px; }
.scrub input { width: 100%; accent-color: var(--green); min-height: 32px; }
.time { font: .85rem ui-monospace, Menlo, monospace; color: var(--muted); }

.instr { margin: 0 0 1rem; padding-left: 1.4rem; }
.instr li { padding: .45rem .6rem; border-radius: 8px; margin-bottom: .2rem; transition: background .2s; }
.instr li.active { background: var(--green-soft); }
.tip { background: #f5e8d8; border-left: 4px solid var(--ochre); padding: .7rem .9rem; border-radius: 8px; margin: 0; }

.notice { background: var(--surface-2); padding: .7rem .9rem; border-radius: 8px; }
.notice.ok { background: var(--green-soft); }
.prep { border: 1px dashed var(--sage); border-radius: 10px; padding: .8rem 1rem; margin: .8rem 0; }

fieldset { border: 0; padding: 0; margin: 0 0 1rem; }
legend { font-weight: 650; margin-bottom: .6rem; padding: 0; }
.opt { display: flex; align-items: center; gap: .6rem; padding: .65rem .8rem; border: 1.5px solid var(--line); border-radius: 10px; margin-bottom: .45rem; cursor: pointer; min-height: 44px; }
.opt:has(input:checked) { border-color: var(--green); background: var(--green-soft); }
.opt input { accent-color: var(--green); width: 20px; height: 20px; flex: none; }
.field-label, .ask label, .filters label { display: block; font-weight: 600; font-size: .9rem; margin-bottom: .3rem; }
textarea, input[type="text"], input[type="search"], input[type="file"], select {
  width: 100%; font: inherit; font-size: 1rem; padding: .65rem .75rem; border: 1.5px solid #b9ad94; border-radius: 10px; background: #fff; color: var(--ink); min-height: 44px;
}
textarea { resize: vertical; }

.upload-panel { display: grid; gap: .8rem; margin-top: .9rem; }
.upload-pill { background: var(--green-soft); border: 1px solid var(--green); border-radius: 999px; padding: .15rem .7rem; font: 600 .78rem ui-sans-serif, system-ui, sans-serif; color: var(--green); }
.video-preview { display: none; width: 100%; max-height: 220px; border-radius: 12px; background: #111; }
.video-preview.visible { display: block; }
.analysis-result { background: #f7f3eb; border: 1px solid var(--line); border-radius: 12px; padding: .8rem .9rem; color: var(--ink); }

.step-nav { display: flex; justify-content: space-between; gap: .5rem; flex-wrap: wrap; margin-top: .6rem; }

.log { max-height: 340px; overflow-y: auto; display: flex; flex-direction: column; gap: .6rem; margin: .6rem 0; padding: .2rem; }
.msg { padding: .6rem .8rem; border-radius: 12px; max-width: 94%; flex: none; }
.msg p { margin: 0; font-size: .98rem; }
.msg .who { display: block; font: 700 .7rem ui-sans-sans-serif, system-ui, sans-serif; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin-bottom: .15rem; }
.msg.coach { background: var(--surface-2); align-self: flex-start; }
.msg.you { background: var(--green-soft); align-self: flex-end; }
.msg .follow { margin-top: .4rem; font-style: italic; color: var(--green); }
.quick { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: .8rem; }
.ask-row { display: flex; gap: .5rem; }
.ask-row input { flex: 1; min-width: 0; }

.filters { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: .8rem; margin: 1rem 0; }
.grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.tech { display: flex; flex-direction: column; justify-content: space-between; margin: 0; }
.empty { text-align: center; padding: 2rem 1rem; }

dialog { border: 1px solid var(--line); border-radius: var(--radius); padding: 1.4rem; max-width: min(480px, calc(100vw - 2rem)); background: var(--surface); color: var(--ink); box-shadow: 0 20px 40px rgba(38,49,43,.18); }
dialog::backdrop { background: rgba(38, 49, 43, .45); }

.toast { position: fixed; left: 50%; bottom: 1.2rem; transform: translate(-50%, 20px); background: var(--ink); color: #fff; padding: .7rem 1.1rem; border-radius: 999px; font: 600 .92rem ui-sans-serif, system-ui, sans-serif; opacity: 0; pointer-events: none; transition: opacity .2s ease, transform .2s ease; }
.toast.show { opacity: 1; transform: translate(-50%, 0); }

.foot { margin-top: 2.4rem; padding-top: 1.2rem; border-top: 1px solid var(--line); display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; align-items: center; color: var(--muted); }
.foot p { margin: 0; max-width: 60ch; }

@media (max-width: 900px) {
  .tutorial { grid-template-columns: 1fr; }
  .coach-panel { position: static; }
  .project-card { grid-template-columns: 1fr; }
  .project-art, .project-art.small { width: 100%; max-width: 320px; }
  .project-head { flex-direction: column; align-items: stretch; }
  .two-col { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  body { font-size: 1rem; }
  .shell { padding: 0 .9rem 2rem; }
  .topbar { padding: .8rem 0; margin-bottom: 1rem; }
  nav { width: 100%; overflow-x: auto; }
  nav ul { flex-wrap: nowrap; }
  nav a { white-space: nowrap; padding: .5rem .7rem; }
  .demo-stage { grid-template-columns: 1fr; min-height: 0; }
  .path-item { grid-template-columns: 36px 1fr; }
  .path-item .btn { grid-column: 1 / -1; }
  .filters { grid-template-columns: 1fr; }
  .controls .btn, .row .btn { flex: 1 1 auto; }
  .ask-row { flex-direction: column; }
  .msg { max-width: 100%; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
