/**
 * Integration test script
 * 
 * Tests the connection between frontend and backend
 * 
 * Note: This application uses Supabase for all backend operations.
 * This script is only useful if a separate backend API is configured.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? null 
    : 'http://localhost:10000');

/**
 * Test API health endpoint
 */
async function testHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      console.error(`   Health check returned status: ${response.status}`);
      return false;
    }
    const text = await response.text();
    if (!text) {
      console.error('   Health check returned empty response');
      return false;
    }
    const data = JSON.parse(text);
    return data.status === 'UP';
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('   Cannot connect to backend. Is it running?');
      console.error(`   Check: ${API_URL}/health`);
    } else {
      console.error('   Health check failed:', error instanceof Error ? error.message : error);
    }
    return false;
  }
}

/**
 * Test API root endpoint
 */
async function testApiRoot(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api`);
    if (!response.ok) {
      console.error(`   API root returned status: ${response.status}`);
      return false;
    }
    const text = await response.text();
    if (!text) {
      console.error('   API root returned empty response');
      return false;
    }
    const data = JSON.parse(text);
    return !!(data.message && data.endpoints);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('   Cannot connect to backend. Is it running?');
    } else {
      console.error('   API root check failed:', error instanceof Error ? error.message : error);
    }
    return false;
  }
}

/**
 * Test authentication endpoints exist
 */
async function testAuthEndpoints(): Promise<boolean> {
  try {
    // Test signup endpoint (should return 400 for missing body, not 404)
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    // 400 means endpoint exists, 404 means it doesn't
    return response.status === 400 || response.status === 422;
  } catch (error) {
    console.error('Auth endpoints check failed:', error);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n🧪 Testing Frontend-Backend Integration...\n');

  // Check if API URL is configured
  if (!API_URL) {
    console.log('⚠️  No backend API URL configured.');
    console.log('   This application uses Supabase for all backend operations.');
    console.log('   If you need to test a separate backend API, set NEXT_PUBLIC_API_URL.');
    console.log('\n');
    process.exit(0);
  }

  console.log('1. Testing health endpoint...');
  const healthOk = await testHealth();
  console.log(healthOk ? '   ✅ Health endpoint working' : '   ❌ Health endpoint failed');

  console.log('2. Testing API root endpoint...');
  const apiRootOk = await testApiRoot();
  console.log(apiRootOk ? '   ✅ API root endpoint working' : '   ❌ API root endpoint failed');

  console.log('3. Testing authentication endpoints...');
  const authOk = await testAuthEndpoints();
  console.log(authOk ? '   ✅ Authentication endpoints exist' : '   ❌ Authentication endpoints not found');

  console.log('\n📊 Test Results:');
  const allPassed = healthOk && apiRootOk && authOk;
  console.log(allPassed ? '   ✅ All tests passed!' : '   ⚠️  Some tests failed');
  
  if (!allPassed) {
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Ensure backend is running:');
    console.log('      cd backend && npm run dev');
    console.log('   2. Check backend is accessible:');
    console.log(`      curl ${API_URL}/health`);
    console.log('   3. Verify environment variables:');
    console.log('      Create .env.local in frontend/apps/web/');
      console.log('      NEXT_PUBLIC_API_URL=http://localhost:10000');
    console.log('   4. Check backend logs for errors');
    console.log('\n   Note: This application uses Supabase for all backend operations.');
    console.log('   If no backend API is needed, you can skip these tests.');
  }

  console.log('\n');
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});

