// Comprehensive Educational Content for ALL California Counties
// Based on systematic research with verified data from official sources

export interface CountyEducation {
  countyId: string;
  historicalContext: string;
  economicImportance: string;
  uniqueFeatures: string;
  culturalHeritage: string;
  geographicalSignificance: string;
  specificData: {
    established?: string;
    indigenousHistory?: string;
    nationalParks?: string[];
    majorAttractions?: string[];
    industries?: string[];
    climate?: string;
    elevation?: string;
    notablePeople?: string[];
    historicalEvents?: string[];
  };
}

export const countyEducationData: CountyEducation[] = [
  // ==================== SOUTHERN CALIFORNIA REGION ====================
  {
    countyId: 'los_angeles',
    historicalContext: 'Los Angeles County is one of the original counties of California, created at the time of statehood in 1850. The county originally included parts of what are now Kern, San Bernardino, Riverside, Inyo, Tulare, Ventura, and Orange counties. In the 1850s there were less than 2,000 people in the town, and 8,329 in Los Angeles County overall, the majority of whom spoke Spanish, and half of whom were Native American. Los Angeles was incorporated as a municipality on April 4, 1850, five months before California achieved statehood.',
    economicImportance: 'In 2018, the Los Angeles metropolitan area had a gross metropolitan product of over $1.0 trillion, making it the city with the third-largest GDP in the world, after New York and Tokyo. In 2019, the median household income in the county was $72,797. Los Angeles County has the highest number of millionaires of any county in the nation, totaling 261,081 households as of 2007. The county is globally known as the home of the U.S. motion picture industry since the latter\'s inception in the early 20th century.',
    uniqueFeatures: 'Los Angeles County is the most populous county in the United States, with 9,663,345 residents estimated in 2023. Its population is greater than that of 40 individual U.S. states. Comprising 88 incorporated cities and 101 unincorporated areas within a total area of 4,083 square miles (10,570 km²), it accommodates more than a quarter of Californians and is one of the most ethnically diverse U.S. counties. The county is divided west-to-east by the San Gabriel Mountains, which are part of the Transverse Ranges of southern California.',
    culturalHeritage: 'The county has a large population of Asian Americans, being home to the largest numbers of Burmese, Cambodian, Chinese, Filipino, Indonesian, Korean, Sri Lankan, Taiwanese, and Thai outside their respective countries. Los Angeles County is home to the largest Armenian population outside of Armenia. It also accommodates the largest Iranian population outside of Iran of any other county or county equivalent globally. Los Angeles hosted the Summer Olympics in 1932 and 1984, and will also host in 2028.',
    geographicalSignificance: 'Most of the county\'s highest peaks are in the San Gabriel Mountains, including Mount San Antonio 10,068 feet (3,069 m) at the Los Angeles–San Bernardino county lines, Mount Baden-Powell 9,399 feet (2,865 m), Mount Burnham 8,997 feet (2,742 m) and Mount Wilson 5,710 feet (1,740 m). The county\'s seat, Los Angeles, is the second most populous city in the United States, with 3,820,914 residents estimated in 2023.',
    specificData: {
      established: 'February 18, 1850 (one of California\'s original counties)',
      indigenousHistory: 'Originally inhabited by Native American peoples including Tongva and Chumash',
      nationalParks: ['Angeles National Forest (partial)', 'Santa Monica Mountains National Recreation Area'],
      majorAttractions: ['Hollywood', 'Universal Studios', 'Getty Center', 'Griffith Observatory', 'Santa Monica Pier', 'Venice Beach', 'LACMA'],
      industries: ['Motion Picture Industry', 'Entertainment', 'Technology', 'Aerospace', 'Tourism', 'International Trade', 'Healthcare'],
      climate: 'Mediterranean climate with warm, dry summers',
      elevation: 'Sea level to 10,068 feet (Mount San Antonio)',
      notablePeople: ['Numerous film and entertainment industry figures'],
      historicalEvents: ['1850 County formation', '1890s Oil discovery brought rapid growth', '1913 LA Aqueduct completion', '1932 Summer Olympics', '1984 Summer Olympics']
    }
  },
  {
    countyId: 'san_diego',
    historicalContext: 'San Diego has been referred to as the "Birthplace of California," as it was the first site visited and settled by Europeans on what is now the West Coast of the United States. The Kumeyaay, Yuman-speaking people of Hokan stock, have lived in this region for more than 10,000 years. In May 1769, Portolà established the Presidio of San Diego on a hill near the San Diego River above the Kumeyaay village of Cosoy. Mission San Diego de Alcalá was founded on July 16, 1769, by Spanish friar Junípero Serra. In 1821, Mexico won its independence from Spain, and San Diego became part of the Mexican territory of Alta California. San Diego officially became part of the U.S. in 1848, and the town was named the seat of San Diego County when California was granted statehood in 1850.',
    economicImportance: 'San Diego County\'s economy exceeds $250 billion in GDP, driven by military defense, tourism, international trade, and biotechnology. The military contributes over $28 billion annually, with major installations including Naval Base San Diego, Marine Corps Base Camp Pendleton, and Naval Air Station North Island. The biotech industry, anchored by over 1,200 companies, generates $41 billion in economic activity. Tourism attracts 35 million visitors annually, contributing $11.6 billion.',
    uniqueFeatures: 'San Diego County covers 4,526 square miles, making it larger than Connecticut and Rhode Island combined. It features 70 miles of pristine coastline and the most temperate climate in the continental United States. The county contains the busiest international border crossing in the Western Hemisphere at San Ysidro. Balboa Park, at 1,200 acres, is one of the largest urban cultural parks in North America, housing 17 museums and the world-famous San Diego Zoo.',
    culturalHeritage: 'San Diego County\'s proximity to Mexico creates a unique bicultural environment where Mexican and American influences blend seamlessly. The region preserves its Spanish colonial heritage through Mission San Diego, Old Town San Diego State Historic Park, and numerous adobe structures. The county is home to 18 Native American reservations, more than any other county in the United States. The annual Comic-Con International has become a global cultural phenomenon, attracting over 130,000 attendees.',
    geographicalSignificance: 'San Diego County encompasses remarkable geographic diversity, from Pacific beaches through coastal mesas, inland valleys, and mountains to the Colorado Desert. The Peninsular Ranges, including the Laguna, Cuyamaca, and Volcan Mountains, create distinct climate zones. The county sits at the intersection of two major floristic provinces, supporting exceptional biodiversity with over 1,500 native plant species.',
    specificData: {
      established: 'February 18, 1850',
      indigenousHistory: 'Kumeyaay (Diegueño), Luiseño, Cahuilla, and Cupeño peoples',
      nationalParks: ['Cabrillo National Monument'],
      majorAttractions: ['San Diego Zoo', 'SeaWorld', 'Balboa Park', 'USS Midway Museum', 'La Jolla Cove', 'Coronado Beach', 'LEGOLAND California'],
      industries: ['Military Defense', 'Tourism', 'Biotechnology', 'Healthcare', 'Telecommunications', 'Agriculture'],
      climate: 'Mediterranean climate, average 70°F, 10 inches rainfall annually',
      elevation: 'Sea level to 6,533 feet (Hot Springs Mountain)',
      notablePeople: ['Ted Williams', 'Gregory Peck', 'Jonas Salk', 'Theodore Geisel (Dr. Seuss)', 'Tony Hawk', 'Cameron Diaz'],
      historicalEvents: ['1542 Cabrillo landing', '1769 Mission founding', '1846 Battle of San Pasqual', '1915 Panama-California Exposition']
    }
  },
  {
    countyId: 'orange',
    historicalContext: 'In 1889, Orange County officially separated from Los Angeles County, with Santa Ana as its seat. The California legislature divided Los Angeles County and created Orange County as a separate political entity on March 11, 1889. The county is said to have been named for the citrus fruit in an attempt to promote immigration by suggesting a semi-tropical paradise. Anaheim was founded by fifty German families in 1857 and incorporated as the second city in Los Angeles County on March 18, 1876. Disney acquired 160 acres of orange groves and walnut trees in Anaheim, and Disneyland opened in 1955 in a former orange grove, transforming the region from agricultural land to a major tourist destination.',
    economicImportance: 'As Disneyland Resort marks its 70th anniversary, the total economic impact of its two Anaheim theme parks, hotels and retail district is $16.1 billion on the Southern California region. Disneyland Resort is the largest employer in Orange County with 36,000 cast members. Disneyland is Anaheim\'s largest taxpayer, paying over $125 million in taxes to Anaheim and its schools annually. The resort generates $279 million in tax revenue for the City of Anaheim, including $194 million paid directly by Disneyland Resort. Tourism remains a vital aspect of Orange County\'s economy, with Disneyland being the second most visited theme park in the world with 17.25 million visitors in 2023.',
    uniqueFeatures: 'Orange County encompasses 948 square miles with 42 miles of coastline featuring world-renowned beaches. Despite being the smallest county in Southern California, it\'s the third most populous in California. The county contains 34 incorporated cities, each maintaining distinct character from beach communities to master-planned cities like Irvine. South Coast Plaza in Costa Mesa is the highest-grossing shopping center in the United States with $2 billion in annual sales.',
    culturalHeritage: 'Orange County represents a fascinating cultural evolution from conservative bastion to diverse, multicultural region. Little Saigon in Westminster is the largest Vietnamese community outside Vietnam. The county preserves its Mexican heritage through historic sites like Mission San Juan Capistrano and Los Rios Historic District. Surf culture originated here at Huntington Beach, "Surf City USA."',
    geographicalSignificance: 'Orange County features diverse geography from Pacific beaches through coastal plains to the Santa Ana Mountains (Saddleback) reaching 5,689 feet. The Santa Ana River, Southern California\'s largest river system, flows through the county. The Mediterranean climate and coastal influence create ideal conditions for year-round outdoor activities.',
    specificData: {
      established: 'March 11, 1889',
      indigenousHistory: 'Tongva (Gabrieleño) and Acjachemen (Juaneño) peoples',
      nationalParks: [],
      majorAttractions: ['Disneyland Resort', 'Knott\'s Berry Farm', 'Huntington Beach', 'Newport Beach', 'Mission San Juan Capistrano', 'Crystal Cove State Park'],
      industries: ['Tourism', 'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Fashion/Retail'],
      climate: 'Mediterranean climate, average 70°F, 13 inches rainfall annually',
      elevation: 'Sea level to 5,689 feet (Santiago Peak)',
      notablePeople: ['Richard Nixon', 'John Wayne', 'Steve Jobs (lived)', 'Gwen Stefani', 'Tiger Woods', 'Michelle Pfeiffer'],
      historicalEvents: ['1776 Mission founding', '1889 County formation', '1955 Disneyland opening', '1994 Orange County bankruptcy']
    }
  },
  {
    countyId: 'riverside',
    historicalContext: 'Riverside County was established on May 3, 1893, carved from San Bernardino and San Diego counties. The area was inhabited by diverse indigenous peoples including the Serrano, Payómkawichum, Mohave, Cupeno, Chemehuevi, Cahuilla, and Tongva for thousands of years. Spanish explorer Juan Bautista De Anza reached the area in 1774. The county became the birthplace of California\'s citrus industry when Eliza Tibbets received two Brazilian navel orange trees in 1873.',
    economicImportance: 'Riverside County has a GDP of approximately $126.3 billion (2023), ranking in the top 1.5% of all US counties. With a population of 2.45 million and labor force of 1.16 million, it\'s the 4th most populous county in California. Major industries include Real Estate ($18.7B), Retail Trade ($9B), Healthcare ($8.4B), Manufacturing ($8.3B), and Wholesale Trade ($7.2B). Transportation and warehousing employ 15.3% of workers, making it a crucial logistics hub.',
    uniqueFeatures: 'Covering 7,208 square miles, Riverside County spans from Mediterranean-climate chaparral in the west to desert and mountains in the east, making it California\'s 4th largest county. Most of Joshua Tree National Park lies within its borders. The county houses the Mission Inn (nation\'s largest Mission Revival building), University of California Riverside, and Riverside National Cemetery.',
    culturalHeritage: 'The county celebrates a rich multicultural heritage with 45.5% Hispanic/Latino residents and significant diversity. Notable cultural sites include the Mission Inn, California Citrus State Historic Park, and over 100 City Landmarks. The county hosts 20+ festivals annually and maintains strong connections to its citrus industry heritage and indigenous Cahuilla, Serrano, and other tribal cultures.',
    geographicalSignificance: 'Elevation ranges from 235 feet below sea level at the Salton Sea to mountain peaks over 10,000 feet. The county features Mediterranean climate in western regions and desert climate in eastern areas. The diverse geography includes the Santa Ana River, Mount Rubidoux, San Bernardino Mountains foothills, and Coachella Valley.',
    specificData: {
      established: 'May 3, 1893',
      indigenousHistory: 'Serrano, Payómkawichum, Mohave, Cupeno, Chemehuevi, Cahuilla, and Tongva peoples',
      nationalParks: ['Joshua Tree National Park (majority)', 'Santa Rosa and San Jacinto Mountains National Monument'],
      majorAttractions: ['Mission Inn', 'Temecula Wine Country', 'California Citrus State Historic Park', 'Riverside National Cemetery', 'UC Riverside'],
      industries: ['Logistics and Transportation', 'Healthcare', 'Real Estate', 'Manufacturing', 'Aerospace', 'Clean Energy', 'Agriculture', 'Tourism'],
      climate: 'Mediterranean to desert; semi-arid with hot summers and mild winters',
      elevation: '235 feet below sea level to 10,000+ feet'
    }
  },
  {
    countyId: 'san_bernardino',
    historicalContext: 'San Bernardino County was created on April 26, 1853, from parts of Los Angeles County, making it one of California\'s original counties. Indigenous peoples including the Serrano (Yuhaaviatam), Cahuilla, Chemehuevi, Mojave, and Maricopa inhabited the region for thousands of years, with Pinto Culture peoples dating back to 8000-4000 BCE. Mormon colonists established the town of San Bernardino in 1851, purchasing Rancho San Bernardino.',
    economicImportance: 'San Bernardino County generates over $123 billion in GDP annually, showing 43.3% growth since 2018. Major economic sectors include Healthcare ($12B), Manufacturing ($9.6B), Technology ($3.9B), Entertainment ($1.2B), and Logistics ($1.2B). The county produces 965,700 jobs with logistics accounting for one in five jobs. The county sits strategically in the center of a four-city region with 30 million people and $1.8 trillion GDP.',
    uniqueFeatures: 'At 20,105 square miles, San Bernardino County is the largest county in California and the contiguous United States - larger than nine US states and about the size of Costa Rica. The county encompasses the entire Mojave Desert region, San Bernardino Mountains (including San Gorgonio Mountain at 11,490 feet - Southern California\'s highest peak), and San Bernardino National Forest.',
    culturalHeritage: 'The county\'s diverse population of 2.18 million includes 39.2% Hispanic/Latino residents, with significant cultural heritage from Native American, Mexican, and mining eras. Cultural sites include Calico Ghost Town which produced 70% of California\'s silver in 1884. The county celebrates Route 66 heritage with annual festivals.',
    geographicalSignificance: 'Elevations range from below sea level in desert areas to 11,490 feet at San Gorgonio Mountain. The county spans multiple climate zones from hot desert (BWh) in the Mojave to subalpine conditions in the mountains. Geographic features include the Mojave National Preserve, Colorado River boundary, and San Andreas Fault.',
    specificData: {
      established: 'April 26, 1853',
      indigenousHistory: 'Serrano (Yuhaaviatam/Taaqtam), Cahuilla, Chemehuevi, Mojave peoples; Pinto Culture 8000-4000 BCE',
      nationalParks: ['Mojave National Preserve', 'San Bernardino National Forest', 'Death Valley National Park (partial)'],
      majorAttractions: ['San Gorgonio Mountain', 'Calico Ghost Town', 'Route 66 landmarks', 'Big Bear Lake', 'Lake Arrowhead', 'Cajon Pass'],
      industries: ['Logistics and Transportation', 'Healthcare', 'Manufacturing', 'Technology', 'Entertainment', 'Mining', 'Tourism', 'Military/Defense'],
      climate: 'Hot desert to subalpine; extreme temperature variations by elevation',
      elevation: 'Below sea level to 11,490 feet (San Gorgonio Mountain)'
    }
  },
  {
    countyId: 'ventura',
    historicalContext: 'Ventura County was officially formed on January 1, 1873, separating from Santa Barbara County with 3,500 initial residents. The Chumash people inhabited the region for 10,000-12,000 years, establishing sophisticated maritime cultures. Spanish colonization began in 1769 with the Portolá expedition, and Mission San Buenaventura was founded in 1782 by Junípero Serra. The discovery of oil in the 1860s transformed the region into a major economic center.',
    economicImportance: 'Ventura County\'s economy totaled $51.4 billion in 2017. Key economic strengths include advanced agriculture with precision farming technology, aerospace and defense manufacturing (companies like Haas Automation, Teledyne, Pentair), healthcare, and tourism contributing $1.8 billion annually. Major employers span agriculture, manufacturing, healthcare, retail trade, and hospitality.',
    uniqueFeatures: 'Ventura County covers diverse terrain from coastal plains to mountains reaching 8,831 feet (Mount Pinos). The county serves as gateway to Channel Islands National Park with headquarters in Ventura city. Unique features include Anacapa Island, advanced agricultural operations, and proximity to both Los Angeles metropolitan area and Central Coast.',
    culturalHeritage: 'The county maintains strong connections to Chumash heritage with numerous archaeological sites and place names (Ojai, Simi Valley, Malibu). Cultural sites include Mission San Buenaventura, Chumash cave paintings, and maritime heritage from the Channel Islands. The region celebrates agricultural traditions, particularly in Oxnard\'s strawberry fields.',
    geographicalSignificance: 'Elevations range from sea level to 8,831 feet at Mount Pinos, creating diverse climate zones. Coastal areas average 60°F annually with Mediterranean climate, while mountains experience subalpine conditions. The 43-mile coastline features diverse beaches and Channel Islands access. Geographic significance includes Los Padres National Forest and Transverse Ranges.',
    specificData: {
      established: 'January 1, 1873',
      indigenousHistory: 'Chumash people for 10,000-12,000 years; sophisticated maritime culture',
      nationalParks: ['Channel Islands National Park (gateway)', 'Los Padres National Forest'],
      majorAttractions: ['Channel Islands National Park', 'Mission San Buenaventura', 'Chumash Indian Museum', 'Ventura Pier', 'Mount Pinos', 'Ojai Valley'],
      industries: ['Advanced Agriculture', 'Aerospace and Defense', 'Manufacturing', 'Tourism', 'Healthcare', 'Oil Production', 'Technology'],
      climate: 'Mediterranean coastal to alpine mountain; mild winters, dry summers',
      elevation: 'Sea level to 8,831 feet (Mount Pinos)'
    }
  },
  {
    countyId: 'imperial',
    historicalContext: 'Imperial County was created in 1907 from the eastern portion of San Diego County, making it California\'s newest county. Indigenous peoples including the Quechan along the Colorado River and Kumeyaay in western areas inhabited the region for over 9,000 years. The county was named for Imperial Valley, itself named after the Imperial Land Company that claimed the Colorado Desert for agriculture at the turn of the 20th century.',
    economicImportance: 'Imperial County\'s economy centers on agriculture valued at over $2.6 billion annually, providing 48% of county employment and earning recognition as "America\'s winter produce basket," supplying 2/3 of US winter vegetables. The county is the #1 California producer of alfalfa, sudan, sugar beets, and sweet corn. Renewable energy, particularly geothermal, generates 550+ megawatts. The emerging "Lithium Valley" contains 17+ million metric tons of lithium reserves.',
    uniqueFeatures: 'Imperial County is unique for being almost entirely below sea level (235 feet below at Salton Sea), experiencing some of America\'s highest temperatures (116-120°F annually), and transforming Colorado Desert into productive farmland through Colorado River irrigation. The Salton Sea is California\'s largest lake, and the Algodones Dunes represent one of America\'s largest dune fields.',
    culturalHeritage: 'Imperial County has 85% Hispanic population - the highest proportion in California - with strong Mexican cultural influences and bicultural identity shared with Mexicali, Mexico. The region maintains indigenous heritage from Quechan, Kumeyaay, and Cahuilla peoples spanning 9,000+ years. The county celebrates agricultural worker heritage and Mexican-American traditions.',
    geographicalSignificance: 'Imperial County occupies a unique geographic position almost entirely below sea level in the Colorado Desert extension of the Sonoran Desert. The Salton Sea sits 235 feet below sea level, while desert areas experience extreme temperatures. The county borders Mexico and Arizona, containing the Colorado River boundary.',
    specificData: {
      established: '1907',
      indigenousHistory: 'Quechan (Colorado River), Kumeyaay (9,000+ years), Cahuilla peoples',
      nationalParks: ['Sonny Bono Salton Sea National Wildlife Refuge'],
      majorAttractions: ['Salton Sea', 'Algodones Dunes', 'All-American Canal', 'Fort Yuma', 'Slab City'],
      industries: ['Agriculture', 'Geothermal Energy', 'Lithium Extraction', 'Border Trade', 'Renewable Energy', 'Food Processing'],
      climate: 'Hot desert (BWh); extreme temperatures; 3 inches annual rainfall',
      elevation: '235 feet below sea level (Salton Sea) to desert mountains'
    }
  },

  // ==================== BAY AREA REGION ====================
  {
    countyId: 'san_francisco',
    historicalContext: 'San Francisco County was one of the state\'s 18 original counties established at California statehood in 1850. In 1856, San Francisco became a consolidated city-county when the California state government divided the county - everything north of a line drawn across the tip of the San Francisco Peninsula became the new consolidated City and County of San Francisco. On June 29, 1776, settlers from New Spain established the Presidio of San Francisco at the Golden Gate and Mission San Francisco de Asís. The California Gold Rush starting in 1849 brought rapid growth.',
    economicImportance: 'San Francisco County generates over $500 billion in GDP, ranking among the world\'s top 20 economies. The technology sector, with companies like Salesforce, Twitter, Uber, and Airbnb, drives economic growth. Financial services, anchored by Wells Fargo and Charles Schwab, manage trillions in assets. Tourism attracts 25 million visitors annually, generating $10 billion.',
    uniqueFeatures: 'San Francisco is the only consolidated city-county in California, encompassing an area of about 47 square miles. With about 47.9 square miles in area, San Francisco is the smallest county in the state. During the 1929 stock market crash and subsequent economic depression, not a single San Francisco-based bank failed. Known for its iconic landmarks like the Golden Gate Bridge, Alcatraz Island, and its historic cable cars.',
    culturalHeritage: 'San Francisco stands as a beacon of cultural diversity and progressive values, with 34% foreign-born residents speaking over 100 languages. Chinatown, established in 1848, is the oldest and largest outside Asia. The Castro District serves as the symbolic heart of LGBTQ+ culture globally. The city birthed the Beat Generation in the 1950s and hippie counterculture in the 1960s.',
    geographicalSignificance: 'San Francisco occupies the tip of a peninsula between San Francisco Bay and the Pacific Ocean, connected to Marin County by the Golden Gate Bridge and to the East Bay via the Bay Bridge. The city sits along the San Andreas and Hayward faults, making it seismically active. Its Mediterranean climate with cool, foggy summers results from cold California Current meeting warm inland air.',
    specificData: {
      established: 'February 18, 1850',
      indigenousHistory: 'Ramaytush Ohlone peoples',
      nationalParks: ['Golden Gate National Recreation Area', 'San Francisco Maritime National Historical Park'],
      majorAttractions: ['Golden Gate Bridge', 'Alcatraz Island', 'Fisherman\'s Wharf', 'Golden Gate Park', 'Cable Cars', 'Chinatown'],
      industries: ['Technology', 'Finance', 'Tourism', 'Healthcare', 'Professional Services', 'Biotechnology'],
      climate: 'Mediterranean climate, average 60°F, 23 inches rainfall annually',
      elevation: 'Sea level to 925 feet (Mount Davidson)',
      notablePeople: ['Dianne Feinstein', 'Nancy Pelosi', 'Jerry Brown', 'Maya Angelou', 'Bruce Lee', 'Steve Jobs'],
      historicalEvents: ['1849 Gold Rush', '1906 Earthquake', '1915 Panama-Pacific Exposition', '1945 UN Charter signing', '1967 Summer of Love', '1989 Loma Prieta earthquake']
    }
  },


  // ==================== SIERRA NEVADA REGION ====================
  {
    countyId: 'alpine',
    historicalContext: 'Alpine County was created March 16, 1864, from parts of 5 counties during the silver mining boom. At its peak in 1864, the county had 11,000 residents drawn by silver mines, but declined to 685 by 1870 when the mines failed. Today it is California\'s least populous county with 1,204 residents (2020 census), having recovered from a low of 484 in 1970.',
    economicImportance: 'Alpine County\'s economy is entirely tourism-based since the late 1960s, built around recreation at Bear Valley and Kirkwood ski resorts. With 96% federally owned land, the county has no traditional industries. The historic Silver Mountain (Köngsberg) was the original county seat until 1875, when mining ceased and the economy shifted to tourism.',
    uniqueFeatures: 'Alpine County is one of only three California counties with no incorporated cities. At elevations from 4,800 to 11,429 feet (Sonora Peak), it resembles the Swiss Alps. The county hosts the annual Death Ride, a 129-mile bicycle challenge over five mountain passes that attracts cyclists worldwide.',
    culturalHeritage: 'The county seat Markleeville (pop. 191) was established in 1861 by Jacob Markley and maintains its pioneer character. The region celebrates Scandinavian and German mining heritage from the 1860s silver boom. Alpine County serves as a gateway to Sierra Nevada wilderness areas with strong outdoor recreation culture.',
    geographicalSignificance: 'Located on the Nevada state border in the eastern Sierra Nevada, Alpine County features extreme elevation variations creating alpine tundra conditions. Major trailheads provide access to the Pacific Crest Trail and wilderness areas. The county represents the high-elevation transition zone between California and the Great Basin.',
    specificData: {
      established: 'March 16, 1864',
      indigenousHistory: 'Washoe and Paiute peoples used high mountain valleys seasonally',
      nationalParks: ['Humboldt-Toiyabe National Forest'],
      majorAttractions: ['Markleeville', 'Bear Valley ski resort', 'Kirkwood ski resort', 'Death Ride bicycle event', 'Pacific Crest Trail'],
      industries: ['Tourism', 'Recreation', 'Outdoor sports'],
      climate: 'Alpine tundra with extreme temperature variations',
      elevation: '4,800 to 11,429 feet (Sonora Peak)',
      notablePeople: ['Jacob Markley (founder)'],
      historicalEvents: ['1864 Silver boom and county formation', '1875 Mining collapse', '1970 Population nadir', '1980s Tourism recovery']
    }
  },
  {
    countyId: 'amador',
    historicalContext: 'Amador County was part of the Southern Mines region during the California Gold Rush, producing 25 million ounces of gold. Historic towns like Jackson, Sutter Creek, and Plymouth feature preserved 1850s architecture. The Argonaut Mine was one of the deepest hardrock mines in North America, representing the transition from placer to industrial mining.',
    economicImportance: 'The Sierra Foothills AVA wine industry drives modern Amador County economics, with award-winning Zinfandel and Rhône varietals. Grape vines increased dramatically from 24,000 to 77,500 between 1856-1858. Tourism along Historic Highway 49 brings visitors to authentic Gold Rush towns and over 40 wineries.',
    uniqueFeatures: 'Amador County preserves intact 19th-century downtown districts with balconied buildings and historic storefronts. The region had 100+ wineries operating by 1890, experiencing revival since the 1970s. Unlike other mining areas, Amador featured deep shaft mines rather than placer mining operations.',
    culturalHeritage: 'Miwok people inhabited the region for thousands of years before European arrival. Strong Italian-American winemaking traditions continue today. Pioneer architecture throughout the county creates an authentic Old West atmosphere that attracts heritage tourists.',
    geographicalSignificance: 'Located in the Sierra Nevada foothills, Amador County represents the transition zone between the Central Valley and high mountains. The Mother Lode gold belt contains significant portions of the historic gold belt. The Mokelumne River system provides hydroelectric power and water resources.',
    specificData: {
      established: '1854',
      indigenousHistory: 'Miwok people for thousands of years',
      nationalParks: ['Eldorado National Forest (partial)'],
      majorAttractions: ['Historic Highway 49', 'Sutter Creek', 'Jackson', 'Plymouth wine region', 'Kennedy Tailing Wheels Park'],
      industries: ['Wine production', 'Tourism', 'Historic preservation'],
      climate: 'Mediterranean with warm, dry summers',
      elevation: '200 to 4,000 feet',
      notablePeople: ['Italian winemaking families'],
      historicalEvents: ['1850s Gold Rush boom', '1890 Wine industry peak', '1970s Wine revival']
    }
  },
  {
    countyId: 'calaveras',
    historicalContext: 'Calaveras County gained international fame through Mark Twain\'s "The Celebrated Jumping Frog of Calaveras County" (1865), set in Angels Camp. George Angel founded Angels Camp in 1849, making it one of the richest quartz mining sections. The 195-pound gold nugget found at Carson Hill was the largest in U.S. history.',
    economicImportance: 'The annual Calaveras County Fair and Jumping Frog Jubilee, running since 1928, attracts 15,000+ visitors and drives tourism. Wine production in the Sierra Foothills AVA contributes significantly to the economy. Forestry operations in eastern portions provide timber industry jobs.',
    uniqueFeatures: 'The Angels Hotel where Mark Twain heard his famous frog story still operates. The Jumping Frog Jubilee every May celebrates the literary connection with frog jumping contests. The mineral calaverite was named after the county, reflecting its geological significance.',
    culturalHeritage: 'The Mark Twain Wild West Fest every October celebrates the county\'s literary heritage. Angels Camp, Murphys, and San Andreas preserve authentic 1850s Gold Rush character. The county name "calaveras" (skulls) was given by Mexican explorers who found Native American remains.',
    geographicalSignificance: 'Located in the core of the Mother Lode gold belt, Calaveras County contains significant portions of the historic mining region. Cave systems including Moaning Caverns and Mercer Caverns feature impressive limestone formations. The Stanislaus River provides a major watershed and recreation corridor.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Miwok and Yokuts peoples',
      nationalParks: ['Stanislaus National Forest (partial)'],
      majorAttractions: ['Angels Camp', 'Murphys', 'Jumping Frog Jubilee', 'Moaning Caverns', 'Mercer Caverns', 'Mark Twain sites'],
      industries: ['Tourism', 'Wine production', 'Forestry'],
      climate: 'Mediterranean foothill climate',
      elevation: '400 to 8,000 feet',
      notablePeople: ['Mark Twain (visitor)', 'George Angel (founder)'],
      historicalEvents: ['1849 Angels Camp founding', '1865 Mark Twain story publication', '1928 First Jumping Frog Jubilee']
    }
  },
  {
    countyId: 'el_dorado',
    historicalContext: 'El Dorado County contains the site where James Marshall discovered gold at Sutter\'s Mill in Coloma on January 24, 1848, starting the California Gold Rush. By 1858, the county had 77,500 grape vines and 8,000 of the state\'s 10,000 vineyard acres. Placerville was known as "Hangtown" for its frontier justice.',
    economicImportance: 'Lake Tahoe tourism makes El Dorado County a major resort destination, anchored by South Lake Tahoe. The historic Apple Hill region features 50+ farms generating significant agritourism revenue. Premium cool-climate wine varieties in the Sierra Foothills AVA contribute to the agricultural economy.',
    uniqueFeatures: 'El Dorado County features dual geography from Lake Tahoe alpine resorts to Sierra Nevada foothills. Historic Highway 50 follows the Lincoln Highway route to Lake Tahoe. Three major ski resorts (Heavenly, Kirkwood, Sierra-at-Tahoe) drive the recreation economy.',
    culturalHeritage: 'Marshall Gold Discovery State Historic Park preserves the original gold discovery site. Chinese, Italian, and Swiss settler influences shaped the cultural landscape. Maidu and Washoe tribal territories encompass different elevational zones of the county.',
    geographicalSignificance: 'Elevation ranges dramatically from 150 feet near Sacramento to over 10,000 feet at the Sierra Crest. 43% of the county lies within Eldorado National Forest. The Pacific Crest Trail provides a major hiking corridor through the eastern county.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Maidu (lower elevations) and Washoe (Lake Tahoe basin)',
      nationalParks: ['Eldorado National Forest', 'Lake Tahoe Basin'],
      majorAttractions: ['Marshall Gold Discovery State Historic Park', 'Lake Tahoe', 'Apple Hill', 'Heavenly ski resort', 'Emerald Bay'],
      industries: ['Tourism', 'Wine production', 'Recreation', 'Apple farming'],
      climate: 'Mediterranean foothills to alpine',
      elevation: '150 feet to 10,000+ feet (Sierra Crest)',
      notablePeople: ['James Marshall (gold discoverer)'],
      historicalEvents: ['1848 Gold discovery', '1850 County formation', '1858 Wine industry peak']
    }
  },
  {
    countyId: 'inyo',
    historicalContext: 'Inyo County takes its name from the Paiute word "Too-man-i-goo-yah" meaning "very old man," referring to Mt. Whitney. The Los Angeles Aqueduct completed in 1913 caused decades of water wars as the Owens Valley was transformed from farming to LA\'s water source. The 1991 Long Term Water Agreement finally resolved most disputes.',
    economicImportance: 'Water export via the Owens River supplies Los Angeles through the 233-mile aqueduct system, representing a major economic factor. Eastern Sierra recreation economy supports tourism. Historical gold and silver mining in the eastern Sierra provided early economic development.',
    uniqueFeatures: 'Mt. Whitney at 14,505 feet is the highest peak in the contiguous United States. In just 84.6 miles, elevation changes from Mt. Whitney to Death Valley (-282 feet), the greatest elevation difference in the lower 48 states. The Long Valley Caldera and Mono-Inyo volcanic chain remain volcanically active.',
    culturalHeritage: 'Paiute traditions include ancient obsidian trade routes across the Sierra Nevada. Water rights legacy includes the landmark 1991 agreement with Los Angeles. Eastern Sierra heritage encompasses mining camps and historic ranches throughout the Owens Valley.',
    geographicalSignificance: 'The Great Basin Divide runs along Mt. Whitney on the Sierra Crest. The Owens Valley stretches 100 miles between the Sierra Nevada and White Mountains. The region is part of the USGS volcanic hazards monitoring program due to ongoing geological activity.',
    specificData: {
      established: '1866',
      indigenousHistory: 'Paiute peoples with ancient obsidian trade networks',
      nationalParks: ['Sequoia National Park (partial)', 'Kings Canyon National Park (partial)', 'Death Valley National Park (partial)'],
      majorAttractions: ['Mt. Whitney', 'Alabama Hills', 'Manzanar National Historic Site', 'Ancient Bristlecone Pine Forest', 'Mono Lake'],
      industries: ['Tourism', 'Water export', 'Recreation'],
      climate: 'High desert with extreme elevation variations',
      elevation: '-282 feet (Death Valley) to 14,505 feet (Mt. Whitney)',
      notablePeople: ['Ansel Adams (photographer)'],
      historicalEvents: ['1913 LA Aqueduct completion', '1942-1945 Manzanar internment camp', '1991 Long Term Water Agreement']
    }
  },
  {
    countyId: 'mariposa',
    historicalContext: 'Mariposa County was the largest of California\'s original 27 counties established in 1850, originally covering much of central California. The Yosemite Grant signed by Lincoln on June 30, 1864, was the first land conservation act in U.S. history. The county was central to the Southern Mines region during the Gold Rush.',
    economicImportance: 'As the gateway to Yosemite National Park, tourism drives Mariposa County\'s economy. The historic Princeton Mine produced $5 million in gold during its operation. Foothill ranching and limited farming supplement the tourism-based economy.',
    uniqueFeatures: 'Mariposa Grove contains 427 mature giant sequoias, including the 2,700-year-old Grizzly Giant. The county is one of three California counties without incorporated cities. Mariposa County represents the birthplace of the national park system through the Yosemite Grant.',
    culturalHeritage: 'Yokuts people inhabited the region for thousands of years before European contact. The 1850s courthouse in Mariposa still operates, one of California\'s oldest. Galen Clark, the first Yosemite guardian, established the conservation legacy that continues today.',
    geographicalSignificance: 'Mariposa County serves as the Sierra Nevada gateway, spanning foothills to high country. The Merced River provides a major watershed flowing to the Central Valley. Highway 140 offers the scenic route to Yosemite Valley through the county.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Yokuts and Southern Sierra Miwok peoples',
      nationalParks: ['Yosemite National Park (partial)', 'Sierra National Forest'],
      majorAttractions: ['Yosemite gateway', 'Mariposa Grove', 'Historic courthouse', 'California State Mining and Mineral Museum'],
      industries: ['Tourism', 'Ranching', 'Historic preservation'],
      climate: 'Mediterranean foothill to alpine',
      elevation: '500 to 13,000+ feet',
      notablePeople: ['Galen Clark (first Yosemite guardian)'],
      historicalEvents: ['1850 County formation', '1864 Yosemite Grant', 'Gold Rush period']
    }
  },
  {
    countyId: 'mono',
    historicalContext: 'Mono County\'s Bodie Ghost Town represents one of California\'s most significant mining booms, with population peaking at 8,000 during 1877-1882. The town produced $38 million in gold and silver before decline. Paiute people established obsidian trade routes and seasonal villages throughout the region for thousands of years.',
    economicImportance: 'Eastern Sierra recreation and ghost town tourism drive Mono County\'s economy. Mono Lake, a 700,000-year-old saline lake ecosystem, supports millions of migrating birds and generates eco-tourism. Ongoing geological research and volcanic monitoring provide scientific economic activity.',
    uniqueFeatures: 'Bodie State Historic Park preserves the best ghost town in the West in "arrested decay" with 110 surviving structures. Mono Lake features ancient tufa towers and unique ecosystem. The Mono-Inyo volcanic chain has experienced 20 eruptions in the last 5,000 years.',
    culturalHeritage: 'Mono Paiute people conducted traditional obsidian quarrying and trading across the Sierra Nevada. Ghost town heritage includes the Dog Town site of the first eastern Sierra gold discovery in 1857. Mining legacy encompasses boom-bust cycles typical of western mining.',
    geographicalSignificance: 'Located in the eastern Sierra and Great Basin transition zone, Mono County features high desert and alpine environments. The Long Valley-Mono Lake volcanic system remains geologically active. The area represents the transition between Sierra Nevada and Nevada desert ecosystems.',
    specificData: {
      established: '1861',
      indigenousHistory: 'Mono Paiute with ancient obsidian trade networks',
      nationalParks: ['Mono Lake Tufa State Natural Reserve', 'Inyo National Forest'],
      majorAttractions: ['Bodie State Historic Park', 'Mono Lake', 'June Lake Loop', 'Mammoth Mountain'],
      industries: ['Tourism', 'Recreation', 'Scientific research'],
      climate: 'High desert with cold winters',
      elevation: '6,400 to 13,000+ feet',
      notablePeople: ['Bodie mining pioneers'],
      historicalEvents: ['1857 First gold discovery', '1877-1882 Bodie boom', '1962 Bodie becomes state park']
    }
  },
  {
    countyId: 'nevada',
    historicalContext: 'Nevada County was the gold mining capital of California, with Grass Valley and Nevada City hosting the most productive lode mines in the state. The Empire Mine extracted 5.8 million ounces over 100+ years (1850-1956). The county pioneered hydraulic mining until the 1884 court injunction ended the practice due to environmental damage.',
    economicImportance: 'Nevada County was the richest mining community in California during the Gold Rush, employing Cornish mining techniques and expertise. The modern economy focuses on tourism, technology, and rural residential development. Historic preservation generates significant tourism revenue.',
    uniqueFeatures: 'The Empire Mine operated continuously from 1850-1940, making it one of California\'s longest-lived mines. Hydraulic mining operations were the largest in the world until environmental destruction led to legal precedent ending the practice. The county preserves the best Gold Rush architecture in California.',
    culturalHeritage: 'Cornish mining heritage brought expertise from Cornwall, England, to California mines. Significant Chinese immigrant population contributed to mining and railroad construction. Victorian architecture from the 1860s-1880s creates intact historic residential districts.',
    geographicalSignificance: 'Located in the Sierra Nevada foothills, Nevada County contains 2,194 documented mine sites. The Yuba River watershed suffered massive environmental damage from hydraulic mining. Nevada City remains one of California\'s most authentic Gold Rush towns.',
    specificData: {
      established: '1851',
      indigenousHistory: 'Nisenan (Southern Maidu) people',
      nationalParks: ['Tahoe National Forest', 'South Yuba River State Park'],
      majorAttractions: ['Empire Mine State Historic Park', 'Nevada City', 'Grass Valley', 'South Yuba River'],
      industries: ['Tourism', 'Technology', 'Historic preservation'],
      climate: 'Mediterranean foothill climate',
      elevation: '1,000 to 7,000 feet',
      notablePeople: ['Cornish mining families', 'Lola Montez (entertainer)'],
      historicalEvents: ['1848 Gold discovery', '1884 Hydraulic mining ban', '1956 Empire Mine closure']
    }
  },
  {
    countyId: 'placer',
    historicalContext: 'Placer County\'s Auburn area saw gold discovery in 1848, starting the northern mines rush. The Central Pacific Railroad route through Donner Pass made the county crucial to transcontinental railroad construction. Large Chinese immigrant populations established mining camps throughout the region.',
    economicImportance: 'Lake Tahoe tourism, particularly North and West Shore resort economies, drives significant revenue. The Roseville rail hub and emerging technology industries provide modern economic foundation. Western area fruit orchards and ranching contribute to agricultural economy.',
    uniqueFeatures: 'Donner Pass represents both historic railroad achievement and tragic pioneer story of the Donner Party. The county ranks #3 in California for outdoor recreation activities. Historic Auburn Old Town preserves authentic Gold Rush character and architecture.',
    culturalHeritage: 'Central Pacific Railroad construction camps housed thousands of Chinese workers who built the most difficult mountain sections. Pioneer trails including the California Trail and Donner Party route cross the county. Chinese heritage remains significant in regional cultural identity.',
    geographicalSignificance: 'Elevation ranges from Central Valley floor to the Lake Tahoe basin, creating diverse ecosystems. The Sierra Nevada crossing represents a major transportation corridor since pioneer times. The American River provided important Gold Rush watershed and continues recreational use.',
    specificData: {
      established: '1851',
      indigenousHistory: 'Nisenan (Maidu) and Washoe peoples',
      nationalParks: ['Tahoe National Forest', 'Auburn State Recreation Area'],
      majorAttractions: ['Lake Tahoe North Shore', 'Auburn Historic Old Town', 'Donner Pass', 'Colfax Railroad Museum'],
      industries: ['Tourism', 'Technology', 'Agriculture', 'Transportation'],
      climate: 'Mediterranean valley to alpine mountain',
      elevation: '100 to 9,000+ feet',
      notablePeople: ['Central Pacific Railroad workers'],
      historicalEvents: ['1848 Gold discovery', '1860s Railroad construction', '1846-47 Donner Party tragedy']
    }
  },
  {
    countyId: 'sierra',
    historicalContext: 'Sierra County was created in 1852 from parts of Yuba County, with mining camps at Loyalton, Sierraville, and Downieville. Mountain barriers limited development and kept the county isolated from major population centers. The area experienced typical boom-bust mining cycles of the Gold Rush era.',
    economicImportance: 'Timber industry provides significant logging operations in Sierra Nevada forests. Lake Tahoe region tourism spillover benefits the county economy. High mountain valley agriculture and ranching support rural communities.',
    uniqueFeatures: 'Sierra County is one of California\'s least populous counties with high average elevation among the highest in the state. The county serves as a gateway to Tahoe National Forest wilderness areas. Isolated mountain communities maintain traditional rural lifestyles.',
    culturalHeritage: 'Basque heritage from sheep ranching traditions remains strong in mountain valleys. Mining legacy includes small-scale placer and hydraulic operations. Mountain communities developed distinct cultures due to geographic isolation.',
    geographicalSignificance: 'Located on the Sierra Nevada Crest, the county spans multiple watersheds at high elevation. The North Fork Feather River drainage system provides water resources. Alpine environment creates limited growing seasons and harsh winter conditions.',
    specificData: {
      established: '1852',
      indigenousHistory: 'Mountain Maidu peoples',
      nationalParks: ['Tahoe National Forest', 'Plumas National Forest'],
      majorAttractions: ['Sierra Buttes', 'Downieville', 'North Fork Yuba River', 'Gold Lakes Basin'],
      industries: ['Timber', 'Recreation', 'Ranching'],
      climate: 'Alpine with harsh winters',
      elevation: '2,000 to 8,000+ feet',
      notablePeople: ['Basque ranching families'],
      historicalEvents: ['1852 County formation', 'Gold Rush mining period', 'Timber industry development']
    }
  },
  {
    countyId: 'tuolumne',
    historicalContext: 'Tuolumne County\'s Columbia was known as the "Gem of the Southern Mines" in the 1850s. A 75-pound gold nugget was found in Jamestown, among the largest discoveries. Mark Twain stayed at a cabin on Jackass Hill during winter 1864-65, providing inspiration for his California stories.',
    economicImportance: 'Columbia State Historic Park as a preserved 1850s mining town drives significant tourism revenue. Wine industry expansion from 9,000 to 50,000 vines between 1857-1858 established viticultural traditions. Timber harvesting in eastern forest areas provides forestry jobs.',
    uniqueFeatures: 'Columbia State Historic Park preserves an entire Gold Rush town with period buildings and interpretation. Sonora county seat maintains an intact historic district. Knights Ferry features the longest covered bridge on the west coast, built in 1862.',
    culturalHeritage: 'The county was named for the Tuolumne River, itself from Native American origins. Preserved Gold Rush-era buildings and streets in mining camps provide authentic historical experience. Mark Twain\'s literary connection brings international recognition.',
    geographicalSignificance: 'Located in the central portion of the Mother Lode gold belt, Tuolumne County contains significant historical mining areas. The Stanislaus River provides major watershed with recreational significance. Sierra Nevada foothills create transition from valley to high country ecosystems.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Yokuts and Sierra Miwok peoples',
      nationalParks: ['Stanislaus National Forest', 'Yosemite National Park (partial)'],
      majorAttractions: ['Columbia State Historic Park', 'Sonora', 'Jamestown', 'Knights Ferry covered bridge'],
      industries: ['Tourism', 'Wine production', 'Forestry'],
      climate: 'Mediterranean foothill climate',
      elevation: '500 to 7,000 feet',
      notablePeople: ['Mark Twain (winter resident)', 'Gold Rush pioneers'],
      historicalEvents: ['1850s Columbia boom', '1864-65 Mark Twain residence', 'Wine industry establishment']
    }
  },

  // ==================== CENTRAL COAST REGION ====================
  {
    countyId: 'monterey',
    historicalContext: 'Mission San Carlos Borromeo de Carmelo was founded in 1770 by Junípero Serra, becoming the headquarters for the California mission system. Large Mexican ranchos were established during the 1820s-1840s. Salinas Valley development began in the 1850s with railroad arrival, transforming the region into an agricultural powerhouse.',
    economicImportance: 'Monterey County generates $4.99 billion gross agricultural value (2024), earning the title "America\'s Salad Bowl." The county produces 61% of U.S. leaf lettuce, 56% of head lettuce, 28% of strawberries, and 57% of celery. Agriculture contributes $12 billion total economic impact with employment for thousands.',
    uniqueFeatures: 'The Salinas Valley grows 80% of U.S. leafy greens and berries in ideal cool growing conditions. Typical farms grow 30+ different crops year-round using AI-integrated equipment for precision agriculture. The region represents the most technologically advanced farming in the world.',
    culturalHeritage: 'Father Serra is buried at Carmel Mission, having founded 9 of California\'s 21 missions. Nobel Prize-winning author John Steinbeck was born in Salinas and wrote extensively about the region. Monterey Bay historic fishing industry and marine research center legacy continues today.',
    geographicalSignificance: 'Pacific Ocean influence creates ideal cool growing conditions for agriculture. Two deep aquifer systems support intensive agricultural operations. Monterey Bay National Marine Sanctuary protects one of the world\'s most diverse marine ecosystems.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Ohlone (Costanoan) peoples for thousands of years',
      nationalParks: ['Monterey Bay National Marine Sanctuary', 'Pinnacles National Park (partial)'],
      majorAttractions: ['Carmel Mission', 'Monterey Bay Aquarium', 'Pebble Beach', 'Big Sur coastline', 'Salinas Valley'],
      industries: ['Agriculture', 'Tourism', 'Marine research', 'Food processing'],
      climate: 'Mediterranean coastal with marine influence',
      elevation: 'Sea level to 5,000+ feet',
      notablePeople: ['Junípero Serra', 'John Steinbeck', 'Ansel Adams'],
      historicalEvents: ['1770 Mission founding', '1850s Railroad arrival', '1930s Dust Bowl refugees', 'Agricultural mechanization']
    }
  },
  {
    countyId: 'san_benito',
    historicalContext: 'San Benito County was named for San Benito Mission, reflecting Spanish colonial heritage. Large cattle ranches dominated during the Mexican era (1821-1848). The transition to row crop agriculture occurred in the early 20th century as irrigation systems developed.',
    economicImportance: 'Agricultural production focuses on vegetables, wine grapes, and cattle ranching. The emerging wine industry benefits from unique terroir and microclimates. Rural economy includes agricultural processing and growing rural tourism sector.',
    uniqueFeatures: 'Hollister Hills provides off-road vehicle recreation for the region. The San Andreas Fault runs visibly through the county, creating unique geological features. Pinnacles National Park protects distinctive rock formations and serves as condor habitat.',
    culturalHeritage: 'Strong Mexican-Californian cultural traditions remain from the rancho period. Rural agricultural community values and traditions continue today. Ohlone tribal territory encompasses the original indigenous heritage of the region.',
    geographicalSignificance: 'The San Andreas and related fault systems create unique geology throughout the county. Pinnacles Formation consists of volcanic rock formations moved by tectonic activity over millions of years. The county represents a transition zone between the coast and interior Central Valley.',
    specificData: {
      established: '1874',
      indigenousHistory: 'Ohlone (Mutsun and other groups)',
      nationalParks: ['Pinnacles National Park'],
      majorAttractions: ['Pinnacles National Park', 'Hollister Hills SVRA', 'San Juan Bautista', 'Casa de Fruta'],
      industries: ['Agriculture', 'Wine production', 'Recreation'],
      climate: 'Mediterranean with inland valley influence',
      elevation: '200 to 3,000+ feet',
      notablePeople: ['Mexican rancho families'],
      historicalEvents: ['1797 Mission San Juan Bautista', '1874 County formation', 'Agricultural development']
    }
  },
  {
    countyId: 'san_luis_obispo',
    historicalContext: 'Mission San Luis Obispo was founded in 1772 by Father Serra in the "Valley of the Bears." The mission pioneered clay tile roofs in California after thatch roof fires. The Coast Daylight train route brought tourism development in the early 20th century.',
    economicImportance: 'San Luis Obispo County is California\'s third largest wine producer after Sonoma and Napa counties. Strawberries are the leading crop with diverse agricultural production. Wine country tourism generates over $2 billion annual economic impact.',
    uniqueFeatures: 'Cal Poly San Luis Obispo provides leading agricultural and engineering education in the region. Paso Robles AVA contains 200+ wineries in a renowned wine region. Morro Bay features the distinctive volcanic Morro Rock and active fishing harbor.',
    culturalHeritage: 'Mission architecture with adobe construction shows Spanish colonial influence throughout the region. Cal Poly University creates an educational heritage and college town atmosphere. The emerging wine culture rivals Napa and Sonoma as a destination.',
    geographicalSignificance: 'Climate diversity ranges from Mediterranean coastal to inland valley microclimates ideal for wine. Morro Rock and the Nine Sisters represent a volcanic chain creating distinctive landmarks. Highway 1 scenic corridor through Big Sur region provides world-famous coastal access.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Chumash and Salinan peoples',
      nationalParks: ['Los Padres National Forest'],
      majorAttractions: ['Morro Bay', 'Paso Robles wine country', 'Cal Poly SLO', 'Mission San Luis Obispo', 'Pismo Beach'],
      industries: ['Wine production', 'Agriculture', 'Tourism', 'Education'],
      climate: 'Mediterranean coastal to inland valley',
      elevation: 'Sea level to 4,000+ feet',
      notablePeople: ['Cal Poly faculty and alumni'],
      historicalEvents: ['1772 Mission founding', 'Railroad era tourism', 'Wine industry development']
    }
  },
  {
    countyId: 'santa_barbara',
    historicalContext: 'The Spanish Presidio was established in 1782 as a military garrison, followed by Mission Santa Barbara in 1786. The transition from Mexican ranchos to American agriculture occurred after 1848. Offshore oil drilling beginning in the 1890s significantly shaped the regional economy.',
    economicImportance: 'Santa Barbara County\'s wine industry generates over $1 billion in wine tourism with 7 distinct AVAs. Diverse agricultural production includes wine grapes, strawberries, and flowers. Vandenberg Space Force Base serves as a major employer and economic driver.',
    uniqueFeatures: 'The Transverse Ranges create unique east-west mountain orientation, producing diverse microclimates. Seven AVAs make this the most diverse wine-growing region in California. The area is known as the "American Riviera" for its Mediterranean climate and coastal beauty.',
    culturalHeritage: 'Spanish Mission Revival and Spanish Colonial Revival architecture defines the regional aesthetic. Wine heritage was featured prominently in the movie "Sideways," establishing the region as the Pinot Noir capital. UC Santa Barbara adds significant research institution presence.',
    geographicalSignificance: 'Channel Islands, called the "Galapagos of California," support unique ecosystems offshore. East-west valley orientation allows maritime influence to penetrate inland. Santa Ynez Mountains create rain shadow effects producing diverse climate zones.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Chumash peoples with sophisticated maritime culture',
      nationalParks: ['Channel Islands National Park', 'Los Padres National Forest'],
      majorAttractions: ['Santa Barbara Mission', 'Channel Islands', 'Santa Ynez Valley wine country', 'Solvang'],
      industries: ['Wine production', 'Agriculture', 'Aerospace', 'Tourism'],
      climate: 'Mediterranean with Transverse Range influence',
      elevation: 'Sea level to 6,000+ feet',
      notablePeople: ['Spanish colonial families', 'UC Santa Barbara faculty'],
      historicalEvents: ['1782 Presidio founding', '1786 Mission founding', '1890s Oil discovery', 'Modern wine development']
    }
  },
  {
    countyId: 'santa_cruz',
    historicalContext: 'Mission Santa Cruz was founded in 1791 but struggled due to proximity to the Branciforte pueblo. Redwood logging beginning in the 1860s drove the early economy with massive timber operations. Victorian-era seaside tourism established Santa Cruz as a beach resort destination.',
    economicImportance: 'Technology sector benefits from Silicon Valley spillover and UC Santa Cruz research activities. Agricultural production includes Brussels sprouts, strawberries, wine grapes, and cut flowers. Beach tourism, redwood parks, and wine tasting drive significant visitor economy.',
    uniqueFeatures: 'UC Santa Cruz features innovative campus design integrated into redwood forest environment. The Beach Boardwalk operating since 1907 represents historic seaside amusement park heritage. Ancient coast redwood groves preserved in multiple state parks provide world-class natural attractions.',
    culturalHeritage: 'Ohlone heritage includes shell mounds and village sites throughout the coastal region. Santa Cruz is considered the birthplace of mainland surfing culture in California. Strong environmental movement and conservation activism characterize the regional culture.',
    geographicalSignificance: 'Santa Cruz forms the northern shore of Monterey Bay National Marine Sanctuary. Santa Cruz Mountains contain significant coast redwood forests in the Coast Range. San Lorenzo Valley drainage supports diverse ecosystems from redwoods to oak woodlands.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Ohlone peoples with coastal shell mound villages',
      nationalParks: ['Big Basin Redwoods State Park', 'Santa Cruz Mountains'],
      majorAttractions: ['UC Santa Cruz', 'Santa Cruz Beach Boardwalk', 'Big Basin Redwoods', 'Natural Bridges State Beach'],
      industries: ['Technology', 'Tourism', 'Agriculture', 'Education'],
      climate: 'Mediterranean coastal with redwood fog belt',
      elevation: 'Sea level to 3,000+ feet',
      notablePeople: ['UCSC faculty and researchers', 'Environmental activists'],
      historicalEvents: ['1791 Mission founding', '1860s Logging boom', '1907 Boardwalk opening', '1965 UCSC founding']
    }
  },

  // ==================== NORTH COAST REGION ====================
  {
    countyId: 'del_norte',
    historicalContext: 'Del Norte County was named "Del Norte" (of the north) by early Spanish explorers as California\'s northernmost Pacific coast region. Tolowa, Yurok, and Hupa peoples inhabited the region for millennia before European contact. Large-scale redwood logging began in the 1850s and peaked in the early 1900s, driving economic development.',
    economicImportance: 'Historic economic foundation rested on old-growth redwood harvesting from coastal temperate rainforests. Redwood National and State Parks now anchor the visitor economy. Commercial fishing industries focus on salmon, crab, and rockfish. Pelican Bay State Prison serves as a major regional employer.',
    uniqueFeatures: 'Redwood National Park protects the tallest trees on Earth in coastal temperate rainforest ecosystems. As California\'s northernmost Pacific coast county, Del Norte serves as the gateway between California and the Pacific Northwest. The Smith River is California\'s last major undammed river system.',
    culturalHeritage: 'Tolowa Nation maintains traditional fishing, basket weaving, and ceremonial practices. Battery Point Lighthouse built in 1856 continues guiding maritime traffic. Logging heritage includes steam donkey engines and railroad logging camps throughout the redwood forests.',
    geographicalSignificance: 'Located on the Oregon border, Del Norte County features ancient marine terraces creating unique coastal topography. The Smith River system provides pristine watershed habitat. Coastal terraces represent various periods of geological uplift and sea level change.',
    specificData: {
      established: '1857',
      indigenousHistory: 'Tolowa, Yurok, and Hupa peoples for millennia',
      nationalParks: ['Redwood National and State Parks', 'Smith River National Recreation Area'],
      majorAttractions: ['Redwood National Park', 'Battery Point Lighthouse', 'Smith River', 'Tolowa Dunes State Park'],
      industries: ['Tourism', 'Fishing', 'Timber', 'Corrections'],
      climate: 'Cool coastal temperate rainforest',
      elevation: 'Sea level to 4,000+ feet',
      notablePeople: ['Tolowa tribal leaders'],
      historicalEvents: ['1850s Logging boom', '1968 Redwood National Park establishment', 'Native American land rights movements']
    }
  },
  {
    countyId: 'humboldt',
    historicalContext: 'Humboldt County contains the largest California tribe, with 6,000+ Yurok tribal members. Gold discovery in 1850 brought violent conflicts with Native peoples. By the early 1900s, the county had become the world\'s largest lumber producer, harvesting ancient redwood forests.',
    economicImportance: 'The cannabis industry makes Humboldt County the largest producer in the Emerald Triangle, transitioning from underground to legal market worth billions. Timber legacy continues with sustained yield forestry and second-growth management. Humboldt State University (now Cal Poly Humboldt) contributes significantly to the regional economy.',
    uniqueFeatures: 'Humboldt Bay is California\'s second largest bay and serves as a major deepwater port. Cannabis tourism is emerging as "canna-tourism" worth $1.7 billion nationally. The Avenue of the Giants scenic highway passes through ancient redwood groves.',
    culturalHeritage: 'Multiple tribal governments maintain cultural sovereignty and traditional practices. Logging culture includes steam donkey operators, mill workers, and timber families. The region birthed the modern forest conservation movement in response to clearcutting.',
    geographicalSignificance: 'The Eel River provides a major watershed draining the Coast Range and supporting threatened salmon runs. Prairie Creek hosts Roosevelt elk herds and coastal prairie ecosystems. The Mendocino Triple Junction creates ongoing seismic activity.',
    specificData: {
      established: '1853',
      indigenousHistory: 'Yurok, Hoopa, Wiyot, and other tribes for thousands of years',
      nationalParks: ['Redwood National and State Parks', 'Six Rivers National Forest'],
      majorAttractions: ['Humboldt Redwoods State Park', 'Avenue of the Giants', 'Humboldt Bay', 'Prairie Creek Redwoods'],
      industries: ['Cannabis', 'Timber', 'Education', 'Tourism'],
      climate: 'Cool coastal with redwood fog belt',
      elevation: 'Sea level to 6,000+ feet',
      notablePeople: ['Yurok tribal leaders', 'Environmental activists'],
      historicalEvents: ['1850 Gold discovery conflicts', '1900s Lumber boom', '1960s Cannabis cultivation', '2016 Cannabis legalization']
    }
  },
  {
    countyId: 'lake',
    historicalContext: 'Lake Pomo people lived around Clear Lake for thousands of years before European contact. Quicksilver (mercury) mines operated from the 1870s-1950s at Sulphur Bank, providing mercury for gold mining statewide. Victorian-era health resorts attracted visitors to natural hot springs around the lake.',
    economicImportance: 'The emerging wine industry benefits from unique volcanic terroir and diverse microclimates. The Geysers geothermal field provides renewable power as the world\'s largest geothermal generating facility. Agriculture includes pears, walnuts, and grapes grown in volcanic soils.',
    uniqueFeatures: 'Clear Lake is California\'s largest natural freshwater lake entirely within state boundaries. Recent volcanic activity created unique geological features throughout the region. The Geysers geothermal field generates clean electricity from underground steam.',
    culturalHeritage: 'Pomo basketry traditions are internationally recognized for Native American basket weaving artistry. Hot springs legacy includes natural thermal springs that attracted health tourism. Rural heritage encompasses agricultural and ranching traditions dating to the 1850s.',
    geographicalSignificance: 'Lake County is part of the Clear Lake Volcanic Field with eruptions as recent as 11,000 years ago. The Clear Lake basin drains to the Russian River system. Interior North Coast location creates Mediterranean climate patterns.',
    specificData: {
      established: '1861',
      indigenousHistory: 'Lake Pomo and other Pomo groups for thousands of years',
      nationalParks: ['Clear Lake State Park', 'Mendocino National Forest (partial)'],
      majorAttractions: ['Clear Lake', 'The Geysers', 'Mount Konocti', 'Harbin Hot Springs'],
      industries: ['Wine production', 'Geothermal energy', 'Agriculture', 'Tourism'],
      climate: 'Mediterranean with volcanic influence',
      elevation: '1,300 to 4,000+ feet',
      notablePeople: ['Pomo basket weavers'],
      historicalEvents: ['1870s Mercury mining boom', 'Victorian health resort era', 'Geothermal development']
    }
  },
  {
    countyId: 'mendocino',
    historicalContext: 'Fort Bragg began as a military garrison in 1857 and became a lumber town with the Skunk Train railroad in 1885. Georgia-Pacific and other companies harvested old-growth redwoods for over a century. Underground cannabis cultivation since the 1960s has transitioned to legal industry leadership.',
    economicImportance: 'The cannabis industry seeks to become the "Napa of cannabis" with proposed appellations and quality designations. Sustainable forestry continues in Jackson Demonstration State Forest. Coastal tourism centered on Mendocino village drives significant visitor economy.',
    uniqueFeatures: 'Glass Beach in Fort Bragg features recycled glass from a former dump site, creating a unique coastal attraction. The Skunk Train operating since 1885 provides historic railroad experience through redwood forests. Cannabis tourism attracts visitors with 68% of Americans supporting adult use.',
    culturalHeritage: 'Multiple Pomo bands maintain distinct languages and territorial traditions. Mendocino village preserves Victorian architecture as a historic district. Logging heritage includes company towns, mill workers, and railroad logging operations.',
    geographicalSignificance: 'Coastal terraces create distinctive marine terrace topography along the Pacific. The Russian River flows through Alexander Valley wine region. Coastal fog belt creates ideal conditions for both redwood forests and cannabis cultivation.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Multiple Pomo bands with distinct territories',
      nationalParks: ['Mendocino National Forest', 'Jackson Demonstration State Forest'],
      majorAttractions: ['Mendocino village', 'Fort Bragg', 'Glass Beach', 'Skunk Train', 'Anderson Valley'],
      industries: ['Cannabis', 'Tourism', 'Timber', 'Wine production'],
      climate: 'Cool coastal with fog belt influence',
      elevation: 'Sea level to 6,000+ feet',
      notablePeople: ['Pomo tribal leaders', 'Cannabis pioneers'],
      historicalEvents: ['1857 Fort Bragg establishment', '1885 Skunk Train', '1960s Cannabis culture', 'Victorian preservation']
    }
  },

  // ==================== BAY AREA REGION (CONTINUED) ====================
  {
    countyId: 'alameda',
    historicalContext: 'Alameda County was established in 1853, named for the Spanish word meaning "grove of cottonwood trees." The transcontinental railroad terminus at Oakland made it a major transportation hub. The county played crucial roles in both World Wars with shipbuilding and military production.',
    economicImportance: 'As part of Silicon Valley, Alameda County hosts major technology companies and startups generating billions in revenue. The Port of Oakland is one of the largest container ports on the West Coast. University of California Berkeley contributes significantly to research and education.',
    uniqueFeatures: 'Berkeley is home to the flagship University of California campus and birthplace of the Free Speech Movement. Oakland serves as a major cultural center and transportation hub. The county encompasses diverse geography from San Francisco Bay to eastern hills.',
    culturalHeritage: 'The county has rich multicultural heritage with significant African American, Latino, and Asian populations. Berkeley represents academic excellence and social activism. Oakland maintains strong arts and music culture, particularly in jazz and hip-hop.',
    geographicalSignificance: 'Located on the east side of San Francisco Bay, the county features bay shoreline, rolling hills, and valleys. The Hayward Fault runs through the county, creating seismic activity. Climate ranges from cool bay influence to warmer inland areas.',
    specificData: {
      established: '1853',
      indigenousHistory: 'Ohlone peoples including Chochenyo and other groups',
      nationalParks: ['San Francisco Bay National Wildlife Refuge'],
      majorAttractions: ['UC Berkeley', 'Oakland Museum', 'Jack London Square', 'Tilden Regional Park'],
      industries: ['Technology', 'Education', 'Transportation', 'Healthcare'],
      climate: 'Mediterranean with bay influence',
      elevation: 'Sea level to 3,000+ feet',
      notablePeople: ['UC Berkeley Nobel laureates', 'Oakland cultural figures'],
      historicalEvents: ['1853 County formation', '1868 UC Berkeley founding', '1960s Free Speech Movement', 'Silicon Valley development']
    }
  },
  {
    countyId: 'contra_costa',
    historicalContext: 'Contra Costa County was named "opposite coast" in Spanish, referring to its location across the bay from San Francisco. Established in 1850 as one of California\'s original counties. The county developed through agriculture, oil refining, and suburban growth.',
    economicImportance: 'Major oil refineries including Chevron Richmond provide significant industrial employment. Technology spillover from Silicon Valley drives growth in eastern county areas. Port operations and transportation logistics contribute to the regional economy.',
    uniqueFeatures: 'Mount Diablo offers panoramic views of the entire Bay Area from its 3,849-foot summit. The county contains diverse communities from industrial Richmond to affluent Walnut Creek. Eastern areas feature rolling hills and suburban developments.',
    culturalHeritage: 'The county reflects Bay Area diversity with multicultural communities. Environmental justice movements originated in Richmond addressing industrial pollution. Suburban development patterns represent post-World War II growth.',
    geographicalSignificance: 'Located in the East Bay, the county stretches from San Francisco Bay to the San Joaquin Valley. Mount Diablo serves as a prominent landmark and geological feature. The county encompasses bay marshlands, rolling hills, and river valleys.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Bay Miwok and Plains Miwok peoples',
      nationalParks: ['Mount Diablo State Park', 'Black Diamond Mines Regional Preserve'],
      majorAttractions: ['Mount Diablo', 'Six Flags Discovery Kingdom', 'John Muir National Historic Site'],
      industries: ['Oil refining', 'Technology', 'Transportation', 'Retail'],
      climate: 'Mediterranean with inland warming',
      elevation: 'Sea level to 3,849 feet (Mount Diablo)',
      notablePeople: ['John Muir (naturalist)', 'Industrial pioneers'],
      historicalEvents: ['1850 County formation', 'Oil industry development', 'Post-WWII suburban growth']
    }
  },
  {
    countyId: 'marin',
    historicalContext: 'Marin County was named after Chief Marin of the Coast Miwok people. Established in 1850, the county remained largely rural until the Golden Gate Bridge opened in 1937, connecting it to San Francisco. The area was known for dairies, lumber mills, and fishing.',
    economicImportance: 'Marin County has one of the highest per capita incomes in the United States, driven by proximity to San Francisco and technology centers. Tourism, particularly to Muir Woods and Point Reyes, generates significant revenue. High-end residential development and professional services dominate the economy.',
    uniqueFeatures: 'Muir Woods National Monument protects ancient coast redwood groves just minutes from San Francisco. Point Reyes National Seashore offers pristine coastal wilderness. The county maintains rural character despite urban proximity.',
    culturalHeritage: 'Coast Miwok heritage includes shell mounds and traditional gathering sites. The county represents California environmental movement with strong conservation ethic. Counterculture movements of the 1960s found expression in Marin communities.',
    geographicalSignificance: 'Located north of San Francisco across the Golden Gate, Marin features dramatic coastline, redwood forests, and rolling hills. The San Andreas Fault runs through the county. Point Reyes Peninsula sits on the Pacific Plate, slowly moving northwest.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Coast Miwok peoples led by Chief Marin',
      nationalParks: ['Muir Woods National Monument', 'Point Reyes National Seashore', 'Golden Gate National Recreation Area'],
      majorAttractions: ['Muir Woods', 'Point Reyes', 'Mount Tamalpais', 'Sausalito'],
      industries: ['Technology', 'Tourism', 'Professional services', 'Real estate'],
      climate: 'Mediterranean coastal with marine influence',
      elevation: 'Sea level to 2,571 feet (Mount Tamalpais)',
      notablePeople: ['Environmental leaders', 'Tech executives'],
      historicalEvents: ['1850 County formation', '1937 Golden Gate Bridge', '1960s Environmental movement']
    }
  },
  {
    countyId: 'san_mateo',
    historicalContext: 'San Mateo County was formed in 1856 from parts of San Francisco County. The area was originally Spanish land grants and Mexican ranchos. The county transformed from agricultural to suburban with the post-World War II technology boom.',
    economicImportance: 'As the heart of Silicon Valley, San Mateo County hosts major technology companies including Facebook (Meta), YouTube, and numerous startups. Venture capital and technology services drive one of the nation\'s most robust economies. San Francisco International Airport provides major employment.',
    uniqueFeatures: 'The county encompasses both Silicon Valley technology centers and coastal redwood forests. Half Moon Bay hosts the annual Pumpkin Festival. Filoli Gardens represents one of California\'s finest estate gardens.',
    culturalHeritage: 'Ohlone heritage includes numerous archaeological sites and shell mounds. The county reflects incredible diversity from technology immigrants to historic Portuguese fishing communities. Innovation culture defines the regional identity.',
    geographicalSignificance: 'The county stretches from San Francisco Bay to the Pacific Ocean across the Coast Range. The San Andreas Fault creates the linear valley occupied by reservoirs. Coastal areas feature marine terraces and redwood forests.',
    specificData: {
      established: '1856',
      indigenousHistory: 'Ohlone peoples including Ramaytush groups',
      nationalParks: ['Golden Gate National Recreation Area', 'San Francisco Bay National Wildlife Refuge'],
      majorAttractions: ['Filoli Gardens', 'Half Moon Bay', 'Purisima Creek Redwoods', 'SFO Airport'],
      industries: ['Technology', 'Biotechnology', 'Aviation', 'Venture capital'],
      climate: 'Mediterranean with coastal fog',
      elevation: 'Sea level to 2,600+ feet',
      notablePeople: ['Tech industry leaders', 'Venture capitalists'],
      historicalEvents: ['1856 County formation', 'Post-WWII tech boom', 'Silicon Valley development']
    }
  },
  {
    countyId: 'santa_clara',
    historicalContext: 'Santa Clara County was established in 1850, named after Mission Santa Clara founded in 1777. The area was primarily agricultural with fruit orchards until the technology revolution. Stanford University, founded in 1885, became crucial to Silicon Valley development.',
    economicImportance: 'Santa Clara County is the heart of Silicon Valley, hosting Apple, Google, Intel, Netflix, and countless other technology giants. The county generates hundreds of billions in economic activity annually. Venture capital investment and innovation drive global technology development.',
    uniqueFeatures: 'Silicon Valley represents the world\'s leading technology innovation center. Stanford University provides research and talent pipeline for technology companies. The region transformed from "Valley of Heart\'s Delight" fruit orchards to global tech capital.',
    culturalHeritage: 'Ohlone heritage includes Mission Santa Clara and numerous archaeological sites. The county reflects global immigration drawn by technology opportunities. Innovation and entrepreneurship define the cultural character.',
    geographicalSignificance: 'The county encompasses the southern portion of San Francisco Bay and extends into the Diablo Range. San Francisco Bay provides water resources and transportation. The area features Mediterranean climate ideal for both agriculture and technology development.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Ohlone peoples including Tamyen and other groups',
      nationalParks: ['San Francisco Bay National Wildlife Refuge'],
      majorAttractions: ['Stanford University', 'Computer History Museum', 'Winchester Mystery House', 'Great America'],
      industries: ['Technology', 'Venture capital', 'Biotechnology', 'Education'],
      climate: 'Mediterranean with bay influence',
      elevation: 'Sea level to 4,000+ feet',
      notablePeople: ['Tech industry founders', 'Stanford faculty', 'Venture capitalists'],
      historicalEvents: ['1777 Mission founding', '1885 Stanford University', '1950s Silicon Valley emergence', 'Tech boom periods']
    }
  },
  {
    countyId: 'solano',
    historicalContext: 'Solano County was established in 1850, named after Chief Solano of the Suisun people. The area served as California\'s capital in Vallejo from 1852-1853. Travis Air Force Base, established in 1943, became a major economic driver.',
    economicImportance: 'Travis Air Force Base provides significant military employment and economic impact. The county benefits from Bay Area proximity while maintaining agricultural production. Manufacturing and logistics operations contribute to the diverse economy.',
    uniqueFeatures: 'The county serves as a geographic bridge between the Bay Area and Central Valley. Suisun Marsh represents the largest contiguous estuarine marsh on the Pacific Coast. The area maintains rural character despite urban proximity.',
    culturalHeritage: 'Suisun and Patwin peoples have lived in the region for thousands of years. The brief period as state capital left historical significance. Military heritage from Travis Air Force Base influences regional culture.',
    geographicalSignificance: 'Located northeast of San Francisco Bay, the county encompasses bay marshlands, rolling hills, and river valleys. The Sacramento-San Joaquin Delta border provides unique wetland ecosystems. Climate transitions from maritime influence to inland patterns.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Suisun and Patwin peoples',
      nationalParks: ['Suisun Marsh'],
      majorAttractions: ['Travis Air Force Base', 'Suisun City Marina', 'Jelly Belly Factory'],
      industries: ['Military', 'Agriculture', 'Manufacturing', 'Logistics'],
      climate: 'Mediterranean transitioning to inland',
      elevation: 'Sea level to 2,000+ feet',
      notablePeople: ['Chief Solano', 'Military personnel'],
      historicalEvents: ['1850 County formation', '1852-53 State capital period', '1943 Travis AFB establishment']
    }
  },
  {
    countyId: 'napa',
    historicalContext: 'Napa County was established in 1850, named after the Wappo word "napa" meaning land of plenty. Wine production began in the 1860s with European immigrants. Prohibition nearly destroyed the industry, but recovery began in the 1960s.',
    economicImportance: 'Napa Valley is one of the world\'s premier wine regions, generating billions in wine sales and tourism revenue. The county hosts over 400 wineries producing world-class wines. Wine tourism attracts millions of visitors annually, supporting restaurants, hotels, and services.',
    uniqueFeatures: 'Napa Valley achieved the first American Viticultural Area designation in 1981. The region produces wines that compete with the finest French wines. Culinary tourism complements wine tourism with world-renowned restaurants.',
    culturalHeritage: 'Wappo and Pomo peoples lived in the valley for thousands of years. European immigrant winemaking traditions continue today. The region represents California wine culture and agricultural heritage.',
    geographicalSignificance: 'The Napa Valley runs north-south between the Vaca and Mayacamas mountain ranges. Mediterranean climate with warm days and cool nights creates ideal wine growing conditions. Diverse soils and microclimates support different grape varieties.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Wappo and Pomo peoples',
      nationalParks: ['Bothe-Napa Valley State Park'],
      majorAttractions: ['Napa Valley wineries', 'Culinary Institute of America', 'Calistoga hot springs'],
      industries: ['Wine production', 'Tourism', 'Hospitality', 'Agriculture'],
      climate: 'Mediterranean with wine-growing microclimates',
      elevation: 'Sea level to 4,000+ feet',
      notablePeople: ['Winemaking pioneers', 'Celebrity chefs'],
      historicalEvents: ['1860s Wine industry founding', '1920-1933 Prohibition era', '1976 Judgment of Paris', '1981 First AVA designation']
    }
  },
  {
    countyId: 'sonoma',
    historicalContext: 'Sonoma County was established in 1850, named after the Pomo word "sono-ma" meaning valley of the moon. The Bear Flag Revolt began in Sonoma in 1846. Russian fur traders established Fort Ross on the coast from 1812-1841.',
    economicImportance: 'Sonoma County is a major wine region producing diverse varieties from Pinot Noir to Cabernet Sauvignon. Agriculture includes dairy farming, apple orchards, and diverse crops. Tourism centered on wine country generates significant revenue.',
    uniqueFeatures: 'The county encompasses 13 distinct American Viticultural Areas with diverse microclimates. Fort Ross represents Russian colonial history in California. Coastal redwood forests extend inland from the Pacific.',
    culturalHeritage: 'Pomo peoples maintained complex societies for thousands of years. Russian heritage from Fort Ross period influences coastal areas. Wine culture and agricultural traditions define regional identity.',
    geographicalSignificance: 'The county stretches from the Pacific Ocean to inland valleys across multiple climate zones. The Russian River provides a major watershed and recreational corridor. Coastal fog influence creates ideal conditions for cool-climate wine varieties.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Pomo peoples with diverse tribal groups',
      nationalParks: ['Fort Ross State Historic Park', 'Armstrong Redwoods State Natural Reserve'],
      majorAttractions: ['Sonoma County wineries', 'Fort Ross', 'Russian River', 'Santa Rosa'],
      industries: ['Wine production', 'Agriculture', 'Tourism', 'Technology'],
      climate: 'Mediterranean with coastal to inland variation',
      elevation: 'Sea level to 4,000+ feet',
      notablePeople: ['Winemaking families', 'Agricultural pioneers'],
      historicalEvents: ['1812-1841 Russian period', '1846 Bear Flag Revolt', '1850 County formation', 'Modern wine development']
    }
  },

  // ==================== CENTRAL VALLEY REGION ====================
  {
    countyId: 'fresno',
    historicalContext: 'Fresno County was established in 1856, named after the Spanish word for ash tree. The Central Pacific Railroad arrival in 1872 transformed the region from cattle ranching to intensive agriculture. Massive irrigation projects beginning in the early 1900s created one of the world\'s most productive agricultural regions.',
    economicImportance: 'Fresno County leads the nation in agricultural production value at over $8 billion annually. The county produces more than 350 different crops including grapes, almonds, tomatoes, and citrus. Food processing and agricultural technology industries support the farming economy.',
    uniqueFeatures: 'The county encompasses both Central Valley floor and Sierra Nevada mountains, including parts of Kings Canyon and Sequoia National Parks. Fresno is the largest inland city in California. The region contains the world\'s largest contiguous area of Class I agricultural soil.',
    culturalHeritage: 'Yokuts peoples lived throughout the valley for thousands of years. Mexican land grants established large cattle ranches. Diverse immigrant communities including Armenian, Hmong, and Mexican families contribute to agricultural labor and cultural richness.',
    geographicalSignificance: 'Located in the heart of the San Joaquin Valley, Fresno County stretches from valley floor to high Sierra Nevada peaks. The San Joaquin River provides water for irrigation. Elevation ranges from 200 feet to over 14,000 feet in the mountains.',
    specificData: {
      established: '1856',
      indigenousHistory: 'Yokuts peoples including multiple tribal groups',
      nationalParks: ['Sequoia National Park (partial)', 'Kings Canyon National Park (partial)', 'Sierra National Forest'],
      majorAttractions: ['Forestiere Underground Gardens', 'Fresno Chaffee Zoo', 'Sierra Nevada foothills'],
      industries: ['Agriculture', 'Food processing', 'Transportation', 'Healthcare'],
      climate: 'Hot-summer Mediterranean to alpine',
      elevation: '200 to 14,000+ feet',
      notablePeople: ['Agricultural innovators', 'Immigrant community leaders'],
      historicalEvents: ['1856 County formation', '1872 Railroad arrival', 'Early 1900s Irrigation development', 'Agricultural mechanization']
    }
  },
  {
    countyId: 'kern',
    historicalContext: 'Kern County was established in 1866, named after the Kern River. The area was inhabited by Yokuts peoples before Spanish exploration. Oil discovery in the 1890s transformed the region into a major petroleum center. The county also became a major agricultural producer with irrigation development.',
    economicImportance: 'Kern County leads California in oil production, generating billions in revenue from petroleum extraction and refining. Agriculture produces over $7 billion annually, with the county leading in almonds, grapes, and citrus. The region also generates significant renewable energy from wind and solar.',
    uniqueFeatures: 'The county contains the southern end of the Central Valley and extends into the Tehachapi Mountains and Mojave Desert. Bakersfield serves as the county seat and oil industry center. The Kern River provides crucial water resources.',
    culturalHeritage: 'Yokuts peoples established settlements throughout the valley. Mexican rancheros established large cattle operations. Oil boom culture and agricultural development created distinct regional identity. Country music heritage earned Bakersfield recognition as a music center.',
    geographicalSignificance: 'Kern County encompasses diverse geography from Central Valley floor to desert and mountains. The Tehachapi Pass serves as a major transportation corridor. Climate ranges from valley Mediterranean to high desert conditions.',
    specificData: {
      established: '1866',
      indigenousHistory: 'Yokuts peoples throughout the valley',
      nationalParks: ['Sequoia National Forest (partial)'],
      majorAttractions: ['California Living Museum', 'Kern River', 'Tehachapi Mountains'],
      industries: ['Oil production', 'Agriculture', 'Renewable energy', 'Transportation'],
      climate: 'Hot-summer Mediterranean to desert',
      elevation: '300 to 8,000+ feet',
      notablePeople: ['Oil industry pioneers', 'Country music artists'],
      historicalEvents: ['1866 County formation', '1890s Oil discovery', 'Agricultural development', 'Renewable energy expansion']
    }
  },
  {
    countyId: 'kings',
    historicalContext: 'Kings County was established in 1893 from parts of Fresno and Tulare counties, named after the Kings River. The area was inhabited by Yokuts peoples who lived along the rivers and in valley communities. Large-scale agriculture developed with irrigation projects in the early 20th century.',
    economicImportance: 'Kings County produces over $2 billion in agricultural products annually, specializing in cotton, dairy, almonds, and pistachios. The county hosts major food processing facilities and agricultural technology companies. Dairy operations make it one of California\'s leading milk producers.',
    uniqueFeatures: 'The county lies entirely within the San Joaquin Valley with extremely flat terrain ideal for mechanized agriculture. Hanford serves as the county seat and agricultural center. The area features some of the most fertile agricultural soils in the world.',
    culturalHeritage: 'Yokuts peoples established numerous village sites along rivers and seasonal wetlands. Mexican land grants created large cattle ranches. Diverse agricultural communities include families from Mexico, Portugal, and other regions drawn by farming opportunities.',
    geographicalSignificance: 'Kings County occupies the southern San Joaquin Valley with elevations ranging from 200 to 300 feet. The Kings River and other waterways provide irrigation for intensive agriculture. The flat terrain and Mediterranean climate create ideal farming conditions.',
    specificData: {
      established: '1893',
      indigenousHistory: 'Yokuts peoples with riverside villages',
      nationalParks: [],
      majorAttractions: ['Hanford Carnegie Museum', 'China Alley Historic District'],
      industries: ['Agriculture', 'Dairy', 'Food processing', 'Logistics'],
      climate: 'Hot-summer Mediterranean',
      elevation: '200 to 300 feet',
      notablePeople: ['Agricultural pioneers'],
      historicalEvents: ['1893 County formation', 'Early 1900s Irrigation development', 'Agricultural mechanization']
    }
  },
  {
    countyId: 'madera',
    historicalContext: 'Madera County was established in 1893, named after the Spanish word for wood due to extensive timber operations. The area was inhabited by Yokuts and Mono peoples. Logging operations in the Sierra Nevada foothills provided timber for Central Valley development.',
    economicImportance: 'Madera County produces over $1 billion in agricultural products including almonds, grapes, and pistachios. The county benefits from Sierra Nevada water resources for irrigation. Tourism to Yosemite National Park provides additional economic activity.',
    uniqueFeatures: 'The county extends from Central Valley floor to high Sierra Nevada, including parts of Yosemite National Park. Madera serves as a gateway community to Yosemite. The area features diverse elevation zones from valley agriculture to alpine wilderness.',
    culturalHeritage: 'Yokuts peoples lived in valley areas while Mono peoples inhabited mountain regions. Mexican land grants established cattle ranches. Logging heritage includes timber operations that supplied lumber for valley development.',
    geographicalSignificance: 'Madera County spans from San Joaquin Valley to Sierra Nevada crest, creating dramatic elevation changes. The Fresno River and other waterways provide irrigation for agriculture. Highway 99 provides the main north-south transportation corridor.',
    specificData: {
      established: '1893',
      indigenousHistory: 'Yokuts (valley) and Mono (mountain) peoples',
      nationalParks: ['Yosemite National Park (partial)', 'Sierra National Forest'],
      majorAttractions: ['Yosemite gateway', 'Fossil Discovery Center'],
      industries: ['Agriculture', 'Tourism', 'Forestry', 'Transportation'],
      climate: 'Hot-summer Mediterranean to alpine',
      elevation: '200 to 13,000+ feet',
      notablePeople: ['Agricultural and logging pioneers'],
      historicalEvents: ['1893 County formation', 'Logging boom period', 'Yosemite tourism development']
    }
  },
  {
    countyId: 'merced',
    historicalContext: 'Merced County was established in 1855, named after the Merced River. Yokuts peoples lived throughout the valley in numerous villages. Mexican land grants created large cattle ranches. The Central Pacific Railroad and irrigation development transformed the region into intensive agriculture.',
    economicImportance: 'Merced County produces over $3 billion in agricultural products annually, specializing in dairy, almonds, and sweet potatoes. The University of California Merced, opened in 2005, contributes to education and research. Food processing facilities support agricultural production.',
    uniqueFeatures: 'UC Merced is the newest University of California campus, emphasizing research and innovation. The county serves as a gateway to Yosemite National Park. Castle Air Museum displays historic military aircraft.',
    culturalHeritage: 'Yokuts peoples established numerous settlements along rivers and seasonal wetlands. Mexican rancho period created large cattle operations. Diverse agricultural communities reflect immigration from many regions drawn by farming opportunities.',
    geographicalSignificance: 'Merced County lies in the northern San Joaquin Valley with the Merced River providing water resources. The flat terrain and Mediterranean climate support intensive agriculture. The county extends from valley floor to Sierra Nevada foothills.',
    specificData: {
      established: '1855',
      indigenousHistory: 'Yokuts peoples with extensive valley settlements',
      nationalParks: ['Yosemite National Park (partial)'],
      majorAttractions: ['UC Merced', 'Castle Air Museum', 'Merced National Wildlife Refuge'],
      industries: ['Agriculture', 'Education', 'Food processing', 'Transportation'],
      climate: 'Hot-summer Mediterranean',
      elevation: '100 to 4,000+ feet',
      notablePeople: ['UC Merced faculty and researchers'],
      historicalEvents: ['1855 County formation', 'Railroad development', '2005 UC Merced opening']
    }
  },
  {
    countyId: 'san_joaquin',
    historicalContext: 'San Joaquin County was established in 1850, named after the San Joaquin River. Yokuts peoples lived throughout the valley and delta regions. The discovery of gold brought miners, and the area became a supply center. Agriculture and transportation developed with railroad connections.',
    economicImportance: 'San Joaquin County benefits from strategic location at the confluence of Central Valley and San Francisco Bay Area transportation networks. Agriculture produces over $3 billion annually in crops including asparagus, wine grapes, and walnuts. The Port of Stockton provides inland shipping capabilities.',
    uniqueFeatures: 'Stockton serves as an inland port connected to San Francisco Bay via deep-water channels. The county encompasses part of the Sacramento-San Joaquin Delta with unique wetland ecosystems. University of the Pacific provides higher education.',
    culturalHeritage: 'Yokuts peoples established numerous villages in valley and delta areas. Mexican land grants created cattle ranches. Diverse agricultural communities include significant Filipino, Mexican, and other immigrant populations.',
    geographicalSignificance: 'San Joaquin County occupies the northern San Joaquin Valley and part of the Sacramento-San Joaquin Delta. The convergence of multiple rivers creates rich agricultural soils. Mediterranean climate supports diverse crop production.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Yokuts peoples throughout valley and delta',
      nationalParks: [],
      majorAttractions: ['Haggin Museum', 'University of the Pacific', 'Pixie Woods'],
      industries: ['Agriculture', 'Transportation', 'Logistics', 'Education'],
      climate: 'Hot-summer Mediterranean',
      elevation: 'Sea level to 3,000+ feet',
      notablePeople: ['Agricultural pioneers', 'University leaders'],
      historicalEvents: ['1850 County formation', 'Gold Rush supply center', 'Railroad development', 'Port development']
    }
  },
  {
    countyId: 'stanislaus',
    historicalContext: 'Stanislaus County was established in 1854, named after the Stanislaus River. Yokuts peoples lived in numerous villages throughout the valley. Mexican land grants created large cattle ranches. Railroad development and irrigation projects transformed the area into intensive agriculture.',
    economicImportance: 'Stanislaus County produces over $3 billion in agricultural products annually, specializing in dairy, almonds, and poultry. Major food processing companies including Foster Farms are headquartered in the county. The agricultural economy supports numerous related industries.',
    uniqueFeatures: 'Modesto serves as the county seat and agricultural center. The county is known as the birthplace of cruising culture immortalized in the movie "American Graffiti." California State University Stanislaus provides higher education.',
    culturalHeritage: 'Yokuts peoples established extensive settlements along rivers and seasonal wetlands. Mexican rancho culture influenced early development. Agricultural communities reflect diverse immigration drawn by farming opportunities.',
    geographicalSignificance: 'Stanislaus County lies in the northern San Joaquin Valley with the Stanislaus and Tuolumne rivers providing water resources. The flat terrain and Mediterranean climate create ideal conditions for agriculture. The county extends from valley floor to Sierra Nevada foothills.',
    specificData: {
      established: '1854',
      indigenousHistory: 'Yokuts peoples with extensive valley presence',
      nationalParks: [],
      majorAttractions: ['McHenry Mansion', 'Gallo Center for the Arts', 'Knights Ferry'],
      industries: ['Agriculture', 'Food processing', 'Manufacturing', 'Education'],
      climate: 'Hot-summer Mediterranean',
      elevation: '100 to 4,000+ feet',
      notablePeople: ['Ernest and Julio Gallo', 'George Lucas (American Graffiti)'],
      historicalEvents: ['1854 County formation', 'Railroad development', 'Food processing industry growth']
    }
  },
  {
    countyId: 'tulare',
    historicalContext: 'Tulare County was established in 1852, named after Tulare Lake which was once the largest freshwater lake west of the Mississippi. Yokuts peoples lived around the lake and throughout the valley. Agricultural development drained the lake for farmland by the early 1900s.',
    economicImportance: 'Tulare County leads the nation in agricultural production value at over $7 billion annually. The county produces more milk than any other county in the United States. Major crops include grapes, oranges, almonds, and cotton.',
    uniqueFeatures: 'The county encompasses both Central Valley agriculture and Sierra Nevada mountains, including parts of Sequoia and Kings Canyon National Parks. Visalia serves as the county seat and gateway to the national parks. The area contains some of the world\'s largest trees.',
    culturalHeritage: 'Yokuts peoples lived around Tulare Lake and throughout the valley in numerous villages. Mexican land grants established cattle ranches. Diverse agricultural communities include significant Latino population drawn by farm work opportunities.',
    geographicalSignificance: 'Tulare County spans from San Joaquin Valley floor to high Sierra Nevada, creating dramatic elevation changes from 200 feet to over 14,000 feet. The Kings and Kaweah rivers provide water for irrigation. The former Tulare Lake basin contains some of the richest agricultural soils.',
    specificData: {
      established: '1852',
      indigenousHistory: 'Yokuts peoples around Tulare Lake and valley',
      nationalParks: ['Sequoia National Park (partial)', 'Kings Canyon National Park (partial)'],
      majorAttractions: ['Sequoia National Park gateway', 'Mooney Grove Park', 'World Ag Expo'],
      industries: ['Agriculture', 'Dairy', 'Food processing', 'Tourism'],
      climate: 'Hot-summer Mediterranean to alpine',
      elevation: '200 to 14,494 feet (Mount Whitney)',
      notablePeople: ['Agricultural innovators'],
      historicalEvents: ['1852 County formation', 'Tulare Lake drainage', 'National park establishment', 'Agricultural mechanization']
    }
  },

  // ==================== NORTHERN CALIFORNIA REGION ====================
  {
    countyId: 'butte',
    historicalContext: 'Butte County was established in 1850, named after the Sutter Buttes. The area was inhabited by Maidu peoples for thousands of years. Gold discovery brought miners and led to conflicts with Native Americans. The town of Chico was founded in 1860 by John Bidwell.',
    economicImportance: 'Butte County\'s economy centers on agriculture, with almonds, rice, and walnuts as major crops. California State University Chico contributes significantly to the regional economy. Tourism to natural areas and the university supports service industries.',
    uniqueFeatures: 'The county encompasses diverse geography from Central Valley floor to Sierra Nevada foothills and Cascade Range. Bidwell Park in Chico is one of the largest municipal parks in the United States. The area features numerous natural springs and recreational opportunities.',
    culturalHeritage: 'Maidu peoples maintained sophisticated societies for thousands of years. Pioneer heritage includes John Bidwell\'s agricultural innovations. The university creates a college town culture in Chico.',
    geographicalSignificance: 'Butte County spans multiple geographic regions from valley floor to mountains. The Sacramento River provides water resources. Climate ranges from Mediterranean valley conditions to montane forest environments.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Maidu peoples including Konkow and other groups',
      nationalParks: ['Lassen National Forest (partial)'],
      majorAttractions: ['Bidwell Park', 'CSU Chico', 'Oroville Dam', 'Table Mountain'],
      industries: ['Agriculture', 'Education', 'Tourism', 'Manufacturing'],
      climate: 'Mediterranean valley to montane',
      elevation: '100 to 7,000+ feet',
      notablePeople: ['John Bidwell (pioneer)', 'Annie Bidwell (philanthropist)'],
      historicalEvents: ['1850 County formation', '1860 Chico founding', 'Gold Rush period', 'University establishment']
    }
  },
  {
    countyId: 'colusa',
    historicalContext: 'Colusa County was established in 1850, named after the Colusi people, a Patwin tribe. The area was part of large Mexican land grants before American settlement. Agriculture developed with irrigation from the Sacramento River beginning in the late 1800s.',
    economicImportance: 'Colusa County\'s economy is almost entirely agricultural, producing rice, almonds, walnuts, and other crops. The county is a major rice producer in California. Small-scale agriculture and related services dominate the rural economy.',
    uniqueFeatures: 'The county is one of California\'s smallest and most rural, maintaining agricultural character. Colusa serves as a small agricultural town and county seat. The Sacramento River provides the primary water source for irrigation.',
    culturalHeritage: 'Patwin peoples including the Colusi tribe lived along the Sacramento River for thousands of years. Mexican land grant heritage influenced early development. Rural agricultural traditions continue today.',
    geographicalSignificance: 'Colusa County lies in the Sacramento Valley along the west side of the Sacramento River. The flat terrain and Mediterranean climate support intensive agriculture. The county represents traditional Central Valley farming.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Patwin peoples including Colusi tribe',
      nationalParks: [],
      majorAttractions: ['Colusa-Sacramento River State Recreation Area', 'Colusa County Courthouse'],
      industries: ['Agriculture', 'Food processing'],
      climate: 'Hot-summer Mediterranean',
      elevation: '100 to 3,000+ feet',
      notablePeople: ['Agricultural pioneers'],
      historicalEvents: ['1850 County formation', 'Mexican land grant period', 'Agricultural development']
    }
  },
  {
    countyId: 'glenn',
    historicalContext: 'Glenn County was established in 1891 from parts of Colusa County, named after Dr. Hugh J. Glenn, a large landowner. The area was inhabited by Wintun peoples. Mexican land grants created large cattle ranches. Agriculture developed with Sacramento Valley irrigation projects.',
    economicImportance: 'Glenn County\'s economy centers on agriculture, producing rice, almonds, walnuts, and livestock. The county is a significant rice producer in the Sacramento Valley. Agricultural processing and related services support the rural economy.',
    uniqueFeatures: 'The county maintains rural agricultural character with small towns and farming communities. Willows serves as the county seat and agricultural center. The area features some of the most productive agricultural soils in California.',
    culturalHeritage: 'Wintun peoples lived along streams and rivers for thousands of years. Mexican rancho period established cattle operations. Rural agricultural traditions and community values continue today.',
    geographicalSignificance: 'Glenn County lies in the Sacramento Valley with the Sacramento River forming the eastern boundary. The flat valley floor and Mediterranean climate create ideal farming conditions. The Coast Range forms the western boundary.',
    specificData: {
      established: '1891',
      indigenousHistory: 'Wintun peoples along waterways',
      nationalParks: ['Mendocino National Forest (partial)'],
      majorAttractions: ['Black Butte Lake', 'Willows Museum'],
      industries: ['Agriculture', 'Livestock', 'Food processing'],
      climate: 'Hot-summer Mediterranean',
      elevation: '100 to 7,000+ feet',
      notablePeople: ['Dr. Hugh J. Glenn (landowner)'],
      historicalEvents: ['1891 County formation', 'Agricultural development', 'Irrigation projects']
    }
  },
  {
    countyId: 'lassen',
    historicalContext: 'Lassen County was established in 1864, named after Peter Lassen, a Danish pioneer. The area was inhabited by Maidu, Paiute, and Pit River peoples. Logging and ranching drove early economic development. The county encompasses diverse landscapes from high desert to volcanic mountains.',
    economicImportance: 'Lassen County\'s economy relies on government employment, ranching, and timber. The county hosts Lassen Volcanic National Park, generating tourism revenue. Geothermal energy development provides some economic activity.',
    uniqueFeatures: 'Lassen Volcanic National Park protects active volcanic features including hot springs, mud pots, and fumaroles. The county encompasses diverse ecosystems from Great Basin desert to Cascade Range forests. Susanville serves as the county seat.',
    culturalHeritage: 'Multiple Native American tribes including Maidu, Paiute, and Pit River peoples have traditional territories in the region. Pioneer heritage includes Peter Lassen\'s trail and settlement efforts. Rural ranching culture continues today.',
    geographicalSignificance: 'Lassen County spans the transition between the Sierra Nevada, Cascade Range, and Great Basin. Lassen Peak represents recent volcanic activity. The county features high elevation plateaus and mountain valleys.',
    specificData: {
      established: '1864',
      indigenousHistory: 'Maidu, Paiute, and Pit River peoples',
      nationalParks: ['Lassen Volcanic National Park', 'Lassen National Forest'],
      majorAttractions: ['Lassen Volcanic National Park', 'Susanville', 'Eagle Lake'],
      industries: ['Government', 'Tourism', 'Ranching', 'Forestry'],
      climate: 'High desert to montane',
      elevation: '4,000 to 10,457 feet (Lassen Peak)',
      notablePeople: ['Peter Lassen (pioneer)'],
      historicalEvents: ['1864 County formation', 'Lassen Trail period', 'National park establishment']
    }
  },
  {
    countyId: 'modoc',
    historicalContext: 'Modoc County was established in 1874, named after the Modoc people. The area was the site of the Modoc War (1872-1873), one of the last Indian wars in California. Ranching and logging developed in the late 1800s. The county remains rural and sparsely populated.',
    economicImportance: 'Modoc County\'s economy centers on ranching, particularly cattle and hay production. Government employment provides significant jobs. Tourism to natural areas generates some revenue, though the county remains one of California\'s poorest.',
    uniqueFeatures: 'The county is California\'s northeastern corner, featuring high desert plateaus and volcanic landscapes. Alturas serves as the county seat and largest town. The area maintains frontier character with vast open spaces.',
    culturalHeritage: 'Modoc peoples fought to maintain their homeland in the Modoc War of 1872-1873. Ranching heritage from the late 1800s continues today. Rural culture emphasizes self-reliance and traditional values.',
    geographicalSignificance: 'Modoc County lies on the Modoc Plateau, a high elevation volcanic region. The county borders Oregon and Nevada, representing California\'s most remote corner. Climate is high desert with cold winters and warm summers.',
    specificData: {
      established: '1874',
      indigenousHistory: 'Modoc people with Captain Jack and other leaders',
      nationalParks: ['Modoc National Forest', 'Lava Beds National Monument'],
      majorAttractions: ['Lava Beds National Monument', 'Modoc National Wildlife Refuge'],
      industries: ['Ranching', 'Government', 'Tourism'],
      climate: 'High desert with cold winters',
      elevation: '4,000 to 9,000+ feet',
      notablePeople: ['Captain Jack (Modoc leader)', 'Ranching families'],
      historicalEvents: ['1872-1873 Modoc War', '1874 County formation', 'Ranching development']
    }
  },
  {
    countyId: 'plumas',
    historicalContext: 'Plumas County was established in 1854, named after the Feather River (Rio de las Plumas). The area was inhabited by Mountain Maidu peoples. Gold mining brought development, followed by extensive logging operations. The Western Pacific Railroad provided transportation through the mountains.',
    economicImportance: 'Plumas County\'s economy relies on government employment, tourism, and some timber operations. The county\'s natural beauty attracts visitors for outdoor recreation. Retirees and telecommuters contribute to the modern economy.',
    uniqueFeatures: 'The county encompasses rugged Sierra Nevada and Cascade Range mountains with numerous lakes and forests. Quincy serves as the county seat in a mountain valley. The area features some of California\'s most pristine wilderness areas.',
    culturalHeritage: 'Mountain Maidu peoples lived in the region for thousands of years, adapting to high elevation environments. Gold Rush and logging heritage shaped early development. Rural mountain culture emphasizes outdoor recreation and self-reliance.',
    geographicalSignificance: 'Plumas County lies in the northern Sierra Nevada with elevations ranging from 2,000 to over 8,000 feet. The Middle Fork Feather River provides major watershed. Climate ranges from Mediterranean foothills to alpine conditions.',
    specificData: {
      established: '1854',
      indigenousHistory: 'Mountain Maidu peoples',
      nationalParks: ['Plumas National Forest', 'Lassen National Forest (partial)'],
      majorAttractions: ['Plumas-Eureka State Park', 'Feather River', 'Lakes Basin'],
      industries: ['Government', 'Tourism', 'Forestry', 'Recreation'],
      climate: 'Mediterranean montane to alpine',
      elevation: '2,000 to 8,000+ feet',
      notablePeople: ['Mountain pioneers and miners'],
      historicalEvents: ['1854 County formation', 'Gold Rush period', 'Logging boom', 'Railroad construction']
    }
  },
  {
    countyId: 'shasta',
    historicalContext: 'Shasta County was established in 1850, named after Mount Shasta or the Shasta people. The area was inhabited by multiple Native American tribes. Gold discovery brought miners and conflicts with indigenous peoples. The city of Redding developed as a railroad and agricultural center.',
    economicImportance: 'Shasta County\'s economy includes government employment, healthcare, retail, and tourism. Shasta Dam and Lake Shasta generate hydroelectric power and recreation revenue. Agriculture and timber provide rural employment.',
    uniqueFeatures: 'Mount Shasta at 14,179 feet dominates the landscape as a sacred peak and outdoor recreation destination. Shasta Lake is California\'s largest reservoir. The county encompasses diverse geography from valley floor to alpine peaks.',
    culturalHeritage: 'Multiple Native American tribes including Wintu, Pit River, and Shasta peoples have traditional territories. Gold Rush heritage includes historic mining towns. Mount Shasta attracts spiritual seekers and outdoor enthusiasts.',
    geographicalSignificance: 'Shasta County spans from Sacramento Valley to Cascade Range peaks. Mount Shasta represents a prominent volcanic cone. The Sacramento River begins in the county and flows south through California.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Wintu, Pit River, Shasta, and other tribes',
      nationalParks: ['Shasta-Trinity National Forest', 'Whiskeytown National Recreation Area'],
      majorAttractions: ['Mount Shasta', 'Shasta Lake', 'Sundial Bridge', 'Burney Falls'],
      industries: ['Government', 'Healthcare', 'Tourism', 'Agriculture'],
      climate: 'Mediterranean valley to alpine',
      elevation: '500 to 14,179 feet (Mount Shasta)',
      notablePeople: ['Native American leaders', 'John Muir (visitor)'],
      historicalEvents: ['1850 County formation', 'Gold Rush conflicts', 'Dam construction', 'Railroad development']
    }
  },
  {
    countyId: 'siskiyou',
    historicalContext: 'Siskiyou County was established in 1852, named after the Siskiyou Mountains. The area was inhabited by diverse Native American tribes including Karuk, Yurok, and Shasta peoples. Gold mining drove early development, followed by agriculture and timber. The county encompasses vast wilderness areas.',
    economicImportance: 'Siskiyou County\'s economy relies on government employment, ranching, timber, and tourism. The county\'s natural resources support small-scale logging and agricultural operations. Outdoor recreation attracts visitors to wilderness areas.',
    uniqueFeatures: 'The county contains California\'s portion of the Cascade Range and Klamath Mountains. Yreka serves as the county seat and historic gold rush town. The area features some of California\'s most remote and pristine wilderness.',
    culturalHeritage: 'Multiple Native American tribes maintain traditional territories and cultural practices. Gold Rush heritage includes historic mining camps and towns. Rural culture emphasizes independence and connection to the land.',
    geographicalSignificance: 'Siskiyou County borders Oregon and encompasses mountainous terrain with numerous wilderness areas. The Klamath River system provides major watershed. Climate ranges from Mediterranean valleys to alpine conditions.',
    specificData: {
      established: '1852',
      indigenousHistory: 'Karuk, Yurok, Shasta, and other tribes',
      nationalParks: ['Klamath National Forest', 'Six Rivers National Forest (partial)'],
      majorAttractions: ['Castle Lake', 'Yreka', 'Marble Mountain Wilderness'],
      industries: ['Government', 'Ranching', 'Forestry', 'Tourism'],
      climate: 'Mediterranean to alpine',
      elevation: '2,000 to 9,000+ feet',
      notablePeople: ['Native American leaders', 'Pioneer families'],
      historicalEvents: ['1852 County formation', 'Gold Rush period', 'Timber industry development']
    }
  },
  {
    countyId: 'sutter',
    historicalContext: 'Sutter County was established in 1850, named after John Sutter of gold discovery fame. The area was inhabited by Maidu peoples along the rivers. Mexican land grants established large ranches. The county developed agriculture with Sacramento River irrigation.',
    economicImportance: 'Sutter County\'s economy centers on agriculture, producing rice, almonds, walnuts, and peaches. The county is a major rice producer in the Sacramento Valley. Food processing and agricultural services support the farming economy.',
    uniqueFeatures: 'The Sutter Buttes rise dramatically from the valley floor, forming the world\'s smallest mountain range. Yuba City serves as the largest city and economic center. The county maintains agricultural character despite urban pressures.',
    culturalHeritage: 'Maidu peoples lived along rivers and in valley areas for thousands of years. John Sutter\'s agricultural empire influenced early development. Significant Sikh population has contributed to agriculture and cultural diversity.',
    geographicalSignificance: 'Sutter County lies in the Sacramento Valley with the Feather and Sacramento rivers providing water resources. The Sutter Buttes create a unique geological formation in the valley. Mediterranean climate supports diverse agriculture.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Maidu peoples along rivers',
      nationalParks: [],
      majorAttractions: ['Sutter Buttes', 'Bok Kai Temple', 'Community Memorial Museum'],
      industries: ['Agriculture', 'Food processing', 'Government'],
      climate: 'Hot-summer Mediterranean',
      elevation: '100 to 2,100+ feet (Sutter Buttes)',
      notablePeople: ['John Sutter', 'Sikh community leaders'],
      historicalEvents: ['1850 County formation', 'Gold Rush connection', 'Agricultural development', 'Sikh immigration']
    }
  },
  {
    countyId: 'tehama',
    historicalContext: 'Tehama County was established in 1856, named after the Tehama people, a Wintun tribe. The area was inhabited by Wintun and Yana peoples. Mexican land grants created large cattle ranches. Agriculture and lumber developed with Sacramento River access.',
    economicImportance: 'Tehama County\'s economy includes agriculture, particularly almonds, walnuts, and olives. Government employment provides significant jobs. Tourism to Red Bluff and natural areas contributes to the economy.',
    uniqueFeatures: 'The county spans from Sacramento Valley to Cascade Range foothills. Red Bluff serves as the county seat and agricultural center. The area features transition from valley agriculture to mountain forests.',
    culturalHeritage: 'Wintun and Yana peoples lived throughout the region for thousands of years. Mexican rancho heritage influenced early development. Rural agricultural traditions continue today.',
    geographicalSignificance: 'Tehama County lies in the northern Sacramento Valley with the Sacramento River providing water resources. The Coast Range forms the western boundary. Climate ranges from Mediterranean valley to montane conditions.',
    specificData: {
      established: '1856',
      indigenousHistory: 'Wintun and Yana peoples',
      nationalParks: ['Lassen National Forest (partial)'],
      majorAttractions: ['Red Bluff', 'Sacramento River', 'Lassen Volcanic National Park (nearby)'],
      industries: ['Agriculture', 'Government', 'Tourism'],
      climate: 'Hot-summer Mediterranean to montane',
      elevation: '200 to 7,000+ feet',
      notablePeople: ['William Ide (Bear Flag leader)', 'Agricultural pioneers'],
      historicalEvents: ['1856 County formation', 'Mexican land grant period', 'Agricultural development']
    }
  },
  {
    countyId: 'trinity',
    historicalContext: 'Trinity County was established in 1850, named after the Trinity River. The area was inhabited by Hoopa, Yurok, and Wintu peoples. Gold mining brought development and conflicts with Native Americans. The county remains one of California\'s most rural and forested.',
    economicImportance: 'Trinity County\'s economy relies on government employment, tourism, and cannabis cultivation. The county\'s remote location and wilderness character attract visitors. Marijuana cultivation, both legal and illegal, provides significant economic activity.',
    uniqueFeatures: 'Trinity County is California\'s third largest but least populated county. The Trinity Alps Wilderness provides pristine mountain recreation. Weaverville serves as the county seat and historic gold rush town.',
    culturalHeritage: 'Multiple Native American tribes maintain traditional territories and cultural practices. Gold Rush heritage includes Chinese and European mining communities. Rural culture emphasizes independence and environmental values.',
    geographicalSignificance: 'Trinity County encompasses rugged Klamath Mountains with numerous wilderness areas. The Trinity River system provides major watershed. Climate ranges from Mediterranean valleys to alpine conditions.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Hoopa, Yurok, Wintu, and other tribes',
      nationalParks: ['Shasta-Trinity National Forest', 'Six Rivers National Forest (partial)'],
      majorAttractions: ['Trinity Alps Wilderness', 'Weaverville', 'Trinity Lake'],
      industries: ['Government', 'Tourism', 'Cannabis', 'Forestry'],
      climate: 'Mediterranean to alpine',
      elevation: '1,000 to 9,000+ feet',
      notablePeople: ['Native American leaders', 'Environmental activists'],
      historicalEvents: ['1850 County formation', 'Gold Rush period', 'Chinese mining communities', 'Wilderness designation']
    }
  },
  {
    countyId: 'yolo',
    historicalContext: 'Yolo County was established in 1850, named after the Yolo people, a Patwin tribe. The area was inhabited by Patwin peoples along waterways. Mexican land grants created large cattle ranches. The University of California Davis transformed the region into an agricultural research center.',
    economicImportance: 'Yolo County\'s economy centers on agriculture and education, with UC Davis as a major employer and research institution. The county produces diverse crops including tomatoes, rice, and wine grapes. Agricultural technology and research drive innovation.',
    uniqueFeatures: 'UC Davis is a world-renowned agricultural and veterinary research university. The county balances agricultural production with environmental conservation. Woodland serves as the county seat.',
    culturalHeritage: 'Patwin peoples including the Yolo tribe lived along Cache Creek and other waterways. UC Davis creates a college town atmosphere in Davis. Agricultural innovation and research define regional identity.',
    geographicalSignificance: 'Yolo County lies in the Sacramento Valley west of the Sacramento River. Cache Creek and other waterways provide irrigation. The Coast Range forms the western boundary with Mediterranean climate throughout.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Patwin peoples including Yolo tribe',
      nationalParks: [],
      majorAttractions: ['UC Davis', 'California Raptor Center', 'Capay Valley'],
      industries: ['Education', 'Agriculture', 'Research', 'Government'],
      climate: 'Hot-summer Mediterranean',
      elevation: '100 to 3,000+ feet',
      notablePeople: ['UC Davis faculty and researchers'],
      historicalEvents: ['1850 County formation', '1905 UC Davis founding', 'Agricultural research development']
    }
  },
  {
    countyId: 'yuba',
    historicalContext: 'Yuba County was established in 1850, named after the Yuba River. The area was inhabited by Maidu peoples. Gold discovery brought thousands of miners, and the county became a major gold-producing region. Hydraulic mining caused massive environmental damage to rivers and valleys.',
    economicImportance: 'Yuba County\'s economy includes agriculture, particularly rice and stone fruit production. Government employment at Beale Air Force Base provides significant jobs. The county struggles economically as one of California\'s poorest.',
    uniqueFeatures: 'The county encompasses both Sacramento Valley floor and Sierra Nevada foothills. Marysville serves as the county seat at the confluence of the Yuba and Feather rivers. The area features significant Gold Rush heritage.',
    culturalHeritage: 'Maidu peoples lived throughout the region for thousands of years. Gold Rush heritage includes hydraulic mining remnants and historic towns. The county reflects boom-bust mining cycles.',
    geographicalSignificance: 'Yuba County spans from Sacramento Valley to Sierra Nevada foothills. The Yuba River suffered severe damage from hydraulic mining. Climate ranges from Mediterranean valley to foothill conditions.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Maidu peoples including Nisenan groups',
      nationalParks: ['Tahoe National Forest (partial)'],
      majorAttractions: ['Empire Mine State Historic Park (nearby)', 'Yuba River'],
      industries: ['Agriculture', 'Military', 'Government'],
      climate: 'Hot-summer Mediterranean',
      elevation: '100 to 4,000+ feet',
      notablePeople: ['Gold Rush miners and pioneers'],
      historicalEvents: ['1850 County formation', 'Gold Rush boom', 'Hydraulic mining era', 'Environmental damage']
    }
  },

  // ==================== NORTHERN CALIFORNIA REGION (CONTINUED) ====================
  {
    countyId: 'sacramento',
    historicalContext: 'Sacramento County was established in 1850, named after the Sacramento River. The area was inhabited by Nisenan (Southern Maidu) peoples for thousands of years. Sacramento became California\'s capital in 1854, and the transcontinental railroad made it a major transportation hub.',
    economicImportance: 'As California\'s capital, Sacramento County hosts state government employment for over 200,000 workers. The regional economy includes healthcare, education, technology, and agriculture. UC Davis Medical Center and California State University Sacramento contribute significantly.',
    uniqueFeatures: 'Sacramento serves as California\'s capital city and the state government center. The county encompasses both urban areas and agricultural lands. The American River Parkway provides 32 miles of recreational corridor through the metropolitan area.',
    culturalHeritage: 'Nisenan peoples established numerous villages along rivers and oak groves. California state government heritage includes the historic Capitol building. The county reflects California\'s political and cultural development.',
    geographicalSignificance: 'Sacramento County lies at the confluence of the Sacramento and American rivers in the Central Valley. The flat terrain and Mediterranean climate support both urban development and agriculture. The county serves as a transportation hub for Northern California.',
    specificData: {
      established: '1850',
      indigenousHistory: 'Nisenan (Southern Maidu) peoples',
      nationalParks: ['American River Parkway'],
      majorAttractions: ['California State Capitol', 'Old Sacramento', 'Crocker Art Museum', 'American River'],
      industries: ['Government', 'Healthcare', 'Education', 'Technology'],
      climate: 'Hot-summer Mediterranean',
      elevation: 'Sea level to 4,000+ feet',
      notablePeople: ['California governors and political leaders'],
      historicalEvents: ['1850 County formation', '1854 Capital designation', 'Gold Rush period', 'Railroad development']
    }
  }
];

// Export function to get education data by county ID
export function getCountyEducationComplete(countyId: string): CountyEducation | null {
  // Convert hyphens to underscores to match the data format
  const normalizedId = countyId.toLowerCase().replace(/-/g, '_');
  const education = countyEducationData.find(e => e.countyId === normalizedId);
  return education || null;
}