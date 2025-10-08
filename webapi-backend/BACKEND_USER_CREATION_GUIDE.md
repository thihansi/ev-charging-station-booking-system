# Backend User Creation Guide

This guide explains how to create users in the EV Charging Station Booking System backend.

## Automatic User Seeding

The backend now includes automatic user seeding functionality. When you start the application, it will automatically create two default users if no users exist in the database:

### Default Users Created:
1. **Backoffice Admin**
   - Username: `admin`
   - Password: `admin123`
   - Role: `Backoffice`

2. **Station Operator**
   - Username: `operator`
   - Password: `operator123`
   - Role: `StationOperator`

## Manual User Creation via API

If you need to create additional users manually, you can use the following API endpoints:

### Prerequisites
1. Make sure MongoDB is running (default: `mongodb://localhost:27017`)
2. Start the backend API application
3. The API will be available at `https://localhost:7001` (or the port configured in launchSettings.json)

### API Endpoints for User Creation

#### 1. Create Backoffice User
```http
POST https://localhost:7001/api/auth/create-backoffice-user
Content-Type: application/json

{
  "username": "admin2",
  "password": "admin456",
  "fullName": "Admin User 2",
  "email": "admin2@evcharging.com"
}
```

#### 2. Create Station Operator
```http
POST https://localhost:7001/api/auth/create-station-operator
Content-Type: application/json

{
  "username": "operator2",
  "password": "operator456",
  "fullName": "Station Operator 2",
  "email": "operator2@evcharging.com",
  "assignedStationId": "station-id-here"
}
```

### PowerShell Script Example

```powershell
# Create Backoffice User
$backofficeUser = @{
    username = "admin2"
    password = "admin456"
    fullName = "Admin User 2"
    email = "admin2@evcharging.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://localhost:7001/api/auth/create-backoffice-user" -Method Post -Body $backofficeUser -ContentType "application/json"

# Create Station Operator
$operatorUser = @{
    username = "operator2"
    password = "operator456"
    fullName = "Station Operator 2"
    email = "operator2@evcharging.com"
    assignedStationId = ""
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://localhost:7001/api/auth/create-station-operator" -Method Post -Body $operatorUser -ContentType "application/json"
```

### cURL Examples

```bash
# Create Backoffice User
curl -X POST "https://localhost:7001/api/auth/create-backoffice-user" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin2",
    "password": "admin456",
    "fullName": "Admin User 2",
    "email": "admin2@evcharging.com"
  }'

# Create Station Operator
curl -X POST "https://localhost:7001/api/auth/create-station-operator" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "operator2",
    "password": "operator456",
    "fullName": "Station Operator 2",
    "email": "operator2@evcharging.com",
    "assignedStationId": ""
  }'
```

## How to Start the Backend

1. Ensure you have .NET SDK installed
2. Navigate to the project directory:
   ```bash
   cd "c:\Users\Yasas Lakmina\Desktop\Projects\ev-charging-station-booking-system\webapi-backend\EvChargingAPI"
   ```
3. Run the application:
   ```bash
   dotnet run
   ```

The application will:
1. Start the API server
2. Automatically seed the default users (admin/admin123 and operator/operator123)
3. Display confirmation messages in the console

## Login Testing

Once users are created, you can test login functionality:

```http
POST https://localhost:7001/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

This will return a JWT token that can be used for authenticated requests.

## Configuration

The backend is configured with:
- **MongoDB**: `mongodb://localhost:27017/EVChargingSystem`
- **JWT Settings**: Configured for development with 60-minute expiry
- **CORS**: Enabled for local development

## Notes

- Default users are only created if the database is empty
- Passwords are hashed using BCrypt before storage
- JWT tokens include username and role claims for authorization
- All endpoints except user creation require authentication (coming users have no auth requirement for initial setup)