/**
 * Manual API Testing Methods
 * 
 * This file contains various methods to test your backend APIs
 * Copy and paste these into your browser console for quick testing
 */

// Method 1: Quick Backend Health Check
const testBackendHealth = async () => {
  try {
    console.log('🔍 Testing backend health...');
    const response = await fetch('https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net');
    console.log('✅ Backend is reachable!', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    return response.ok;
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    return false;
  }
};

// Method 2: Test Login API
const testLoginAPI = async (username: string, password: string) => {
  try {
    console.log('🔐 Testing login API...');
    const response = await fetch('https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!', data);
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('💾 Token stored in localStorage');
      }
      return data;
    } else {
      console.error('❌ Login failed:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Login API error:', error);
    return null;
  }
};

// Method 3: Test Protected API Endpoint
const testProtectedAPI = async (endpoint: string) => {
  try {
    console.log(`🔒 Testing protected endpoint: ${endpoint}`);
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('⚠️ No token found. Please login first.');
      return null;
    }
    
    const response = await fetch(`https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${endpoint} success:`, data);
      return data;
    } else {
      console.error(`❌ ${endpoint} failed:`, data);
      return null;
    }
  } catch (error) {
    console.error(`❌ ${endpoint} error:`, error);
    return null;
  }
};

// Method 4: Test All Common Endpoints
const testAllEndpoints = async () => {
  console.log('🚀 Starting comprehensive API tests...');
  
  // Test 1: Backend Health
  const healthOk = await testBackendHealth();
  if (!healthOk) {
    console.log('❌ Backend is not reachable. Stopping tests.');
    return;
  }
  
  // Test 2: CORS Check
  try {
    console.log('🌐 Testing CORS...');
    const corsResponse = await fetch('https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net/api/auth/login', {
      method: 'OPTIONS',
    });
    console.log('✅ CORS check completed:', {
      status: corsResponse.status,
      headers: {
        'access-control-allow-origin': corsResponse.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': corsResponse.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': corsResponse.headers.get('access-control-allow-headers'),
      }
    });
  } catch (error) {
    console.error('❌ CORS test failed:', error);
  }
  
  // Test 3: Protected endpoints (requires login)
  const endpoints = [
    '/api/evowners',
    '/api/chargingstations',
    '/api/bookings',
  ];
  
  for (const endpoint of endpoints) {
    await testProtectedAPI(endpoint);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎉 All tests completed!');
};

// Method 5: Check Current Configuration
const checkConfiguration = () => {
  console.log('⚙️ Current Configuration:');
  console.log({
    backendURL: 'https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net',
    tokenInStorage: !!localStorage.getItem('token'),
    tokenValue: localStorage.getItem('token')?.substring(0, 20) + '...',
    environment: window.location.origin,
    userAgent: navigator.userAgent,
  });
};

// Export methods for use
declare global {
  interface Window {
    testBackendHealth: () => Promise<boolean>;
    testLoginAPI: (username: string, password: string) => Promise<any>;
    testProtectedAPI: (endpoint: string) => Promise<any>;
    testAllEndpoints: () => Promise<void>;
    checkConfiguration: () => void;
  }
}

window.testBackendHealth = testBackendHealth;
window.testLoginAPI = testLoginAPI;
window.testProtectedAPI = testProtectedAPI;
window.testAllEndpoints = testAllEndpoints;
window.checkConfiguration = checkConfiguration;

console.log(`
🛠️  API Testing Methods Available:

1. testBackendHealth() - Check if backend server is running
2. testLoginAPI('username', 'password') - Test login with credentials
3. testProtectedAPI('/api/endpoint') - Test any protected endpoint
4. testAllEndpoints() - Run comprehensive tests
5. checkConfiguration() - Check current setup
`);

export {
  testBackendHealth,
  testLoginAPI,
  testProtectedAPI,
  testAllEndpoints,
  checkConfiguration,
};