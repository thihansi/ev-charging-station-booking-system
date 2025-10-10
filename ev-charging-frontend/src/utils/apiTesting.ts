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
    testBookingsAPI: () => Promise<any>;
    testAvailableEndpoints: () => Promise<void>;
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

// Method 6: Test Bookings Endpoint specifically
const testBookingsAPI = async () => {
  try {
    console.log('📋 Testing bookings API endpoints...');
    const token = localStorage.getItem('token') || localStorage.getItem('ev_charging_auth_token');
    
    if (!token) {
      console.error('❌ No token found. Please login first using testLoginAPI()');
      return null;
    }

    const baseUrl = 'https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net';
    
    // Test different possible endpoints and methods
    const testCases = [
      // Different endpoint names
      { method: 'GET', endpoint: '/api/bookings', description: 'Standard bookings (lowercase)' },
      { method: 'GET', endpoint: '/api/Bookings', description: 'Capitalized Bookings' },
      { method: 'GET', endpoint: '/api/booking', description: 'Singular booking' },
      { method: 'GET', endpoint: '/api/Booking', description: 'Singular Booking (capitalized)' },
      { method: 'GET', endpoint: '/api/BookingManagement', description: 'BookingManagement' },
      { method: 'GET', endpoint: '/api/BookingController', description: 'BookingController' },
      
      // Different HTTP methods
      { method: 'POST', endpoint: '/api/bookings/search', description: 'POST search bookings', body: {} },
      { method: 'POST', endpoint: '/api/bookings/list', description: 'POST list bookings', body: {} },
      
      // Try without /api prefix
      { method: 'GET', endpoint: '/bookings', description: 'Without /api prefix' },
      { method: 'GET', endpoint: '/Bookings', description: 'Without /api prefix (capitalized)' },
    ];

    for (const testCase of testCases) {
      console.log(`🔍 Testing: ${testCase.method} ${testCase.endpoint} - ${testCase.description}`);
      
      try {
        const options: any = {
          method: testCase.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        };
        
        if (testCase.body && testCase.method === 'POST') {
          options.body = JSON.stringify(testCase.body);
        }

        const response = await fetch(`${baseUrl}${testCase.endpoint}`, options);

        console.log(`📊 ${testCase.method} ${testCase.endpoint} Response:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (response.ok) {
          try {
            const data = await response.json();
            console.log(`✅ ${testCase.endpoint} SUCCESS! Data:`, data);
            return { endpoint: testCase.endpoint, method: testCase.method, data };
          } catch (jsonError) {
            console.log(`✅ ${testCase.endpoint} SUCCESS! (No JSON response)`);
            return { endpoint: testCase.endpoint, method: testCase.method, data: 'No JSON' };
          }
        } else if (response.status === 404) {
          console.log(`❌ ${testCase.endpoint} - Endpoint not found (404)`);
        } else if (response.status === 405) {
          console.log(`❌ ${testCase.endpoint} - Method not allowed (405)`);
        } else if (response.status === 401) {
          console.log(`❌ ${testCase.endpoint} - Unauthorized (401) - Token might be invalid`);
        } else if (response.status === 403) {
          console.log(`❌ ${testCase.endpoint} - Forbidden (403) - Insufficient permissions`);
        } else {
          const errorText = await response.text();
          console.log(`❌ ${testCase.endpoint} - Error ${response.status}:`, errorText);
        }
      } catch (error: any) {
        console.log(`💥 ${testCase.endpoint} - Network error:`, error.message);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('❌ All booking endpoint tests completed. Check results above.');
    return null;
  } catch (error) {
    console.error('❌ Bookings API test failed:', error);
    return null;
  }
};

// Method 7: Test what endpoints are actually available
const testAvailableEndpoints = async () => {
  console.log('🔍 Testing which endpoints are available...');
  const baseUrl = 'https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net';
  
  // Test basic connectivity
  try {
    console.log('🌐 Testing basic connectivity...');
    const response = await fetch(baseUrl);
    console.log('Backend connectivity:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
  } catch (error: any) {
    console.error('❌ Cannot reach backend:', error.message);
    return;
  }
  
  // Test if we can access swagger/docs
  try {
    console.log('📚 Testing if Swagger documentation is available...');
    const swaggerResponse = await fetch(`${baseUrl}/swagger`);
    if (swaggerResponse.ok) {
      console.log('✅ Swagger is available at /swagger');
    } else {
      console.log('❌ Swagger not available at /swagger');
    }
  } catch (error) {
    console.log('❌ Could not access swagger docs');
  }
  
  console.log('ℹ️ Try running testBookingsAPI() to test specific booking endpoints');
};

// Simple test function matching the working charging stations pattern
async function testBookingsSimple() {
  console.log('🧪 Testing Bookings API (Simple Pattern)...');
  
  try {
    const response = await fetch('https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net/api/Bookings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Bookings Success!', data);
      return data;
    } else {
      const errorText = await response.text();
      console.log('❌ Bookings Failed:', response.status, errorText);
      return null;
    }
  } catch (error) {
    console.error('💥 Bookings Error:', error);
    return null;
  }
}

// Test charging stations to compare
async function testChargingStationsWorking() {
  console.log('🧪 Testing ChargingStations API (Working Pattern)...');
  
  try {
    const response = await fetch('https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net/api/ChargingStations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ ChargingStations Success!', data);
      return data;
    } else {
      const errorText = await response.text();
      console.log('❌ ChargingStations Failed:', response.status, errorText);
      return null;
    }
  } catch (error) {
    console.error('💥 ChargingStations Error:', error);
    return null;
  }
}

// Compare both APIs
async function compareBothAPIs() {
  console.log('🔄 Comparing Working vs Non-Working APIs...');
  
  console.log('\n--- Testing ChargingStations (Working) ---');
  await testChargingStationsWorking();
  
  console.log('\n--- Testing Bookings (Not Working) ---');
  await testBookingsSimple();
  
  console.log('\n--- Testing WITHOUT Authentication ---');
  await testBookingsWithoutAuth();
  await testChargingStationsWithoutAuth();
  
  console.log('\n--- Auth Token Check ---');
  console.log('Token exists:', !!localStorage.getItem('token'));
  console.log('Token preview:', localStorage.getItem('token')?.substring(0, 50) + '...');
}

// Test booking API without authentication
async function testBookingsWithoutAuth() {
  console.log('🧪 Testing Bookings API (No Auth)...');
  
  try {
    const response = await fetch('https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net/api/Bookings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response Status (No Auth):', response.status);
    if (response.status === 401) {
      console.log('🔒 Bookings requires authentication');
    } else if (response.ok) {
      console.log('✅ Bookings works without auth');
    }
  } catch (error) {
    console.error('💥 Bookings Error (No Auth):', error);
  }
}

// Test charging stations API without authentication  
async function testChargingStationsWithoutAuth() {
  console.log('🧪 Testing ChargingStations API (No Auth)...');
  
  try {
    const response = await fetch('https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net/api/ChargingStations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response Status (No Auth):', response.status);
    if (response.status === 401) {
      console.log('🔒 ChargingStations requires authentication');
    } else if (response.ok) {
      console.log('✅ ChargingStations works without auth');
    }
  } catch (error) {
    console.error('💥 ChargingStations Error (No Auth):', error);
  }
}

// Add to window for console access
(window as any).testBookingsAPI = testBookingsAPI;
(window as any).testAvailableEndpoints = testAvailableEndpoints;
(window as any).testBookingsSimple = testBookingsSimple;
(window as any).testChargingStationsWorking = testChargingStationsWorking;
(window as any).compareBothAPIs = compareBothAPIs;
(window as any).testBookingsWithoutAuth = testBookingsWithoutAuth;
(window as any).testChargingStationsWithoutAuth = testChargingStationsWithoutAuth;