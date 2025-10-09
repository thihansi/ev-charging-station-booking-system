# Operator Login Debug Guide

## 🔍 **Common Issues with Operator Login**

### **Issue 1: Role Mismatch**
- **Problem**: Backend returns different role name than frontend expects
- **Frontend expects**: `"StationOperator"`
- **Backend might return**: `"Station_Operator"`, `"station_operator"`, `"operator"`, etc.
- **Solution**: Check actual role value in debug tool

### **Issue 2: Wrong Route Redirect**
- **Problem**: User logs in but gets redirected to wrong dashboard
- **Expected for Operator**: `/operator/dashboard`
- **Expected for Backoffice**: `/admin/dashboard`
- **Solution**: Verify role comparison logic

### **Issue 3: Authentication Token Issues**
- **Problem**: Token not stored or retrieved correctly
- **Check**: localStorage['token'] exists after login
- **Solution**: Verify token storage and API client setup

### **Issue 4: Backend API Issues**
- **Problem**: Login API returns success but profile API fails
- **Symptoms**: Login works but user data missing
- **Solution**: Test both endpoints separately

## 🛠️ **Debug Steps**

### **Step 1: Use Login Debug Tool**
Navigate to: `http://localhost:5173/login-debug`

1. Enter operator credentials
2. Click "Test Direct API Login"
3. Check the results for:
   - ✅ Login response has token
   - ✅ Profile response has correct role
   - ✅ Role matches expected constants

### **Step 2: Check Browser Console**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Try logging in normally
4. Look for debug messages:
   - `🔐 Attempting login...`
   - `👤 Fetching user profile...`
   - `🚀 LoginPage: User authenticated, determining redirect...`
   - `🎯 LoginPage: Redirecting to:`

### **Step 3: Check Network Tab**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try logging in
4. Check requests:
   - `POST /api/auth/login` - Should return 200 with token
   - `GET /api/auth/profile` - Should return 200 with user data

### **Step 4: Test API Endpoints**
Navigate to: `http://localhost:5173/api-test`

1. Test login endpoint with operator credentials
2. Check if profile endpoint works
3. Verify token storage

## 🎯 **Expected Behavior for Operator**

### **Successful Login Flow:**
1. **User enters credentials** → operator username/password
2. **POST /api/auth/login** → returns `{ token: "..." }`
3. **Token stored** → localStorage['token'] = received token
4. **GET /api/auth/profile** → returns `{ role: "StationOperator", username: "...", ... }`
5. **Role check** → role === "StationOperator"
6. **Redirect** → navigate to `/operator/dashboard`
7. **Dashboard loads** → OperatorDashboard component renders

### **What to Check if It's Not Working:**

#### **If login fails entirely:**
- ❌ Wrong credentials
- ❌ Backend API not accessible
- ❌ CORS issues

#### **If login succeeds but redirects to wrong page:**
- ❌ Role mismatch (check exact role string)
- ❌ Frontend role constants don't match backend

#### **If login succeeds but shows unauthorized:**
- ❌ ProtectedRoute blocking access
- ❌ Role comparison failing
- ❌ Token not being sent with requests

#### **If login succeeds but page is blank:**
- ❌ OperatorDashboard component has errors
- ❌ API calls in dashboard failing
- ❌ Missing dependencies

## 🔧 **Quick Fixes**

### **Fix 1: Role Case Sensitivity**
If backend returns different case, update constants:
```typescript
export const USER_ROLES = {
  STATION_OPERATOR: "station_operator", // Match backend exactly
  BACKOFFICE: "backoffice",
} as const;
```

### **Fix 2: Add Fallback Route**
In LoginPage, add fallback:
```typescript
const redirectPath = state.user.role === USER_ROLES.BACKOFFICE
  ? ROUTES.ADMIN.DASHBOARD
  : state.user.role === USER_ROLES.STATION_OPERATOR
  ? ROUTES.OPERATOR.DASHBOARD
  : ROUTES.LOGIN; // Fallback if role doesn't match
```

### **Fix 3: Debug Token Issues**
Check localStorage in browser console:
```javascript
// Check token
localStorage.getItem('token')

// Check user profile
localStorage.getItem('ev_charging_user_profile')

// Clear if needed
localStorage.clear()
```

## 📋 **Checklist**

- [ ] Backend returns consistent role names
- [ ] Frontend constants match backend exactly
- [ ] Login API returns valid JWT token
- [ ] Profile API returns user with correct role
- [ ] ProtectedRoute allows operator role
- [ ] Route paths are correct in constants
- [ ] OperatorDashboard component works
- [ ] API calls use correct base URL

Use the debug tools to systematically check each item! 🎯