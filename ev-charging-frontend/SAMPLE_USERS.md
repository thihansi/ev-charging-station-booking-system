# Sample Users for EV Charging System

This document provides sample user credentials for testing the EV Charging Station Booking System.

## 🎯 Quick Access - Backend Users

**Backend users are automatically created when you start the API server.**

### Admin Access

- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Backoffice

### Station Operator Access

- **Username:** `operator`
- **Password:** `operator123`
- **Role:** StationOperator

## System Admin/Backoffice Users

### Admin User 1 (Primary Administrator) - AUTO-CREATED

```json
{
  "username": "admin",
  "password": "admin123",
  "fullName": "System Administrator",
  "email": "admin@evcharging.com",
  "role": "Backoffice"
}
```

**Login Credentials:**

- Username: `admin`
- Password: `admin123`
- **Status:** ✅ Automatically created by backend on startup

### Admin User 2 (Backup Administrator)

```json
{
  "username": "backoffice.manager",
  "password": "manager123",
  "fullName": "Sarah Thompson",
  "email": "sarah.thompson@evcharging.com",
  "role": "Backoffice"
}
```

**Login Credentials:**

- Username: `backoffice.manager`
- Password: `manager123`

### Admin User 3 (Operations Manager)

```json
{
  "username": "operations.admin",
  "password": "ops123",
  "fullName": "Michael Rodriguez",
  "email": "michael.rodriguez@evcharging.com",
  "role": "Backoffice"
}
```

**Login Credentials:**

- Username: `operations.admin`
- Password: `ops123`

## Station Operator Users

### Operator 1 (Primary Operator) - AUTO-CREATED

```json
{
  "username": "operator",
  "password": "operator123",
  "fullName": "Station Operator",
  "email": "operator@evcharging.com",
  "role": "StationOperator",
  "assignedStationId": ""
}
```

**Login Credentials:**

- Username: `operator`
- Password: `operator123`
- **Status:** ✅ Automatically created by backend on startup

### Operator 2 (Colombo Stations)

```json
{
  "username": "operator.colombo",
  "password": "operator123",
  "fullName": "John Smith",
  "email": "john.smith@evcharging.com",
  "role": "StationOperator",
  "assignedStationId": "STATION_001"
}
```

**Login Credentials:**

- Username: `operator.colombo`
- Password: `operator123`

### Operator 3 (Highway Stations)

```json
{
  "username": "operator.highway",
  "password": "highway123",
  "fullName": "Emma Wilson",
  "email": "emma.wilson@evcharging.com",
  "role": "StationOperator",
  "assignedStationId": "STATION_003"
}
```

**Login Credentials:**

- Username: `operator.highway`
- Password: `highway123`

### Operator 3 (Airport Station)

```json
{
  "username": "operator.airport",
  "password": "airport123",
  "fullName": "David Chen",
  "email": "david.chen@evcharging.com",
  "role": "StationOperator",
  "assignedStationId": "STATION_004"
}
```

**Login Credentials:**

- Username: `operator.airport`
- Password: `airport123`

## EV Owner Test Accounts

### EV Owner 1 (Active User)

```json
{
  "nic": "123456789V",
  "fullName": "Sarah Johnson",
  "phoneNumber": "+94771234567",
  "email": "sarah.johnson@email.com",
  "address": "123 Green Street, Colombo 07, Sri Lanka",
  "password": "user123",
  "isActive": true,
  "isVerified": true
}
```

**Login Credentials (if EV Owner login is implemented):**

- NIC/Username: `123456789V`
- Password: `user123`

### EV Owner 2 (Power User)

```json
{
  "nic": "987654321V",
  "fullName": "Michael Chen",
  "phoneNumber": "+94772345678",
  "email": "michael.chen@email.com",
  "address": "456 Electric Avenue, Kandy, Sri Lanka",
  "password": "user123",
  "isActive": true,
  "isVerified": true
}
```

**Login Credentials (if EV Owner login is implemented):**

- NIC/Username: `987654321V`
- Password: `user123`

### EV Owner 3 (New User - Unverified)

```json
{
  "nic": "456789123V",
  "fullName": "Emma Wilson",
  "phoneNumber": "+94773456789",
  "email": "emma.wilson@email.com",
  "address": "789 Charging Lane, Galle, Sri Lanka",
  "password": "user123",
  "isActive": true,
  "isVerified": false
}
```

**Login Credentials (if EV Owner login is implemented):**

- NIC/Username: `456789123V`
- Password: `user123`

## Quick Login Reference

### For System Testing:

#### **Backoffice Dashboard Access:**

1. **Primary Admin**: `admin` / `admin123`
2. **Manager**: `backoffice.manager` / `manager123`
3. **Operations**: `operations.admin` / `ops123`

#### **Station Operator Dashboard Access:**

1. **Colombo**: `operator.colombo` / `operator123`
2. **Highway**: `operator.highway` / `highway123`
3. **Airport**: `operator.airport` / `airport123`

## User Creation API Calls

### Create Backoffice Admin

```bash
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "fullName": "System Administrator",
  "email": "admin@evcharging.com",
  "role": "Backoffice"
}
```

### Create Station Operator

```bash
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "operator.colombo",
  "password": "operator123",
  "fullName": "John Smith",
  "email": "john.smith@evcharging.com",
  "role": "StationOperator",
  "assignedStationId": "STATION_001"
}
```

### Create EV Owner

```bash
POST /api/ev-owners
Content-Type: application/json

{
  "nic": "123456789V",
  "fullName": "Sarah Johnson",
  "phoneNumber": "+94771234567",
  "email": "sarah.johnson@email.com",
  "address": "123 Green Street, Colombo 07, Sri Lanka",
  "password": "user123"
}
```

## Testing Scenarios

### Scenario 1: Admin Workflow

1. **Login**: Use `admin` / `admin123`
2. **Access**: Full system access to all modules
3. **Test**: Create users, manage stations, oversee bookings

### Scenario 2: Station Operator Workflow

1. **Login**: Use `operator.colombo` / `operator123`
2. **Access**: Station-specific dashboard and booking management
3. **Test**: Approve bookings, scan QR codes, manage sessions

### Scenario 3: Role-Based Access Testing

1. **Login as Admin**: Verify access to user management
2. **Login as Operator**: Verify limited access to assigned stations only
3. **Test Permissions**: Ensure proper role-based restrictions

## Security Notes

⚠️ **Important**: These are sample credentials for development/testing only!

### For Production:

- Change all default passwords
- Implement strong password policies
- Use proper password hashing (bcrypt)
- Enable two-factor authentication
- Implement account lockout policies
- Use secure password reset mechanisms

### Password Requirements (Recommended):

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Database Seeding Script

Here's a sample SQL script to create these users (adjust for your database schema):

```sql
-- Insert Backoffice Users
INSERT INTO Users (username, password_hash, full_name, email, role, created_at) VALUES
('admin', '$2a$10$hashedpassword', 'System Administrator', 'admin@evcharging.com', 'Backoffice', NOW()),
('backoffice.manager', '$2a$10$hashedpassword', 'Sarah Thompson', 'sarah.thompson@evcharging.com', 'Backoffice', NOW()),
('operations.admin', '$2a$10$hashedpassword', 'Michael Rodriguez', 'michael.rodriguez@evcharging.com', 'Backoffice', NOW());

-- Insert Station Operators
INSERT INTO Users (username, password_hash, full_name, email, role, assigned_station_id, created_at) VALUES
('operator.colombo', '$2a$10$hashedpassword', 'John Smith', 'john.smith@evcharging.com', 'StationOperator', 'STATION_001', NOW()),
('operator.highway', '$2a$10$hashedpassword', 'Emma Wilson', 'emma.wilson@evcharging.com', 'StationOperator', 'STATION_003', NOW()),
('operator.airport', '$2a$10$hashedpassword', 'David Chen', 'david.chen@evcharging.com', 'StationOperator', 'STATION_004', NOW());

-- Insert EV Owners
INSERT INTO EVOwners (nic, full_name, phone_number, email, address, password_hash, is_active, is_verified, created_at) VALUES
('123456789V', 'Sarah Johnson', '+94771234567', 'sarah.johnson@email.com', '123 Green Street, Colombo 07, Sri Lanka', '$2a$10$hashedpassword', true, true, NOW()),
('987654321V', 'Michael Chen', '+94772345678', 'michael.chen@email.com', '456 Electric Avenue, Kandy, Sri Lanka', '$2a$10$hashedpassword', true, true, NOW()),
('456789123V', 'Emma Wilson', '+94773456789', 'emma.wilson@email.com', '789 Charging Lane, Galle, Sri Lanka', '$2a$10$hashedpassword', true, false, NOW());
```

This provides a complete set of test users for all roles in the system, enabling comprehensive testing of the EV Charging Station Booking System.
