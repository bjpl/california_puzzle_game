// Comprehensive Educational Content for California Counties
// Rich narratives, historical context, and detailed information for Study Mode

export interface CountyEducation {
  countyId: string;
  historicalContext: string;        // History & Context - full paragraphs
  economicImportance: string;       // Economic Importance - detailed info
  uniqueFeatures: string;          // Unique Features - complete descriptions
  culturalHeritage: string;        // Cultural Heritage - rich narratives
  geographicalSignificance: string; // Geographic importance
  specificData: {                  // Specific verified data
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
  // SOUTHERN CALIFORNIA REGION
  {
    countyId: 'los-angeles',
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
    countyId: 'san-diego',
    historicalContext: 'San Diego has been referred to as the "Birthplace of California," as it was the first site visited and settled by Europeans on what is now the West Coast of the United States. The Kumeyaay, Yuman-speaking people of Hokan stock, have lived in this region for more than 10,000 years. In May 1769, Portolà established the Presidio of San Diego on a hill near the San Diego River above the Kumeyaay village of Cosoy. Mission San Diego de Alcalá was founded on July 16, 1769, by Spanish friar Junípero Serra. In 1821, Mexico won its independence from Spain, and San Diego became part of the Mexican territory of Alta California. San Diego officially became part of the U.S. in 1848, and the town was named the seat of San Diego County when California was granted statehood in 1850.',
    economicImportance: 'San Diego County\'s economy exceeds $250 billion in GDP, driven by military defense, tourism, international trade, and biotechnology. The military contributes over $28 billion annually, with major installations including Naval Base San Diego, Marine Corps Base Camp Pendleton, and Naval Air Station North Island. The biotech industry, anchored by over 1,200 companies, generates $41 billion in economic activity. Tourism attracts 35 million visitors annually, contributing $11.6 billion. The Port of San Diego handles $8 billion in trade yearly. Agriculture, particularly avocados and nursery products, adds $1.75 billion annually.',
    uniqueFeatures: 'San Diego County covers 4,526 square miles, making it larger than Connecticut and Rhode Island combined. It features 70 miles of pristine coastline and the most temperate climate in the continental United States. The county contains the busiest international border crossing in the Western Hemisphere at San Ysidro. Balboa Park, at 1,200 acres, is one of the largest urban cultural parks in North America, housing 17 museums, numerous art venues, and the world-famous San Diego Zoo. The county maintains 340 parks and preserves, including Anza-Borrego Desert State Park, California\'s largest state park.',
    culturalHeritage: 'San Diego County\'s proximity to Mexico creates a unique bicultural environment where Mexican and American influences blend seamlessly. The region preserves its Spanish colonial heritage through Mission San Diego, Old Town San Diego State Historic Park, and numerous adobe structures. The county is home to 18 Native American reservations, more than any other county in the United States. The annual Comic-Con International has become a global cultural phenomenon, attracting over 130,000 attendees. The craft beer movement thrives here with over 150 breweries, earning San Diego the title "Capital of Craft."',
    geographicalSignificance: 'San Diego County encompasses remarkable geographic diversity, from Pacific beaches through coastal mesas, inland valleys, and mountains to the Colorado Desert. The Peninsular Ranges, including the Laguna, Cuyamaca, and Volcan Mountains, create distinct climate zones. The county sits at the intersection of two major floristic provinces, supporting exceptional biodiversity with over 1,500 native plant species. The San Diego River watershed covers 440 square miles, historically providing water for Native Americans and early settlers.',
    specificData: {
      established: 'February 18, 1850',
      indigenousHistory: 'Kumeyaay (Diegueño), Luiseño, Cahuilla, and Cupeño peoples',
      nationalParks: ['Cabrillo National Monument'],
      majorAttractions: ['San Diego Zoo', 'SeaWorld', 'Balboa Park', 'USS Midway Museum', 'La Jolla Cove', 'Coronado Beach', 'LEGOLAND California'],
      industries: ['Military Defense', 'Tourism', 'Biotechnology', 'Healthcare', 'Telecommunications', 'Agriculture'],
      climate: 'Mediterranean climate, average 70°F, 10 inches rainfall annually',
      elevation: 'Sea level to 6,533 feet (Hot Springs Mountain)',
      notablePeople: ['Ted Williams', 'Gregory Peck', 'Jonas Salk', 'Theodore Geisel (Dr. Seuss)', 'Tony Hawk', 'Cameron Diaz'],
      historicalEvents: ['1542 Cabrillo landing', '1769 Mission founding', '1846 Battle of San Pasqual', '1915 Panama-California Exposition', '1935 California Pacific International Exposition', '1969 San Diego State College protests']
    }
  },
  {
    countyId: 'orange',
    historicalContext: 'In 1889, Orange County officially separated from Los Angeles County, with Santa Ana as its seat. The California legislature divided Los Angeles County and created Orange County as a separate political entity on March 11, 1889. The county is said to have been named for the citrus fruit in an attempt to promote immigration by suggesting a semi-tropical paradise. Anaheim was founded by fifty German families in 1857 and incorporated as the second city in Los Angeles County on March 18, 1876. Disney acquired 160 acres of orange groves and walnut trees in Anaheim, and Disneyland opened in 1955 in a former orange grove, transforming the region from agricultural land to a major tourist destination.',
    economicImportance: 'As Disneyland Resort marks its 70th anniversary, the total economic impact of its two Anaheim theme parks, hotels and retail district is $16.1 billion on the Southern California region. Disneyland Resort is the largest employer in Orange County with 36,000 cast members. Disneyland is Anaheim\'s largest taxpayer, paying over $125 million in taxes to Anaheim and its schools annually. The resort generates $279 million in tax revenue for the City of Anaheim, including $194 million paid directly by Disneyland Resort. Tourism remains a vital aspect of Orange County\'s economy, with Disneyland being the second most visited theme park in the world with 17.25 million visitors in 2023.',
    uniqueFeatures: 'Orange County encompasses 948 square miles with 42 miles of coastline featuring world-renowned beaches. Despite being the smallest county in Southern California, it\'s the third most populous in California. The county contains 34 incorporated cities, each maintaining distinct character from beach communities to master-planned cities like Irvine. South Coast Plaza in Costa Mesa is the highest-grossing shopping center in the United States with $2 billion in annual sales. The county maintains over 60,000 acres of parkland and open space, including regional wilderness preserves.',
    culturalHeritage: 'Orange County represents a fascinating cultural evolution from conservative bastion to diverse, multicultural region. Little Saigon in Westminster is the largest Vietnamese community outside Vietnam. The county preserves its Mexican heritage through historic sites like Mission San Juan Capistrano and Los Rios Historic District. Surf culture originated here at Huntington Beach, "Surf City USA." The Crystal Cathedral (now Christ Cathedral) pioneered megachurch architecture. The county\'s performing arts scene includes Segerstrom Center for the Arts, one of the largest arts complexes in California.',
    geographicalSignificance: 'Orange County features diverse geography from Pacific beaches through coastal plains to the Santa Ana Mountains (Saddleback) reaching 5,689 feet. The Santa Ana River, Southern California\'s largest river system, flows through the county. The Mediterranean climate and coastal influence create ideal conditions for year-round outdoor activities. The San Joaquin Hills and San Onofre Breccia geological formations provide unique landscapes. Wetlands like Upper Newport Bay Ecological Reserve support critical habitat for migrating birds along the Pacific Flyway.',
    specificData: {
      established: 'March 11, 1889',
      indigenousHistory: 'Tongva (Gabrieleño) and Acjachemen (Juaneño) peoples',
      nationalParks: [],
      majorAttractions: ['Disneyland Resort', 'Knott\'s Berry Farm', 'Huntington Beach', 'Newport Beach', 'Mission San Juan Capistrano', 'Crystal Cove State Park'],
      industries: ['Tourism', 'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Fashion/Retail'],
      climate: 'Mediterranean climate, average 70°F, 13 inches rainfall annually',
      elevation: 'Sea level to 5,689 feet (Santiago Peak)',
      notablePeople: ['Richard Nixon', 'John Wayne', 'Steve Jobs (lived)', 'Gwen Stefani', 'Tiger Woods', 'Michelle Pfeiffer'],
      historicalEvents: ['1776 Mission founding', '1889 County formation', '1955 Disneyland opening', '1994 Orange County bankruptcy', '2003 Cedar Fire']
    }
  },

  // BAY AREA REGION
  {
    countyId: 'san-francisco',
    historicalContext: 'San Francisco County was one of the state\'s 18 original counties established at California statehood in 1850. In 1856, San Francisco became a consolidated city-county when the California state government divided the county - everything north of a line drawn across the tip of the San Francisco Peninsula became the new consolidated City and County of San Francisco. On June 29, 1776, settlers from New Spain established the Presidio of San Francisco at the Golden Gate and Mission San Francisco de Asís. The California Gold Rush starting in 1849 brought rapid growth. California was quickly granted statehood in 1850, and the U.S. military built Fort Point at the Golden Gate and a fort on Alcatraz Island to secure San Francisco Bay.',
    economicImportance: 'San Francisco County generates over $500 billion in GDP, ranking among the world\'s top 20 economies. The technology sector, with companies like Salesforce, Twitter, Uber, and Airbnb, drives economic growth. Financial services, anchored by Wells Fargo and Charles Schwab, manage trillions in assets. Tourism attracts 25 million visitors annually, generating $10 billion. The Port of San Francisco supports $2.1 billion in economic activity. The city hosts more than 30 international financial institutions and maintains the highest GDP per capita of any major U.S. city.',
    uniqueFeatures: 'San Francisco is the only consolidated city-county in California, encompassing an area of about 47 square miles. With about 47.9 square miles in area, San Francisco is the smallest county in the state. During the 1929 stock market crash and subsequent economic depression, not a single San Francisco-based bank failed. The region undertook two large infrastructure projects: construction of the Golden Gate Bridge connecting San Francisco with Marin County, and the Bay Bridge connecting San Francisco with Oakland and the East Bay. Known for its iconic landmarks like the Golden Gate Bridge, Alcatraz Island, and its historic cable cars, San Francisco is a popular tourist destination.',
    culturalHeritage: 'San Francisco stands as a beacon of cultural diversity and progressive values, with 34% foreign-born residents speaking over 100 languages. Chinatown, established in 1848, is the oldest and largest outside Asia. The Castro District serves as the symbolic heart of LGBTQ+ culture globally. The city birthed the Beat Generation in the 1950s, hippie counterculture in the 1960s, and continues fostering artistic innovation. Historic neighborhoods like North Beach (Little Italy), the Mission District (Latino culture), and Japantown preserve distinct cultural identities.',
    geographicalSignificance: 'San Francisco occupies the tip of a peninsula between San Francisco Bay and the Pacific Ocean, connected to Marin County by the Golden Gate Bridge and to the East Bay via the Bay Bridge. The city sits along the San Andreas and Hayward faults, making it seismically active. Its Mediterranean climate with cool, foggy summers results from cold California Current meeting warm inland air. The Golden Gate strait, only one mile wide, serves as the sole connection between San Francisco Bay and the Pacific Ocean.',
    specificData: {
      established: 'February 18, 1850',
      indigenousHistory: 'Ramaytush Ohlone peoples',
      nationalParks: ['Golden Gate National Recreation Area', 'San Francisco Maritime National Historical Park'],
      majorAttractions: ['Golden Gate Bridge', 'Alcatraz Island', 'Fisherman\'s Wharf', 'Golden Gate Park', 'Cable Cars', 'Chinatown', 'Palace of Fine Arts'],
      industries: ['Technology', 'Finance', 'Tourism', 'Healthcare', 'Professional Services', 'Biotechnology'],
      climate: 'Mediterranean climate, average 60°F, 23 inches rainfall annually',
      elevation: 'Sea level to 925 feet (Mount Davidson)',
      notablePeople: ['Dianne Feinstein', 'Nancy Pelosi', 'Jerry Brown', 'Maya Angelou', 'Bruce Lee', 'Steve Jobs'],
      historicalEvents: ['1849 Gold Rush', '1906 Earthquake', '1915 Panama-Pacific Exposition', '1945 UN Charter signing', '1967 Summer of Love', '1978 Moscone-Milk assassinations', '1989 Loma Prieta earthquake']
    }
  },
  {
    countyId: 'alameda',
    historicalContext: 'Alameda County was formed in 1853 from portions of Contra Costa and Santa Clara counties. The Ohlone people inhabited the East Bay for millennia before Spanish colonization brought Mission San José in 1797. The Gold Rush era saw rapid development, with Oakland emerging as the Bay Area\'s transportation hub. The county played a crucial role in World War II shipbuilding, with Kaiser Shipyards in Richmond employing over 90,000 workers. The Free Speech Movement at UC Berkeley in 1964 and the Black Panther Party founding in Oakland in 1966 established the county as a center of progressive activism.',
    economicImportance: 'Alameda County\'s economy exceeds $170 billion in GDP, driven by technology, healthcare, and education. The Port of Oakland, the third-busiest container port on the West Coast, handles $50 billion in trade annually. UC Berkeley contributes $8 billion to the regional economy while Lawrence Berkeley National Laboratory adds $1.8 billion. The biotechnology cluster in Emeryville and Fremont generates significant innovation. Wine production in Livermore Valley, one of California\'s oldest wine regions, contributes to agricultural diversity. Tesla\'s Fremont factory employs over 10,000 workers.',
    uniqueFeatures: 'Alameda County spans 813 square miles from San Francisco Bay to the Central Valley, encompassing urban centers, suburban communities, agricultural land, and wilderness areas. Lake Merritt in Oakland, created in 1869, was the United States\' first official wildlife refuge. The county includes portions of five regional parks districts managing over 100,000 acres. UC Berkeley houses 13 Nobel laureates and maintains one of the world\'s premier public research universities. The county features remarkable ethnic diversity, with no single ethnic group constituting a majority.',
    culturalHeritage: 'Alameda County epitomizes California\'s multicultural character, with Oakland alone speaking over 125 languages. The county preserves rich African American heritage, including the African American Museum and Library at Oakland. Berkeley\'s Telegraph Avenue remains iconic for counterculture and student activism. Fremont\'s Little Kabul hosts the largest Afghan community in the United States. The Niles district in Fremont was Charlie Chaplin\'s early filmmaking location. Jack London Square in Oakland celebrates the famous author\'s legacy.',
    geographicalSignificance: 'Alameda County features diverse geography from bay wetlands through urban flatlands to oak-studded hills and the Diablo Range. The Hayward Fault runs directly through populated areas, posing significant seismic risk. San Francisco Bay wetlands provide critical habitat for migrating birds along the Pacific Flyway. The Oakland Hills offer panoramic bay views but face persistent wildfire danger. Alameda Creek watershed, the largest tributary to San Francisco Bay, supports steelhead trout restoration efforts.',
    specificData: {
      established: 'March 25, 1853',
      indigenousHistory: 'Ohlone (Costanoan) peoples',
      nationalParks: [],
      majorAttractions: ['UC Berkeley campus', 'Oakland Museum of California', 'Chabot Space & Science Center', 'USS Hornet Museum', 'Tilden Regional Park', 'Jack London Square'],
      industries: ['Technology', 'Healthcare', 'Education', 'Biotechnology', 'Transportation/Logistics', 'Manufacturing'],
      climate: 'Mediterranean climate, average 60°F, 23 inches rainfall annually',
      elevation: 'Sea level to 3,849 feet (Rose Peak)',
      notablePeople: ['Jack London', 'Gertrude Stein', 'Bruce Lee', 'Tom Hanks', 'Zendaya', 'Kamala Harris'],
      historicalEvents: ['1853 County formation', '1869 Transcontinental Railroad completion', '1906 Earthquake refugee camps', '1946 General Strike', '1964 Free Speech Movement', '1966 Black Panther Party founding', '1989 Loma Prieta earthquake', '1991 Oakland Hills fire']
    }
  },

  // CENTRAL VALLEY REGION
  {
    countyId: 'sacramento',
    historicalContext: 'Sacramento is located at the confluence of the Sacramento River and the American River. John Sutter Sr. first arrived in the area on August 13, 1839, with a Mexican land grant of 50,000 acres. The history of Sacramento began with its founding by Samuel Brannan and John Augustus Sutter Jr. in 1848 around an embarcadero constructed at the confluence of the American and Sacramento Rivers. With a population of more than 10,000 in 1854, Sacramento was chosen as the state capital. The California State Legislature, with the support of Governor John Bigler, moved to Sacramento in 1854 after previously meeting in San Jose, Vallejo, and Benicia. In the Sacramento Constitutional Convention of 1879, Sacramento was named the permanent state capital.',
    economicImportance: 'Sacramento County\'s economy exceeds $75 billion in GDP, anchored by government employment as California\'s capital. State government provides 75,000 jobs, while healthcare systems including UC Davis Medical Center and Kaiser Permanente employ over 50,000. Agriculture remains significant, with wine grapes, pears, and corn contributing $500 million annually. The emerging technology sector, dubbed the "Next Economy," attracts clean tech and life sciences companies. The region processes 25% of the world\'s almonds through Blue Diamond Growers\' headquarters. Tourism generates $2.3 billion annually from 15 million visitors.',
    uniqueFeatures: 'Sacramento County covers 994 square miles at the heart of the Central Valley, where the Sacramento and American Rivers meet. The county maintains 15,000 acres of regional parks, including the 23-mile American River Parkway, one of the longest urban parkways in the United States. Old Sacramento, a 28-acre National Historic Landmark District, preserves the largest concentration of Gold Rush-era buildings in California. The California State Railroad Museum houses one of North America\'s finest railroad collections. Sacramento International Airport serves as the region\'s gateway, handling 13 million passengers annually.',
    culturalHeritage: 'Sacramento County reflects California\'s evolution from Gold Rush boomtown to diverse modern capital. The county preserves numerous cultural landmarks including Sutter\'s Fort State Historic Park, the California State Indian Museum, and the Crocker Art Museum, the West\'s oldest public art museum. The region\'s farm-to-fork movement capitalizes on agricultural abundance, with Sacramento proclaiming itself America\'s Farm-to-Fork Capital. The annual California State Fair, dating to 1854, celebrates agricultural heritage while embracing innovation.',
    geographicalSignificance: 'Sacramento County occupies the northern portion of the Central Valley, historically prone to flooding from Sierra Nevada snowmelt. The Sacramento-San Joaquin Delta, beginning at the county\'s southern edge, forms the West Coast\'s largest estuary. The American River provides recreation and water supply while its Folsom Dam offers critical flood control. The county\'s flat topography and fertile soil, enriched by historic flooding, create ideal agricultural conditions. Summer temperatures regularly exceed 100°F, while winter tule fog can reduce visibility to near zero.',
    specificData: {
      established: 'February 18, 1850',
      indigenousHistory: 'Nisenan (Southern Maidu) and Plains Miwok peoples',
      nationalParks: [],
      majorAttractions: ['California State Capitol', 'Old Sacramento', 'Crocker Art Museum', 'California State Railroad Museum', 'Sutter\'s Fort', 'American River Parkway'],
      industries: ['Government', 'Healthcare', 'Education', 'Agriculture', 'Technology', 'Real Estate'],
      climate: 'Mediterranean climate, average 75°F summer/50°F winter, 18 inches rainfall annually',
      elevation: '0 to 828 feet',
      notablePeople: ['Leland Stanford', 'Mark Spitz', 'Tom Hanks (raised)', 'Jessica Chastain', 'Timothy Busfield'],
      historicalEvents: ['1839 Sutter\'s Fort established', '1849 Gold Rush begins', '1854 State capital designated', '1860 Pony Express launch', '1869 Transcontinental Railroad completion', '1963 Capitol restoration']
    }
  },
  {
    countyId: 'fresno',
    historicalContext: 'Fresno County, situated in the heart of the San Joaquin Valley, holds the title of the top agricultural county in the United States. Named for the abundant ash trees lining the San Joaquin River, Fresno was founded in 1872 as a railway station of the Central Pacific Railroad before it was incorporated in 1885. The city rapidly grew as an agricultural hub thanks to the fertile soil of the San Joaquin Valley and the region\'s favorable climate. Fresno proudly wears the moniker of the "Raisin Capital of the World," with the story beginning in the late 19th century when early settlers, including a notable population of Armenian immigrants, brought the age-old tradition of sun-drying grapes to create raisins.',
    economicImportance: 'Fresno County is home to 1.88 million acres of the world\'s most productive farmland, with agricultural operations covering nearly half of the county\'s entire land base of 3.84 million acres. Farmers here raise more than 300 different crops, contributing directly more than $8.59 billion to the California economy and supporting 20 percent of all jobs in the Fresno area. Many of the county\'s crops are not grown commercially anywhere else in the nation. The area\'s hot, dry summers are ideal for drying grapes into raisins, a process that has been perfected over generations. Besides raisins, Fresno County is a major producer of poultry, milk, almonds, and grapes. Major crops also include cotton, peaches, and nectarines.',
    uniqueFeatures: 'Fresno County encompasses 6,011 square miles, making it California\'s fifth-largest county, stretching from the valley floor to Sierra Nevada peaks exceeding 14,000 feet. The county contains portions of three national parks and two national forests. Underground gardens at Forestiere Underground Gardens showcase unique subterranean architecture. The San Joaquin River, California\'s second-longest river, flows through the county. Fresno Chaffee Zoo houses over 190 species. The county maintains the nation\'s most extensive contiguous vineyard acreage.',
    culturalHeritage: 'Fresno County exemplifies agricultural California\'s multicultural heritage. The county hosts the nation\'s largest Hmong population outside Minnesota, with 35,000 residents. Historic Chinatown preserves Chinese immigrant contributions to railroad and agricultural development. The Armenian community, numbering 40,000, maintains cultural institutions including Holy Trinity Armenian Apostolic Church. Mexican American heritage pervades the region, with César Chávez beginning his farmworker organizing in nearby Delano. The annual Big Fresno Fair celebrates agricultural traditions while the Rogue Festival showcases performing arts.',
    geographicalSignificance: 'Fresno County spans from 200 feet elevation in the valley to 14,248 feet at North Palisade peak. The San Joaquin Valley portion features some of Earth\'s most fertile soil, while the eastern Sierra Nevada contains pristine wilderness. The Kings River, descending from the Sierra, carved Kings Canyon, one of America\'s deepest gorges. The county experiences extreme temperature variations, from valley summer heat exceeding 110°F to winter snow in mountain regions. Groundwater depletion poses ongoing challenges as agricultural demands stress aquifer systems.',
    specificData: {
      established: 'April 19, 1856',
      indigenousHistory: 'Yokuts and Mono peoples',
      nationalParks: ['Kings Canyon National Park (partial)', 'Sequoia National Park (partial)', 'Yosemite National Park (partial)'],
      majorAttractions: ['Forestiere Underground Gardens', 'Fresno Chaffee Zoo', 'Woodward Park', 'Kearney Mansion', 'Island Waterpark', 'Shinzen Friendship Garden'],
      industries: ['Agriculture', 'Food Processing', 'Healthcare', 'Education', 'Government', 'Distribution/Logistics'],
      climate: 'Mediterranean climate, average 80°F summer/47°F winter, 11 inches rainfall annually',
      elevation: '200 to 14,248 feet (North Palisade)',
      notablePeople: ['William Saroyan', 'Tom Seaver', 'Sam Peckinpah', 'Audra McDonald', 'Ryan Guzman'],
      historicalEvents: ['1856 County formation', '1872 Railroad arrival', '1900 Raisin industry dominance', '1942 Fresno Assembly Center', '1965 Delano Grape Strike', '1980s Hmong resettlement']
    }
  },

  // NORTHERN CALIFORNIA REGION
  {
    countyId: 'shasta',
    historicalContext: 'Shasta County\'s history reflects Northern California\'s transformation from indigenous homeland through Gold Rush boom to modern gateway to the Cascade Range. The Wintu people inhabited the region for over 10,000 years, developing sophisticated salmon fishing techniques. The California Gold Rush brought miners flooding into the area in 1848, establishing Reading\'s Bar and Shasta City. The copper boom of the 1890s-1920s made Shasta County a major mining center. Construction of Shasta Dam (1938-1945), the keystone of the Central Valley Project, created California\'s largest reservoir and transformed regional development.',
    economicImportance: 'Shasta County\'s economy, generating $8 billion annually, balances natural resources, tourism, and services. Timber and forest products, though diminished from historic peaks, remain important employers. Tourism contributes $500 million annually, with 3 million visitors to Shasta Lake, Lassen Volcanic National Park, and Mount Shasta. Healthcare, centered on Mercy Medical Center and Shasta Regional Medical Center, employs 8,000 workers. Retail trade benefits from the county\'s position as Northern California\'s commercial hub. Agriculture, including cattle ranching and nursery products, adds $100 million annually.',
    uniqueFeatures: 'Shasta County covers 3,847 square miles of spectacular natural diversity, from Sacramento Valley floor to Cascade peaks. Mount Shasta, at 14,179 feet, dominates the landscape as California\'s fifth-highest peak and the second-most voluminous volcano in the Cascades. Shasta Lake, with 365 miles of shoreline, ranks as California\'s largest reservoir. The county contains portions of three national forests and Lassen Volcanic National Park. Lake Shasta Caverns, formed over 200 million years, showcase remarkable limestone formations. The Sundial Bridge in Redding, designed by Santiago Calatrava, functions as both pedestrian crossing and working sundial.',
    culturalHeritage: 'Shasta County preserves layers of cultural history from Native American heritage through Gold Rush legacy to modern outdoor recreation culture. The historic town of Shasta, now a state park, maintains 1850s buildings as a Gold Rush ghost town. Native American heritage continues through the Wintu, Pit River, and Yana peoples. The region\'s logging history is preserved at the Turtle Bay Exploration Park. Mount Shasta holds spiritual significance for numerous groups, from Native Americans to New Age practitioners. The county\'s outdoor recreation culture celebrates fishing, hunting, boating, and hiking traditions.',
    geographicalSignificance: 'Shasta County sits at the northern end of the Central Valley where the Cascade Range, Klamath Mountains, and Coast Range converge. The Sacramento River, California\'s largest river, originates here from springs near Mount Shasta. The county spans five distinct ecosystems from oak woodlands through mixed conifer forests to alpine environments. Volcanic features dominate eastern portions, including Lassen Peak and numerous cinder cones. The region\'s position creates dramatic weather variations, from valley heat exceeding 110°F to heavy mountain snowfall.',
    specificData: {
      established: 'February 18, 1850',
      indigenousHistory: 'Wintu, Yana, Pit River (Achomawi and Atsugewi) peoples',
      nationalParks: ['Lassen Volcanic National Park (partial)', 'Whiskeytown National Recreation Area'],
      majorAttractions: ['Mount Shasta', 'Shasta Lake', 'Sundial Bridge', 'Lake Shasta Caverns', 'Turtle Bay Exploration Park', 'Shasta State Historic Park'],
      industries: ['Healthcare', 'Retail Trade', 'Tourism', 'Government', 'Forest Products', 'Agriculture'],
      climate: 'Mediterranean/Continental, valley 60°F average, mountains cooler, 35 inches rainfall annually',
      elevation: '400 to 14,179 feet (Mount Shasta)',
      notablePeople: ['Joaquin Miller', 'Gary Snyder (resident)', 'Kathleen Norris'],
      historicalEvents: ['1848 Gold discovery at Reading\'s Bar', '1851 Shasta City founding', '1872 Modoc War', '1888 Railroad arrival', '1945 Shasta Dam completion', '2018 Carr Fire']
    }
  },

  // Add more counties with similarly comprehensive content...
  // This is a sample of the detailed educational content structure
  // Continue with remaining 50 counties following the same pattern
];

// Memory aids for geographical learning
export const geographicalMemoryAids: { [key: string]: string } = {
  'los-angeles': 'Largest county by population, shaped like a boot kicking the Pacific',
  'san-diego': 'Southernmost county, borders Mexico, think "Sandy Ego" at the beach',
  'orange': 'Small but mighty between LA and San Diego, shaped like an orange wedge',
  'san-francisco': 'Tiny square at the Golden Gate, smallest county but huge impact',
  'alameda': 'East of SF across the Bay Bridge, "All the Media" in Oakland',
  'sacramento': 'Capital county in the Central Valley, where rivers Sacramento and American meet',
  'fresno': 'Dead center of California, "Fresh? No!" - it\'s hot and agricultural',
  'shasta': 'Northern sentinel with Mount Shasta watching, "Shasta" have beautiful lakes',
  // Add more memory aids
};

// Historical timeline connections
export const historicalConnections: { [key: string]: string[] } = {
  '1769': ['san-diego', 'los-angeles'], // Spanish mission founding
  '1849': ['sacramento', 'san-francisco', 'alameda'], // Gold Rush
  '1850': ['los-angeles', 'san-diego', 'sacramento', 'san-francisco'], // Original counties
  '1906': ['san-francisco', 'alameda', 'san-mateo'], // Great Earthquake
  '1955': ['orange'], // Disneyland opens
  // Add more connections
};

// Cultural and economic relationships
export const interCountyConnections = {
  economicClusters: {
    'Tech Hub': ['san-francisco', 'alameda', 'san-mateo', 'santa-clara'],
    'Entertainment': ['los-angeles', 'orange'],
    'Agriculture': ['fresno', 'kern', 'tulare', 'monterey'],
    'Military': ['san-diego', 'riverside', 'monterey'],
    'Wine Country': ['napa', 'sonoma', 'santa-barbara', 'san-luis-obispo'],
  },
  geographicRegions: {
    'Bay Area': ['alameda', 'contra-costa', 'marin', 'napa', 'san-francisco', 'san-mateo', 'santa-clara', 'solano', 'sonoma'],
    'Southern California': ['imperial', 'los-angeles', 'orange', 'riverside', 'san-bernardino', 'san-diego', 'ventura'],
    'Central Valley': ['fresno', 'kern', 'kings', 'madera', 'merced', 'sacramento', 'san-joaquin', 'stanislaus', 'tulare'],
    'Central Coast': ['monterey', 'san-benito', 'san-luis-obispo', 'santa-barbara', 'santa-cruz'],
  },
  historicalPaths: {
    'El Camino Real': ['san-diego', 'orange', 'los-angeles', 'ventura', 'santa-barbara', 'san-luis-obispo', 'monterey', 'santa-cruz', 'san-mateo', 'san-francisco'],
    'Gold Rush Route': ['san-francisco', 'sacramento', 'el-dorado', 'placer', 'nevada'],
    'Route 66': ['san-bernardino', 'los-angeles', 'orange'],
  },
};

// Export helper function to get education data by county ID
export function getCountyEducation(countyId: string): CountyEducation | undefined {
  return countyEducationData.find(data => data.countyId === countyId);
}

// Export helper to get memory aid
export function getMemoryAid(countyId: string): string {
  return geographicalMemoryAids[countyId] || 'Study this county\'s unique features to create your own memory aid!';
}

// Export helper to get historical connections for a year
export function getHistoricalCounties(year: string): string[] {
  return historicalConnections[year] || [];
}

// Export helper to get related counties
export function getRelatedCounties(countyId: string): string[] {
  const related = new Set<string>();

  // Check economic clusters
  Object.values(interCountyConnections.economicClusters).forEach(cluster => {
    if (cluster.includes(countyId)) {
      cluster.forEach(id => related.add(id));
    }
  });

  // Check geographic regions
  Object.values(interCountyConnections.geographicRegions).forEach(region => {
    if (region.includes(countyId)) {
      region.forEach(id => related.add(id));
    }
  });

  // Remove the county itself
  related.delete(countyId);

  return Array.from(related);
}