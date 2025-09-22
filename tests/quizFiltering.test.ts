import { getQuestionsByRegion, getQuestionsByCounty, getQuestionsByType, getRandomQuestions } from '../src/data/californiaQuizQuestions';

// Test region filtering
function testRegionFiltering() {
  console.log('🧪 Testing Quiz Region Filtering\n');
  console.log('=' .repeat(50));

  // Test filtering for each region
  const regions = [
    'Bay Area',
    'Southern California',
    'Central Valley',
    'Central Coast',
    'Northern California',
    'North Coast',
    'Sierra Nevada'
  ];

  regions.forEach(region => {
    const questions = getQuestionsByRegion(region);
    console.log(`\n📍 ${region}:`);
    console.log(`   Questions found: ${questions.length}`);

    // Show sample questions from this region
    const sample = questions.slice(0, 2);
    sample.forEach(q => {
      console.log(`   - ${q.countyName}: ${q.question.substring(0, 50)}...`);
    });
  });

  // Test 'all' region filter
  console.log('\n📍 All Regions:');
  const allQuestions = getQuestionsByRegion('all');
  console.log(`   Total questions: ${allQuestions.length}`);

  // Test county filtering
  console.log('\n🏛️ Testing County Filtering:');
  const losAngelesQuestions = getQuestionsByCounty('Los Angeles');
  console.log(`   Los Angeles County: ${losAngelesQuestions.length} questions`);

  const alamedaQuestions = getQuestionsByCounty('Alameda');
  console.log(`   Alameda County: ${alamedaQuestions.length} questions`);

  // Test question type filtering
  console.log('\n📚 Testing Question Type Filtering:');
  const questionTypes = ['capital', 'landmark', 'geography', 'history', 'economy', 'demographics', 'nature', 'culture'];

  questionTypes.forEach(type => {
    const questions = getQuestionsByType(type as any);
    console.log(`   ${type}: ${questions.length} questions`);
  });

  // Test random question selection
  console.log('\n🎲 Testing Random Question Selection:');
  const randomQuestions = getRandomQuestions(5, { region: 'Bay Area' });
  console.log(`   Got ${randomQuestions.length} random questions from Bay Area`);
  randomQuestions.forEach(q => {
    console.log(`   - ${q.countyName} (${q.region}): ${q.type}`);
  });

  console.log('\n' + '=' .repeat(50));
  console.log('✅ Quiz filtering tests complete!\n');
}

// Run the test
testRegionFiltering();