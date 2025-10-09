// Test all possible booking endpoints to find where the 9 bookings are
const fetch = require('node-fetch');

const BASE_URL = 'https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net';

async function testAllBookingEndpoints() {
  console.log('🔍 Testing ALL booking endpoints to find the 9 bookings...\n');

  const endpoints = [
    '/api/Bookings',
    '/api/bookings', 
    '/api/Bookings/pending',
    '/api/Bookings/my-bookings',
    '/api/Bookings/my-bookings/upcoming',
    '/api/Bookings/my-bookings/history',
    '/api/Bookings/all',        // Maybe there's an "all" endpoint?
    '/api/Bookings/list',       // Maybe "list"?
    '/api/admin/Bookings',      // Maybe under admin?
    '/api/backoffice/Bookings'  // Maybe under backoffice?
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📍 Testing: ${endpoint}`);
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Status: ${response.status} - ${response.statusText}`);
      
      if (response.ok) {
        try {
          const data = await response.json();
          if (Array.isArray(data)) {
            console.log(`✅ SUCCESS! Found ${data.length} bookings`);
            if (data.length === 9) {
              console.log('🎯 BINGO! This endpoint has all 9 bookings!');
            }
          } else {
            console.log('✅ Endpoint works but returns non-array data');
          }
        } catch (jsonError) {
          console.log('✅ Endpoint works but response is not JSON');
        }
      } else if (response.status === 401) {
        console.log('🔒 Authentication required');
      } else if (response.status === 404) {
        console.log('❌ Endpoint not found');
      } else if (response.status === 405) {
        console.log('🚫 Method not allowed');
      } else {
        const errorText = await response.text();
        console.log(`⚠️ Error: ${errorText}`);
      }
    } catch (error) {
      console.error(`💥 Network error:`, error.message);
    }
  }

  console.log('\n--- Testing with different HTTP methods ---');
  
  // Maybe it needs POST instead of GET?
  try {
    console.log('\n📍 Testing POST /api/Bookings (maybe it needs POST?)');
    const response = await fetch(`${BASE_URL}/api/Bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}) // Empty body for testing
    });
    
    console.log(`POST Status: ${response.status} - ${response.statusText}`);
  } catch (error) {
    console.error('POST error:', error.message);
  }
}

testAllBookingEndpoints().then(() => {
  console.log('\n🏁 Endpoint scanning complete');
});