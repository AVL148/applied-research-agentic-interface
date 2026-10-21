# applied research agentic interface

Prototype van een research-interface voor het origami-vouwen van een kraanvogel. De interface gebruikt een bestaande video als referentie om te bepalen of een AI-ondersteunde analyse beter werkt dan een normale video zonder extra ondersteuning.

## Starten

Vereist Node 18 of nieuwer. Er zijn geen dependencies en geen buildstap.

```bash
npm start        # http://localhost:5173  (andere poort: PORT=8080 npm start)
npm test         # logica-tests (voortgang, opslag, zoeken, coach)
```

Je kunt ook elke statische server op de projectmap gebruiken.

## Wat werkt echt

- Navigatie: dashboard, project, tutorial per stap, technieken zoeken, opgeslagen technieken.
- Leerpad met afgeronde, huidige en komende stappen; eerdere stappen opnieuw openen.
- Voortgang, reflecties, gesprekken en opgeslagen technieken in `localStorage`; reset via **Demo resetten**.
- Onderzoeksflow voor origami-kraanvogel: referentievideo, vouwstappen, AI-feedback en kwaliteitsreview.
- AI is in deze versie nog een prototype-koppeling; de interface is voorbereid op echte backend-integratie.

## Wat gesimuleerd is

- **Video-analyse:** demo-video en visuele preview, zonder echte computer vision of AI-backend.
- **Begeleider:** lokale regels en voorbeeldantwoorden (`js/coach.js`). Geen AI, geen netwerk. De interface zegt dat ook.
- **Technieken:** lokale voorbeelddata, niet van internet.

## Waar een echte AI later aansluit

Alle coachantwoorden lopen via één functie: `askCoach()` in `js/coach.js`. Vervang daar de lokale regels door een aanroep naar je eigen backend, bijvoorbeeld `POST /api/coach` of `POST /api/analyze-video`, die de kraanvogelvideo analyseert en het volgende vouwprobleem adviseert.

Zet nooit een API-sleutel in frontendcode. Het ontwerp is nu klaar voor een echte AI-connectie.

## Structuur

```text
index.html        shell en dialoog
css/styles.css    ontwerp, responsive
js/data.js        project, stappen, technieken
js/store.js       staat, localStorage, pure logica
js/coach.js       begeleider-adapter (enige koppelpunt voor AI)
js/app.js         routing en schermen
server.mjs        minimale statische server
```
