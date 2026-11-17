const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const OCEAN='#bfe0ee', NODATA='url(#nodata-pattern)';
// type:'wb' datasets are NOT fetched live on page load. The record of record is
// the committed snapshot in data/wb/<id>.json (see data/wb/manifest.json).
// After rendering from that record, the app revalidates against the World Bank
// API in the background (stale-while-revalidate) and updates itself in place
// (+ localStorage) if the API has newer data. Maintainers refresh the
// committed record with scripts/fetch-data.mjs.
const DATASETS=[
{id:'population',icon:'👥',label:'Population',cat:'People',type:'wb',code:'SP.POP.TOTL',unit:'people',fmt:'compact',log:true,color:d3.interpolateYlOrRd,range:[1960,2024],desc:'Total population — UN estimates via World Bank',source:'World Bank WDI (SP.POP.TOTL) • UN Population Division • CC-BY 4.0'},
{id:'density',icon:'🏙️',label:'Population Density',cat:'People',type:'wb',code:'EN.POP.DNST',unit:'people/km²',fmt:'num1',log:true,color:d3.interpolateReds,range:[1961,2024],desc:'People per sq. km of land area',source:'World Bank WDI (EN.POP.DNST) • FAO + UN'},
{id:'medianAge',icon:'👵',label:'Median Age',cat:'People',type:'curated',idx:0,unit:'years',fmt:'num1',color:d3.interpolatePurples,snapshot:2024,desc:'Median age of population (snapshot)',source:'UN World Population Prospects 2024 • Curated snapshot, rounded'},
{id:'birthRate',icon:'👶',label:'Birth Rate',cat:'People',type:'wb',code:'SP.DYN.CBRT.IN',unit:'per 1,000',fmt:'num1',color:d3.interpolatePuBu,range:[1960,2024],desc:'Crude birth rate per 1,000 people',source:'World Bank WDI (SP.DYN.CBRT.IN) • UN / vital registries'},
{id:'lifeExpect',icon:'❤️',label:'Life Expectancy',cat:'People',type:'wb',code:'SP.DYN.LE00.IN',unit:'years',fmt:'num1',color:d3.interpolateRdYlGn,range:[1960,2024],desc:'Life expectancy at birth, total years',source:'World Bank WDI (SP.DYN.LE00.IN) • UN WPP'},
{id:'gdp',icon:'💰',label:'GDP (Total)',cat:'Economy',type:'wb',code:'NY.GDP.MKTP.CD',unit:'US$',fmt:'money',log:true,color:d3.interpolateYlGn,range:[1960,2024],desc:'GDP, current US$ — size of the whole economy',source:'World Bank WDI (NY.GDP.MKTP.CD) • National accounts / OECD'},
{id:'gdpCap',icon:'🧍',label:'GDP per Capita',cat:'Economy',type:'wb',code:'NY.GDP.PCAP.CD',unit:'US$ / person',fmt:'money',log:true,color:d3.interpolateGreens,range:[1960,2024],desc:'GDP per capita, current US$',source:'World Bank WDI (NY.GDP.PCAP.CD)'},
{id:'gdpGrowth',icon:'🚀',label:'GDP Growth',cat:'Economy',type:'wb',code:'NY.GDP.MKTP.KD.ZG',unit:'% / year',fmt:'pct1',diverging:true,color:d3.interpolateRdYlGn,range:[1961,2024],desc:'Annual % growth of GDP — booms & recessions',source:'World Bank WDI (NY.GDP.MKTP.KD.ZG)'},
{id:'unemployment',icon:'🧑‍💼',label:'Unemployment',cat:'Economy',type:'wb',code:'SL.UEM.TOTL.ZS',unit:'% labour force',fmt:'pct1',color:d3.interpolateOranges,range:[1991,2024],desc:'Unemployment, % of labour force (ILO modelled)',source:'World Bank WDI (SL.UEM.TOTL.ZS) • ILOSTAT'},
{id:'literacy',icon:'📚',label:'Literacy Rate',cat:'Society',type:'wb',code:'SE.ADT.LITR.ZS',unit:'% adults',fmt:'pct1',color:d3.interpolateBlues,range:[2000,2024],desc:'Adult literacy (15+) — sparse: only survey years exist',source:'UNESCO Institute for Statistics via World Bank (SE.ADT.LITR.ZS)'},
{id:'internet',icon:'🌐',label:'Internet Users',cat:'Society',type:'wb',code:'IT.NET.USER.ZS',unit:'% population',fmt:'pct1',color:d3.interpolatePuBuGn,range:[1990,2024],desc:'Individuals using the Internet — watch 1990→today!',source:'World Bank WDI (IT.NET.USER.ZS) • ITU'},
{id:'urban',icon:'🏙️',label:'Urban Population',cat:'Society',type:'wb',code:'SP.URB.TOTL.IN.ZS',unit:'% urban',fmt:'pct1',color:d3.interpolateYlOrBr,range:[1960,2024],desc:'Share of population living in urban areas',source:'World Bank WDI (SP.URB.TOTL.IN.ZS) • UN Population Division'},
{id:'forest',icon:'🌲',label:'Forest Cover',cat:'Planet',type:'wb',code:'AG.LND.FRST.ZS',unit:'% land',fmt:'pct1',color:d3.interpolateGreens,range:[1990,2024],desc:'Forest area as % of land area',source:'World Bank WDI (AG.LND.FRST.ZS) • FAO Global Forest Resources Assessment'},
{id:'renewable',icon:'🔄',label:'Renewable Energy',cat:'Planet',type:'wb',code:'EG.FEC.RNEW.ZS',unit:'% energy',fmt:'pct1',color:d3.interpolateYlGn,range:[2000,2022],desc:'Renewables share of final energy consumption',source:'World Bank WDI (EG.FEC.RNEW.ZS) • IEA / UN'},
{id:'peak',icon:'🏔️',label:'Highest Peak',cat:'Curiosities',type:'curated',idx:1,unit:'m',fmt:'int',log:true,color:d3.interpolateYlOrBr,snapshot:2024,desc:'Elevation of highest summit',source:'CIA World Factbook • Curated snapshot'},
{id:'lakes',icon:'🏞️',label:'Number of Lakes',cat:'Curiosities',type:'curated',idx:2,unit:'lakes',fmt:'int',log:true,color:d3.interpolateBlues,snapshot:2020,desc:'Count of natural lakes (HydroLAKES)',source:'HydroLAKES v1.0 (Messager et al.) • Curated, rounded'},
{id:'mammals',icon:'🦁',label:'Mammal Species',cat:'Planet',type:'curated',idx:3,unit:'species',fmt:'int',log:true,color:d3.interpolateYlGn,snapshot:2023,desc:'Native mammal species richness',source:'IUCN Red List • Curated snapshot, rounded'},
{id:'nuclear',icon:'☢️',label:'Nuclear Reactors',cat:'Curiosities',type:'curated',idx:4,unit:'reactors',fmt:'int',color:d3.interpolateReds,snapshot:2024,desc:'Operational power reactors — 0 for most countries',source:'IAEA PRIS 2024 • Curated snapshot'},
{id:'commonwealth',icon:'👑',label:'Commonwealth',cat:'Curiosities',type:'curated',idx:5,unit:'member?',fmt:'yn',discrete:{0:'#dbeafe',1:'#f59e0b'},discreteLabels:'<span>Not member</span><span>Member</span>',snapshot:2024,desc:'Member of the Commonwealth of Nations (56)',source:'Commonwealth Secretariat 2024 • '+COMMONWEALTH_NAMES},
{id:'dino',icon:'🦕',label:'Dinosaur Fossils',cat:'Curiosities',type:'curated',idx:6,unit:'localities',fmt:'int',log:true,color:d3.interpolateOranges,snapshot:2024,desc:'Dinosaur fossil localities (approx.)',source:'Paleobiology Database • Curated, rounded — discovery effort biases this!'},
{id:'coastline',icon:'🌊',label:'Coastline Length',cat:'Curiosities',type:'curated',idx:7,unit:'km',fmt:'int',log:true,color:d3.interpolatePuBu,snapshot:2024,desc:'Length of coastline',source:'CIA World Factbook • Coastline paradox applies — treat as comparative'},
{id:'popGrowth',icon:'📈',label:'Population Growth',cat:'People',type:'wb',code:'SP.POP.GROW',unit:'% / year',fmt:'pct1',diverging:true,color:d3.interpolateRdYlGn,range:[1961,2025],desc:'Annual % population change — growth and shrinkage',source:'World Bank WDI (SP.POP.GROW) • UN Population Division'},
{id:'fertility',icon:'🤰',label:'Fertility Rate',cat:'People',type:'wb',code:'SP.DYN.TFRT.IN',unit:'children / woman',fmt:'num1',color:d3.interpolateYlOrRd,range:[1960,2024],desc:'Children per woman — the demographic transition, live',source:'World Bank WDI (SP.DYN.TFRT.IN) • UN Population Division'},
{id:'co2',icon:'🏭',label:'CO₂ per Capita',cat:'Planet',type:'wb',code:'EN.GHG.CO2.PC.CE.AR5',unit:'t CO₂ / person',fmt:'num1',log:true,color:d3.interpolateYlOrRd,range:[1970,2024],desc:'CO₂ emissions per person, excl. land use',source:'World Bank WDI (EN.GHG.CO2.PC.CE.AR5) • EDGAR / UNFCCC'},
{id:'rainfall',icon:'🌧️',label:'Rainfall',cat:'Planet',type:'wb',code:'AG.LND.PRCP.MM',unit:'mm / year',fmt:'int',log:true,color:d3.interpolateBlues,range:[1961,2022],desc:'Average precipitation depth per year',source:'World Bank WDI (AG.LND.PRCP.MM) • FAO'},
{id:'temperature',icon:'🌡️',label:'Avg Temperature',cat:'Planet',type:'curated',map:'temperature',unit:'°C',fmt:'num1',color:d3.interpolateYlOrRd,snapshot:2020,desc:'Mean annual temperature (1991–2020 normals, approx.)',source:'World Bank Climate Change Knowledge Portal (CRU) • Curated, approximate'},
{id:'birds',icon:'🐦',label:'Bird Species',cat:'Planet',type:'curated',map:'birds',unit:'species',fmt:'int',log:true,color:d3.interpolateYlGnBu,snapshot:2023,desc:'Bird species richness, incl. migrants (rounded)',source:'IUCN Red List / BirdLife • Curated, rounded'},
{id:'amphibians',icon:'🐸',label:'Amphibian Species',cat:'Planet',type:'curated',map:'amphibians',unit:'species',fmt:'int',log:true,color:d3.interpolateGreens,snapshot:2023,desc:'Amphibian species richness (rounded)',source:'IUCN Red List • Curated, rounded'},
{id:'reptiles',icon:'🦎',label:'Reptile Species',cat:'Planet',type:'curated',map:'reptiles',unit:'species',fmt:'int',log:true,color:d3.interpolateOranges,snapshot:2023,desc:'Reptile species richness (rounded)',source:'IUCN Red List • Curated, rounded'},
{id:'volcanoes',icon:'🌋',label:'Active Volcanoes',cat:'Planet',type:'curated',map:'volcanoes',unit:'volcanoes',fmt:'int',color:d3.interpolateReds,snapshot:2024,desc:'Holocene (active) volcanoes by country',source:'Smithsonian Institution GVP • Curated counts'},
{id:'coffee',icon:'☕',label:'Coffee Drinking',cat:'Society',type:'curated',map:'coffee',unit:'kg / person / yr',fmt:'num1',color:d3.interpolateYlOrBr,snapshot:2023,desc:'Coffee consumption per person (approx.)',source:'International Coffee Organization • Curated, rounded, approx.'},
{id:'tea',icon:'🍵',label:'Tea Drinking',cat:'Society',type:'curated',map:'tea',unit:'kg / person / yr',fmt:'num1',color:d3.interpolateGreens,snapshot:2022,desc:'Tea consumption per person (approx.)',source:'FAOSTAT / industry reports • Curated, rounded, approx.'},
{id:'beer',icon:'🍺',label:'Beer Drinking',cat:'Society',type:'curated',map:'beer',unit:'L / person / yr',fmt:'int',color:d3.interpolateOranges,snapshot:2023,desc:'Beer consumption per person (approx.)',source:'Kirin Beer University Report (2023 data) • Curated, rounded, approx.'},
{id:'wine',icon:'🍷',label:'Wine Drinking',cat:'Society',type:'curated',map:'wine',unit:'L / person / yr',fmt:'num1',color:d3.interpolateRdPu,snapshot:2023,desc:'Wine consumption per person (approx.)',source:'OIV State of the Vine and Wine (2023 data) • Curated, rounded, approx.'},
{id:'languages',icon:'🗣️',label:'Languages Spoken',cat:'Society',type:'curated',map:'languages',unit:'living languages',fmt:'int',log:true,color:d3.interpolateBuGn,snapshot:2024,desc:'Living languages counted in each country (rounded)',source:'Ethnologue, 27th ed. (2024) • Curated, rounded'},
{id:'timezones',icon:'⏰',label:'Time Zones',cat:'Curiosities',type:'curated',map:'timezones',unit:'zones',fmt:'int',color:d3.interpolatePlasma,snapshot:2024,desc:'Civil time zones incl. overseas territories',source:'IANA time zone database • Curated'},
{id:'driving',icon:'🚗',label:'Driving Side',cat:'Curiosities',type:'curated',map:'driving',unit:'side',fmt:'drive',discrete:{0:'#9db8d6',1:'#e8590c'},discreteLabels:'<span>Right-hand traffic</span><span>⬅ Left-hand traffic</span>',snapshot:2024,desc:'Which side of the road each country drives on',source:'WorldStandards • Curated'},
{id:'landlocked',icon:'🔒',label:'Landlocked',cat:'Curiosities',type:'curated',map:'landlocked',unit:'status',fmt:'lock',discrete:{0:'#7fb3d5',1:'#f59e0b',2:'#c2255c'},discreteLabels:'<span>Coastline</span><span>Landlocked</span><span>Doubly landlocked</span>',snapshot:2024,desc:'44 landlocked nations — 2 doubly landlocked',source:'UN-OHRLLS • Curated (doubly: Liechtenstein, Uzbekistan)'},
{id:'earthquakes',icon:'💥',label:'Major Earthquakes',cat:'Planet',type:'points',unit:'M6.0+ events',fmt:'int',range:[2000,2025],desc:'M6.0+ earthquakes as dots — size = magnitude, colour = depth. Drag time.',source:'USGS Earthquake Catalog (ANSS ComCat) • Saved snapshot + live refresh',
 points:{store:'quakes',file:'data/earthquakes.json',live:'usgs'},
 ptSize:e=>Math.min(12,1.4+Math.pow(2,e.m-6)*1.2),
 ptColor:e=>quakeColor(e.d==null?300:Math.min(600,Math.max(0,e.d))),
 ptLegendCSS:()=>`linear-gradient(90deg,${d3.range(0,1.01,.1).map(t=>quakeColor(600-600*t)).join(',')})`,
 ptLegendLabels:()=>['Deep (600 km)','Shallow (0 km)'],
 ptVal:e=>e.m,ptValFmt:v=>'M'+v.toFixed(1),ptPlace:e=>e.p,ptYear:e=>new Date(e.t).getUTCFullYear(),
 ptRow:e=>[`<b>${e.p}</b>`,`<b>M${e.m.toFixed(1)}</b> · ${e.d!=null?Math.round(e.d)+' km':'—'}`,quakeDate(e.t)],
 ptHead:()=>['Place','Magnitude · Depth','Date'],ptTopT:()=>'💥 Largest',ptBotT:()=>'🕳️ Deepest',
 ptVal2:e=>e.d??-1,ptVal2Fmt:v=>Math.round(v)+' km',ptSortBottomDesc:true,
 ptPanelBig:e=>`M${e.m.toFixed(1)} — ${e.p} (${quakeDate(e.t)})`,
 ptCount:'M6+ events',ptBig:'Largest quake',
 ptTip:e=>`<b>M${e.m.toFixed(1)}</b> — ${e.p}<br><small>${quakeDate(e.t)} • ${e.d!=null?Math.round(e.d)+' km deep':'depth n/a'}</small>`},
{id:'eruptions',icon:'🌋',label:'Iconic Eruptions',cat:'Planet',type:'points',unit:'eruptions',fmt:'int',range:[1815,2024],desc:'Iconic volcanic eruptions since 1815 — size and colour = VEI. Drag time.',source:'Smithsonian Institution GVP (VEI) • Curated list',
 points:{store:'eruptions',key:'eruptions'},
 ptSize:e=>1.5+e.v*1.6,ptColor:e=>d3.interpolateYlOrRd(.15+.85*(e.v-3)/4),
 ptLegendCSS:()=>`linear-gradient(90deg,${d3.range(3,7.01,1).map(v=>d3.interpolateYlOrRd(.15+.85*(v-3)/4)).join(',')})`,
 ptLegendLabels:()=>['VEI 3','VEI 7'],
 ptVal:e=>e.v,ptValFmt:v=>'VEI '+v,ptPlace:e=>`${e.n} (${e.c})`,ptYear:e=>e.y,
 ptRow:e=>[`<b>${e.n}</b> <small>${e.c}</small>`,`<b>VEI ${e.v}</b>`,e.y],
 ptHead:()=>['Volcano','VEI','Year'],ptTopT:()=>'🌋 Largest VEI',ptBotT:()=>'🌋 Smallest VEI',
 ptPanelBig:e=>`VEI ${e.v} — ${e.n} (${e.y})`,
 ptCount:'eruptions',ptBig:'Largest eruption',
 ptTip:e=>`<b>${e.n}</b> — VEI ${e.v}<br><small>${e.y} • ${e.c}</small>`},
{id:'cities',icon:'🏙️',label:'Megacities',cat:'People',type:'points',unit:'million people',fmt:'num1',range:[2024,2024],desc:'The world’s largest metro areas — dot size = population.',source:'UN World Urbanization Prospects • Curated snapshot',
 points:{store:'cities',key:'cities'},
 ptSize:e=>2+Math.sqrt(e.v)*1.1,ptColor:()=>'#0e7a5f',
 ptLegendCSS:()=> '#0e7a5f',ptLegendLabels:()=>['● size = metro population',''],
 ptVal:e=>e.v,ptValFmt:v=>'≈'+v+'M',ptPlace:e=>`${e.n}, ${e.c}`,ptYear:e=>e.y,
 ptRow:e=>[`<b>${e.n}</b> <small>${e.c}</small>`,`<b>≈${e.v}M</b>`,e.c],
 ptHead:()=>['City','Population','Country'],ptTopT:()=>'🏙️ Largest',ptBotT:()=>'🏙️ Smallest',
 ptPanelBig:e=>`≈${e.v}M — ${e.n}`,
 ptCount:'megacities',ptBig:'Largest city',
 ptTip:e=>`<b>${e.n}</b> — ≈${e.v}M people<br><small>${e.c} • metro area</small>`},
{id:'airports',icon:'✈️',label:'Busiest Airports',cat:'Economy',type:'points',unit:'M passengers / yr',fmt:'num1',range:[2024,2024],desc:'World\u2019s busiest airports by 2023 passengers — dot size = traffic.',source:'Airports Council International 2023 • Curated snapshot',
 points:{store:'airports',key:'airports'},
 ptSize:e=>2+e.v*.06,ptColor:()=>'#b45309',
 ptLegendCSS:()=> '#b45309',ptLegendLabels:()=>['● size = passengers',''],
 ptVal:e=>e.v,ptValFmt:v=>v+'M',ptPlace:e=>`${e.n} (${e.c})`,ptYear:e=>e.y,
 ptRow:e=>[`<b>${e.n}</b> <small>${e.c}</small>`,`<b>${e.v}M</b>`,e.c],
 ptHead:()=>['Airport','Passengers','Country'],ptTopT:()=>'✈️ Busiest',ptBotT:()=>'✈️ Quietest',
 ptPanelBig:e=>`${e.v}M — ${e.n}`,
 ptCount:'airports',ptBig:'Busiest airport',
 ptTip:e=>`<b>${e.n}</b> — ${e.v}M passengers (2023)<br><small>${e.c}</small>`},
{id:'meteorites',icon:'☄️',label:'Famous Meteorites',cat:'Curiosities',type:'points',unit:'falls & finds',fmt:'int',range:[1492,2013],desc:'Famous meteorite falls and finds — dot size = mass (log). Drag time.',source:'Meteoritical Society database • Curated list',
 points:{store:'meteorites',key:'meteorites'},
 ptSize:e=>e.v==null?2:2+Math.log10(e.v+1)*1.6,ptColor:()=>'#475569',
 ptLegendCSS:()=> '#475569',ptLegendLabels:()=>['● size = mass (log)',''],
 ptVal:e=>e.v??-1,ptValFmt:v=>v<0?'unknown':v>=1000?(v/1000).toFixed(1)+' t':Math.round(v)+' kg',ptPlace:e=>`${e.n} (${e.c})`,ptYear:e=>e.y,
 ptRow:e=>[`<b>${e.n}</b> <small>${e.c}</small>`,`<b>${e.v==null?'—':e.v>=1000?(e.v/1000).toFixed(1)+' t':Math.round(e.v)+' kg'}</b>`,e.y],
 ptHead:()=>['Name','Mass','Year'],ptTopT:()=>'☄️ Heaviest',ptBotT:()=>'☄️ Lightest',
 ptPanelBig:e=>`${e.n} (${e.y})`,
 ptCount:'meteorites',ptBig:'Heaviest',
 ptTip:e=>`<b>${e.n}</b> — ${e.v==null?'mass unknown':e.v>=1000?(e.v/1000).toFixed(1)+' tonnes':Math.round(e.v)+' kg'}<br><small>${e.y} • ${e.c}</small>`},
{id:'electricity',icon:'💡',label:'Electricity Access',cat:'Society',type:'wb',code:'EG.ELC.ACCS.ZS',unit:'% population',fmt:'pct1',color:d3.interpolateBlues,range:[1990,2025],desc:'Population with access to electricity — watch the lights come on',source:'World Bank WDI (EG.ELC.ACCS.ZS) • SE4ALL'},
{id:'mobiles',icon:'📱',label:'Mobile Subscriptions',cat:'Society',type:'wb',code:'IT.CEL.SETS.P2',unit:'per 100 people',fmt:'int',log:true,color:d3.interpolateGnBu,range:[1990,2025],desc:'Mobile subscriptions per 100 people (>100 = multiple SIMs)',source:'World Bank WDI (IT.CEL.SETS.P2) • ITU'},
{id:'childMort',icon:'👶',label:'Child Mortality',cat:'People',type:'wb',code:'SH.DYN.MORT',unit:'per 1,000 births',fmt:'num1',log:true,color:d3.interpolateOrRd,range:[1960,2023],desc:'Under-5 deaths per 1,000 live births — the great decline',source:'World Bank WDI (SH.DYN.MORT) • UN IGME'},
{id:'elderly',icon:'🧓',label:'Elderly Share',cat:'People',type:'wb',code:'SP.POP.65UP.TO.ZS',unit:'% aged 65+',fmt:'pct1',color:d3.interpolatePuRd,range:[1960,2025],desc:'Share of population aged 65 and above',source:'World Bank WDI (SP.POP.65UP.TO.ZS) • UN Population Division'},
{id:'undernourish',icon:'🍽️',label:'Undernourishment',cat:'People',type:'wb',code:'SN.ITK.DEFC.ZS',unit:'% population',fmt:'pct1',color:d3.interpolateYlOrRd,range:[2000,2022],desc:'Prevalence of undernourishment — FAO modelled estimates',source:'World Bank WDI (SN.ITK.DEFC.ZS) • FAO'},
{id:'gini',icon:'⚖️',label:'Income Inequality',cat:'Economy',type:'wb',code:'SI.POV.GINI',unit:'Gini index',fmt:'num1',color:d3.interpolateYlOrRd,range:[1980,2023],desc:'Gini index — 0 = perfect equality, 100 = total concentration',source:'World Bank WDI (SI.POV.GINI) • PovcalNet'},
{id:'military',icon:'🛡️',label:'Military Spending',cat:'Economy',type:'wb',code:'MS.MIL.XPND.GD.ZS',unit:'% of GDP',fmt:'pct1',color:d3.interpolateReds,range:[1960,2024],desc:'Military expenditure as % of GDP (SIPRI)',source:'World Bank WDI (MS.MIL.XPND.GD.ZS) • SIPRI'},
{id:'tourism',icon:'🧳',label:'Tourist Arrivals',cat:'Economy',type:'wb',code:'ST.INT.ARVL',unit:'visitors / yr',fmt:'compact',log:true,color:d3.interpolateGnBu,range:[1995,2023],desc:'International tourist arrivals per year',source:'World Bank WDI (ST.INT.ARVL) • UN Tourism'},
{id:'protected',icon:'🏞️',label:'Protected Areas',cat:'Planet',type:'wb',code:'ER.LND.PTLD.ZS',unit:'% land',fmt:'pct1',color:d3.interpolateYlGn,range:[1990,2023],desc:'Terrestrial protected areas as % of land',source:'World Bank WDI (ER.LND.PTLD.ZS) • UNEP-WCMC'},
{id:'eduSpend',icon:'🎓',label:'Education Spending',cat:'Economy',type:'wb',code:'SE.XPD.TOTL.GD.ZS',unit:'% of GDP',fmt:'pct1',color:d3.interpolateBlues,range:[1970,2023],desc:'Government education spending as % of GDP',source:'World Bank WDI (SE.XPD.TOTL.GD.ZS) • UNESCO UIS'},
{id:'rdSpend',icon:'🔬',label:'R&D Spending',cat:'Economy',type:'wb',code:'GB.XPD.RSDV.GD.ZS',unit:'% of GDP',fmt:'pct1',color:d3.interpolatePurples,range:[1996,2022],desc:'Research & development spending as % of GDP',source:'World Bank WDI (GB.XPD.RSDV.GD.ZS) • UNESCO UIS'},
{id:'nobel',icon:'🏅',label:'Nobel Laureates',cat:'Society',type:'curated',map:'nobel',unit:'laureates',fmt:'int',color:d3.interpolateOranges,snapshot:2024,desc:'Nobel laureates by country (all prizes, approx.)',source:'nobelprize.org • Curated, rounded, approx.'},
{id:'olympics',icon:'🥇',label:'Olympic Medals',cat:'Society',type:'curated',map:'olympics',unit:'medals',fmt:'int',log:true,color:d3.interpolateYlOrBr,snapshot:2024,desc:'All-time Olympic medals by current nation (approx.)',source:'Olympedia • Curated, rounded, approx.'},
{id:'olympicsPC',icon:'🥇',label:'Olympics per Million',cat:'Society',type:'curated',map:'olympicsPC',unit:'medals / M people',fmt:'num1',log:true,color:d3.interpolateYlOrBr,snapshot:2024,desc:'All-time Olympic medals per million people — small nations shine',source:'Olympedia + UN population • Curated, computed'},
{id:'unesco',icon:'🏛️',label:'Heritage Sites',cat:'Curiosities',type:'curated',map:'unesco',unit:'sites',fmt:'int',color:d3.interpolateGreens,snapshot:2024,desc:'UNESCO World Heritage Sites by country (approx.)',source:'UNESCO World Heritage Centre • Curated, rounded, approx.'},
{id:'democracy',icon:'🗳️',label:'Democracy Status',cat:'Curiosities',type:'curated',map:'democracy',unit:'status',fmt:'demo',discrete:{0:'#2a9d8f',1:'#e9c46a',2:'#e76f51'},discreteLabels:'<span>Free</span><span>Partly free</span><span>Not free</span>',snapshot:2024,desc:'Free, Partly Free or Not Free (approx.)',source:'Freedom House, Freedom in the World • Curated, approx.'},
{id:'legal',icon:'⚖️',label:'Legal System',cat:'Curiosities',type:'curated',map:'legal',unit:'system',fmt:'legal',discrete:{0:'#7fb3d5',1:'#2a9d8f',2:'#e9c46a',3:'#c2255c'},discreteLabels:'<span>Civil law</span><span>Common law</span><span>Mixed</span><span>Religious</span>',snapshot:2024,desc:'Civil, common, mixed or religious legal tradition',source:'JuriGlobe (Univ. of Ottawa) • Curated, approx.'},
{id:'plugs',icon:'🔌',label:'Plug Types',cat:'Curiosities',type:'curated',map:'plugs',unit:'plug type',fmt:'plug',discrete:{0:'#e8590c',1:'#2a9d8f',2:'#3a86ff',3:'#8338ec',4:'#ff006e',5:'#6c757d'},discreteLabels:'<span>A / B</span><span>C – F</span><span>G</span><span>D / M</span><span>I</span><span>Other</span>',snapshot:2024,desc:'Which mains plug each country uses (primary type)',source:'WorldStandards • Curated, approx.'},
{id:'metric',icon:'📏',label:'Metric System',cat:'Curiosities',type:'curated',map:'metric',unit:'system',fmt:'metric',discrete:{0:'#e8590c',1:'#2a9d8f'},discreteLabels:'<span>Non-metric (US, Liberia, Myanmar)</span><span>Metric</span>',snapshot:2024,desc:'Only 3 countries have not adopted metric',source:'WorldStandards • Curated'},
{id:'eu',icon:'🇪🇺',label:'EU Members',cat:'Curiosities',type:'curated',map:'eu',unit:'member?',fmt:'bloc',discrete:{0:'#dbeafe',1:'#1d4ed8'},discreteLabels:'<span>Not a member</span><span>EU member</span>',snapshot:2024,desc:'27 European Union member states',source:'European Union • Curated'},
{id:'nato',icon:'🛡️',label:'NATO Members',cat:'Curiosities',type:'curated',map:'nato',unit:'member?',fmt:'bloc',discrete:{0:'#dbeafe',1:'#1d4ed8'},discreteLabels:'<span>Not a member</span><span>NATO member</span>',snapshot:2024,desc:'32 NATO allies',source:'NATO • Curated'},
{id:'brics',icon:'🧱',label:'BRICS',cat:'Curiosities',type:'curated',map:'brics',unit:'member?',fmt:'bloc',discrete:{0:'#dbeafe',1:'#1d4ed8',2:'#93c5fd'},discreteLabels:'<span>Not a member</span><span>Full member</span><span>Partner</span>',snapshot:2025,desc:'10 full members + partner countries (approx.)',source:'BRICS summits • Curated, approx.'},
{id:'opec',icon:'🛢️',label:'OPEC Members',cat:'Curiosities',type:'curated',map:'opec',unit:'member?',fmt:'bloc',discrete:{0:'#dbeafe',1:'#1d4ed8'},discreteLabels:'<span>Not a member</span><span>OPEC member</span>',snapshot:2024,desc:'12 OPEC oil exporters',source:'OPEC • Curated'},
{id:'g20',icon:'🤝',label:'G20 Members',cat:'Curiosities',type:'curated',map:'g20',unit:'member?',fmt:'bloc',discrete:{0:'#dbeafe',1:'#1d4ed8'},discreteLabels:'<span>Not a member</span><span>G20 member</span>',snapshot:2024,desc:'19 states + EU + African Union',source:'G20 • Curated'},
{id:'langfam',icon:'💬',label:'Language Families',cat:'Curiosities',type:'curated',map:'langfam',unit:'family',fmt:'langfam',discrete:{0:'#4e79a7',1:'#f28e2b',2:'#e15759',3:'#76b7b2',4:'#59a14f',5:'#edc949',6:'#af7aa1',7:'#ff9da7',8:'#9c755f',9:'#bab0ac',10:'#e377c2',11:'#7f7f7f',12:'#bcbd22',13:'#17becf',14:'#8c564b',15:'#9467bd'},discreteLabels:'<span>16 families — Indo-European → Other</span><span>see country card</span>',snapshot:2024,desc:'Dominant language family of each country',source:'Ethnologue • Curated, approx.'},
{id:'gov',icon:'🏛️',label:'Government Type',cat:'Curiosities',type:'curated',map:'gov',unit:'system',fmt:'gov',discrete:{0:'#7fb3d5',1:'#f59e0b',2:'#c2255c',3:'#6d28d9'},discreteLabels:'<span>Republic</span><span>Monarchy</span><span>One-party</span><span>Theocracy</span>',snapshot:2024,desc:'Republic, monarchy, one-party or theocracy',source:'CIA World Factbook field • Curated, approx.'},
{id:'coffeeProd',icon:'🌱',label:'Coffee Growing',cat:'Economy',type:'curated',map:'coffeeProd',unit:'tonnes / yr',fmt:'compact',log:true,color:d3.interpolateYlGn,snapshot:2023,desc:'Coffee production in tonnes (approx.) — pairs with Coffee Drinking',source:'FAOSTAT • Curated, rounded, approx.'},
{id:'choco',icon:'🍫',label:'Chocolate Eating',cat:'Society',type:'curated',map:'choco',unit:'kg / person / yr',fmt:'num1',color:d3.interpolateRdPu,snapshot:2023,desc:'Chocolate consumption per person (approx.)',source:'Industry reports • Curated, rounded, approx.'},
{id:'ageDep',icon:'👨‍👩‍👧',label:'Age Dependency',cat:'People',type:'wb',code:'SP.POP.DPND',unit:'dependents / 100 workers',fmt:'num1',color:d3.interpolatePuBu,range:[1960,2025],desc:'Child + elderly dependents per 100 working-age people',source:'World Bank WDI (SP.POP.DPND) • UN Population Division'},
{id:'broadband',icon:'🌐',label:'Broadband',cat:'Society',type:'wb',code:'IT.NET.BBND.P2',unit:'per 100 people',fmt:'num1',color:d3.interpolateGnBu,range:[2000,2025],desc:'Fixed broadband subscriptions per 100 people',source:'World Bank WDI (IT.NET.BBND.P2) • ITU'},
{id:'foodProd',icon:'🌾',label:'Food Production',cat:'Economy',type:'wb',code:'AG.PRD.FOOD.XD',unit:'index 2014–16 = 100',fmt:'num1',color:d3.interpolateYlGn,range:[1961,2023],desc:'Food production index (2014–2016 = 100)',source:'World Bank WDI (AG.PRD.FOOD.XD) • FAO'},
{id:'trade',icon:'🚢',label:'Trade Openness',cat:'Economy',type:'wb',code:'NE.TRD.GNFS.ZS',unit:'% of GDP',fmt:'pct1',color:d3.interpolateBlues,range:[1960,2023],desc:'Trade (exports + imports) as % of GDP',source:'World Bank WDI (NE.TRD.GNFS.ZS) • National accounts'},
{id:'maternal',icon:'🤱',label:'Maternal Mortality',cat:'People',type:'wb',code:'SH.STA.MMRT',unit:'per 100,000 births',fmt:'int',log:true,color:d3.interpolateReds,range:[2000,2023],desc:'Maternal deaths per 100,000 live births — the great decline',source:'World Bank WDI (SH.STA.MMRT) • WHO / UNICEF'},
{id:'femaleLabor',icon:'👩‍💼',label:'Women Working',cat:'Society',type:'wb',code:'SL.TLF.CACT.FE.ZS',unit:'% women 15+',fmt:'pct1',color:d3.interpolateBuGn,range:[1990,2025],desc:'Labour force participation of women 15+ (ILO modelled)',source:'World Bank WDI (SL.TLF.CACT.FE.ZS) • ILOSTAT'},
];
let cur=DATASETS[0], year=2024, yearTouched=false, cache={}, series={}, recordMeta={}, geo=null, selected=null, playing=null, colorScale=null, vals=new Map(), names={}, hasTimeline=false;
const revalidating=new Set(), revalidated=new Set();
function fmt(v,ds=cur){if(v==null||isNaN(v))return'No data';if(ds.fmt==='compact')return d3.format('.3~s')(v);if(ds.fmt==='money')return v>=1e12?'$'+(v/1e12).toFixed(2)+'T':v>=1e9?'$'+(v/1e9).toFixed(1)+'B':'$'+d3.format(',')(Math.round(v));if(ds.fmt==='pct1')return v.toFixed(1)+'%';if(ds.fmt==='num1')return (+v).toFixed(1);if(ds.fmt==='int')return d3.format(',')(Math.round(v));if(ds.fmt==='yn')return v?'✅ Member':'— Not a member';if(ds.fmt==='drive')return v?'⬅ Left-hand':'Right-hand ➡';if(ds.fmt==='lock')return['Coastline','Landlocked','Doubly landlocked'][v]??'No data';if(ds.fmt==='demo')return['Free','Partly free','Not free'][v]??'No data';if(ds.fmt==='legal')return['Civil law','Common law','Mixed','Religious / customary'][v]??'No data';if(ds.fmt==='plug')return['Type A / B','Type C / E / F','Type G','Type D / M','Type I','Other'][v]??'No data';if(ds.fmt==='langfam')return['Indo-European','Afro-Asiatic','Niger-Congo','Nilo-Saharan','Sino-Tibetan','Austronesian','Austroasiatic','Kra-Dai','Turkic','Uralic','Japonic','Koreanic','Mongolic','Trans–New Guinea','Eskimo-Aleut','Other'][v]??'No data';if(ds.fmt==='gov')return['Republic','Monarchy','One-party state','Theocracy'][v]??'No data';if(ds.fmt==='metric')return v?'Metric':'Non-metric';if(ds.fmt==='bloc')return v==null?'No data':v===2?'🤝 Partner':v?'✅ Member':'— Not a member';return d3.format(',')(v)}
function setStatus(t){const el=$('#dataStatus');if(el){el.textContent=t;el.title=t}}
/* ---------- geometry: local record first, India already official in it ---------- */
async function fetchJson(urls){let last;for(const u of urls){try{const r=await fetch(u);if(!r.ok)throw new Error(r.status);return await r.json()}catch(e){last=e}}throw last}
async function loadGeo(){
 geo=await fetchJson(['data/world.geo.json','https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json']);
 // India (official outline incl. PoK/Gilgit-Baltistan + Aksai Chin) must paint
 // over the overlapping de-facto polygons of its neighbours, so draw it last.
 geo.features.sort((a,b)=>(a.id==='IND'?1:0)-(b.id==='IND'?1:0));
 geo.features.forEach(f=>{names[f.id]=f.properties.name});
 drawMap();
}
let svg,g,path,zoomBeh,landFc,dotLayer,projRef,mapW=960,mapH=500;
const PT={}; // point-dataset id -> {events, byYear, meta}
function P(){return PT[cur.id]||{events:[],byYear:{},meta:{}}}
const quakeColor=d3.scaleSequential(d3.interpolateTurbo).domain([600,0]);
const quakeR=m=>Math.min(12,1.4+Math.pow(2,m-6)*1.2);
const quakeDate=t=>new Date(t).toISOString().slice(0,10);
// The SVG is sized to the exact pixel box and the projection is fitted to it,
// so the map fills the frame edge to edge with no letterbox gap.
// Antarctica stays in (it holds no data in any dataset — hatched grey).
function drawMap(){
 svg=d3.select('#map').append('svg').attr('width','100%');
 const defs=svg.append('defs');
 defs.html('<pattern id="nodata-pattern" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#dfe3e0"/><line x1="0" y1="0" x2="0" y2="6" stroke="#b9c0bb" stroke-width="2"/></pattern>');
 g=svg.append('g');
 landFc={type:'FeatureCollection',features:geo.features};
 // Ocean + graticule are drawn in a fixed colour and are never part of
 // the choropleth selection — changing datasets cannot recolour the sea.
 g.append('path').attr('class','ocean');
 g.append('path').attr('class','graticule');
 dotLayer=g.append('g').attr('class','dots');
 zoomBeh=d3.zoom().scaleExtent([1,8]).on('zoom',e=>g.attr('transform',e.transform)); svg.call(zoomBeh);
 g.selectAll('path.country').data(landFc.features).join('path').attr('class','country')
  .on('mousemove',showTip).on('mouseleave',()=>$('#tooltip').style.opacity=0)
  .on('click',(e,d)=>selectCountry(d.id,d.properties.name));
 fitProjection();
 updateMap();
}
let globeView=false,gRot=[-30,-15],globeK=1;
const globeDrag=d3.drag().on('drag',e=>{gRot[0]+=e.dx*.35;gRot[1]=Math.max(-60,Math.min(60,gRot[1]-e.dy*.35));fitProjection(true)});
function fitProjection(spin){
 const box=$('#map'); const W=Math.max(320,Math.round(box.clientWidth||960));
 const H=Math.round(Math.min(600,Math.max(440,W*0.60))); mapW=W; mapH=H;
 svg.attr('viewBox',`0 0 ${W} ${H}`).attr('height',H);
 let proj;
 if(globeView){proj=d3.geoOrthographic().fitExtent([[4,4],[W-4,H-4]],{type:'Sphere'}).rotate(gRot);proj.scale(proj.scale()*globeK)}
 else{proj=d3.geoNaturalEarth1().fitExtent([[2,2],[W-2,H-2]],landFc)}
 projRef=proj; path=d3.geoPath(proj);
 g.select('.ocean').attr('d',path({type:'Sphere'}));
 g.select('.graticule').attr('d',path(d3.geoGraticule10()));
 g.selectAll('.country').attr('d',path);
 renderPoints();
}
function setGlobe(on){globeView=on;const b=$('#globeBtn');if(b){b.textContent=globeView?'🗺️ Map':'🌐 Globe';b.classList.toggle('play',globeView)}
 if(!svg)return; try{svg.call(zoomBeh.transform,d3.zoomIdentity)}catch(e){} g.attr('transform',null);
 if(globeView){svg.on('.zoom',null);svg.on('wheel.globe',e=>{e.preventDefault();globeK=Math.max(.7,Math.min(5,globeK*Math.pow(1.0015,-e.deltaY)));fitProjection(true)});svg.call(globeDrag)}
 else{svg.on('wheel.globe',null);svg.on('.drag',null);svg.call(zoomBeh);fitProjection();resetZoom();return}
 fitProjection(true);}
let resizeT;window.addEventListener('resize',()=>{clearTimeout(resizeT);resizeT=setTimeout(()=>{if(svg&&g)fitProjection()},200)});
function resetZoom(){if(globeView){gRot=[-30,-15];globeK=1;fitProjection(true);return}if(svg)svg.transition().duration(500).call(zoomBeh.transform,d3.zoomIdentity)}
function showTip(e,d){const tt=$('#tooltip');if(cur.type==='points'){const n=((P().byYear[year])||[]).length;tt.innerHTML=`<b>${d.properties.name}</b><br>${cur.icon} ${n} ${cur.ptCount} worldwide in ${year}<br><small>Click for the year summary • hover a dot for details</small>`}else{const v=vals.get(d.id);tt.innerHTML=`<b>${d.properties.name}</b><br>${cur.label}: <b>${fmt(v)}</b><br><small>${cur.type==='wb'?year:'Snapshot '+cur.snapshot} • ${cur.unit}</small>`}const r=$('#map').getBoundingClientRect();tt.style.left=(e.clientX-r.left+14)+'px';tt.style.top=(e.clientY-r.top+14)+'px';tt.style.opacity=1}
/* ---------- local record + background revalidation ---------- */
const AGG=new Set('AFE AFW ARB CEB CSS EAP EAR EAS ECA ECS EMU EUU FCV HIC HPC IBD IBT IDA IDB IDX LAC LCN LDC LIC LMC LMY LTE MEA MIC MNA NAC OED OSS PRE PSS PST SAS SSA SSF SST TEA TEC TLA TMN TSA TSS UMC WLD'.split(' '));
function ingest(ds,payload,origin){
 const byYear={},ser={};
 Object.entries(payload.countries||{}).forEach(([iso,years])=>{if(!iso||iso.length!==3||AGG.has(iso))return;Object.entries(years).forEach(([y,v])=>{const n=+v;if(v==null||!isFinite(n))return;(byYear[y]=byYear[y]||new Map()).set(iso,n);(ser[iso]=ser[iso]||[]).push([+y,n])})});
 cache[ds.id]=byYear; series[ds.id]=ser;
 recordMeta[ds.id]={fetchedAt:payload.fetchedAt||null,origin,signature:signature(byYear)};
 return byYear;
}
function signature(byYear){const ys=Object.keys(byYear).sort();const y=ys[ys.length-1];if(!y)return'';return y+':'+[...byYear[y].entries()].sort().map(([k,v])=>k+'='+v).join(',')}
function deriveRange(ds){
 const byYear=cache[ds.id]||{};const ys=Object.keys(byYear).map(Number).sort((a,b)=>a-b);
 if(!ys.length)return ds.range;
 const cnt=y=>byYear[y]?.size||0;
 const maxCnt=Math.max(...ys.map(cnt));
 const min=ys.find(y=>cnt(y)>=15) ?? ys[0];
 // Latest year with near-full coverage (avoids landing on a stub year with a handful of early reporters).
 const max=[...ys].reverse().find(y=>cnt(y)>=Math.max(50,.6*maxCnt)) ?? ys[ys.length-1];
 return [min,max];
}
async function loadRecord(ds){
 if(cache[ds.id])return true;
 let stored=null; try{stored=JSON.parse(localStorage.getItem('mm-wb3-'+ds.id)||'null')}catch(e){}
 try{
  const payload=await (await fetch(`data/wb/${ds.id}.json`)).json();
  // Keep whichever record is newer: the committed file, or a background-refreshed copy.
  if(stored && (!payload.fetchedAt || (stored.fetchedAt||'')>payload.fetchedAt)){ingest(ds,stored,'browser cache (refreshed)')}
  else ingest(ds,payload,'saved record');
  return true;
 }catch(e){
  if(stored){ingest(ds,stored,'browser cache (refreshed)');return true}
  return false;
 }
}
async function revalidate(ds){
 if(revalidated.has(ds.id)||revalidating.has(ds.id))return;
 revalidated.add(ds.id); revalidating.add(ds.id);
 const wasLatest=cur.id===ds.id&&+($('#yearSlider').max||0)>0&&year>=+$('#yearSlider').max;
 setStatus(`📦 saved record${recordMeta[ds.id]?.fetchedAt?' · '+recordMeta[ds.id].fetchedAt.slice(0,10):''} · checking World Bank…`);
 try{
  const countries={}; let page=1,pages=1;
  do{
   const r=await fetch(`https://api.worldbank.org/v2/country/all/indicator/${ds.code}?format=json&per_page=1000&page=${page}&date=1960:2025`,{headers:{'Accept':'application/json'}});
   if(!r.ok)throw new Error('HTTP '+r.status);
   const j=await r.json(); pages=j[0]?.pages||1;
   (j[1]||[]).forEach(row=>{if(!row.countryiso3code||AGG.has(row.countryiso3code)||row.value==null||!isFinite(+row.value)||row.country?.region?.id==='NA')return;(countries[row.countryiso3code]=countries[row.countryiso3code]||{})[row.date]=Math.round(row.value*10000)/10000});
   page++;
  }while(page<=pages);
  for(const must of ['ARG','AUS','IND'])if(!countries[must])throw new Error('incomplete API response ('+must+' missing) — keeping saved record');
  const payload={id:ds.id,code:ds.code,source:'World Bank WDI',fetchedAt:new Date().toISOString(),countries};
  const before=recordMeta[ds.id]?.signature;
  ingest(ds,payload,'World Bank API (background refresh)');
  if(recordMeta[ds.id].signature!==before){
   try{localStorage.setItem('mm-wb3-'+ds.id,JSON.stringify(payload))}catch(e){}
   if(cur.id===ds.id){const [mn,mx]=deriveRange(ds); const sl=$('#yearSlider'); sl.min=mn; sl.max=mx; $('#rangeLabel').textContent=`${mn} — ${mx}`; if(wasLatest||!yearTouched)year=mx;else year=Math.min(Math.max(year,mn),mx); sl.value=year;
   applyYear();
   setStatus('✨ Updated just now from the World Bank API — newer data was available.')}
  }else if(cur.id===ds.id){
   setStatus(`✅ Saved record is up to date — checked World Bank just now.`);
   recordMeta[ds.id].origin='saved record (checked, up to date)';
  }
 }catch(e){
  if(cur.id===ds.id)setStatus(`📦 Showing saved record — update check unavailable (${e.message}).`);
 }finally{revalidating.delete(ds.id)}
}
/* ---------- generic point-dot layers (quakes live + curated static sets) ---------- */
function ingestPoints(id,list,origin,fetchedAt){
 const seen=new Map(); (list||[]).forEach(e=>{if(!e||!isFinite(+e.lat)||!isFinite(+e.lon))return;seen.set(e.id||e.n+'-'+e.y,e)});
 const events=[...seen.values()].sort((a,b)=>(a.t||0)-(b.t||0));
 const byYear={}; events.forEach(e=>{const y=e.y!=null?e.y:new Date(e.t).getUTCFullYear();(byYear[y]=byYear[y]||[]).push(e)});
 PT[id]={events,byYear,meta:{fetchedAt:fetchedAt||null,origin,count:events.length}};
}
async function loadPointRecord(ds){
 if(PT[ds.id])return true;
 if(ds.points.key){
  if(typeof POINT_DATA==='undefined'||!POINT_DATA[ds.points.key])return false;
  ingestPoints(ds.id,POINT_DATA[ds.points.key],'curated snapshot',null);
  return true;
 }
 let stored=null; try{stored=JSON.parse(localStorage.getItem('mm-pt3-'+ds.id)||'null')}catch(e){}
 try{
  const payload=await (await fetch(ds.points.file)).json();
  if(stored&&stored.events&&(!payload.fetchedAt||(stored.fetchedAt||'')>payload.fetchedAt))ingestPoints(ds.id,stored.events,'browser cache (refreshed)',stored.fetchedAt);
  else ingestPoints(ds.id,payload.events,'saved record',payload.fetchedAt);
  return true;
 }catch(e){
  if(stored&&stored.events){ingestPoints(ds.id,stored.events,'browser cache (refreshed)',stored.fetchedAt);return true}
  return false;
 }
}
const liveFetchers={
 usgs:async ds=>{
  const st=P(); const last=new Date(Math.max(...st.events.map(e=>e.t))).toISOString().slice(0,10);
  const r=await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${last}&minmagnitude=6&orderby=time&limit=2000`);
  if(!r.ok)throw new Error('HTTP '+r.status);
  const j=await r.json();
  return (j.features||[]).map(f=>({id:f.id,t:f.properties.time,m:Math.round(f.properties.mag*10)/10,lon:+f.geometry.coordinates[0].toFixed(3),lat:+f.geometry.coordinates[1].toFixed(3),d:f.geometry.coordinates[2]!=null?Math.round(f.geometry.coordinates[2]*10)/10:null,p:(f.properties.place||'Unknown location').slice(0,120)}));
 }
};
async function revalidatePoints(ds){
 if(revalidated.has(ds.id))return; revalidated.add(ds.id);
 const wasLatestPt=cur.id===ds.id&&+($('#yearSlider').max||0)>0&&year>=+$('#yearSlider').max;
 const st0=P();
 setStatus(`📦 saved record • ${st0.meta.count} ${ds.ptCount||'points'} • checking for newer data…`);
 try{
  if(!ds.points.live)throw new Error('snapshot only');
  const have=new Set(st0.events.map(e=>e.id));
  const add=(await liveFetchers[ds.points.live](ds)).filter(e=>!have.has(e.id));
  if(add.length){
   const merged=[...st0.events,...add]; ingestPoints(ds.id,merged,'live refresh',new Date().toISOString());
   try{localStorage.setItem('mm-pt3-'+ds.id,JSON.stringify({fetchedAt:PT[ds.id].meta.fetchedAt,events:merged}))}catch(e){}
   if(cur.id===ds.id){const ys=Object.keys(PT[ds.id].byYear).map(Number).sort((a,b)=>a-b); const sl=$('#yearSlider'); sl.min=ys[0]; sl.max=ys[ys.length-1]; $('#rangeLabel').textContent=`${ys[0]} — ${ys[ys.length-1]}`; if(wasLatestPt||!yearTouched){year=+sl.max} sl.value=year; $('#yearLabel').textContent=year; applyYear();
   setStatus(`✨ Added ${add.length} new ${ds.ptCount||'point'}${add.length>1?'s':''} just now.`)}
  }else if(cur.id===ds.id)setStatus(`✅ Point record is up to date — ${st0.meta.count} ${ds.ptCount||'points'}, checked just now.`);
 }catch(e){ if(cur.id===ds.id)setStatus(`📦 Showing saved record — live check unavailable (${e.message}).`); }
}
function renderPoints(){
 if(!dotLayer||!projRef)return;
 if(cur.type!=='points'){dotLayer.selectAll('circle').remove();return}
 const evs=(P().byYear[year])||[];
 const cullGlobe=d=>{if(!globeView)return false;try{return d3.geoDistance([d.lon,d.lat],[-gRot[0],-gRot[1]])>Math.PI/2-.02}catch(e){return true}};
 dotLayer.selectAll('circle').data(evs,d=>d.id).join(
  enter=>enter.append('circle').attr('stroke','#0e2a22').attr('stroke-width',.4).attr('opacity',.88)
   .on('mousemove',showPointTip).on('mouseleave',()=>$('#tooltip').style.opacity=0))
  .attr('cx',d=>{try{return projRef([d.lon,d.lat])[0]}catch(e){return -9999}})
  .attr('cy',d=>{try{return projRef([d.lon,d.lat])[1]}catch(e){return -9999}})
  .attr('r',d=>cur.ptSize(d))
  .attr('fill',d=>cur.ptColor(d))
  .style('display',d=>cullGlobe(d)?'none':null);
 dotLayer.raise();
}
function showPointTip(e,d){const tt=$('#tooltip');tt.innerHTML=cur.ptTip(d);const r=$('#map').getBoundingClientRect();tt.style.left=(e.clientX-r.left+14)+'px';tt.style.top=(e.clientY-r.top+14)+'px';tt.style.opacity=1}
function zoomToPoint(id){const ev=P().events.find(e=>e.id===id);if(!ev||!projRef||!svg)return;
 if(globeView){gRot=[-ev.lon,Math.max(-60,Math.min(60,-ev.lat))];globeK=3;fitProjection();}
 else{const p=projRef([ev.lon,ev.lat]);svg.transition().duration(750).call(zoomBeh.transform,d3.zoomIdentity.translate(mapW/2-3.5*p[0],mapH/2-3.5*p[1]).scale(3.5))}
 document.querySelector('#explore').scrollIntoView({behavior:'smooth'})}
function pointSpark(){const byYear=P().byYear;const ys=Object.keys(byYear).map(Number).sort((a,b)=>a-b);const s=ys.map(y=>[y,(byYear[y]||[]).length]);if(s.length<2)return'';const w=260,h=70,x=d3.scaleLinear().domain(d3.extent(s,d=>d[0])).range([4,w-4]),y=d3.scaleLinear().domain([0,d3.max(s,d=>d[1])]).range([h-6,14]);const line=d3.line().x(d=>x(d[0])).y(d=>y(d[1]));return `<svg class="spark" width="${w}" height="${h}"><path d="${line(s)}" fill="none" stroke="#e8590c" stroke-width="2.5"/></svg><div class="kv"><span>${cur.ptCount} / year (first)</span><b>${s[0][1]}</b></div><div class="kv"><span>${cur.ptCount} / year (latest)</span><b>${s[s.length-1][1]}</b></div>`}
/* ---------- timeline visibility ---------- */
function stopPlay(){if(playing){clearInterval(playing);playing=null;$('#playBtn').textContent='▶ Play timeline';$('#playBtn2').textContent='▶';$('#timelineBar').classList.remove('playing')}}
function setTimelineUI(){
 const bar=$('#timelineBar'),na=$('#timelineNA');
 bar.hidden=!hasTimeline; $('#playBtn').style.display=hasTimeline?'':'none';
 na.hidden=hasTimeline;
 if(!hasTimeline){
  $('#timelineNAYear').textContent=cur.type==='curated'?` (${cur.snapshot})`:'';
  $('#timelineNASource').textContent=cur.type==='curated'?`Source: ${cur.source}.`:'This dataset has only one year of data in the record.';
 }
}
/* ---------- dataset loading ---------- */
async function loadDataset(ds){
 stopPlay(); cur=ds;
  $('#mapTitle').textContent=`${ds.icon} ${ds.label}`; $('#mapSub').textContent=ds.desc;
  $('#sourceNote').textContent='Source: '+ds.source;
  $$('.ds-item').forEach(el=>el.classList.toggle('active',el.dataset.id===ds.id));
  if(ds.type==='points'){
   $('#mapLoading').style.display=P().events.length?'none':'flex';
   const ok=await loadPointRecord(ds);
   $('#mapLoading').style.display='none';
   if(!ok){setStatus('⚠️ Could not load the point record for '+ds.id+'. Serve the site over http — file:// blocks local data files.');PT[ds.id]={events:[],byYear:{},meta:{}}}
   const ys=Object.keys(P().byYear).map(Number).sort((a,b)=>a-b);
   hasTimeline=ys.length>1; setTimelineUI();
   const sl=$('#yearSlider'); sl.min=ys[0]??2000; sl.max=ys[ys.length-1]??2000; if(!yearTouched||year>+sl.max||year<+sl.min)year=+sl.max; sl.value=year;
   $('#rangeLabel').textContent=`${sl.min} — ${sl.max}`; $('#yearLabel').textContent=year;
   applyYear();
   if(ok)revalidatePoints(ds);
   return;
  }
   if(ds.type==='curated'){
  hasTimeline=false; setTimelineUI();
  const m=new Map();
  if(ds.map)Object.entries((typeof CURATED_EXTRA!=='undefined'?CURATED_EXTRA[ds.map]:{})||{}).forEach(([k,v])=>m.set(k,+v));
  else Object.entries(CURATED).forEach(([k,a])=>m.set(k,a[ds.idx]));
  cache[ds.id]={'snap':m}; series[ds.id]={}; $('#yearLabel').textContent=ds.snapshot;
  setStatus(`◆ Curated snapshot (${ds.snapshot}) — ${cur.source}`);
  $('#mapLoading').style.display='none'; applyYear(); return;
 }
 $('#mapLoading').style.display=cache[ds.id]?'none':'flex';
 const ok=await loadRecord(ds);
 $('#mapLoading').style.display='none';
 if(!ok){setStatus('⚠️ Could not load the saved record (data/wb/'+ds.id+'.json). Serve the site over http (python3 -m http.server) — file:// blocks local data files.');cache[ds.id]={};series[ds.id]={}}
 const [mn,mx]=deriveRange(ds);
 hasTimeline=Object.keys(cache[ds.id]||{}).length>1; setTimelineUI();
 const sl=$('#yearSlider'); sl.min=mn; sl.max=mx; if(!yearTouched||year>mx||year<mn)year=mx; sl.value=year;
 $('#rangeLabel').textContent=`${mn} — ${mx}`; $('#yearLabel').textContent=year;
 applyYear();
 if(ok)revalidate(ds);
}
function applyYear(){vals=cur.type==='points'?new Map():(cur.type==='wb'?(cache[cur.id]?.[year]||cache[cur.id]?.[String(year)]||new Map()):(cache[cur.id]?.['snap']||new Map()));buildScale();updateMap();renderPoints();renderRankings();renderTable();if(selected&&names[selected])selectCountry(selected,names[selected],true)}
function buildScale(){
 const arr=[...vals.values()].filter(v=>v!=null);
 if(cur.type==='points'){colorScale=()=>NODATA;$('#legend').style.background=cur.ptLegendCSS();const lb=cur.ptLegendLabels();$('#legendLabels').innerHTML=`<span>${lb[0]}</span><span>${lb[1]}</span>`;return}
 if(cur.discrete){const cols=cur.discrete;colorScale=v=>v==null?NODATA:(cols[v]??NODATA);$('#legend').style.background=`linear-gradient(90deg,${Object.values(cols).join(',')})`;$('#legendLabels').innerHTML=cur.discreteLabels;return}
 let min=d3.min(arr),max=d3.max(arr); if(min==null){colorScale=()=>NODATA;return}
 // Compress the scale so the LOWEST country is still clearly visible against
 // the (fixed, pale-blue) ocean — previously pale low values (e.g. Australia
 // on density, Argentina on several indicators) visually vanished.
 colorScale=v=>{
  if(v==null)return NODATA;
  let t;
  if(cur.diverging){const a=Math.max(Math.abs(min),Math.abs(max),1e-9);t=(v+a)/(2*a)}
  else if(cur.log){const lo=Math.log(Math.max(min<=0?d3.min(arr.filter(x=>x>0)):min,1e-9)),hi=Math.log(max);t=hi===lo?.5:(Math.log(Math.max(v,Math.exp(lo)))-lo)/(hi-lo)}
  else t=max===min?.5:(v-min)/(max-min);
  return cur.color(.16+.84*Math.max(0,Math.min(1,t)));
 };
 $('#legend').style.background=`linear-gradient(90deg,${d3.range(0,1.01,.1).map(t=>colorScale(min+(max-min)*t)).join(',')})`;
 $('#legendLabels').innerHTML=`<span>${fmt(min)}</span><span>${fmt(max)}</span>`;
}
const PT_BASE='#ece5d3';
function updateMap(){if(!g)return;if(cur.type==='points'){g.selectAll('.country').attr('fill',PT_BASE).attr('stroke',d=>d.id===selected?'#ffc53d':'#1a1a1a').attr('stroke-width',d=>d.id===selected?2.2:.7);return}g.selectAll('.country').attr('fill',d=>{const v=vals.get(d.id);return v==null?NODATA:colorScale(v)}).attr('stroke',d=>d.id===selected?'#ffc53d':'#1a1a1a').attr('stroke-width',d=>d.id===selected?2.2:.7)}
function sortedVals(){return [...vals.entries()].filter(([,v])=>v!=null).map(([iso,v])=>({iso,name:names[iso]||iso,v})).sort((a,b)=>b.v-a.v)}
function renderRankings(){if(cur.type==='points')return renderPointRankings();$$('.rank-col h4')[0].textContent='🏆 Highest';$$('.rank-col h4')[1].textContent='Lowest (with data)';$$('thead th')[1].textContent='Country';$$('thead th')[3].textContent='Year';const s=sortedVals();$('#topList').innerHTML=s.slice(0,5).map(x=>`<li><b>${x.name}</b> — ${fmt(x.v)}</li>`).join('')||'No data';$('#bottomList').innerHTML=s.slice(-5).reverse().map(x=>`<li><b>${x.name}</b> — ${fmt(x.v)}</li>`).join('');const top=s[0];$('#insight').textContent=top?`${top.name} leads on ${cur.label} (${fmt(top.v)} ${cur.type==='wb'?'in '+year:'in '+cur.snapshot}). ${s.length} countries have data for this view${s.length<100?' — ⚠️ partial coverage for this year; try a different year.':'.'} Hatched grey = no data reported — we never fill gaps with guesses.`:'No data loaded for this year. Try another year — many series (especially literacy) are only measured in survey years.';$('#thMetric').textContent=cur.label+' ('+cur.unit+')'}
function renderPointRankings(){const evs=(P().byYear[year])||[];const val=x=>cur.ptVal(x);
 const big=[...evs].sort((a,b)=>val(b)-val(a)).slice(0,5);
 const small=cur.ptSortBottomDesc?[...evs].filter(x=>cur.ptVal2(x)!=null).sort((a,b)=>cur.ptVal2(b)-cur.ptVal2(a)).slice(0,5):[...evs].sort((a,b)=>val(a)-val(b)).slice(0,5);
 $$('.rank-col h4')[0].textContent=cur.ptTopT();$$('.rank-col h4')[1].textContent=cur.ptBotT();
 $$('thead th')[1].textContent=cur.ptHead()[0];$$('thead th')[3].textContent=cur.ptHead()[2];
 $('#thMetric').textContent=cur.ptHead()[1];
 $('#topList').innerHTML=big.map(x=>`<li><b>${cur.ptValFmt(val(x))}</b> — ${cur.ptPlace(x)}</li>`).join('')||('No '+cur.ptCount+' this year');
 $('#bottomList').innerHTML=small.map(x=>`<li><b>${cur.ptSortBottomDesc?cur.ptVal2Fmt(cur.ptVal2(x)):cur.ptValFmt(val(x))}</b> — ${cur.ptPlace(x)}</li>`).join('')||'—';
 $('#insight').textContent=evs.length?`${evs.length} ${cur.ptCount} in ${year}${big[0]?`, top: ${cur.ptValFmt(val(big[0]))} — ${cur.ptPlace(big[0])}`:''}. ${cur.desc} Click a table row to fly to it.`:`No ${cur.ptCount} recorded this year.`}
function renderTable(){if(cur.type==='points'){const evs=[...((P().byYear[year])||[])].sort((a,b)=>cur.ptVal(b)-cur.ptVal(a));$('#tableBody').innerHTML=evs.map((x,i)=>{const c=cur.ptRow(x);return `<tr data-qid="${x.id}"><td>${i+1}</td><td>${c[0]}</td><td>${c[1]}</td><td>${c[2]}</td></tr>`}).join('')||`<tr><td colspan="4">No ${cur.ptCount} this year.</td></tr>`;$$('#tableBody tr[data-qid]').forEach(tr=>tr.onclick=()=>zoomToPoint(tr.dataset.qid));return}const s=sortedVals();$('#tableBody').innerHTML=s.map((x,i)=>`<tr data-iso="${x.iso}"><td>${i+1}</td><td><b>${x.name}</b> <small>${x.iso}</small></td><td><b>${fmt(x.v)}</b></td><td>${cur.type==='wb'?year:cur.snapshot}</td></tr>`).join('');$$('#tableBody tr').forEach(tr=>tr.onclick=()=>{selectCountry(tr.dataset.iso,names[tr.dataset.iso]);document.querySelector('#explore').scrollIntoView({behavior:'smooth'})})}
function sparkline(iso){const s=(series[cur.id]?.[iso]||[]).sort((a,b)=>a[0]-b[0]);if(s.length<2)return'<p class="hint">Timeline unavailable for this country in this dataset (snapshot / single year only).</p>';const w=260,h=70,x=d3.scaleLinear().domain(d3.extent(s,d=>d[0])).range([4,w-4]),y=d3.scaleLinear().domain(d3.extent(s,d=>d[1])).range([h-6,6]);const line=d3.line().x(d=>x(d[0])).y(d=>y(d[1]));return `<svg class="spark" width="${w}" height="${h}"><path d="${line(s)}" fill="none" stroke="#0e7a5f" stroke-width="2.5"/></svg><div class="kv"><span>${s[0][0]}</span><b>${fmt(s[0][1])}</b></div><div class="kv"><span>${s[s.length-1][0]}</span><b>${fmt(s[s.length-1][1])}</b></div>`}
const RELATED_FACT={medianAge:{idx:0,icon:'👵',label:'Median age',fmt:v=>`${v} yrs`,src:'UN WPP 2024'},peak:{idx:1,icon:'🏔️',label:'Highest peak',fmt:v=>`${d3.format(',')(v)} m`,src:'CIA World Factbook'},lakes:{idx:2,icon:'🏞️',label:'Lakes',fmt:v=>d3.format(',')(v),src:'HydroLAKES v1.0'},mammals:{idx:3,icon:'🦁',label:'Mammal species',fmt:v=>`${v} species`,src:'IUCN Red List'},nuclear:{idx:4,icon:'☢️',label:'Nuclear reactors',fmt:v=>`${v}`,src:'IAEA PRIS 2024'},commonwealth:{idx:5,icon:'👑',label:'Commonwealth',fmt:v=>v?'Yes':'No',src:'Commonwealth Secretariat 2024'},dino:{idx:6,icon:'🦕',label:'Dino localities',fmt:v=>`~${d3.format(',')(v)}`,src:'Paleobiology Database'},coastline:{idx:7,icon:'🌊',label:'Coastline',fmt:v=>`${d3.format(',')(v)} km`,src:'CIA World Factbook'},coffee:{map:'coffee',icon:'☕',label:'Coffee',fmt:v=>`${v} kg / person / yr`,src:'ICO 2023'},tea:{map:'tea',icon:'🍵',label:'Tea',fmt:v=>`${v} kg / person / yr`,src:'FAOSTAT / industry 2022'},beer:{map:'beer',icon:'🍺',label:'Beer',fmt:v=>`${d3.format(',')(v)} L / person / yr`,src:'Kirin Beer University 2023'},wine:{map:'wine',icon:'🍷',label:'Wine',fmt:v=>`${v} L / person / yr`,src:'OIV 2023'},languages:{map:'languages',icon:'🗣️',label:'Living languages',fmt:v=>`${v} languages`,src:'Ethnologue 2024'},temperature:{map:'temperature',icon:'🌡️',label:'Mean temperature',fmt:v=>`${v} °C (1991–2020)`,src:'World Bank CCKP'},birds:{map:'birds',icon:'🐦',label:'Bird species',fmt:v=>`${v} species`,src:'IUCN / BirdLife'},amphibians:{map:'amphibians',icon:'🐸',label:'Amphibian species',fmt:v=>`${v} species`,src:'IUCN Red List'},reptiles:{map:'reptiles',icon:'🦎',label:'Reptile species',fmt:v=>`${v} species`,src:'IUCN Red List'},volcanoes:{map:'volcanoes',icon:'🌋',label:'Active volcanoes',fmt:v=>`${v} Holocene`,src:'Smithsonian GVP'},timezones:{map:'timezones',icon:'⏰',label:'Time zones',fmt:v=>`${v} zones`,src:'IANA tz database'},driving:{map:'driving',icon:'🚗',label:'Driving side',fmt:v=>v?'⬅ Left-hand':'Right-hand ➡',src:'WorldStandards'},landlocked:{map:'landlocked',icon:'🔒',label:'Status',fmt:v=>['Coastline','Landlocked','Doubly landlocked'][v],src:'UN-OHRLLS'},nobel:{map:'nobel',icon:'🏅',label:'Nobel laureates',fmt:v=>`${v}`,src:'nobelprize.org'},olympics:{map:'olympics',icon:'🥇',label:'Olympic medals',fmt:v=>d3.format(',')(v),src:'Olympedia'},olympicsPC:{map:'olympicsPC',icon:'🥇',label:'Medals per million',fmt:v=>`${v} / M`,src:'Olympedia + UN pop'},unesco:{map:'unesco',icon:'🏛️',label:'Heritage sites',fmt:v=>`${v}`,src:'UNESCO WHC'},democracy:{map:'democracy',icon:'🗳️',label:'Status',fmt:v=>['Free','Partly free','Not free'][v],src:'Freedom House 2024'},legal:{map:'legal',icon:'⚖️',label:'Legal system',fmt:v=>['Civil law','Common law','Mixed','Religious / customary'][v],src:'JuriGlobe'},plugs:{map:'plugs',icon:'🔌',label:'Plug type',fmt:v=>['A / B','C / E / F','G','D / M','I','Other'][v],src:'WorldStandards'},metric:{map:'metric',icon:'📏',label:'System',fmt:v=>v?'Metric':'Non-metric',src:'WorldStandards'},eu:{map:'eu',icon:'🇪🇺',label:'EU',fmt:v=>v?'✅ Member':'—',src:'European Union'},nato:{map:'nato',icon:'🛡️',label:'NATO',fmt:v=>v?'✅ Member':'—',src:'NATO'},brics:{map:'brics',icon:'🧱',label:'BRICS',fmt:v=>v===2?'🤝 Partner':v?'✅ Full member':'—',src:'BRICS'},opec:{map:'opec',icon:'🛢️',label:'OPEC',fmt:v=>v?'✅ Member':'—',src:'OPEC'},g20:{map:'g20',icon:'🤝',label:'G20',fmt:v=>v?'✅ Member':'—',src:'G20'},langfam:{map:'langfam',icon:'💬',label:'Language family',fmt:v=>['Indo-European','Afro-Asiatic','Niger-Congo','Nilo-Saharan','Sino-Tibetan','Austronesian','Austroasiatic','Kra-Dai','Turkic','Uralic','Japonic','Koreanic','Mongolic','Trans–New Guinea','Eskimo-Aleut','Other'][v],src:'Ethnologue'},gov:{map:'gov',icon:'🏛️',label:'Government',fmt:v=>['Republic','Monarchy','One-party','Theocracy'][v],src:'CIA Factbook'},coffeeProd:{map:'coffeeProd',icon:'🌱',label:'Coffee grown',fmt:v=>d3.format(',')(v)+' t / yr',src:'FAOSTAT'},choco:{map:'choco',icon:'🍫',label:'Chocolate',fmt:v=>`${v} kg / person / yr`,src:'Industry reports'}};
function pointPanel(name,iso){const evs=(P().byYear[year])||[];const big=[...evs].sort((a,b)=>cur.ptVal(b)-cur.ptVal(a))[0];$('#detailBody').innerHTML=`<div class="panel-h">YEAR IN ${cur.ptCount.toUpperCase()}</div><h3>${year} • ${evs.length} ${cur.ptCount}</h3><p class="hint">${cur.label} • selected: ${name||iso}</p><div class="big">${big?cur.ptPanelBig(big):'—'}</div><p>${cur.ptBig}${big?' — '+cur.ptPlace(big):''}</p>${pointSpark()}<p class="hint">${cur.desc} Source: ${cur.source} — see Sources.</p>`}
function selectCountry(iso,name,keep){if(cur.type==='points'){selected=iso;updateMap();return pointPanel(name||iso,iso)}selected=iso;updateMap();const v=vals.get(iso),s=sortedVals(),rank=s.findIndex(x=>x.iso===iso)+1,rel=RELATED_FACT[cur.id];const relVal=rel?(rel.map?((typeof CURATED_EXTRA!=='undefined'?CURATED_EXTRA[rel.map]:{})||{})[iso]:(CURATED[iso]||[])[rel.idx]):null;const relHtml=(rel&&relVal!=null)?`<div class="panel-h" style="margin-top:14px">RELATED FACT</div><div class="kv"><span>${rel.icon} ${rel.label}</span><b>${rel.fmt(relVal)}</b></div><p class="hint">Source: ${rel.src} — see Sources.</p>`:'';$('#detailBody').innerHTML=`<div class="panel-h">COUNTRY SPOTLIGHT</div><h3>${name||iso}</h3><p class="hint">${iso} • ${cur.type==='wb'?year:'Snapshot '+cur.snapshot}</p><div class="big">${fmt(v)}</div><p>${cur.label} ${rank?`• Rank #${rank} of ${s.length}`:''}</p>${sparkline(iso)}${relHtml}`}
// UI build
const cats=['All','People','Economy','Society','Planet','Curiosities'];$('#catPills').innerHTML=cats.map((c,i)=>`<button class="pill ${i==0?'active':''}" data-cat="${c}">${c}</button>`).join('');
let curCat='All';
function renderDatasetList(cat=curCat,q=($('#dsSearch')?.value||'').trim().toLowerCase()){const list=DATASETS.filter(d=>(cat==='All'||d.cat===cat)&&(!q||(d.label+' '+d.desc).toLowerCase().includes(q)));$('#datasetList').innerHTML=list.map(d=>`<button class="ds-item ${d.id===cur.id?'active':''}" data-id="${d.id}"><span class="ic">${d.icon}</span><span><b>${d.label} <span class="badge ${d.type==='curated'?'cur':''}">${d.type==='wb'?'● Live':d.type==='points'?'● Dots':'◆ Snap'}</span></b><small>${d.desc}</small></span></button>`).join('')||'<p class="hint">No datasets match — clear the filter.</p>';$('#dsCount').textContent=`• ${list.length} of ${DATASETS.length}`;$$('.ds-item').forEach(el=>el.onclick=()=>loadDataset(DATASETS.find(d=>d.id===el.dataset.id)))}
$$('#catPills .pill').forEach(p=>p.onclick=()=>{$$('#catPills .pill').forEach(x=>x.classList.remove('active'));p.classList.add('active');curCat=p.dataset.cat;renderDatasetList()});
$('#dsSearch').addEventListener('input',()=>renderDatasetList());
$('#search').addEventListener('change',e=>{const q=e.target.value.toLowerCase();const f=geo?.features.find(f=>f.properties.name.toLowerCase().includes(q));if(f)selectCountry(f.id,f.properties.name)});
$('#yearSlider').addEventListener('input',e=>{stopPlay();yearTouched=true;year=+e.target.value;$('#yearLabel').textContent=year;applyYear()});
function togglePlay(){if(playing){stopPlay();return}if(!hasTimeline)return;const sl=$('#yearSlider');if(+sl.value>=+sl.max)sl.value=sl.min;year=+sl.value;$('#yearLabel').textContent=year;applyYear();$('#playBtn').textContent='⏸ Pause';$('#playBtn2').textContent='⏸';$('#timelineBar').classList.add('playing');playing=setInterval(()=>{const s2=$('#yearSlider');year++;if(year>=+s2.max){year=+s2.max;s2.value=year;$('#yearLabel').textContent=year;applyYear();stopPlay();return}s2.value=year;$('#yearLabel').textContent=year;applyYear()},700)}
$('#playBtn').onclick=togglePlay;$('#playBtn2').onclick=togglePlay;
$('#latestBtn').onclick=()=>{stopPlay();const sl=$('#yearSlider');year=+sl.max;sl.value=year;$('#yearLabel').textContent=year;applyYear()};
$('#globeBtn').onclick=()=>setGlobe(!globeView);
// init
$('#detailBody').innerHTML=`<div class="panel-h">COUNTRY SPOTLIGHT</div><h3>Click any country</h3><p style="line-height:1.6;color:#5a6d66">You’ll see its value, world rank and trend over time for the selected dataset.</p><p class="hint">Try: 🇮🇳 India • 🇦🇷 Argentina • 🇦🇺 Australia • 🇯🇵 Japan • 🇨🇦 Canada</p>`;
renderDatasetList();
(async()=>{await loadGeo();await loadDataset(DATASETS[0]);selectCountry('IND','India')})();
