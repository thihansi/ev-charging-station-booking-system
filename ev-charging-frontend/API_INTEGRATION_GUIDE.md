# API Integration Guide

## Overview

This guide explains how to use the API services to connect your React frontend with the .NET backend deployed on Azure.

## Configuration

### Environment Variables

The API base URL is configured via environment variables:

```bash
# .env.local
VITE_API_BASE_URL=https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net
```

### Axios Client Setup

The Axios client is pre-configured with:
- Automatic JWT token attachment
- Global error handling
- Request/response logging (development only)
- Timeout handling (30 seconds)

## Authentication

### Login

```typescript
import { authApi } from '../api';

const login = async (username: string, password: string) => {
  try {
    const response = await authApi.login({ username, password });
    // Token is automatically stored and attached to future requests
    localStorage.setItem('ev_charging_auth_token', response.token);
    return response;
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Get User Profile

```typescript
const getUserProfile = async () => {
  try {
    const user = await authApi.getProfile();
    return user;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  }
};
```

## API Services

### Charging Stations

```typescript
import { chargingStationApi } from '../api';

// Get all active charging stations
const getActiveStations = async () => {
  const stations = await chargingStationApi.getActive();
  return stations;
};

// Create new charging station
const createStation = async (stationData) => {
  const response = await chargingStationApi.create(stationData);
  return response;
};

// Update charging station
const updateStation = async (id: string, stationData) => {
  const response = await chargingStationApi.update(id, stationData);
  return response;
};
```

### EV Owners Management

```typescript
import { evOwnerApi } from '../api';

// Get all EV owners
const getAllEvOwners = async () => {
  const evOwners = await evOwnerApi.getAll();
  return evOwners;
};

// Get EV owner by NIC
const getEvOwnerByNic = async (nic: string) => {
  const evOwner = await evOwnerApi.getByNic(nic);
  return evOwner;
};

// Create new EV owner
const createEvOwner = async (evOwnerData) => {
  const response = await evOwnerApi.create(evOwnerData);
  return response;
};
```

### Bookings Management

```typescript
import { bookingApi } from '../api';

// Get all bookings
const getAllBookings = async () => {
  const bookings = await bookingApi.getAll();
  return bookings;
};

// Approve booking (Station Operator)
const approveBooking = async (bookingId: string) => {
  const response = await bookingApi.approve(bookingId);
  return response;
};

// Reject booking (Station Operator)
const rejectBooking = async (bookingId: string) => {
  const response = await bookingApi.reject(bookingId);
  return response;
};

// Create new booking
const createBooking = async (bookingData) => {
  const response = await bookingApi.create(bookingData);
  return response;
};
```

## Error Handling

### Using API Wrapper

```typescript
import { apiWrapper, getErrorMessage } from '../api';
import { useNotification } from '../hooks/useNotification';

const MyComponent = () => {
  const { showError, showSuccess } = useNotification();

  const handleApiCall = async () => {
    try {
      const result = await apiWrapper(
        () => chargingStationApi.getActive(),
        'Fetch Charging Stations'
      );
      showSuccess('Stations loaded successfully!');
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      showError(`Failed to load stations: ${errorMessage}`);
    }
  };
};
```

### Direct Error Handling

```typescript
const handleDirectApiCall = async () => {
  try {
    const result = await chargingStationApi.getActive();
    return result;
  } catch (error) {
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('User not authenticated');
    } else if (error.response?.status === 403) {
      // Handle forbidden
      console.error('User not authorized');
    } else {
      // Handle other errors
      console.error('API call failed:', error.message);
    }
  }
};
```

## Custom Hooks for API Integration

### useApi Hook

```typescript
import { useState, useEffect } from 'react';
import { apiWrapper, getErrorMessage } from '../api';

export const useApi = <T>(apiCall: () => Promise<T>, dependencies: any[] = []) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiWrapper(apiCall);
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    execute();
  }, dependencies);

  return { data, loading, error, refetch: execute };
};
```

## Available Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/create-backoffice-user` - Create admin user
- `POST /api/auth/create-station-operator` - Create operator user

### EV Owners
- `GET /api/evowners` - Get all EV owners
- `POST /api/evowners` - Create EV owner
- `GET /api/evowners/{nic}` - Get EV owner by NIC
- `PUT /api/evowners/{nic}` - Update EV owner

### Charging Stations
- `GET /api/chargingstations` - Get all stations
- `GET /api/chargingstations/active` - Get active stations
- `POST /api/chargingstations` - Create station
- `GET /api/chargingstations/{id}` - Get station by ID
- `PUT /api/chargingstations/{id}` - Update station
- `DELETE /api/chargingstations/{id}` - Delete station

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/{id}` - Get booking by ID
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking
- `POST /api/bookings/{id}/approve` - Approve booking
- `POST /api/bookings/{id}/reject` - Reject booking
- `POST /api/bookings/{id}/complete` - Complete booking

## Environment Configuration

### Development
```bash
VITE_API_BASE_URL=http://localhost:5000
```

### Production (Azure)
```bash
VITE_API_BASE_URL=https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net
```

## CORS Configuration

The Azure backend is configured with CORS to allow requests from your frontend domain. No additional proxy configuration is needed in Vite.

## Logging and Debugging

### Development Mode
- All API requests and responses are logged to the console
- Error details are displayed in the console
- Network errors are clearly identified

### Production Mode
- Only errors are logged
- Sensitive information is not exposed
- User-friendly error messages are displayed

## Best Practices

1. **Always use try-catch blocks** for API calls
2. **Use the notification system** to inform users of success/error states
3. **Implement loading states** for better user experience
4. **Use the apiWrapper utility** for consistent error handling
5. **Validate data** before sending to the API
6. **Handle different error types** appropriately (401, 403, 500, etc.)
7. **Implement retry logic** for transient failures (using retryRequest utility)
8. **Cache API responses** when appropriate to reduce server load

## Migration from Localhost

If you were previously using localhost endpoints, simply:

1. Update your `.env.local` file with the Azure URL
2. Remove any hardcoded localhost URLs from your components
3. Ensure all API calls use the imported API services
4. Test each feature to ensure proper connectivity

The API services are already configured to use the environment variable, so no code changes should be needed in your components.