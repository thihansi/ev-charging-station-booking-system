# Backend API Testing Guide

This guide shows you **multiple ways** to test if your Azure backend APIs are working correctly with the base URL: `https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net`

## 🎯 Quick Methods to Test Your Backend

### Method 1: Visual Testing Tool (Recommended)
Navigate to your React app and go to:
```
http://localhost:5173/api-test
```

This provides a comprehensive UI for testing:
- ✅ Server connectivity
- ✅ Authentication endpoints
- ✅ All API endpoints
- ✅ CORS configuration
- ✅ Error handling

### Method 2: Browser Console Commands
Open your browser's Developer Tools (F12) and paste these commands:

#### Test Basic Connectivity
```javascript
testBackendHealth()
```

#### Test Login (replace with real credentials)
```javascript
testLoginAPI('your-username', 'your-password')
```

#### Test Protected Endpoints
```javascript
testProtectedAPI('/api/evowners')
testProtectedAPI('/api/chargingstations')
testProtectedAPI('/api/bookings')
```

#### Run All Tests
```javascript
testAllEndpoints()
```

#### Check Configuration
```javascript
checkConfiguration()
```

### Method 3: Manual cURL Commands
Test from command line or terminal:

#### Test Server Status
```bash
curl -I https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net
```

#### Test Login API
```bash
curl -X POST https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your-username","password":"your-password"}'
```

#### Test Protected Endpoint (after getting token)
```bash
curl -X GET https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net/api/evowners \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Method 4: Browser Network Tab
1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Use your React app normally (login, navigate pages)
4. Watch for requests to your Azure backend
5. Check for:
   - ✅ Status codes (200, 201, etc.)
   - ❌ Error codes (401, 403, 500, etc.)
   - 🌐 CORS errors
   - ⏱️ Response times

## 🔍 What to Look For

### ✅ Success Indicators
- **Status 200-299**: API calls working
- **Token received**: Authentication successful
- **Data returned**: Endpoints returning proper JSON
- **No CORS errors**: Browser allows requests

### ❌ Problem Indicators
- **Status 401/403**: Authentication issues
- **Status 500**: Backend server errors
- **CORS errors**: Browser blocking requests
- **Network errors**: Can't reach server
- **Timeout errors**: Server too slow

## 🛠️ Troubleshooting Common Issues

### Issue: CORS Errors
```
Access to fetch at 'https://...' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution**: Azure backend needs to allow localhost origins in CORS settings

### Issue: 401 Unauthorized
```
{"error": "Unauthorized"}
```
**Solutions**:
1. Check username/password are correct
2. Ensure token is being sent in Authorization header
3. Token might be expired - login again

### Issue: Network Errors
```
TypeError: Failed to fetch
```
**Solutions**:
1. Check internet connection
2. Verify Azure backend URL is correct
3. Check if Azure service is running

### Issue: 500 Internal Server Error
```
{"error": "Internal Server Error"}
```
**Solutions**:
1. Check Azure backend logs
2. Verify database connections
3. Check backend configuration

## 📊 Expected API Endpoints

Based on your backend, these endpoints should be available:

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/auth/login` | POST | User login | No |
| `/api/evowners` | GET | List EV owners | Yes |
| `/api/evowners` | POST | Create EV owner | Yes |
| `/api/chargingstations` | GET | List stations | Yes |
| `/api/chargingstations` | POST | Create station | Yes |
| `/api/bookings` | GET | List bookings | Yes |
| `/api/bookings` | POST | Create booking | Yes |

## 🎯 Quick Success Test

Run this in browser console for a quick test:
```javascript
// Quick test sequence
async function quickTest() {
  console.log('🚀 Starting quick backend test...');
  
  // 1. Test connectivity
  const health = await testBackendHealth();
  if (!health) return console.log('❌ Backend not reachable');
  
  // 2. Test CORS
  try {
    await fetch('https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net/api/auth/login', {method: 'OPTIONS'});
    console.log('✅ CORS working');
  } catch (e) {
    console.log('❌ CORS issue:', e.message);
  }
  
  console.log('✅ Basic tests complete! Try login with real credentials.');
}

quickTest();
```

This comprehensive testing approach will help you identify exactly what's working and what needs to be fixed with your backend API connection! 🎯