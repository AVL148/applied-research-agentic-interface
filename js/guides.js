// Stappenplannen met tekeningen: per techniek en voor de kraanvogel zelf.
// De tekeningen zijn zelf getekend (diagrams.js); ze volgen de conventies van
// gewone origamidiagrammen en de volgorde van het referentiediagram (19 panelen).

import {
  poly, valley, mountain, crease, edge, arrow, label, dot, reflectAll, mirror,
  FR, SQ, DIAMOND, KB, KC, KM,
} from './diagrams.js';

/* ---------- Extra tekeningen die maar op één plek nodig zijn ---------- */

const HALF = [[40, 40], [200, 40], [200, 120], [40, 120]];

const valleyMid = () => [
  poly(HALF, 'f'),
  poly([[40, 120], [200, 120], [188, 72], [52, 72]], 'b'),
  crease([40, 120], [200, 120]),
  arrow([120, 196], [120, 132], 0),
  label('onderkant komt omhoog', 120, 228),
];

const mountainMid = () => [
  poly(HALF, 'f'),
  poly([[40, 120], [200, 120], [188, 168], [52, 168]], 'b'),
  crease([40, 120], [200, 120]),
  arrow([120, 60], [120, 100], 0),
  label('onderkant gaat naar achteren', 120, 228),
];

export const SHAPES = {
  valleySetup: () => [poly(SQ, 'f'), valley([40, 120], [200, 120]), arrow([120, 196], [120, 132], 0), label('dalvouw', 120, 228)],
  valleyMid,
  valleyDone: () => [
    poly([[40, 40], [200, 40], [200, 120], [40, 120]], 'f'),
    poly([[40, 46], [200, 46], [200, 120], [40, 120]], 'b'),
    label('de vouw ligt onderaan', 120, 150),
    label('(het gekleurde papier is nu bedekt)', 120, 166),
  ],
  valleySide: () => [
    edge([30, 90], [120, 150]), edge([120, 150], [210, 90]),
    dot([120, 150]),
    label('zijaanzicht: de vouw is een V (dal)', 120, 200),
  ],

  mountainSetup: () => [poly(SQ, 'f'), mountain([40, 120], [200, 120]), arrow([120, 60], [120, 100], 0), label('bergvouw', 120, 228)],
  mountainMid,
  mountainDone: () => [
    poly([[40, 34], [200, 34], [200, 114], [40, 114]], 'b'),
    poly([[40, 40], [200, 40], [200, 120], [40, 120]], 'f'),
    label('de vouw wijst van je af', 120, 150),
    label('(wit papier zit nu achter het gekleurde)', 120, 166),
  ],
  mountainSide: () => [
    edge([30, 150], [120, 90]), edge([120, 90], [210, 150]),
    dot([120, 90]),
    label('zijaanzicht: de vouw is een Λ (berg)', 120, 200),
  ],

  // Squash fold: een flap openen en plat drukken
  squashStart: () => [
    poly([[120, 44], [168, 200], [72, 200]], 'f'),
    crease([120, 44], [120, 200]),
    arrow([112, 120], [84, 120]),
    arrow([128, 120], [156, 120]),
    label('open de flap langs de middenlijn', 120, 228),
  ],
  squashMid: () => [
    poly([[120, 80], [190, 140], [120, 200], [50, 140]], 'f'),
    crease([120, 80], [120, 200]),
    arrow([120, 40], [120, 70]),
    label('duw het bovenste punt naar beneden', 120, 228),
  ],
  squashDone: () => [
    poly([[120, 60], [190, 130], [120, 200], [50, 130]], 'f'),
    crease([120, 60], [120, 200]),
    crease([50, 130], [190, 130]),
    label('plat gedrukt: een nieuwe ruit', 120, 228),
  ],

  // Sink fold: een punt naar binnen laten zakken
  sinkSetup: () => [
    poly(DIAMOND, 'f'),
    valley([96, 78], [144, 78]),
    arrow([120, 44], [120, 72]),
    label('vouw de punt omlaag en weer open', 120, 228),
  ],
  sinkMid: () => [
    poly(DIAMOND, 'f'),
    crease([96, 78], [144, 78]),
    arrow([120, 30], [120, 90], 0),
    label('duw de punt naar binnen (vouwen keren om)', 120, 228),
  ],
  sinkDone: () => [
    poly(DIAMOND, 'f'),
    poly([[96, 78], [144, 78], [120, 104]], 'b'),
    label('de punt is binnenin gezonken', 120, 228),
  ],

  // Kraanvogel: hals en staart (reverse folds), kop en vleugels
  legsLines: () => [
    poly([[120, 24], [146, 100], [120, 216], [94, 100]], 'f'),
    crease([120, 24], [120, 216]),
    valley([92, 164], [124, 136]),
    arrow([112, 200], [92, 158], 12),
    label('hals en staart: reverse fold', 120, 14),
  ],
  neckTail: () => {
    const body = [[120, 76], [152, 150], [120, 200], [88, 150]];
    return [
      poly([[88, 150], [96, 112], [52, 62], [44, 74]], 'f'),
      poly([[152, 150], [144, 112], [188, 62], [196, 74]], 'f'),
      poly(body, 'f'),
      crease([120, 76], [120, 200]),
      label('hals en staart wijzen omhoog', 120, 228),
    ];
  },
  head: () => {
    const neck = [[152, 150], [144, 112], [188, 62], [196, 74]];
    return [
      poly([[88, 150], [96, 112], [52, 62], [44, 74]], 'f'),
      poly(neck, 'f'),
      poly([[120, 76], [152, 150], [120, 200], [88, 150]], 'f'),
      crease([120, 76], [120, 200]),
      valley([180, 70], [198, 58]),
      arrow([190, 40], [190, 56]),
      label('kop: kleine reverse fold', 120, 228),
    ];
  },
  wingsOpen: () => [
    poly([[120, 120], [44, 70], [112, 156]], 'f'),
    poly([[120, 120], [196, 70], [128, 156]], 'f'),
    poly([[120, 112], [150, 160], [120, 206], [90, 160]], 'f'),
    arrow([70, 100], [48, 80]),
    arrow([170, 100], [192, 80]),
    label('trek de vleugels voorzichtig uit elkaar', 120, 228),
  ],
  crane: () => [
    poly([[40, 66], [64, 96], [88, 150], [66, 150]], 'f'),
    poly([[88, 150], [120, 62], [154, 150], [150, 192], [92, 192]], 'f'),
    crease([120, 62], [120, 192]),
    crease([92, 150], [120, 192]),
    crease([148, 150], [120, 192]),
    poly([[148, 150], [160, 98], [170, 64], [178, 68], [172, 104], [158, 150]], 'f'),
    poly([[170, 64], [208, 76], [176, 70]], 'f'),
    label('klaar: de kraanvogel', 120, 224),
  ],

  // Onderzoek: vergelijken met de referentie
  compare: () => [
    poly([[56, 54], [90, 124], [56, 194], [22, 124]], 'f'),
    poly([[184, 54], [218, 124], [190, 194], [150, 130]], 'f'),
    label('referentie', 56, 36), label('jouw model', 184, 36),
    arrow([112, 124], [130, 124]),
    label('verschil?', 120, 214),
  ],
  frames: () => [
    poly([[20, 40], [100, 40], [100, 100], [20, 100]], 'b'),
    poly([[140, 40], [220, 40], [220, 100], [140, 100]], 'b'),
    poly([[20, 130], [100, 130], [100, 190], [20, 190]], 'b'),
    poly([[140, 130], [220, 130], [220, 190], [140, 190]], 'b'),
    poly([[60, 52], [76, 88], [60, 94], [44, 88]], 'f'),
    poly([[180, 50], [204, 80], [180, 96], [156, 80]], 'f'),
    poly([[60, 140], [88, 176], [60, 184], [32, 176]], 'f'),
    poly([[180, 138], [210, 166], [180, 186], [150, 166]], 'f'),
    label('0:10', 60, 34), label('0:25', 180, 34), label('0:40', 60, 124), label('0:55', 180, 124),
    label('losse beelden uit de video', 120, 220),
  ],
  symmetry: () => [
    poly([[120, 40], [190, 120], [120, 200], [56, 120]], 'f'),
    mountain([120, 20], [120, 220]),
    arrow([120, 120], [66, 120]),
    arrow([120, 120], [182, 120]),
    label('as', 128, 28, 'start'),
    label('links = rechts?', 120, 234),
  ],
};

/* ---------- Stappenplannen per techniek ---------- */

const SRC = {
  zen: { title: 'Zenfolds – Basics of Origami: Folding Techniques', url: 'https://zenfolds.com/origami/basic-techniques' },
  vm: { title: 'Origami-Instructions – Valley and Mountain Folds', url: 'http://origami-instructions.com/origami-valley-and-mountain-folds.html' },
  prelim: { title: 'Origami Resource Center – Preliminary Base', url: 'https://origami-resource-center.com/preliminary-base/' },
  make: { title: 'Make-Origami – Preliminary Base', url: 'https://make-origami.com/preliminary-base' },
  guide: { title: 'Origami.guide – Mountain and valley folds', url: 'https://origami.guide/beginner-origami/origami-folding-techniques/origami-mountain-valley-folds/' },
};

export const GUIDES = {
  t1: {
    goal: 'Het papier vouwt naar je toe, zodat de vouw onderaan ligt en een V vormt.',
    needs: ['Vierkant vel papier', 'Vlak, glad oppervlak', 'Nagel of botje om de vouw aan te drukken'],
    steps: [
      { title: 'Zoek de vouwlijn', text: 'Streeplijn (- - - -) in een diagram betekent altijd: dalvouw. Leg het papier met de gekleurde kant boven en pak de onderrand.', shapes: SHAPES.valleySetup(), tip: 'Leg beide randen eerst op elkaar zonder te drukken. Pas als alles klopt maak je de vouw.' },
      { title: 'Breng de rand omhoog', text: 'Til de onderrand naar boven en leg hem precies op de bovenrand. Hoeken op hoeken, randen op randen.', shapes: SHAPES.valleyMid() },
      { title: 'Strijk de vouw scherp', text: 'Begin in het midden en strijk met je duim naar buiten. Een scherpe vouw is belangrijker dan veel kracht.', shapes: SHAPES.valleyDone() },
      { title: 'Controleer in zijaanzicht', text: 'Open de vouw een beetje: het papier vormt een V. Gebeurt het omgekeerde (Λ), dan is het een bergvouw geworden.', shapes: SHAPES.valleySide() },
    ],
    mistakes: ['Eerst vouwen en daarna pas uitlijnen: de vouw komt dan scheef.', 'De vouw van het midden uit niet naar buiten aanstrijken: er blijft een bolling.', 'Dalvouw en bergvouw verwisselen. Kijk naar het lijntype in het diagram.'],
    sources: [SRC.vm, SRC.guide],
  },
  t2: {
    goal: 'Het papier vouwt van je af, zodat de vouw een bergrug vormt.',
    needs: ['Vierkant vel papier', 'Vlak, glad oppervlak'],
    steps: [
      { title: 'Herken de bergvouw', text: 'Een streep-puntlijn (- · - ·) betekent bergvouw. Het papier gaat achter zichzelf.', shapes: SHAPES.mountainSetup() },
      { title: 'Vouw naar achteren', text: 'Houd het papier vast en vouw de onderkant naar achteren omhoog. Leg de randen achter het model netjes op elkaar.', shapes: SHAPES.mountainMid() },
      { title: 'Strijk aan', text: 'Strijk de vouw van het midden naar buiten aan terwijl je het papier tegen het tafelblad houdt.', shapes: SHAPES.mountainDone() },
      { title: 'Controleer in zijaanzicht', text: 'Open de vouw een beetje: het papier vormt een Λ. Zie je een V, dan heb je een dalvouw gemaakt.', shapes: SHAPES.mountainSide() },
    ],
    mistakes: ['Bergvouw moeilijk? Draai het papier om, maak een dalvouw en draai het weer terug (tip uit de bron).', 'Te snel vouwen zonder dat de achterkant netjes uitlijnt.'],
    sources: [SRC.vm, SRC.guide],
  },
  t3: {
    goal: 'Een smalle punt naar binnen of naar buiten omkeren, zodat hij een andere kant op wijst. Zo ontstaan hals, staart en kop van de kraanvogel.',
    needs: ['Smalle gevouwen punt (zoals bij de kraanvogel)', 'Scherpe voorvouw'],
    steps: [
      { title: 'Maak eerst een voorvouw', text: 'Vouw de punt langs de gewenste lijn omhoog (dalvouw) en strijk de vouw scherp. Vouw weer open.', shapes: FR.reverseSetup(), tip: 'Maak de vouw schuin: de hoek bepaalt de richting van hals en staart.' },
      { title: 'Open de lagen', text: 'Duw de punt omhoog en laat de twee zijkanten van de punt een beetje uit elkaar gaan. De vouw wordt een bergvouw aan de binnenkant.', shapes: [...FR.reverseSetup(), arrow([140, 100], [120, 124], -10)] },
      { title: 'Duw de punt naar binnen', text: 'Duw de punt tussen de twee lagen door naar binnen. Klap alles plat en strijk beide vouwen scherp aan.', shapes: FR.reverseDone() },
      { title: 'Naar buiten omkeren (outside reverse fold)', text: 'Bij een outside reverse fold wikkel je de punt juist om de buitenkant heen: dezelfde voorvouw, maar de punt gaat over het model in plaats van erin. Je ziet dan de witte achterkant.', shapes: FR.reverseDone('b') },
    ],
    mistakes: ['Zonder voorvouw proberen te draaien: het papier scheurt of wordt kreukelig.', 'De voorvouw te ver van de punt maken: hals en staart worden te lang.', 'Niet plat drukken voordat je de vouw aanstrijkt.'],
    sources: [SRC.zen],
  },
  t4: {
    goal: 'De vogelbasis is de vorm waarmee de kraanvogel begint: een smalle ruit met twee lange punten omhoog en twee punten omlaag.',
    needs: ['Vierkant vel (gekleurde kant boven)', 'Voorbereide basisvorm (preliminary base)'],
    steps: [
      { title: 'Begin met de basisvorm', text: 'Vouw eerst de basisvorm (preliminary base): zie de techniek “Preliminary base”. De open kant wijst naar je toe.', shapes: FR.prelimBase() },
      { title: 'Kite fold', text: 'Vouw de twee onderste randen van de bovenste laag naar de middenlijn (dalvouw). Zo ontstaat een vlieger.', shapes: FR.kiteLines() },
      { title: 'Vlieger', text: 'De omgevouwen flappen laten de witte achterkant zien. De vouwen komen precies op de middenlijn.', shapes: FR.kite() },
      { title: 'Petal fold', text: 'Vouw de bovenpunt omlaag, open weer, til de onderpunt omhoog en laat de zijkanten meeklappen (zie “Petal fold”).', shapes: FR.petalLift() },
      { title: 'Herhaal aan de achterkant', text: 'Draai het model om en doe kite fold en petal fold nog een keer. Je hebt nu een vogelbasis.', shapes: FR.birdBase() },
    ],
    mistakes: ['De kite fold niet precies tegen de middenlijn leggen: de vogelbasis wordt scheef.', 'Vergeten de achterkant te herhalen.', 'Het model niet goed plat strijken voordat je verdergaat.'],
    sources: [SRC.prelim, SRC.make, SRC.zen],
  },
  t5: {
    goal: 'Een flap openen en plat drukken tot een ruit. Dit gebeurt vooral bij de basisvorm van de kraanvogel.',
    needs: ['Een flap met middenlijn', 'Scherpe voorvouwen'],
    steps: [
      { title: 'Zet de flap klaar', text: 'Til de flap een beetje op. Zijn de vouwen scherp genoeg, dan kun je hem langs de middenlijn openen.', shapes: SHAPES.squashStart() },
      { title: 'Open en duw omlaag', text: 'Duw de bovenpunt omlaag en laat de zijkanten uit elkaar gaan.', shapes: SHAPES.squashMid() },
      { title: 'Druk plat', text: 'Strijk alles plat. De middenlijn is nu de symmetrieas van een nieuwe ruit.', shapes: SHAPES.squashDone() },
    ],
    mistakes: ['Niet voorvouwen, daardoor wordt de ruit scheef.', 'Te hard drukken voordat de vouwen op hun plek liggen.'],
    sources: [SRC.zen],
  },
  t6: {
    goal: 'Een lange smalle vorm (petal) maken uit een vlieger. Deze vouw is nodig voor de vogelbasis van de kraanvogel.',
    needs: ['Vlieger (kite fold gedaan)', 'Scherpe voorvouwen'],
    steps: [
      { title: 'Begin met de vlieger', text: 'Zorg dat de vlieger netjes plat ligt en de flappen op de middenlijn liggen.', shapes: FR.kite() },
      { title: 'Voorvouwen maken', text: 'Vouw de bovenpunt omlaag op de lijn tussen de twee zijpunten en vouw weer open. Dit is je voorvouw.', shapes: FR.petalLines() },
      { title: 'Til de onderpunt op', text: 'Pak de onderste punt van de bovenste laag en til hem omhoog. De zijkanten klappen vanzelf naar de middenlijn.', shapes: FR.petalLift() },
      { title: 'Strijk aan', text: 'Druk alles plat. Je hebt aan deze kant een lange smalle vorm. Herhaal aan de achterkant.', shapes: FR.birdBase() },
    ],
    mistakes: ['De voorvouwen overslaan: het papier wil dan niet vanzelf meebewegen.', 'Aan twee kanten tegelijk trekken in plaats van omhoog tillen.', 'Vergeten de achterkant te herhalen.'],
    sources: [SRC.zen],
  },
  t7: {
    goal: 'Een punt naar binnen laten zakken, zodat hij in het model verdwijnt.',
    needs: ['Model met een punt', 'Scherpe voorvouwen'],
    steps: [
      { title: 'Voorvouw maken', text: 'Vouw de punt omlaag langs de lijn waar hij moet zinken en vouw weer open.', shapes: SHAPES.sinkSetup() },
      { title: 'Laat de punt zakken', text: 'Duw de punt naar binnen. De vouwen keren om (berg wordt dal, dal wordt berg).', shapes: SHAPES.sinkMid() },
      { title: 'Strijk aan', text: 'Strijk alles plat. De punt zit nu binnenin.', shapes: SHAPES.sinkDone() },
    ],
    mistakes: ['Niet scherp genoeg voorgevouwen: de punt blijft half staan.', 'Geforceerd duwen terwijl de vouwen nog niet omkeren.'],
    sources: [SRC.zen],
  },
  t8: {
    goal: 'Elke vouwstap naast de referentie leggen en afwijkingen eerst zichtbaar maken, voordat je verder vouwt.',
    needs: ['Referentievideo of referentiediagram', 'Jouw model na elke stap'],
    steps: [
      { title: 'Kies een controlemoment', text: 'Zet de video op het einde van de stap, of kijk naar het diagram van die stap.', shapes: SHAPES.frames() },
      { title: 'Leg model en referentie naast elkaar', text: 'Controleer drie dingen: vorm, hoeken en vouwrichting (berg of dal).', shapes: SHAPES.compare() },
      { title: 'Noteer het verschil', text: 'Schrijf één zin op: wat wijkt af en in welke stap is het ontstaan?', shapes: SHAPES.symmetry() },
    ],
    mistakes: ['Pas aan het einde vergelijken: fouten uit vroege stappen zijn dan niet meer te herstellen.', 'Alleen naar de vorm kijken, niet naar de vouwrichting.'],
    sources: [],
  },
  t9: {
    goal: 'Een AI losse beelden uit je video laten bekijken om te zien welke stap waar begint.',
    needs: ['Een geüploade video', 'AI-verbinding (optioneel)'],
    steps: [
      { title: 'Upload de video', text: 'Ga naar Video-analyse en kies je video. De video blijft in je eigen browser.', shapes: SHAPES.frames() },
      { title: 'Laat 10 beelden analyseren', text: 'De browser haalt 10 losse beelden uit de video. De AI beschrijft alleen wat hij daarop ziet en markeert onzekere stukken.', shapes: SHAPES.frames() },
      { title: 'Controleer de voorgestelde fragmenten', text: 'Pas de koppeling aan stappen aan waar nodig en bevestig pas daarna. Zonder jouw bevestiging telt niets mee.', shapes: SHAPES.compare() },
    ],
    mistakes: ['De AI-voorstellen blind overnemen: hij ziet losse beelden, geen beweging.', 'Een donkere of wazige video gebruiken.'],
    sources: [],
  },
  t10: {
    goal: 'Het eindresultaat beoordelen op een vaste checklist, zodat de uitkomsten vergelijkbaar blijven tussen de proef met video en de proef met interface.',
    needs: ['Afgewerkte kraanvogel', 'Referentiefoto of -video'],
    steps: [
      { title: 'Kijk naar symmetrie', text: 'Houd de vogel recht voor je en kijk of beide vleugels even groot zijn.', shapes: SHAPES.symmetry() },
      { title: 'Vergelijk met de referentie', text: 'Leg de vogel naast de referentie: let op vleugelhoek, hals en snavel.', shapes: SHAPES.compare() },
      { title: 'Noteer je score', text: 'Geef elk onderdeel een score van 1 tot 5 en schrijf één verbeterpunt op voor de volgende ronde.', shapes: SHAPES.crane() },
    ],
    mistakes: ['Verschillende criteria gebruiken bij beide proeven.', 'Pas achteraf bedenken waar je op let.'],
    sources: [],
  },
  t11: {
    goal: 'De basisvorm waarmee veel traditionele modellen beginnen, ook de kraanvogel. Het papier wordt een kleinere vierkant met vier flappen.',
    needs: ['Vierkant vel, gekleurde kant boven'],
    steps: [
      { title: 'Vouw de diagonalen', text: 'Gekleurde kant boven. Vouw beide diagonalen en vouw ze weer open. Je krijgt een X.', shapes: FR.diagonalFold() },
      { title: 'Draai om en vouw de middenlijnen', text: 'Leg de witte kant boven. Vouw het papier links op rechts en boven op onder en vouw telkens weer open.', shapes: FR.flippedMidlines() },
      { title: 'Alle vouwen zijn klaar', text: 'Je hebt nu vier lijnen door het midden en twee diagonalen. Zo kan het papier straks vanzelf inklappen.', shapes: FR.allCreased() },
      { title: 'Duw de zijkanten naar binnen', text: 'Duw de linker- en rechterrand naar elkaar toe terwijl de bovenkant omlaag zakt. De diagonalen worden bergvouwen, de middenlijnen dalvouwen.', shapes: FR.collapse() },
      { title: 'Strijk plat', text: 'Je houdt een vierkant over met vier flappen en een open kant. Zo begint de kraanvogel.', shapes: FR.prelimBase() },
    ],
    mistakes: ['De diagonalen en middenlijnen niet allemaal vouwen: het model klapt dan niet vanzelf in.', 'Per ongeluk de verkeerde kant boven: de kleur zit daarna binnenin.', 'De open kant naar boven houden in plaats van naar je toe.'],
    sources: [SRC.prelim, SRC.make],
  },
};

/* ---------- Stappenplan van het project (kraanvogel) ---------- */

export const PLANS = {
  1: [
    { title: 'Papier klaarleggen', text: 'Vierkant vel, gekleurde kant boven, vaste richting. Op deze tekening is het gekleurde vlak de buitenkant van de vogel.', shapes: FR.square('f') },
    { title: 'Doel', text: 'Zo ziet de eindvorm eruit.', shapes: SHAPES.crane() },
  ],
  2: [
    { title: 'Diagonalen', text: 'Vouw beide diagonalen en vouw weer open.', shapes: FR.diagonalFold() },
    { title: 'Omdraaien en middenlijnen', text: 'Witte kant boven: vouw links op rechts en boven op onder, telkens weer open.', shapes: FR.flippedMidlines() },
    { title: 'Resultaat', text: 'Je hebt 8 vouwlijnen. Controleer of ze recht door het midden lopen.', shapes: FR.allCreased() },
  ],
  3: [
    { title: 'Klap in tot basisvorm', text: 'Duw de zijkanten naar binnen: de middenlijnen worden dalvouwen.', shapes: FR.collapse() },
    { title: 'Basisvorm', text: 'Open kant naar je toe.', shapes: FR.prelimBase() },
    { title: 'Kite fold', text: 'Vouw de onderste randen naar de middenlijn: dalvouw aan beide kanten.', shapes: FR.kiteLines() },
    { title: 'Resultaat', text: 'Een vlieger. Draai om en herhaal.', shapes: FR.kite() },
  ],
  4: [
    { title: 'Bovenpunt omlaag', text: 'Voorvouw: vouw de bovenpunt omlaag en weer open.', shapes: FR.petalLines() },
    { title: 'Petal fold', text: 'Til de onderpunt omhoog; de zijkanten klappen naar binnen (bergvouwen langs de middenlijn).', shapes: FR.petalLift() },
    { title: 'Vogelbasis', text: 'Herhaal aan de achterkant.', shapes: FR.birdBase() },
  ],
  5: [
    { title: 'Smal maken', text: 'Vouw de onderste randen naar de middenlijn.', shapes: FR.narrowLines() },
    { title: 'Smalle vorm', text: 'Draai om en herhaal.', shapes: FR.narrow() },
    { title: 'Reverse folds', text: 'Maak een schuine voorvouw bij beide onderpunten.', shapes: SHAPES.legsLines() },
    { title: 'Hals en staart', text: 'Duw beide punten naar binnen: de ene wordt hals, de andere staart.', shapes: SHAPES.neckTail() },
  ],
  6: [
    { title: 'Vleugels uit elkaar', text: 'Trek de vleugels langzaam omlaag tot ze horizontaal staan.', shapes: SHAPES.wingsOpen() },
    { title: 'Symmetrie controleren', text: 'Kijk van boven langs de middenlijn: links en rechts moeten gelijk zijn.', shapes: SHAPES.symmetry() },
  ],
  7: [
    { title: 'Kop', text: 'Vouw de punt van de hals met een kleine reverse fold om.', shapes: SHAPES.head() },
    { title: 'Blaas hem op', text: 'Trek de vleugels zacht naar buiten en druk de buik uit.', shapes: SHAPES.crane() },
  ],
  8: [
    { title: 'Vergelijk', text: 'Leg je kraanvogel naast de referentie.', shapes: SHAPES.compare() },
    { title: 'Klaar', text: 'Noteer wat goed ging en welke stap je moeilijk vond.', shapes: SHAPES.crane() },
  ],
};
