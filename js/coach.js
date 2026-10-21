export const PROJECT = {
  id: 'origami-agentic-research',
  title: 'Applied Research Agentic Interface',
  summary:
    'Research workflow voor origami-vouwen gebaseerd op een bestaande video, met AI-gestuurde analyse, stappenplan en kwaliteitscontrole.',
  level: 'Research prototype',
  totalTime: 'Video + AI review',
};

export const STEPS = [
  {
    id: 1,
    title: 'Paper en referentievideo voorbereiden',
    minutes: 15,
    demoTitle: 'Referentie instellen',
    demoSeconds: 45,
    demoCaption: 'Kies de juiste video en leg een vlak vel papier met duidelijke contouren klaar.',
    instructions: [
      'Upload de bestaande origami-video en controleer of het canvas goed zichtbaar is.',
      'Leg een vierkant vel papier flat op de werkplek en markeer de vaste beginsituatie.',
      'Noteer het doel: welke vorm of dier moet je uit de video herkennen?',
    ],
    tip: 'Zorg voor een heldere hoek- en lijnweergave in de video; dan werkt de AI-analyse betrouwbaarder.',
    easier:
      'Begin met een duidelijke referentie, zodat de volgende vouwstappen kunnen worden vergeleken met de video.',
    hints: [
      'Controleer of de video niet te fel of te donker is.',
      'Zet de video op pauze op het eerste duidelijke vouwmoment.',
    ],
    reflection: {
      question: 'Wat was het belangrijkste bij het instellen van de referentie?',
      options: ['De video was duidelijk', 'De papierpositie was lastig', 'Ik wilde een ander startpunt', 'Ik weet het nog niet'],
    },
  },
  {
    id: 2,
    title: 'Basislijn en centrale crease vastleggen',
    minutes: 20,
    demoTitle: 'Centrale vouw opzetten',
    demoSeconds: 60,
    demoCaption: 'Gebruik de video om de centrale crease precies te volgen en te herhalen.',
    instructions: [
      'Vouw het papier in de helft om een vaste middenlijn te creëren.',
      'Controleer of beide zijden symmetrisch liggen.',
      'Herhaal de lijn met een lichte, nette crease die niet te hard wordt ingedrukt.',
    ],
    tip: 'Een goede basislijn bepaalt de rest van het model; maak deze rustig en precies.',
    easier:
      'Denk aan de middenlijn als het kompas van je model: alles draait daar om.',
    hints: [
      'Vergelijk de linker- en rechterhelft voor een duidelijke symmetrie.',
      'Als de crease scheef is, maak dan rustig opnieuw.',
    ],
    reflection: {
      question: 'Hoe voelde de eerste crease?',
      options: ['Nauwkeurig', 'Een beetje scheef', 'Te zwaar', 'Ik wil het nog oefenen'],
    },
  },
  {
    id: 3,
    title: 'Valley fold aanbrengen',
    minutes: 25,
    demoTitle: 'Valley fold oefenen',
    demoSeconds: 72,
    demoCaption: 'De papierrand draait naar binnen en vormt een donkere vallei in het midden.',
    instructions: [
      'Leg de vouwlijn goed vast en druk het papier met een lichte beweging naar binnen.',
      'Controleer of de twee vlakken gelijkmatig samenkomen.',
      'Gebruik je vingers langs de rand om een nette vallei te maken.',
    ],
    tip: 'Een vallei moet helder zijn, maar niet gekreukeld. De scherpe lijn is belangrijker dan druk.',
    easier:
      'Zie het als een dal: het papier zakt netjes naar de middenlijn toe.',
    hints: [
      'Als de rand ruw is, maak dan de vouw opnieuw met minder druk.',
      'Volgens de video kan het helpen om de vouw eerst licht te markeren.',
    ],
    reflection: {
      question: 'Hoe ging de vallei in de praktijk?',
      options: ['Heel scherp', 'Vrij goed', 'Niet helemaal netjes', 'Ik moest opnieuw beginnen'],
    },
  },
  {
    id: 4,
    title: 'Mountain fold afwerken',
    minutes: 30,
    demoTitle: 'Mountain fold opzetten',
    demoSeconds: 80,
    demoCaption: 'De fold komt omhoog en vormt een hoge verdieping in plaats van een dal.',
    instructions: [
      'Leg de vouwlijn vast en zet de rand omgekeerd omhoog.',
      'Maak een duidelijke bergvorm zonder de onderkant te scheuren.',
      'Controleer elke hoek op consistentie met de referentievideo.',
    ],
    tip: 'Bij een bergvouw ligt de scherpe lijn juist andersom dan bij een vallei. Kijk nauwkeurig naar het verschil.',
    easier:
      'Denk aan een berg: het papier komt omhoog en vormt een duidelijke top.',
    hints: [
      'Laat de vouw eerst licht zien voordat je hem fixeert.',
      'Vergelijk de richting met de voorbeeldvideo op het juiste tijdstip.',
    ],
    reflection: {
      question: 'Welke vouw was moeilijker: vallei of berg?',
      options: ['Vallei', 'Berg', 'Beide even', 'Ik weet het nog niet'],
    },
  },
  {
    id: 5,
    title: 'Reverse fold en contouren herzien',
    minutes: 35,
    demoTitle: 'Contour omzetten',
    demoSeconds: 65,
    demoCaption: 'Een scherpe omkering van de vouw geeft het model gezicht of vleugelvorm.',
    instructions: [
      'Leg de schone contour van de vorm vast en draai de rand precies om.',
      'Krijg de vouw in één vloeiende beweging, zonder de buitenste hoek te scheuren.',
      'Controleer of de vorm in de video en op je papier gelijk lopen.',
    ],
    tip: 'Bij een reverse fold is preciesheid belangrijker dan snelheid. Een kleine draai maakt het verschil.',
    easier:
      'Je draait een flap om en laat de contour terugkomen in de juiste richting.',
    hints: [
      'Zet met je vinger een lichte markering op de beenzijde van de hoek.',
      'Werk met kleine, gecontroleerde bewegingen.',
    ],
    reflection: {
      question: 'Hoe ging de omkering van de contour?',
      options: ['Vlot', 'Ik had even een pauze nodig', 'Ik moest corrigeren', 'Niet goed genoeg'],
    },
  },
  {
    id: 6,
    title: 'Pleat en symmetrie controleren',
    minutes: 25,
    demoTitle: 'Symmetrie in balans',
    demoSeconds: 64,
    demoCaption: 'Herhaal de pleat symmetrisch, zodat het model niet scheef draait.',
    instructions: [
      'Maak de plooien op beide zijden even groot en symmetrisch.',
      'Vergelijk de ruimte tussen de vouwen met de referentie.',
      'Duw de pleat zachtjes naar beneden zodat de contour helder blijft.',
    ],
    tip: 'Symmetrie werkt beter als je beide kanten gelijktijdig bekijkt.',
    easier:
      'Je doet een pleat rechts en links alsof je dezelfde beweging tegelijk maakt.',
    hints: [
      'Kijk langs de middenlijn om scheefheid te zien.',
      'Maak kleine correcties in plaats van grote herzieningen.',
    ],
    reflection: {
      question: 'Welke kant was het lastigst om symmetrisch te houden?',
      options: ['Links', 'Rechts', 'Beide', 'Geen verschil'],
    },
  },
  {
    id: 7,
    title: 'Modelvorm verfijnen en gelijkmaken',
    minutes: 20,
    demoTitle: 'Detail buitenste contour',
    demoSeconds: 58,
    demoCaption: 'Bijwerken van de contouren zodat de vorm in de video en op papier samenvallen.',
    instructions: [
      'Kijk naar de buitenlijn en werk eventuele kleine hoek- of randcorrecties bij.',
      'Verfijn de fijne vouwen, zonder extra plooien aan te brengen die het model verstoren.',
      'Controleer of de vorm nog duidelijk in de referentievideo is te herkennen.',
    ],
    tip: 'Fijnere correcties zijn vaak beter dan een grote nieuwe vouw. Laat het model rustig spreken.',
    easier:
      'Je herbekijkt alleen wat niet klopt en zet daarna de vorm weer terug in balans.',
    hints: [
      'Kleine correcties op de rand zorgen voor grotere helderheid van de vorm.',
      'Vergelijk tijdens het bijwerken steeds opnieuw met de video.',
    ],
    reflection: {
      question: 'Wat moest je het vaakst bijstellen?',
      options: ['Randen', 'Symmetrie', 'Hoeken', 'Ik had weinig correcties'],
    },
  },
  {
    id: 8,
    title: 'Eindresultaat beoordelen en feedback opvragen',
    minutes: 20,
    demoTitle: 'Afronding en review',
    demoSeconds: 54,
    demoCaption: 'Vergelijk het model met de referentie en noteer wat nog beter kan.',
    instructions: [
      'Vergelijk het eindresultaat stap voor stap met de video en markeer de verschillen.',
      'Noteer welke vouw het best gelukt is en welke nog iets beter kan.',
      'Vraag de AI om een focusadvies op basis van de meest opvallende afwijking.',
    ],
    tip: 'De beste feedback komt uit het vergelijken van detail en vorm, niet alleen van de totale afmeting.',
    easier:
      'Je kijkt terug op het model zoals een onderzoeker: wat werkt, wat valt op, en wat moet nog verbeteren?',
    hints: [
      'Het is nuttig om één duidelijke verbetering te kiezen voor de volgende iteratie.',
      'Leg de afbeelding of video vast voor vergelijking met de volgende ronde.',
    ],
    reflection: {
      question: 'Wat is je belangrijkste leerpunt voor de volgende ronde?',
      options: ['Zonder een betere basislijn', 'Door meer symmetrie', 'Door scherpere vouwen', 'Ik wil eerst nog oefenen'],
    },
  },
];

export const TECHNIQUES = [
  { id: 't1', name: 'Valley fold', craft: 'Origami', material: 'Papier', level: 'Beginner', description: 'Een vouw naar binnen die een dal vormt in het papier.' },
  { id: 't2', name: 'Mountain fold', craft: 'Origami', material: 'Papier', level: 'Beginner', description: 'Een vouw naar buiten die een heuvel of bergvorm creëert.' },
  { id: 't3', name: 'Reverse fold', craft: 'Origami', material: 'Papier', level: 'Gemiddeld', description: 'Een hoek of flap omdraaien om de vorm scherp te laten rondlopen.' },
  { id: 't4', name: 'Petal fold', craft: 'Origami', material: 'Papier', level: 'Gemiddeld', description: 'Een complexe vouw die een bloem- of petalvorm maakt in het model.' },
  { id: 't5', name: 'Pleat', craft: 'Origami', material: 'Papier', level: 'Beginner', description: 'Een reeks parallelle vouwen om textuur en contour te laten ontstaan.' },
  { id: 't6', name: 'Sink fold', craft: 'Origami', material: 'Papier', level: 'Gevorderd', description: 'Een vouw naar binnen om een diepere, compacte vorm te creëren.' },
  { id: 't7', name: 'Crimp', craft: 'Origami', material: 'Papier', level: 'Gemiddeld', description: 'Een dubbele scherpe vouw voor een duidelijke, geprofileerde hoek.' },
  { id: 't8', name: 'Base form', craft: 'Origami', material: 'Papier', level: 'Beginner', description: 'Een basisstructuur die als startpunt werkt voor meerdere modellen.' },
  { id: 't9', name: 'Reference matching', craft: 'Research', material: 'Video', level: 'Beginner', description: 'Vormen en contouren vergelijken met de oorspronkelijke demonstratie.' },
  { id: 't10', name: 'AI feedback loop', craft: 'Research', material: 'Video + prompts', level: 'Gemiddeld', description: 'Gebruik de AI om een focusadvies te geven op basis van verschillen in vouwkwaliteit.' },
];

export const FILTERS = {
  crafts: ['Alle', 'Origami', 'Research'],
  levels: ['Alle', 'Beginner', 'Gemiddeld', 'Gevorderd'],
};
