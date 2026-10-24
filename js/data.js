// Lokale voorbeelddata. Niets hiervan komt van internet of uit een API.

export const APP_NAME = 'applied research agentic interface';

export const PROJECT = {
  id: 'kraanvogel',
  title: 'Papieren kraanvogel',
  summary:
    'Een klassieke origami-kraanvogel (tsuru) uit één vierkant vel papier van 15 × 15 cm. Je leert basisvouwen, de vogelbasis, omvouwen en afwerken, met een bestaande video als leidraad.',
  level: 'Beginner tot gemiddeld',
  totalTime: '± 1,5 uur',
};

// Elke stap bevat alles wat het tutorialscherm nodig heeft.
export const STEPS = [
  {
    id: 1,
    title: 'Papier klaarleggen en diagonalen vouwen',
    minutes: 10,
    demoTitle: 'Het papier voorbereiden',
    demoSeconds: 40,
    demoCaption: 'Vierkant vel, kleurzijde boven. Twee diagonalen vouwen en weer openen.',
    instructions: [
      'Leg een vierkant vel papier met de kleurzijde boven op een vlakke tafel.',
      'Vouw het vel diagonaal dubbel, hoek op hoek, en strijk de vouw scherp aan met je nagel.',
      'Open het papier en herhaal dit met de andere diagonaal.',
      'Open het papier weer. Je ziet nu een kruis van twee vouwlijnen.',
    ],
    tip: 'Leg de hoeken exact op elkaar voordat je aanstrijkt. Een scheve eerste vouw geeft een scheve vogel.',
    easier:
      'Je vouwt het vierkant twee keer van hoek naar hoek en opent het weer, zodat er twee kruisende lijnen in het papier zitten.',
    hints: [
      'Strijk de vouw van het midden naar buiten aan, dan blijft het papier vlak.',
      'Controleer of de twee vouwlijnen precies in het midden kruisen.',
    ],
    reflection: {
      question: 'Lagen de hoeken precies op elkaar toen je vouwde?',
      options: ['Ja, precies', 'Bijna, een beetje scheef', 'Nee, de vouw liep scheef', 'Dat kon ik niet goed zien'],
    },
  },
  {
    id: 2,
    title: 'De basisvorm vouwen (preliminary base)',
    minutes: 15,
    demoTitle: 'Van vlak vel naar klein vierkant',
    demoSeconds: 75,
    demoCaption: 'Eerst ook horizontaal en verticaal vouwen, dan laat je het papier samenklappen.',
    instructions: [
      'Keer het papier om en vouw het horizontaal dubbel. Strijk aan en open weer.',
      'Vouw het ook verticaal dubbel, strijk aan en open weer.',
      'Duw de zijkanten naar binnen langs de bestaande vouwlijnen, zodat het papier samenklapt tot een kleiner vierkant.',
      'Strijk alle randen plat. De open punt wijst naar jou toe.',
    ],
    tip: 'Laat het papier de vouwen zelf volgen. Als je moet dwingen, ligt een vouwlijn aan de verkeerde kant.',
    easier:
      'Eerst maak je alle hulpvouwen. Daarna druk je de vier hoeken naar het midden, zodat het papier vanzelf plat samenvouwt.',
    hints: [
      'Dalvouwen vormen een V; bergvouwen een omgekeerde V. Kijk welke de demonstratie gebruikt.',
      'Houd de diagonalen als bergvouw en de horizontale en verticale lijnen als dalvouw.',
    ],
    reflection: {
      question: 'Hoe liep het samenklappen naar de basisvorm?',
      options: ['Vanzelf, het klapte netjes dicht', 'Ik moest een paar vouwen corrigeren', 'Het papier wilde niet plat', 'Ik weet het niet zeker'],
    },
  },
  {
    id: 3,
    title: 'Hulpvouwen maken (vliegerwouw)',
    minutes: 15,
    demoTitle: 'Rand naar de middenlijn',
    demoSeconds: 70,
    demoCaption: 'De zijranden gaan naar de middenlijn. Daarna vouw je alles weer open.',
    instructions: [
      'Leg de basisvorm met de open punt naar je toe.',
      'Vouw de linker- en rechterrand van de bovenste laag naar de middenlijn.',
      'Vouw de bovenste punt naar beneden over de brede vouw en strijk aan.',
      'Open alles weer, keer het werk om en doe hetzelfde aan de achterkant.',
    ],
    tip: 'Laat de randen precies op de middenlijn eindigen, niet erover of erachter. Dat bepaalt de vorm van de vleugels.',
    easier:
      'Je maakt vouwlijnen die je straks als geleiding gebruikt. Daarom vouw je alles weer open nadat je hebt aangestreken.',
    hints: [
      'Als de rand naar buiten schiet, vouwde je de rand te ver. Vouw terug en probeer opnieuw.',
      'Strijk de vouwen goed aan voordat je opent. Zwakke lijnen helpen je later niet.',
    ],
    reflection: {
      question: 'Wat zag je gebeuren toen de rand niet precies op de middenlijn lag?',
      options: ['De vorm werd scheef', 'De lagen sloten niet goed aan', 'Het papier knikte op de verkeerde plek', 'Dat is me niet overkomen'],
    },
  },
  {
    id: 4,
    title: 'De bloemblad-vouw (petal fold)',
    minutes: 20,
    demoTitle: 'Onderste punt omhoog tillen',
    demoSeconds: 95,
    demoCaption: 'De onderste punt gaat omhoog, de zijkanten klappen vanzelf naar binnen.',
    instructions: [
      'Til de onderste punt van de bovenste laag omhoog, langs de hulpvouwen die je net maakte.',
      'Laat de zijkanten naar binnen klappen terwijl de punt omhoog gaat.',
      'Strijk het werk plat. Je hebt nu een lange, smalle ruit.',
      'Controleer of de randen netjes tegen de middenlijn liggen.',
    ],
    tip: 'Doe dit rustig en til met beide handen. De vouw gaat vanzelf goed als de hulpvouwen scherp zijn.',
    easier:
      'Je trekt één punt omhoog. De zijkanten volgen vanzelf naar binnen en je krijgt een smalle ruit.',
    hints: [
      'Lukt het niet? Open het papier en versterk de hulpvouwen van stap 3.',
      'Houd de bovenste laag vast terwijl je de onderste punt optilt, zodat het papier niet verschuift.',
    ],
    reflection: {
      question: 'Hoe voelde de bloemblad-vouw?',
      options: ['Het ging vanzelf', 'Het was even zoeken', 'De zijkanten klapten niet goed', 'Ik wil het opnieuw proberen'],
    },
  },
  {
    id: 5,
    title: 'Dezelfde vouw aan de achterkant',
    minutes: 10,
    demoTitle: 'Omdraaien en herhalen',
    demoSeconds: 50,
    demoCaption: 'Keer het werk om en herhaal de bloemblad-vouw aan de andere kant.',
    instructions: [
      'Keer het werk om, zodat de achterkant naar boven ligt.',
      'Til opnieuw de onderste punt omhoog en laat de zijkanten naar binnen klappen.',
      'Strijk plat. Je hebt nu de vogelbasis: een symmetrische ruit.',
    ],
    tip: 'Leg de voorkant en de achterkant naast elkaar in je hoofd. Ze moeten er precies hetzelfde uitzien.',
    easier: 'Je herhaalt wat je net deed, maar dan aan de achterkant van het werk.',
    hints: [
      'Draai het werk om zonder de lagen te verschuiven. Houd de bovenkant vast.',
      'Zie je een verschil tussen voor- en achterkant? Corrigeer dat nu, niet pas aan het einde.',
    ],
    reflection: {
      question: 'Zagen de voor- en achterkant er hetzelfde uit?',
      options: ['Ja, symmetrisch', 'Bijna, kleine verschillen', 'Nee, duidelijk anders', 'Ik heb het nog niet vergeleken'],
    },
  },
  {
    id: 6,
    title: 'Hals en staart smal vouwen',
    minutes: 10,
    demoTitle: 'Smalle punten onderaan',
    demoSeconds: 55,
    demoCaption: 'De onderste randen gaan naar de middenlijn, voor en achter.',
    instructions: [
      'Leg de vogelbasis met de gesloten punt boven.',
      'Vouw de onderste randen van de bovenste laag naar de middenlijn.',
      'Keer het werk om en doe hetzelfde aan de achterkant.',
      'De twee smalle punten onderaan worden straks de hals en de staart.',
    ],
    tip: 'Strijk elke vouw even scherp aan. Smalle punten blijven alleen mooi als de vouw strak zit.',
    easier: 'Je maakt de onderkant smaller door de randen naar het midden te vouwen, voor en achter.',
    hints: [
      'Staan de punten niet recht? Controleer of de randen precies bij de middenlijn eindigen.',
      'Vouw telkens beide lagen mee als de demonstratie dat laat zien.',
    ],
    reflection: {
      question: 'Welke vouw vond je het lastigst?',
      options: ['De voorkant', 'De achterkant', 'Beide even moeilijk', 'Geen enkele'],
    },
  },
  {
    id: 7,
    title: 'Hals en staart omvouwen (inside reverse fold)',
    minutes: 15,
    demoTitle: 'Punten naar binnen duwen',
    demoSeconds: 90,
    demoCaption: 'Vouw de punt omhoog, open, en duw hem dan naar binnen langs de vouwlijn.',
    instructions: [
      'Vouw de linkerpunt omhoog langs een schuine lijn en open hem weer.',
      'Open de lagen een beetje en duw de punt naar binnen langs die lijn.',
      'Strijk de nieuwe vouw aan zodat de punt omhoog wijst.',
      'Herhaal dit met de rechterpunt voor de staart.',
    ],
    tip: 'Duw de punt naar binnen, niet naar buiten. Als je de lagen een beetje opent, gaat het sneller.',
    easier:
      'Je vouwt de punt eerst omhoog en opent hem. Daarna duw je hem naar binnen zodat hij een knik maakt.',
    hints: [
      'Zet je duim in de opening en duw de punt tussen de lagen.',
      'Een scherpe knik begint met een scherpe hulpvouw.',
    ],
    reflection: {
      question: 'Lukte het om de punt naar binnen te duwen?',
      options: ['Ja, meteen', 'Na een paar pogingen', 'De lagen klapten steeds terug', 'Ik wil het nog eens bekijken'],
    },
  },
  {
    id: 8,
    title: 'Kop en vleugels afwerken',
    minutes: 10,
    demoTitle: 'Kop vouwen, vleugels openen',
    demoSeconds: 60,
    demoCaption: 'Een kleine omvouw maakt de kop. Dan trek je de vleugels voorzichtig open.',
    instructions: [
      'Vouw de punt van één omgevouwen punt een klein stukje naar beneden voor de kop.',
      'Vouw de vleugels omlaag en trek ze voorzichtig opzij.',
      'Duw zacht in de opening onderaan zodat het lichaam bol wordt.',
    ],
    tip: 'Beweeg de vleugels langzaam. Papier dat te snel open wordt getrokken, scheurt bij de vouw.',
    easier: 'Je maakt de kop met een kleine knik, trekt de vleugels open en geeft het lichaam wat volume.',
    hints: [
      'Houd de kop klein; een grote knik laat de hals scheef staan.',
      'Trek de vleugels aan de bovenranden, niet aan de punten.',
    ],
    reflection: {
      question: 'Waar ben je het meest tevreden over?',
      options: ['De vleugels', 'De kop', 'Dat het af is', 'Dat zie ik later wel'],
    },
  },
];

export const TECHNIQUES = [
  { id: 't1', name: 'Dalvouw (valley fold)', craft: 'Basisvouw', material: 'Origamipapier', level: 'Beginner', description: 'Je vouwt het papier naar je toe, zodat de vouw een V-vormige geul vormt.' },
  { id: 't2', name: 'Bergvouw (mountain fold)', craft: 'Basisvouw', material: 'Origamipapier', level: 'Beginner', description: 'Je vouwt het papier van je af, zodat de vouw een kam vormt.' },
  { id: 't3', name: 'Vouwlijn scherp aanstrijken', craft: 'Basisvouw', material: 'Nagel of vouwbeen', level: 'Beginner', description: 'Strijk de vouw met je nagel of een vouwbeen aan, van het midden naar buiten.' },
  { id: 't4', name: 'Basisvorm (preliminary base)', craft: 'Basisvorm', material: 'Vierkant papier', level: 'Beginner', description: 'Een samengeklapt vierkant met vier lagen. Het begin van veel figuren, ook van de kraanvogel.' },
  { id: 't5', name: 'Vliegerwouw (kite fold)', craft: 'Basisvorm', material: 'Vierkant papier', level: 'Beginner', description: 'Twee randen naar de middenlijn vouwen, zodat er een vliegervorm ontstaat.' },
  { id: 't6', name: 'Bloemblad-vouw (petal fold)', craft: 'Basisvorm', material: 'Vierkant papier', level: 'Gemiddeld', description: 'Een punt omhoog tillen terwijl de zijkanten naar binnen klappen. Dit geeft de vogelbasis.' },
  { id: 't7', name: 'Inside reverse fold', craft: 'Omvouw', material: 'Dun papier', level: 'Gemiddeld', description: 'Een punt naar binnen duwen langs een vouwlijn, voor hals, staart of kop.' },
  { id: 't8', name: 'Outside reverse fold', craft: 'Omvouw', material: 'Dun papier', level: 'Gemiddeld', description: 'Een punt om de buitenkant heen omvouwen, bijvoorbeeld voor een snavel.' },
  { id: 't9', name: 'Squash fold', craft: 'Basisvouw', material: 'Origamipapier', level: 'Gemiddeld', description: 'Een flap openen en plat drukken tot een nieuwe vorm, vaak een vierkant of ruit.' },
  { id: 't10', name: 'Vleugels openen en lichaam opblazen', craft: 'Afwerking', material: 'Gevouwen figuur', level: 'Beginner', description: 'Trek de vleugels voorzichtig open en geef het lichaam volume met een zachte duw.' },
];

export const FILTERS = {
  crafts: ['Alle', 'Basisvouw', 'Basisvorm', 'Omvouw', 'Afwerking'],
  levels: ['Alle', 'Beginner', 'Gemiddeld', 'Gevorderd'],
};
