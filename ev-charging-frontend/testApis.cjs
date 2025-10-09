// Simple API Testing Script
// Run this directly with: node testApis.cjs

const fetch = require('node-fetch');

const BASE_URL = 'https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net';

// Test function to compare Charging Stations vs Bookings
async function testBothAPIs() {
  console.log('🔄 Testing API Endpoints...\n');

  // Test ChargingStations (Working)
  console.log('--- Testing ChargingStations (Working) ---');
  try {
    const response = await fetch(`${BASE_URL}/api/ChargingStations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status} - ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ ChargingStations Success!');
      console.log(`📊 Returned ${data.length} charging stations`);
    } else {
      console.log('❌ ChargingStations Failed');
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.error('💥 ChargingStations Error:', error.message);
  }

  console.log('\n--- Testing Bookings (Not Working) ---');
  try {
    const response = await fetch(`${BASE_URL}/api/Bookings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status} - ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Bookings Success!');
      console.log(`📊 Returned ${data.length} bookings`);
    } else {
      console.log('❌ Bookings Failed');
      const errorText = await response.text();
      console.log('Error:', errorText);
      
      if (response.status === 401) {
        console.log('🔒 Authentication required for bookings');
      } else if (response.status === 405) {
        console.log('🚫 Method not allowed - endpoint might not exist');
      }
    }
  } catch (error) {
    console.error('💥 Bookings Error:', error.message);
  }

  console.log('\n--- Testing Other Endpoints ---');
  
  // Test lowercase endpoints
  const testEndpoints = [
    '/api/bookings',
    '/api/chargingstations',
    '/api/EVOwners',
    '/api/evowners'
  ];

  for (const endpoint of testEndpoints) {
    try {
      console.log(`\n📍 Testing: ${endpoint}`);
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Status: ${response.status} - ${response.statusText}`);
      
      if (response.status === 401) {
        console.log('🔒 Authentication required');
      } else if (response.status === 404) {
        console.log('❌ Endpoint not found');
      } else if (response.status === 405) {
        console.log('🚫 Method not allowed');
      } else if (response.ok) {
        console.log('✅ Endpoint accessible');
      }
    } catch (error) {
      console.error(`💥 Error testing ${endpoint}:`, error.message);
    }
  }
}

// Run the test
testBothAPIs().then(() => {
  console.log('\n🏁 API Testing Complete');
}).catch(error => {
  console.error('Test failed:', error);
});