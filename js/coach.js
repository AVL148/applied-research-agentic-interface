export const PROJECT = {
  id: 'origami-crane-study',
  title: 'Origami kraanvogel',
  summary:
    'Onderzoek naar een kraanvogel in origami: een bestaande video wordt geanalyseerd om te beoordelen of een AI-ondersteunde interface betere vouwfeedback geeft dan een normale video zonder extra aanwijzingen.',
  level: 'Research prototype',
  totalTime: 'Video + AI review',
};

export const STEPS = [
  {
    id: 1,
    title: 'Papier en referentievideo voorbereiden',
    minutes: 15,
    demoTitle: 'Start van de kraanvogel',
    demoSeconds: 48,
    demoCaption: 'Upload de bestaande video van de kraanvogel en plaats een vierkant vel papier in een duidelijke startpositie.',
    instructions: [
      'Upload een bestaande origami-video van de kraanvogel en controleer of de contouren goed zichtbaar zijn.',
      'Leg een vierkant vel papier vlak neer met duidelijke hoeken en een vaste richting.',
      'Bepaal wat het einddoel is: een nette, symmetrische kraanvogel met een duidelijke vleugelvorm.',
    ],
    tip: 'Een heldere referentievideo met zichtbare contouren maakt de AI-analyse betrouwbaarder.',
    easier:
      'Begin met een duidelijke startpositie: zonder scherpe basis is de rest van de vouw moeilijk te vergelijken.',
    hints: [
      'Controleer of de video niet te donker of te fel is.',
      'Zet de video op het eerste duidelijke vouwmoment stil.',
    ],
    reflection: {
      question: 'Wat was het belangrijkste bij het voorbereiden van de video?',
      options: ['De video was duidelijk', 'De positie van het papier was lastig', 'Ik wilde een ander startpunt', 'Ik weet het nog niet'],
    },
  },
  {
    id: 2,
    title: 'Basisvorm en middenlijn leggen',
    minutes: 20,
    demoTitle: 'Middenlijn vastleggen',
    demoSeconds: 62,
    demoCaption: 'Gebruik de video om de middenlijn en eerste basisvorm exact te volgen.',
    instructions: [
      'Vouw het papier in het midden zodat beide zijden symmetrisch liggen.',
      'Controleer of de vouwlijn recht en gelijkmatig is.',
      'Gebruik de video om te zien waar de eerste basisvorm begint.',
    ],
    tip: 'Een goede middenlijn is de basis van de kraanvogel. Als die scheef is, ontstaat de rest ook scheef.',
    easier:
      'Denk aan de middenlijn als het kompas van de vouw: alles draait daar om.',
    hints: [
      'Vergelijk linker- en rechterhelft voor symmetrie.',
      'Maak een kleine correctie als de vouw niet precies in het midden zit.',
    ],
    reflection: {
      question: 'Hoe ging de middenlijn?',
      options: ['Goed en recht', 'Een beetje scheef', 'Niet helemaal gelijk', 'Ik wil nog oefenen'],
    },
  },
  {
    id: 3,
    title: 'Valley fold aanbrengen',
    minutes: 25,
    demoTitle: 'Valley fold voor de vleugels',
    demoSeconds: 72,
    demoCaption: 'De vouw gaat naar binnen en vormt het eerste duidelijke dal in het papier.',
    instructions: [
      'Maak de eerste valley fold langs de geleider van de video.',
      'Laat de twee vlakken gelijkmatig samenkomen zonder te veel druk.',
      'Gebruik de referentie om de hoek en diepte van de vouw te controleren.',
    ],
    tip: 'Een vallei moet scherp zijn, maar niet gekreukeld. De scherpe lijn is belangrijker dan brute kracht.',
    easier:
      'Zie het als een dal: het papier zakt naar de middenlijn toe.',
    hints: [
      'Als de vouw ruw is, maak dan een kleine herhaling met minder druk.',
      'Gebruik de video als visuele controle bij het aanleggen.',
    ],
    reflection: {
      question: 'Hoe voelde de vallei?',
      options: ['Helemaal scherp', 'Vrij goed', 'Niet scherp genoeg', 'Ik moest opnieuw beginnen'],
    },
  },
  {
    id: 4,
    title: 'Mountain fold opbouwen',
    minutes: 30,
    demoTitle: 'Bergvouw voor de contour',
    demoSeconds: 80,
    demoCaption: 'De tweede contour draait omhoog en vormt het eerste duidelijke bergpad van de vogel.',
    instructions: [
      'Maak een mountain fold tegenover de valley fold om de contouren van de vleugels te vormen.',
      'Laat de lijnen scherp maar rustig uitkomen.',
      'Controleer met de video of de hoek en richting juist zijn.',
    ],
    tip: 'Bij een bergvouw zie je de contour omhoog komen; de richting is precies het tegenovergestelde van de vallei.',
    easier:
      'Denk aan een berg: het papier komt omhoog en vormt een duidelijke top.',
    hints: [
      'Markeer de lijn eerst licht om te voorkomen dat de vorm scheef gaat.',
      'Vergelijk de richting ook met het voorbeeldbeeld.',
    ],
    reflection: {
      question: 'Welk type vouw was moeilijker?',
      options: ['Valley fold', 'Mountain fold', 'Beide ongeveer even', 'Ik weet het nog niet'],
    },
  },
  {
    id: 5,
    title: 'Reverse fold en vleugelvorm maken',
    minutes: 35,
    demoTitle: 'Vleugel en contour draaien',
    demoSeconds: 65,
    demoCaption: 'Een reverse fold geeft de kraanvogel een duidelijke, karakteristieke vleugel- en lichaamsvorm.',
    instructions: [
      'Leg de duidelijke contour van de vleugel vast en draai de rand om.',
      'Maak de reverse fold in één vloeiende beweging zonder de hoek te scheuren.',
      'Vergelijk de vorm met de referentievideo van de kraanvogel.',
    ],
    tip: 'Bij een reverse fold is precisie belangrijker dan snelheid. Eén nette draai maakt het model duidelijker.',
    easier:
      'Je draait een flap om en laat de contour terugkomen in de juiste richting.',
    hints: [
      'Zet een lichte markering op de hoek om de juiste draai te volgen.',
      'Werk met kleine, gecontroleerde bewegingen.',
    ],
    reflection: {
      question: 'Hoe ging de omkering van de contour?',
      options: ['Vlot', 'Ik had even een pauze nodig', 'Ik moest corrigeren', 'Niet goed genoeg'],
    },
  },
  {
    id: 6,
    title: 'Zijvleugels en symmetrie controleren',
    minutes: 25,
    demoTitle: 'Symmetrie in balans',
    demoSeconds: 64,
    demoCaption: 'Controleer of beide vleugels even groot en symmetrisch zijn, net als in de standaard kraanvogelvideo.',
    instructions: [
      'Maak de vouwen aan beide zijden even groot en symmetrisch.',
      'Vergelijk de beide vleugels met elkaar en met de referentie.',
      'Laat de vorm rusten en controleer opnieuw of de lijnen parallel lopen.',
    ],
    tip: 'Symmetrie werkt het best als je beide zijden gelijktijdig bekijkt.',
    easier:
      'Je bekijkt beide vleugels alsof je ze tegelijk maakt in een vaste, evenwichtige beweging.',
    hints: [
      'Kijk langs de middenlijn om scheefheid te zien.',
      'Doe kleine correcties in plaats van grote herzieningen.',
    ],
    reflection: {
      question: 'Welke kant was het lastigst om symmetrisch te houden?',
      options: ['Links', 'Rechts', 'Beide', 'Geen verschil'],
    },
  },
  {
    id: 7,
    title: 'Hoofd, snavel en details verfijnen',
    minutes: 20,
    demoTitle: 'Laatste details van de kraanvogel',
    demoSeconds: 58,
    demoCaption: 'Werk de laatste contouren bij zodat de snavel en de staart zichtbaar en scherp zijn.',
    instructions: [
      'Werk de kleine vouwen bij rond het hoofd en de staart.',
      'Controleer of de snavel duidelijk en recht staat.',
      'Vergelijk de laatste details met de referentievideo van de kraanvogel.',
    ],
    tip: 'Fijne correcties maken het model vaak realistischer dan grote extra vouwen.',
    easier:
      'Je only refines what is not yet right and lets the shape return to balance.',
    hints: [
      'Kleine correcties op de snavel zorgen voor meer duidelijkheid in de totale vorm.',
      'Vergelijk de laatste detailstappen ook met de video.',
    ],
    reflection: {
      question: 'Wat was het meest opvallende detail?',
      options: ['Snavel', 'Vleugels', 'Staart', 'Ik had weinig details te corrigeren'],
    },
  },
  {
    id: 8,
    title: 'Eindresultaat toetsen en feedback verzamelen',
    minutes: 20,
    demoTitle: 'Review en vergelijking',
    demoSeconds: 54,
    demoCaption: 'Vergelijk de eindvorm met de referentie en noteer waar de AI-interface of de normale video het beste hielp.',
    instructions: [
      'Vergelijk het eindresultaat met de video en markeer de verschillen in vouwvorm en symmetrie.',
      'Noteer welke stap het duidelijkst was en welke moeilijk bleef.',
      'Vraag de AI om een focusadvies op basis van het grootste verschil tussen jouw model en de referentie.',
    ],
    tip: 'De beste feedback komt uit het vergelijken van detail en vorm, niet alleen van heel het model.',
    easier:
      'Je kijkt terug op het model zoals een onderzoeker: wat werkt, wat valt op en wat kan beter?',
    hints: [
      'Kies één duidelijke verbetering voor de volgende proefronde.',
      'Bewaar de video voor vergelijking in een volgende ronde.',
    ],
    reflection: {
      question: 'Wat is je belangrijkste leerpunt voor de volgende ronde?',
      options: ['Steviger beginpunt', 'Meer symmetrie', 'Sharper contouren', 'Ik wil eerst nog oefenen'],
    },
  },
];

export const TECHNIQUES = [
  { id: 't1', name: 'Valley fold', craft: 'Origami', material: 'Papier', level: 'Beginner', description: 'Een vouw naar binnen die een duidelijke dalvorm in de kraanvogel creëert.' },
  { id: 't2', name: 'Mountain fold', craft: 'Origami', material: 'Papier', level: 'Beginner', description: 'Een vouw naar buiten die de contour van de vleugel en het lijf laat omhoogkomen.' },
  { id: 't3', name: 'Reverse fold', craft: 'Origami', material: 'Papier', level: 'Gemiddeld', description: 'Een flap omdraaien om de scherpe contour van vleugel of snavel te vormen.' },
  { id: 't4', name: 'Bird base', craft: 'Origami', material: 'Papier', level: 'Beginner', description: 'De basisvorm die vaak wordt gebruikt voor de kraanvogel-structuur.' },
  { id: 't5', name: 'Squash fold', craft: 'Origami', material: 'Papier', level: 'Gemiddeld', description: 'Een form van flattening die de vleugel en het lijf van de vogel afwerkt.' },
  { id: 't6', name: 'Petal fold', craft: 'Origami', material: 'Papier', level: 'Gevorderd', description: 'Een ronde, afgeronde vouw voor de vleugel- of snavelvorm van de kraanvogel.' },
  { id: 't7', name: 'Sink fold', craft: 'Origami', material: 'Papier', level: 'Gevorderd', description: 'Een ingedrukte vouw om de vorm van het lichaam of de vleugel te verdiepen.' },
  { id: 't8', name: 'Reference matching', craft: 'Research', material: 'Video', level: 'Beginner', description: 'De vouwstappen vergelijken met de video om afwijkingen te signaleren.' },
  { id: 't9', name: 'AI frame check', craft: 'Research', material: 'Video + prompts', level: 'Gemiddeld', description: 'Frame-analyses gebruiken om de juiste vouw- of contourfout te vinden.' },
  { id: 't10', name: 'Fold quality review', craft: 'Research', material: 'Video', level: 'Beginner', description: 'De eindkwaliteit beoordelen in vergelijking met de standaard kraanvogelvideo.' },
];

export const FILTERS = {
  crafts: ['Alle', 'Origami', 'Research'],
  levels: ['Alle', 'Beginner', 'Gemiddeld', 'Gevorderd'],
};
