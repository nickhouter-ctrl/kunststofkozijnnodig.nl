export type City = {
  slug: string;
  name: string;
  region: string;
  description: string;
  highlights: string[];
  nearbyAreas: string[];
  distance: string; // afstand vanaf Wormerveer
  serviceType: "leveren-plaatsen" | "leveren"; // binnen 40km = leveren+plaatsen, rest = alleen leveren
};

export const cities: City[] = [
  // Zaanstreek (kerngebied)
  {
    slug: "wormerveer",
    name: "Wormerveer",
    region: "Zaanstreek",
    description:
      "Als gevestigd kozijnbedrijf in Wormerveer zijn wij letterlijk om de hoek. Onze monteurs kennen de Zaanse bouwstijlen als geen ander — van karakteristieke houten woningen tot moderne nieuwbouw. Wij komen graag bij je langs voor een gratis inmeting.",
    highlights: ["Eigen vestiging in Wormerveer", "Dezelfde dag inmeten mogelijk", "Kennis van Zaanse bouwstijlen"],
    nearbyAreas: ["Zaandijk", "Koog aan de Zaan", "Wormer"],
    serviceType: "leveren-plaatsen",
    distance: "0 km",
  },
  {
    slug: "zaandam",
    name: "Zaandam",
    region: "Zaanstreek",
    description:
      "Zaandam is onze thuisbasis en hier hebben we al tientallen woningen voorzien van nieuwe kunststof kozijnen. Van de Russische Buurt tot Kogerveldwijk — we kennen elk type woning en leveren altijd maatwerk dat perfect past bij jouw gevel.",
    highlights: ["Tientallen projecten afgerond in Zaandam", "Snelle service vanuit Wormerveer", "Ervaring met alle woningtypes"],
    nearbyAreas: ["Zaandam-Zuid", "Westerwatering", "Rooswijk"],
    serviceType: "leveren-plaatsen",
    distance: "5 km",
  },
  {
    slug: "krommenie",
    name: "Krommenie",
    region: "Zaanstreek",
    description:
      "In Krommenie en omgeving hebben we meerdere complete gevelrenovaties uitgevoerd. De mix van jaren '60 woningen en nieuwere wijken vraagt om kozijnen die qua stijl en isolatie perfect aansluiten — en dat is precies onze specialiteit.",
    highlights: ["Ervaring met jaren '60 woningen", "Complete gevelrenovaties", "Korte reistijd vanuit Wormerveer"],
    nearbyAreas: ["Krommeniedijk", "Assendelft", "Wormerveer"],
    serviceType: "leveren-plaatsen",
    distance: "3 km",
  },
  {
    slug: "assendelft",
    name: "Assendelft",
    region: "Zaanstreek",
    description:
      "Assendelft kent veel eengezinswoningen uit de jaren '80 en '90 waar de oorspronkelijke houten kozijnen aan vervanging toe zijn. Wij zorgen voor een naadloze overgang naar onderhoudsvrije kunststof kozijnen met HR++ of triple glas.",
    highlights: ["Specialist in kozijnen jaren '80/'90 woningen", "HR++ en triple glas", "Inclusief afvoer oude kozijnen"],
    nearbyAreas: ["Krommenie", "Nauerna", "Westzaan"],
    serviceType: "leveren-plaatsen",
    distance: "6 km",
  },
  // Groot Amsterdam
  {
    slug: "amsterdam",
    name: "Amsterdam",
    region: "Amsterdam",
    description:
      "Ook in Amsterdam leveren en plaatsen wij kunststof kozijnen. Van grachtenpanden in het centrum tot eengezinswoningen in Nieuw-West en Noord — wij bieden maatwerk voor elk type woning. Denk aan smalle profielen voor monumentale panden of brede schuifpuien voor moderne appartementen.",
    highlights: ["Ervaring met Amsterdamse bouwstijlen", "Maatwerk voor grachtenpanden", "Levering in heel Amsterdam"],
    nearbyAreas: ["Amsterdam-Noord", "Amsterdam Nieuw-West", "Amstelveen"],
    serviceType: "leveren-plaatsen",
    distance: "18 km",
  },
  {
    slug: "amstelveen",
    name: "Amstelveen",
    region: "Amsterdam",
    description:
      "Amstelveen staat bekend om zijn ruime gezinswoningen en villa's. Hier plaatsen we regelmatig grote schuifpuien en complete kozijnsets. De groene omgeving vraagt om kozijnen die passen bij de rustige, kwalitatieve uitstraling van de wijk.",
    highlights: ["Schuifpuien voor villa's en gezinswoningen", "Houtlook kozijnen populair", "Persoonlijk advies op locatie"],
    nearbyAreas: ["Amsterdam-Zuid", "Buitenveldert", "Aalsmeer"],
    serviceType: "leveren-plaatsen",
    distance: "25 km",
  },
  // Haarlem en omgeving
  {
    slug: "haarlem",
    name: "Haarlem",
    region: "Kennemerland",
    description:
      "Haarlem heeft een prachtige mix van monumentale woningen en moderne nieuwbouw. Of je nu in het Centrum woont of in Schalkwijk — wij leveren kunststof kozijnen die passen bij het karakter van jouw woning. Inclusief advies over vergunningen bij monumentale panden.",
    highlights: ["Advies over monumentale panden", "Alle stijlen en kleuren leverbaar", "Gratis inmeting op locatie"],
    nearbyAreas: ["Heemstede", "Bloemendaal", "Overveen"],
    serviceType: "leveren-plaatsen",
    distance: "22 km",
  },
  {
    slug: "heemstede",
    name: "Heemstede",
    region: "Kennemerland",
    description:
      "Heemstede kent veel statige woningen en villa's waar kwaliteit voorop staat. Onze kozijnen van Schüco, Aluplast en Gealan passen perfect bij de hoge standaard van deze woningen — strak design, topkwaliteit en jarenlang onderhoudsvrij.",
    highlights: ["Premium profielen voor villa's", "Schüco en Gealan leverbaar", "Strak design met hoge kwaliteit"],
    nearbyAreas: ["Haarlem", "Bennebroek", "Hillegom"],
    serviceType: "leveren-plaatsen",
    distance: "28 km",
  },
  // Purmerend en Waterland
  {
    slug: "purmerend",
    name: "Purmerend",
    region: "Waterland",
    description:
      "Purmerend groeit snel met nieuwe woonwijken en renovatieprojecten. Wij zijn een vaste partner voor zowel particulieren als aannemers in de regio. Korte lijnen, snelle levering vanuit Wormerveer en altijd een eerlijke prijs.",
    highlights: ["Partner voor nieuwbouw én renovatie", "Snel leverbaar vanuit Wormerveer", "Zakelijke tarieven voor aannemers"],
    nearbyAreas: ["Edam-Volendam", "Monnickendam", "Neck"],
    serviceType: "leveren-plaatsen",
    distance: "15 km",
  },
  {
    slug: "edam-volendam",
    name: "Edam-Volendam",
    region: "Waterland",
    description:
      "In Edam-Volendam is het karakter van de woning extra belangrijk. Onze houtlook kozijnen zijn hier erg populair — ze geven de warme uitstraling van hout, maar zijn volledig onderhoudsvrij. Perfect voor de historische centra.",
    highlights: ["Houtlook kozijnen voor historische uitstraling", "Onderhoudsvrij in zilte omgeving", "Passend bij dorpskarakter"],
    nearbyAreas: ["Purmerend", "Monnickendam", "Zeevang"],
    serviceType: "leveren-plaatsen",
    distance: "20 km",
  },
  // IJmond en Beverwijk
  {
    slug: "beverwijk",
    name: "Beverwijk",
    region: "IJmond",
    description:
      "Beverwijk en de IJmond-regio zijn goed bereikbaar vanuit onze vestiging in Wormerveer. We leveren en plaatsen hier regelmatig kunststof kozijnen — van rijtjeswoningen in de Plantagebuurt tot vrijstaande woningen in Wijk aan Zee.",
    highlights: ["Goed bereikbaar vanuit Wormerveer", "Ervaring in de IJmond-regio", "Bestand tegen zilte zeelucht"],
    nearbyAreas: ["Heemskerk", "Wijk aan Zee", "Velsen"],
    serviceType: "leveren-plaatsen",
    distance: "15 km",
  },
  {
    slug: "heemskerk",
    name: "Heemskerk",
    region: "IJmond",
    description:
      "In Heemskerk zien we veel woningen uit de jaren '70 waar isolatie en comfort flink verbeterd kunnen worden met nieuwe kunststof kozijnen. Wij nemen de complete gevel onder handen — van sloop tot oplevering in vaak maar een paar dagen.",
    highlights: ["Isolatieverbetering voor jaren '70 woningen", "Complete gevel in enkele dagen", "Merkbare energiebesparing"],
    nearbyAreas: ["Beverwijk", "Castricum", "Uitgeest"],
    serviceType: "leveren-plaatsen",
    distance: "18 km",
  },
  // Alkmaar en omgeving
  {
    slug: "alkmaar",
    name: "Alkmaar",
    region: "Noord-Holland Noord",
    description:
      "Alkmaar en omgeving voorzien wij van hoogwaardige kunststof kozijnen. De historische binnenstad heeft specifieke eisen — wij adviseren over de juiste profielen en kleuren die passen bij het straatbeeld. Gratis inmeting en offerte op locatie.",
    highlights: ["Advies voor historische binnenstad", "Ruime kleurkeuze inclusief RAL", "Gratis inmeting in Alkmaar"],
    nearbyAreas: ["Bergen", "Heiloo", "Heerhugowaard"],
    serviceType: "leveren-plaatsen",
    distance: "30 km",
  },
  {
    slug: "heiloo",
    name: "Heiloo",
    region: "Noord-Holland Noord",
    description:
      "Het groene en rustige Heiloo verdient kozijnen die passen bij de kwaliteit van de woonomgeving. Van slanke schuifpuien tot klassieke draaikiepramen — wij leveren elk type in de kleur en afwerking die jij wilt.",
    highlights: ["Passend bij groene woonomgeving", "Alle types kozijnen leverbaar", "Persoonlijk advies aan huis"],
    nearbyAreas: ["Alkmaar", "Egmond", "Castricum"],
    serviceType: "leveren-plaatsen",
    distance: "28 km",
  },
  {
    slug: "hoorn",
    name: "Hoorn",
    region: "West-Friesland",
    description:
      "Ook in Hoorn en West-Friesland zijn wij actief. De historische binnenstad en de groeiende nieuwbouwwijken bieden uiteenlopende uitdagingen — van monumentaal tot modern. Wij bieden voor elk type project de juiste oplossing.",
    highlights: ["Actief in West-Friesland", "Monumentaal én modern", "Levering binnen 4 weken"],
    nearbyAreas: ["Enkhuizen", "Zwaag", "Blokker"],
    serviceType: "leveren-plaatsen",
    distance: "35 km",
  },
  // Randstad uitloop
  {
    slug: "hoofddorp",
    name: "Hoofddorp",
    region: "Haarlemmermeer",
    description:
      "Hoofddorp en de Haarlemmermeer zijn een groeigebied waar veel wordt gebouwd en gerenoveerd. Wij leveren kunststof kozijnen voor zowel de nieuwbouw als de bestaande woningvoorraad — altijd op maat en binnen 4 weken.",
    highlights: ["Geschikt voor nieuwbouw én bestaande bouw", "Snelle levering", "Zakelijke tarieven beschikbaar"],
    nearbyAreas: ["Nieuw-Vennep", "Aalsmeer", "Lisse"],
    serviceType: "leveren-plaatsen",
    distance: "30 km",
  },
  {
    slug: "uitgeest",
    name: "Uitgeest",
    region: "Zaanstreek",
    description:
      "Uitgeest ligt op een steenworp afstand van onze vestiging. Korte lijnen, snel inmeten en snel geplaatst. Of het nu gaat om een enkele voordeur of een complete gevelrenovatie — wij staan voor je klaar.",
    highlights: ["Op korte afstand van onze vestiging", "Snel inmeten en plaatsen", "Van voordeur tot complete gevel"],
    nearbyAreas: ["Heemskerk", "Akersloot", "Castricum"],
    serviceType: "leveren-plaatsen",
    distance: "10 km",
  },
  {
    slug: "castricum",
    name: "Castricum",
    region: "Kennemerland",
    description:
      "In de kustgemeente Castricum is het extra belangrijk dat kozijnen bestand zijn tegen weer en wind. Onze kunststof kozijnen zijn volledig weerbestendig, sluiten luchtdicht af en gaan tientallen jaren mee — ook in de zilte kustlucht.",
    highlights: ["Weerbestendig tegen kustklimaat", "Luchtdichte afdichting", "Tientallen jaren onderhoudsvrij"],
    nearbyAreas: ["Uitgeest", "Heemskerk", "Limmen"],
    serviceType: "leveren-plaatsen",
    distance: "16 km",
  },
  {
    slug: "landsmeer",
    name: "Landsmeer",
    region: "Waterland",
    description:
      "In Landsmeer hebben we recent nog een prachtig project opgeleverd. De dorpse sfeer vraagt om kozijnen die karakter toevoegen. Met onze houtlook uitvoeringen en klassieke kleuren geeft jouw woning een warme, verzorgde uitstraling.",
    highlights: ["Recent project in Landsmeer afgerond", "Houtlook voor dorpse sfeer", "Referenties beschikbaar"],
    nearbyAreas: ["Amsterdam-Noord", "Purmerend", "Broek in Waterland"],
    serviceType: "leveren-plaatsen",
    distance: "12 km",
  },
  {
    slug: "zaandijk",
    name: "Zaandijk",
    region: "Zaanstreek",
    description:
      "Zaandijk, met de beroemde Zaanse Schans, heeft een uniek karakter. Wij plaatsen hier kozijnen die passen bij zowel de historische als de moderne woningen. Dankzij onze locatie in Wormerveer zijn we er binnen 5 minuten.",
    highlights: ["5 minuten vanaf onze vestiging", "Passend bij Zaans karakter", "Snelle plaatsing mogelijk"],
    nearbyAreas: ["Wormerveer", "Koog aan de Zaan", "Westzaan"],
    serviceType: "leveren-plaatsen",
    distance: "2 km",
  },

  // ============================================================
  // LANDELIJK — alleen levering (voor aannemers, bouwbedrijven, VvE)
  // ============================================================
  {
    slug: "utrecht",
    name: "Utrecht",
    region: "Utrecht",
    description:
      "Aannemers en bouwbedrijven in Utrecht en omgeving kunnen bij Rebu Kozijnen terecht voor de levering van hoogwaardige kunststof kozijnen, deuren en schuifpuien. Wij leveren direct vanuit onze fabriek, binnen 4 weken op jouw bouwplaats — scherpe zakelijke tarieven inclusief.",
    highlights: ["Levering op jouw bouwplaats", "Zakelijke staffelkorting", "Binnen 4 weken geleverd"],
    nearbyAreas: ["Nieuwegein", "IJsselstein", "Zeist", "Amersfoort"],
    serviceType: "leveren",
    distance: "55 km",
  },
  {
    slug: "rotterdam",
    name: "Rotterdam",
    region: "Zuid-Holland",
    description:
      "Rotterdam is een van de grootste bouwmarkten van Nederland. Wij leveren kunststof kozijnen aan aannemers, bouwbedrijven en VvE's in de regio Rotterdam. Van nieuwbouwprojecten in de Kop van Zuid tot renovaties in Kralingen — wij leveren op maat.",
    highlights: ["Grote aantallen voor bouwprojecten", "VvE-pakketten beschikbaar", "Directe levering vanuit fabriek"],
    nearbyAreas: ["Schiedam", "Capelle aan den IJssel", "Dordrecht", "Barendrecht"],
    serviceType: "leveren",
    distance: "80 km",
  },
  {
    slug: "den-haag",
    name: "Den Haag",
    region: "Zuid-Holland",
    description:
      "In Den Haag en omgeving leveren wij kunststof kozijnen aan aannemers en vastgoedbeheerders. De Haagse woningmarkt — van monumentale herenhuizen tot naoorlogse portiekflats — vraagt om kozijnen die passen bij elk type project. Wij leveren maatwerk in elke kleur en profiel.",
    highlights: ["Maatwerk voor elk woningtype", "Ervaring met VvE-projecten", "Alle RAL-kleuren leverbaar"],
    nearbyAreas: ["Rijswijk", "Delft", "Leidschendam", "Wassenaar"],
    serviceType: "leveren",
    distance: "75 km",
  },
  {
    slug: "almere",
    name: "Almere",
    region: "Flevoland",
    description:
      "Almere groeit als kool en daar profiteren aannemers van. Wij leveren kunststof kozijnen voor nieuwbouwprojecten en renovaties in Almere-Stad, Haven, Buiten en Poort. Altijd op maat, altijd binnen 4 weken, altijd scherp geprijsd.",
    highlights: ["Nieuwbouw-specialist", "Grote aantallen met staffelkorting", "Snelle levering naar Flevoland"],
    nearbyAreas: ["Lelystad", "Huizen", "Naarden", "Bussum"],
    serviceType: "leveren",
    distance: "45 km",
  },
  {
    slug: "amersfoort",
    name: "Amersfoort",
    region: "Utrecht",
    description:
      "Amersfoort en de Eemvallei zijn een actieve bouwregio. Wij leveren kunststof kozijnen aan aannemers en bouwbedrijven die werken in Amersfoort, Soest, Baarn en omgeving. Directe levering, geen tussenpersonen, scherpe prijzen.",
    highlights: ["Direct van fabrikant", "Geen tussenpersonen", "Flexibele leveringsplanning"],
    nearbyAreas: ["Soest", "Baarn", "Leusden", "Nijkerk"],
    serviceType: "leveren",
    distance: "65 km",
  },
  {
    slug: "hilversum",
    name: "Hilversum",
    region: "Gooi en Vechtstreek",
    description:
      "Het Gooi staat bekend om zijn villabouw en kwalitatieve woningen. Wij leveren premium kunststof kozijnen van Schüco en Gealan aan aannemers en bouwers in Hilversum, Bussum, Laren en Blaricum. Slanke profielen, houtlook, elke kleur.",
    highlights: ["Premium profielen voor villamarkt", "Schüco en Gealan op voorraad", "Houtlook folies populair"],
    nearbyAreas: ["Bussum", "Laren", "Blaricum", "Naarden"],
    serviceType: "leveren",
    distance: "40 km",
  },
  {
    slug: "leiden",
    name: "Leiden",
    region: "Zuid-Holland",
    description:
      "Leiden en de Bollenstreek zijn een groeiende markt voor duurzame renovaties. Wij leveren kunststof kozijnen aan aannemers en installateurs in de regio. Van studentencomplexen tot monumentale grachtenwoningen — wij leveren elk type profiel op maat.",
    highlights: ["Breed assortiment profielen", "Levering in de Bollenstreek", "Ervaring met complexe projecten"],
    nearbyAreas: ["Leiderdorp", "Voorschoten", "Katwijk", "Noordwijk"],
    serviceType: "leveren",
    distance: "50 km",
  },
  {
    slug: "eindhoven",
    name: "Eindhoven",
    region: "Noord-Brabant",
    description:
      "Ook in Brabant leveren wij kunststof kozijnen. Eindhoven en omgeving kent veel nieuwbouw en grootschalige renovatieprojecten. Aannemers en bouwbedrijven in de regio kunnen rekenen op onze kwaliteit, snelle levering en scherpe zakelijke prijzen.",
    highlights: ["Levering in heel Brabant", "Geschikt voor grootschalige projecten", "Zakelijke tarieven"],
    nearbyAreas: ["Helmond", "Veldhoven", "Best", "Tilburg"],
    serviceType: "leveren",
    distance: "130 km",
  },
  {
    slug: "tilburg",
    name: "Tilburg",
    region: "Noord-Brabant",
    description:
      "Tilburg is een van de grotere steden in Brabant met een actieve bouwsector. Wij leveren kunststof kozijnen, deuren en schuifpuien rechtstreeks aan aannemers op locatie. Geen tussenpersonen, dus scherpe prijzen en snelle communicatie.",
    highlights: ["Direct aan aannemer geleverd", "Scherpe B2B-prijzen", "Binnen 4 weken op locatie"],
    nearbyAreas: ["Breda", "Den Bosch", "Waalwijk", "Oisterwijk"],
    serviceType: "leveren",
    distance: "120 km",
  },
  {
    slug: "den-bosch",
    name: "'s-Hertogenbosch",
    region: "Noord-Brabant",
    description:
      "Voor aannemers en bouwbedrijven in Den Bosch en de Meierij leveren wij hoogwaardige kunststof kozijnen op maat. Van kleine renovaties tot grote VvE-trajecten — wij denken mee over profielen, kleuren en planning.",
    highlights: ["Meedenken over project-specifieke eisen", "VvE-trajecten begeleiding", "Alle merken leverbaar"],
    nearbyAreas: ["Vught", "Rosmalen", "Oss", "Veghel"],
    serviceType: "leveren",
    distance: "110 km",
  },
  {
    slug: "arnhem",
    name: "Arnhem",
    region: "Gelderland",
    description:
      "Arnhem en de Veluwe bedienen wij met levering van maatwerk kunststof kozijnen. Aannemers in Gelderland vertrouwen op onze snelle levertijden en kwaliteit van Schüco, Aluplast en Gealan. Elke kleur, elk profiel, binnen 4 weken.",
    highlights: ["Levering in heel Gelderland", "Snelle levertijd", "Drie topmerken beschikbaar"],
    nearbyAreas: ["Nijmegen", "Ede", "Wageningen", "Apeldoorn"],
    serviceType: "leveren",
    distance: "100 km",
  },
  {
    slug: "nijmegen",
    name: "Nijmegen",
    region: "Gelderland",
    description:
      "De oudste stad van Nederland verduurzaamt. Aannemers in Nijmegen en omgeving bestellen bij ons kunststof kozijnen voor zowel de historische binnenstad als nieuwe woonwijken. Wij leveren op maat, rechtstreeks op jouw bouwplaats.",
    highlights: ["Ervaring met historische projecten", "Op maat geleverd op locatie", "Duurzame keuze"],
    nearbyAreas: ["Arnhem", "Wijchen", "Beuningen", "Lent"],
    serviceType: "leveren",
    distance: "115 km",
  },
  {
    slug: "groningen",
    name: "Groningen",
    region: "Groningen",
    description:
      "Zelfs in het noorden zijn wij actief. Aannemers en bouwbedrijven in Groningen bestellen bij ons kunststof kozijnen met landelijke levering. De aardbevingsproblematiek maakt hoogwaardige kozijnen extra belangrijk — onze profielen zijn robuust en duurzaam gebouwd.",
    highlights: ["Landelijke levering tot Groningen", "Robuuste profielen", "Ervaring met verstevigde constructies"],
    nearbyAreas: ["Assen", "Haren", "Delfzijl", "Veendam"],
    serviceType: "leveren",
    distance: "190 km",
  },
  {
    slug: "zwolle",
    name: "Zwolle",
    region: "Overijssel",
    description:
      "Zwolle en Overijssel bedienen wij met levering van kunststof kozijnen voor aannemers en bouwbedrijven. De groeiende regio biedt veel kansen — wij leveren snel en tegen zakelijke tarieven, zonder tussenpersonen.",
    highlights: ["Groeiende bouwregio", "Directe levering", "Zakelijke tarieven"],
    nearbyAreas: ["Kampen", "Deventer", "Meppel", "Hardenberg"],
    serviceType: "leveren",
    distance: "120 km",
  },
  {
    slug: "breda",
    name: "Breda",
    region: "Noord-Brabant",
    description:
      "Breda en West-Brabant zijn een sterke bouwmarkt. Wij leveren kunststof kozijnen aan aannemers, installateurs en bouwbedrijven in de regio. Van kleinschalige woningrenovaties tot grote utiliteitsprojecten — altijd maatwerk, altijd kwaliteit.",
    highlights: ["Sterke bouwmarkt in West-Brabant", "Klein én groot project", "Maatwerk standaard"],
    nearbyAreas: ["Tilburg", "Roosendaal", "Etten-Leur", "Oosterhout"],
    serviceType: "leveren",
    distance: "115 km",
  },
  {
    slug: "apeldoorn",
    name: "Apeldoorn",
    region: "Gelderland",
    description:
      "Apeldoorn en de Veluwe zijn populaire woongebieden met veel renovatiewerk. Aannemers en bouwbedrijven bestellen bij ons kozijnen die passen bij zowel de bosrijke omgeving als moderne nieuwbouw. Houtlook, antraciet, wit — alles leverbaar.",
    highlights: ["Passend bij Veluws karakter", "Houtlook zeer populair", "Binnen 4 weken geleverd"],
    nearbyAreas: ["Deventer", "Zutphen", "Epe", "Vaassen"],
    serviceType: "leveren",
    distance: "95 km",
  },
  {
    slug: "leeuwarden",
    name: "Leeuwarden",
    region: "Friesland",
    description:
      "Ook Friesland bedienen wij. Aannemers en bouwbedrijven in Leeuwarden en omgeving kunnen bij ons terecht voor levering van kunststof kozijnen op maat. Kwaliteit van Schüco, Aluplast en Gealan — geleverd waar je het nodig hebt.",
    highlights: ["Levering in heel Friesland", "Drie Europese topmerken", "Geen minimale afname"],
    nearbyAreas: ["Heerenveen", "Sneek", "Drachten", "Harlingen"],
    serviceType: "leveren",
    distance: "150 km",
  },
  {
    slug: "maastricht",
    name: "Maastricht",
    region: "Limburg",
    description:
      "In het zuiden van Nederland leveren wij kunststof kozijnen aan aannemers en bouwbedrijven in Maastricht en heel Limburg. De Limburgse bouwstijl met veel natuursteen vraagt om kozijnen die qua kleur en afwerking perfect passen.",
    highlights: ["Levering in heel Limburg", "Kleur op maat (RAL)", "Passend bij regionale bouwstijl"],
    nearbyAreas: ["Heerlen", "Sittard", "Venlo", "Roermond"],
    serviceType: "leveren",
    distance: "210 km",
  },
  {
    slug: "enschede",
    name: "Enschede",
    region: "Overijssel",
    description:
      "Twente en Oost-Nederland bedienen wij met landelijke levering van kunststof kozijnen. Aannemers in Enschede, Hengelo en omgeving bestellen bij ons voor scherpe prijzen, snelle levering en kwaliteit die je kunt vertrouwen.",
    highlights: ["Levering in heel Twente", "Scherpe prijzen voor aannemers", "Betrouwbare kwaliteit"],
    nearbyAreas: ["Hengelo", "Almelo", "Oldenzaal", "Losser"],
    serviceType: "leveren",
    distance: "160 km",
  },
];

export function getCity(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}

export const deliveryCities = cities.filter((c) => c.serviceType === "leveren");
export const installCities = cities.filter((c) => c.serviceType === "leveren-plaatsen");
