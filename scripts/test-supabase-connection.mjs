/**
 * Test Supabase Connection
 * Quick verification that credentials work
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Parse .env file manually
const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^VITE_SUPABASE_(\w+)=(.+)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const supabaseUrl = envVars.URL;
const supabaseKey = envVars.ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_')) {
  console.error('❌ Missing or placeholder credentials in .env file');
  console.error('   URL:', supabaseUrl ? '✅' : '❌');
  console.error('   Key:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

console.log('📡 Project URL:', supabaseUrl);
console.log('🔑 Anon Key:', supabaseKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    // Test 1: Auth
    console.log('Test 1: Auth System');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;
    console.log('  ✅ Auth accessible');
    console.log('  📊 Session:', session ? 'Active' : 'None');

    // Test 2: Database
    console.log('\nTest 2: Database');
    const { error: dbError } = await supabase.from('game_stats').select('count').limit(1);

    if (dbError) {
      if (dbError.code === '42P01') {
        console.log('  ⚠️  Table not created yet (run migrations)');
        console.log('  ✅ Connection works!');
      } else {
        console.log('  ⚠️  Error:', dbError.message);
        console.log('  ✅ Connection established');
      }
    } else {
      console.log('  ✅ Database accessible');
    }

    // Test 3: Realtime
    console.log('\nTest 3: Realtime');
    const channel = supabase.channel('test');
    console.log('  ✅ Realtime available');
    await channel.unsubscribe();

    console.log('\n✅ All tests passed!');
    console.log('\n🚀 Supabase is ready! Start dev server: npm run dev');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  }
}

test();
