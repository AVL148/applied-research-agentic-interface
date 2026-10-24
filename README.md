# applied research agentic interface

Onderzoeksprototype rond **origami vouwen** (papieren kraanvogel). Een bestaande instructievideo wordt ondersteund door een agentic interface, om te onderzoeken of dat tot een beter vouwresultaat leidt dan een gewone video zonder extra aanwijzingen.

De gebruiker bepaalt zelf het tempo en bevestigt zelf wanneer een stap klaar is. De begeleider legt uit, geeft hints en stelt voor; hij voert niets uit en wijzigt de voortgang nooit zelf.

## Starten

Vereist Node 18 of nieuwer. Er zijn geen dependencies en geen buildstap.

```bash
npm start        # http://localhost:5173  (andere poort: PORT=8080 npm start)
npm test         # 27 tests: logica, AI-laag en server
```

Dubbelklikken op `index.html` werkt niet (browsers blokkeren JavaScript-modules bij `file://`). Gebruik `npm start`.

## Wat de interface doet

- **Dashboard, project en leerpad** met 8 stappen, voortgang en reflectie per stap.
- **Video-analyse** (menu: *Video-analyse*): upload een bestaande video, laat de AI fragmenten voorstellen, koppel ze aan stappen en neem ze pas over nadat je dat bevestigt. In een stap speel je dan het bijbehorende fragment af.
- **Begeleider** per stap: *Leg anders uit*, *Geef een hint* en een eigen vraag.
- **Technieken** zoeken en opslaan.
- Voortgang, gesprekken en de video blijven bewaard in je browser. *Demo resetten* wist alles.

## Een AI verbinden

De browser praat nooit rechtstreeks met Claude en bevat geen sleutel. De server (`server.mjs`) roept de Claude API aan.

1. Maak een API-sleutel op console.anthropic.com.
2. Kopieer `.env.example` naar `.env` en vul in: `ANTHROPIC_API_KEY=...`
3. Start opnieuw met `npm start`. In de terminal staat dan `AI verbonden`.

`.env` staat in `.gitignore` en komt nooit in GitHub. Het model is in te stellen met `ANTHROPIC_MODEL`.

Zonder sleutel blijft alles werken: de begeleider geeft dan gemarkeerde voorbeeldantwoorden en de video-analyse biedt een duidelijk als gesimuleerd gemarkeerde voorbeeldanalyse.

### Hoe de video-analyse werkt

1. De video blijft in je browser (IndexedDB) en wordt niet geüpload.
2. Bij **Analyseer video met AI** haalt de browser 10 losse beelden (JPEG, maximaal 512 px breed) uit de video.
3. Alleen die beelden gaan via je server naar de Claude API (`POST /api/analyze-video`).
4. De server controleert en begrenst het antwoord (tijden, stap-nummers, aantal fragmenten) voordat de browser het ziet.

Beperkingen die je in het onderzoek moet meewegen: de AI ziet losse beelden zonder geluid en zonder beweging ertussen. Fragmenten zijn voorstellen, geen vaststaande feiten, en de AI beoordeelt nooit een werkstuk dat hij niet gezien heeft.

## Online zetten

- **GitHub Pages** kan alleen de statische pagina tonen. Daar draait geen server, dus dan werken uploaden, afspelen en de voorbeeldanalyse, maar niet de echte AI. Pages is gratis voor publieke repositories.
- Voor echte AI online moet `server.mjs` ergens draaien (bijvoorbeeld een kleine Node-hosting). Zet dan in `js/config.js` de `API_BASE` op die server en op de server `ALLOWED_ORIGIN` op het adres van je pagina.
- Zet nooit een API-sleutel in `js/`, `index.html` of in de repository.

## Structuur

```
index.html          shell en dialoog
css/styles.css      ontwerp, responsive
js/data.js          project, stappen en technieken (origami-kraanvogel)
js/store.js         staat, localStorage, pure logica
js/coach.js         begeleider: Claude via de server, anders voorbeeldantwoorden
js/api.js           contact met de server (status, aanvragen)
js/video.js         video bewaren, beelden uit de video halen, voorbeeldanalyse
js/config.js        adres van de AI-server
js/app.js           routing en schermen
server.mjs          statische server + /api/status, /api/coach, /api/analyze-video
server/ai.mjs       Claude API-aanroepen en validatie (alleen server)
tests/              node:test
```

## Wat echt is en wat gesimuleerd

| Onderdeel | Status |
| --- | --- |
| Navigatie, voortgang, reflectie, opslag, technieken | Werkt echt, lokaal |
| Video uploaden, bewaren, afspelen en fragmenten afspelen | Werkt echt, lokaal |
| Coach en video-analyse met Claude | Werkt zodra de server een geldige `ANTHROPIC_API_KEY` heeft; getest met een nagemaakte Claude, nog niet met een echte sleutel |
| Demonstratie zonder geüploade video | Placeholder met afspeelsimulatie, geen echte video |
| Beeldanalyse van je eigen vouwwerk | Nog niet gebouwd |
| Projectgeheugen en persoonlijke leeradviezen | Nog niet gebouwd |
