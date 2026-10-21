// Lokale voorbeelddata. Niets hiervan komt van internet of uit een API.

export const PROJECT = {
  id: 'wandhanger',
  title: 'Geweven wandhanger',
  summary:
    'Een kleine wandhanger op een houten weefraam, in katoen en wol. Je leert opspannen, een nette zelfkant maken, afwisselen en afwerken.',
  level: 'Beginner',
  totalTime: '± 3 uur',
};

// Elke stap bevat alles wat het tutorialscherm nodig heeft.
export const STEPS = [
  {
    id: 1,
    title: 'Materiaal en weefraam klaarzetten',
    minutes: 15,
    demoTitle: 'Je werkplek inrichten',
    demoSeconds: 48,
    demoCaption: 'Raam rechtop, garen binnen handbereik, schaar en weefkam klaar.',
    instructions: [
      'Leg het weefraam plat voor je neer, met de kerven naar je toe.',
      'Zet katoengaren (schering), wolgaren (inslag), een weefkam en een schaar klaar.',
      'Knip een draad schering van ongeveer vier keer de hoogte van je raam.',
    ],
    tip: 'Zorg voor goed licht. Je ziet strakke en slappe draden veel sneller bij daglicht.',
    easier:
      'Kort gezegd: leg alles klaar vóór je begint, zodat je tijdens het weven niet hoeft te zoeken.',
    hints: [
      'Controleer of de kerven aan boven- en onderkant evenveel zijn.',
      'Een pot of bakje voor kleine knipsels houdt je tafel rustig.',
    ],
    reflection: {
      question: 'Wat vond je het lastigst aan het klaarzetten?',
      options: ['Niets, het ging vanzelf', 'Weten welk garen waarvoor is', 'De juiste lengte knippen', 'Iets anders'],
    },
  },
  {
    id: 2,
    title: 'De basisdraden opspannen',
    minutes: 25,
    demoTitle: 'Schering opspannen',
    demoSeconds: 92,
    demoCaption: 'De schering gaat om de kerven, van boven naar beneden en weer terug.',
    instructions: [
      'Maak een knoop in de eerste kerf linksboven.',
      'Leid de draad naar beneden, om de eerste kerf onderaan, en dan weer omhoog.',
      'Houd de spanning gelijk: stevig, maar zonder dat het raam doorbuigt.',
      'Eindig met een knoop op de achterkant en knip het uiteinde af.',
    ],
    tip: 'Trek bij elke ronde even zacht aan. Gelijkmatige spanning is belangrijker dan strak.',
    easier:
      'Zie de schering als snaren van een gitaar: allemaal even gespannen, niet kneiter strak.',
    hints: [
      'Tik met je vinger op de draden. Klinken ze ongeveer gelijk, dan zit het goed.',
      'Houd de draad met je vrije hand vast tijdens het omwikkelen.',
    ],
    reflection: {
      question: 'Hoe voelde de spanning van je draden?',
      options: ['Gelijkmatig', 'Sommige draden slap', 'Alles erg strak', 'Dat kon ik nog niet goed inschatten'],
    },
  },
  {
    id: 3,
    title: 'Een nette zelfkant maken',
    minutes: 20,
    demoTitle: 'Maak je eerste nette zelfkant',
    demoSeconds: 74,
    demoCaption: 'De inslag draait om de buitenste schering en blijft een beetje los.',
    instructions: [
      'Weef de inslagdraad over-onder door de scheringdraden, tot aan de rand.',
      'Draai de draad om de buitenste schering heen en ga terug.',
      'Laat de draad in een zachte boog liggen voordat je hem aantrekt.',
      'Trek de draad pas aan als hij tegen de rand ligt, niet erover heen.',
    ],
    tip: 'Leg de inslag in een zachte golf en trek hem niet strak: zo blijft de rand recht.',
    easier:
      'Denk aan een bocht in een weg: de draad maakt een lichte boog en komt dan netjes terug.',
    hints: [
      'Als de rand naar binnen trekt, was de draad te strak aangetrokken.',
      'Laat de draad per rij een centimeter extra liggen en kijk wat er gebeurt.',
    ],
    reflection: {
      question: 'Wat zag je gebeuren toen de draad te strak stond?',
      options: [
        'De rand trok naar binnen',
        'Het weefsel werd smaller',
        'De draad brak of schoof weg',
        'Dat is me niet overkomen',
      ],
    },
  },
  {
    id: 4,
    title: 'De inslag afwisselen',
    minutes: 30,
    demoTitle: 'Over en onder afwisselen',
    demoSeconds: 85,
    demoCaption: 'Elke volgende rij begint tegenovergesteld: waar je over ging, ga je nu onder.',
    instructions: [
      'Kijk bij welke schering je vorige rij over of onder ging.',
      'Ga in de nieuwe rij precies tegenovergesteld.',
      'Duw de rij zacht omlaag met de weefkam.',
      'Herhaal tot je ongeveer twee centimeter hebt geweven.',
    ],
    tip: 'Tel de eerste paar rijen hardop mee. Zo sluipt er geen fout in het patroon.',
    easier: 'Zie het als een schaakbord: elke rij wisselt van kleur ten opzichte van de vorige.',
    hints: [
      'Zie je twee rijen met dezelfde stand op elkaar? Haal die rij terug.',
      'Duw de rijen zacht aan; hard slaan maakt het weefsel te dicht.',
    ],
    reflection: {
      question: 'Hoe liep het afwisselen?',
      options: ['Vlot', 'Ik raakte soms de tel kwijt', 'Ik moest een rij terughalen', 'Ik weet het niet zeker'],
    },
  },
  {
    id: 5,
    title: 'Kleur of patroon toevoegen',
    minutes: 35,
    demoTitle: 'Een nieuwe kleur aanzetten',
    demoSeconds: 66,
    demoCaption: 'Nieuwe kleur laten overlappen aan de achterkant, daarna verder weven.',
    instructions: [
      'Kies een nieuwe kleur en knip een stuk van ongeveer een armlengte.',
      'Laat het oude uiteinde aan de achterkant hangen.',
      'Begin de nieuwe kleur in dezelfde rij en weef door.',
      'Knip de losse eindjes pas aan het einde af.',
    ],
    tip: 'Begin elke nieuwe kleur aan dezelfde kant, dan blijven de uiteinden netjes bij elkaar.',
    easier: 'Je wisselt gewoon van draad. Het uiteinde van de oude kleur blijft achter het werk.',
    hints: [
      'Wil je een streep? Weef vier tot zes rijen in dezelfde kleur.',
      'Draai nieuwe wol los voor het gebruik: dan zit er minder knoop in.',
    ],
    reflection: {
      question: 'Welke keuze maakte je voor kleur of patroon?',
      options: ['Eén kleur, rustig', 'Twee kleuren in strepen', 'Een eigen patroon', 'Nog niet gekozen'],
    },
  },
  {
    id: 6,
    title: 'De spanning controleren',
    minutes: 15,
    demoTitle: 'Spanning en rand controleren',
    demoSeconds: 40,
    demoCaption: 'Houd het raam schuin tegen het licht en volg de randen met je blik.',
    instructions: [
      'Houd het raam op armlengte en kijk langs de randen.',
      'Controleer of de zijkanten recht lopen en niet inzakken.',
      'Voel of de rijen even dicht op elkaar liggen.',
    ],
    tip: 'Een lichte inkeping komt vaak voor. Trek vanaf nu iets losser en ga rustig door.',
    easier: 'Kijk gewoon: loopt de rand recht naar beneden, of zie je een taille?',
    hints: [
      'Een taille ontstaat meestal door een draad die te strak is aangetrokken.',
      'Leg een liniaal langs de rand om te zien of die recht blijft.',
    ],
    reflection: {
      question: 'Wat viel je op aan de randen?',
      options: ['Ze liepen recht', 'Een lichte taille', 'Duidelijk te strak', 'Ik wil het laten bekijken'],
    },
  },
  {
    id: 7,
    title: 'Het werk van het raam halen',
    minutes: 20,
    demoTitle: 'Voorzichtig losmaken',
    demoSeconds: 58,
    demoCaption: 'Eerst de scheringlussen van de kerven tillen, dan het werk vrijmaken.',
    instructions: [
      'Knip de scheringdraden aan de achterkant door, bij de bovenste kerven.',
      'Til de lussen voorzichtig van de kerven.',
      'Knoop steeds twee schering aan elkaar zodat het weefsel niet kan uitrafelen.',
    ],
    tip: 'Knip pas als je zeker bent dat het weefsel hoog genoeg is. Terugdraaien kan niet.',
    easier: 'Je laat het weefsel los van het raam en zet de draden vast met knoopjes.',
    hints: [
      'Knoop in paren, links naar rechts, zodat het gelijkmatig blijft.',
      'Houd het weefsel bovenaan vast terwijl je knipt.',
    ],
    reflection: {
      question: 'Hoe voelde het om het werk los te maken?',
      options: ['Spannend', 'Gewoon goed te doen', 'Ik twijfelde bij het knippen', 'Ik wil het nog even laten rusten'],
    },
  },
  {
    id: 8,
    title: 'Afwerken en terugblikken',
    minutes: 20,
    demoTitle: 'Franjes en ophangstok',
    demoSeconds: 70,
    demoCaption: 'Franjes gelijk knippen en de stok ophangen met een eenvoudige lus.',
    instructions: [
      'Knip de franjes op gelijke lengte of kies een schuine lijn.',
      'Schuif een stokje door de bovenste lussen.',
      'Hang er een lus van koord aan en hang de wandhanger op.',
    ],
    tip: 'Zet je werk een dag neer en kijk dan nog eens. Je ziet meer dan direct na het maken.',
    easier: 'Je maakt de onderkant netjes, geeft het een stokje en hangt het op.',
    hints: [
      'Wil je de franjes zachter? Haal ze voorzichtig door met een kam.',
      'Test het ophangen eerst op een plek waar het niet erg is als het scheef hangt.',
    ],
    reflection: {
      question: 'Waar ben je het meest tevreden over?',
      options: ['De kleuren', 'De randen', 'Dat het af is', 'Dat zie ik later wel'],
    },
  },
];

export const TECHNIQUES = [
  { id: 't1', name: 'Zelfkant weven', craft: 'Weven', material: 'Wol, katoen', level: 'Beginner', description: 'Houd de randen van je weefsel recht door de inslag zacht om de buitenste schering te draaien.' },
  { id: 't2', name: 'Spanning opbouwen', craft: 'Weven', material: 'Katoengaren', level: 'Beginner', description: 'Schering opspannen met gelijke spanning, zodat het weefsel egaal wordt.' },
  { id: 't3', name: 'Streeppatroon', craft: 'Weven', material: 'Wol', level: 'Beginner', description: 'Kleuren afwisselen in vaste aantallen rijen voor een rustig patroon.' },
  { id: 't4', name: 'Soumak', craft: 'Weven', material: 'Wol, jute', level: 'Gevorderd', description: 'Een gedraaide inslagsteek voor reliëf en textuur in je weefwerk.' },
  { id: 't5', name: 'Franjes knopen', craft: 'Weven', material: 'Katoen', level: 'Beginner', description: 'Franjes netjes afwerken met paarsgewijs knopen.' },
  { id: 't6', name: 'Losse steek breien', craft: 'Breien', material: 'Wol, katoen', level: 'Beginner', description: 'Een rechte steek breien met gelijke spanning voor een nette rand.' },
  { id: 't7', name: 'Stekenpatroon haken', craft: 'Haken', material: 'Katoen', level: 'Gemiddeld', description: 'Vaste en stokjes afwisselen voor een stevig patroonveld.' },
  { id: 't8', name: 'Zijkant afhechten', craft: 'Textiel', material: 'Naaldgaren', level: 'Beginner', description: 'Losse draadjes verbergen met een naald, zodat de achterkant net blijft.' },
  { id: 't9', name: 'Keramiek opbouwen', craft: 'Keramiek', material: 'Klei', level: 'Gemiddeld', description: 'Worstjes klei op elkaar leggen en gladstrijken tot een kom.' },
  { id: 't10', name: 'Hout schuren', craft: 'Hout', material: 'Schuurpapier', level: 'Beginner', description: 'Van grof naar fijn schuren voor een glad oppervlak.' },
];

export const FILTERS = {
  crafts: ['Alle', 'Weven', 'Breien', 'Haken', 'Textiel', 'Keramiek', 'Hout'],
  levels: ['Alle', 'Beginner', 'Gemiddeld', 'Gevorderd'],
};
