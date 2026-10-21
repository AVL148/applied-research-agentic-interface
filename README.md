# atelier/maat

Prototype van een agentic maakcoach voor mensen die een ambacht leren. Voorbeeldproject: een **geweven wandhanger** in 8 stappen, met demonstratie, begeleider en reflectie.

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
- Voortgang verandert **alleen** nadat de gebruiker een stap bevestigt (de coach kan dat niet).
- Reflectievraag met opties en vrij tekstveld, overslaan mogelijk.
- Zoeken en filteren op tekst, techniek en niveau.
- Responsive en toetsenbordbedienbaar, met labels, zichtbare focus en `aria-live` voor het gesprek.

## Wat gesimuleerd is

- **Demonstratie:** een placeholder met lokale afspeel/pauze/herhaal-simulatie. Er is geen echte video.
- **Begeleider:** lokale regels en voorbeeldantwoorden (`js/coach.js`). Geen AI, geen netwerk. De interface zegt dat ook.
- **Technieken:** lokale voorbeelddata, niet van internet.

## Waar Claude later aansluit

Alle coachantwoorden lopen via één functie: `askCoach()` in `js/coach.js`. Vervang daar de lokale regels door een aanroep naar je **eigen backend** (bijv. `POST /api/coach`) die de Claude API gebruikt, met het contract:

```
askCoach({ kind, step, question?, history? }) -> { text, followUp?, simulated }
```

Zet nooit een API-sleutel in frontendcode. Andere toekomstige integraties: echte tutorialvideo's, beeldanalyse van het werkstuk, projectgeheugen en persoonlijke leeradviezen.

## Structuur

```
index.html        shell en dialoog
css/styles.css    ontwerp, responsive
js/data.js        voorbeeldproject, stappen, technieken
js/store.js       staat, localStorage, pure logica
js/coach.js       begeleider-adapter (enige koppelpunt voor Claude)
js/app.js         routing en schermen
server.mjs        minimale statische server
tests/            node:test
```
