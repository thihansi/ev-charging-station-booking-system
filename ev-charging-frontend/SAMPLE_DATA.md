# EV Charging Station Booking System - Sample Data

This document provides sample data that can be used to populate the EV Charging Station Booking System for demonstration and testing purposes.

## Sample System Users

### Backoffice Administrator

```json
{
  "username": "admin",
  "password": "admin123",
  "fullName": "System Administrator",
  "email": "admin@evcharging.com",
  "role": "Backoffice"
}
```

### Station Operator

```json
{
  "username": "operator1",
  "password": "operator123",
  "fullName": "John Smith",
  "email": "john.smith@evcharging.com",
  "role": "StationOperator",
  "assignedStationId": "STATION_001"
}
```

## Sample EV Owners

### EV Owner 1

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

### EV Owner 2

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

### EV Owner 3

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

## Sample Charging Stations

### Station 1 - Urban Center

```json
{
  "id": "STATION_001",
  "name": "Colombo City Center Charging Hub",
  "address": "World Trade Center, Echelon Square, Colombo 01, Sri Lanka",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "stationType": "DC",
  "totalSlots": 8,
  "availableSlots": 5,
  "operationalHours": {
    "openTime": "06:00",
    "closeTime": "22:00"
  },
  "isActive": true,
  "qrCodeData": "STATION_001_QR"
}
```

### Station 2 - Shopping Mall

```json
{
  "id": "STATION_002",
  "name": "Odel Mall Fast Charging Station",
  "address": "Odel Shopping Complex, Alexandra Place, Colombo 07, Sri Lanka",
  "latitude": 6.9147,
  "longitude": 79.8754,
  "stationType": "AC",
  "totalSlots": 4,
  "availableSlots": 2,
  "operationalHours": {
    "openTime": "08:00",
    "closeTime": "20:00"
  },
  "isActive": true,
  "qrCodeData": "STATION_002_QR"
}
```

### Station 3 - Highway Service Center

```json
{
  "id": "STATION_003",
  "name": "Southern Expressway Charging Point",
  "address": "Expressway Service Center, Kottawa, Sri Lanka",
  "latitude": 6.8061,
  "longitude": 79.9737,
  "stationType": "DC",
  "totalSlots": 6,
  "availableSlots": 4,
  "operationalHours": {
    "openTime": "24:00",
    "closeTime": "24:00"
  },
  "isActive": true,
  "qrCodeData": "STATION_003_QR"
}
```

### Station 4 - Airport

```json
{
  "id": "STATION_004",
  "name": "Bandaranaike Airport EV Charging",
  "address": "Bandaranaike International Airport, Katunayake, Sri Lanka",
  "latitude": 7.1804,
  "longitude": 79.8841,
  "stationType": "AC",
  "totalSlots": 12,
  "availableSlots": 8,
  "operationalHours": {
    "openTime": "24:00",
    "closeTime": "24:00"
  },
  "isActive": true,
  "qrCodeData": "STATION_004_QR"
}
```

### Station 5 - University Campus

```json
{
  "id": "STATION_005",
  "name": "University of Colombo Green Campus",
  "address": "University of Colombo, Reid Avenue, Colombo 07, Sri Lanka",
  "latitude": 6.9022,
  "longitude": 79.8607,
  "stationType": "AC",
  "totalSlots": 3,
  "availableSlots": 1,
  "operationalHours": {
    "openTime": "07:00",
    "closeTime": "18:00"
  },
  "isActive": false,
  "qrCodeData": "STATION_005_QR"
}
```

## Sample Bookings

### Booking 1 - Pending

```json
{
  "id": "BOOKING_001",
  "evOwnerNic": "123456789V",
  "chargingStationId": "STATION_001",
  "reservationDateTime": "2025-10-09T10:00:00.000Z",
  "status": "Pending",
  "qrCodeData": "QR_BOOKING_001",
  "createdAt": "2025-10-08T08:30:00.000Z",
  "updatedAt": "2025-10-08T08:30:00.000Z"
}
```

### Booking 2 - Approved

```json
{
  "id": "BOOKING_002",
  "evOwnerNic": "987654321V",
  "chargingStationId": "STATION_002",
  "reservationDateTime": "2025-10-09T14:30:00.000Z",
  "status": "Approved",
  "qrCodeData": "QR_BOOKING_002",
  "createdAt": "2025-10-07T15:20:00.000Z",
  "updatedAt": "2025-10-07T16:45:00.000Z"
}
```

### Booking 3 - Completed

```json
{
  "id": "BOOKING_003",
  "evOwnerNic": "123456789V",
  "chargingStationId": "STATION_003",
  "reservationDateTime": "2025-10-07T09:00:00.000Z",
  "status": "Completed",
  "qrCodeData": "QR_BOOKING_003",
  "createdAt": "2025-10-06T18:00:00.000Z",
  "updatedAt": "2025-10-07T10:30:00.000Z"
}
```

### Booking 4 - Rejected

```json
{
  "id": "BOOKING_004",
  "evOwnerNic": "456789123V",
  "chargingStationId": "STATION_001",
  "reservationDateTime": "2025-10-08T16:00:00.000Z",
  "status": "Rejected",
  "qrCodeData": "QR_BOOKING_004",
  "createdAt": "2025-10-08T12:00:00.000Z",
  "updatedAt": "2025-10-08T12:30:00.000Z"
}
```

### Booking 5 - Cancelled

```json
{
  "id": "BOOKING_005",
  "evOwnerNic": "987654321V",
  "chargingStationId": "STATION_004",
  "reservationDateTime": "2025-10-10T11:00:00.000Z",
  "status": "Cancelled",
  "qrCodeData": "QR_BOOKING_005",
  "createdAt": "2025-10-08T09:15:00.000Z",
  "updatedAt": "2025-10-08T11:20:00.000Z"
}
```

### Booking 6 - No Show

```json
{
  "id": "BOOKING_006",
  "evOwnerNic": "123456789V",
  "chargingStationId": "STATION_002",
  "reservationDateTime": "2025-10-07T13:00:00.000Z",
  "status": "NoShow",
  "qrCodeData": "QR_BOOKING_006",
  "createdAt": "2025-10-06T20:00:00.000Z",
  "updatedAt": "2025-10-07T13:30:00.000Z"
}
```

## Quick Setup Guide

### Step 1: Create System Users

1. Login to the backend admin panel
2. Create the admin user with Backoffice role
3. Create station operator users with StationOperator role

### Step 2: Populate Charging Stations

1. Use the admin panel or API to create all 5 sample charging stations
2. Ensure proper coordinates for map integration
3. Set appropriate operational hours

### Step 3: Register EV Owners

1. Create EV owner accounts through the registration system
2. Mark appropriate accounts as verified
3. Test different verification states

### Step 4: Create Sample Bookings

1. Create bookings with different statuses to demonstrate workflow
2. Assign bookings to different stations and owners
3. Set various reservation times (past, present, future)

## Testing Scenarios

### Scenario 1: Complete Booking Workflow

1. **EV Owner Registration**: Register as Sarah Johnson
2. **Browse Stations**: View available charging stations
3. **Create Booking**: Book a slot at Colombo City Center
4. **Operator Approval**: Login as operator and approve booking
5. **QR Code Validation**: Scan QR code to validate booking
6. **Complete Session**: Mark charging session as completed

### Scenario 2: Role-Based Access Testing

1. **Backoffice Access**: Login as admin to access all management features
2. **Operator Access**: Login as operator to access station-specific features
3. **Permission Testing**: Verify operators can only manage assigned stations

### Scenario 3: Booking Status Management

1. **Pending Review**: Create booking and leave in pending state
2. **Approval Process**: Test approve/reject functionality
3. **Cancellation**: Test booking cancellation by different user types
4. **No-Show Handling**: Test marking bookings as no-show

### Scenario 4: Dashboard Analytics

1. **View Statistics**: Check booking counts and station utilization
2. **Filter Data**: Test filtering by date ranges and status
3. **Export Reports**: Test data export functionality

## API Testing Data

### Authentication

```bash
# Admin Login
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}

# Operator Login
POST /api/auth/login
{
  "username": "operator1",
  "password": "operator123"
}
```

### Station Management

```bash
# Get all stations
GET /api/charging-stations

# Create new station
POST /api/charging-stations
# Use any station data from above

# Update station
PUT /api/charging-stations/STATION_001
# Use modified station data
```

### Booking Management

```bash
# Get all bookings
GET /api/bookings

# Create booking
POST /api/bookings
# Use any booking data from above

# Approve booking
POST /api/bookings/BOOKING_001/approve

# Complete booking
POST /api/bookings/BOOKING_002/complete
```

This sample data provides a comprehensive foundation for testing all features of the EV Charging Station Booking System, including user management, station operations, booking workflows, and role-based access control.
