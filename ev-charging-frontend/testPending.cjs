// Test the pending bookings endpoint
const fetch = require('node-fetch');

const BASE_URL = 'https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net';

async function testPendingBookings() {
  console.log('🧪 Testing /api/Bookings/pending endpoint...\n');

  try {
    const response = await fetch(`${BASE_URL}/api/Bookings/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status} - ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Pending Bookings Success!');
      console.log(`📊 Returned ${data.length} pending bookings`);
    } else {
      console.log('❌ Pending Bookings Failed');
      const errorText = await response.text();
      console.log('Error:', errorText);
      
      if (response.status === 401) {
        console.log('🔒 Authentication required');
      } else if (response.status === 405) {
        console.log('🚫 Method not allowed');
      }
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testPendingBookings();