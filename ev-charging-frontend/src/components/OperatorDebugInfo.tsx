import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/constants';
import { Box, Alert, Card, CardContent, Typography, Button } from '@mui/material';

export const OperatorDebugInfo: React.FC = () => {
  const { state } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    // Decode JWT token to see its contents
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT payload (basic decode, not verification)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        setTokenInfo(JSON.parse(jsonPayload));
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }, []);

  if (!state.isAuthenticated) {
    return (
      <Alert severity="warning">
        User is not authenticated
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Operator Debug Information
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Authentication Status:</strong> {state.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
          </Alert>

          <Alert severity={state.user?.role === USER_ROLES.STATION_OPERATOR ? 'success' : 'warning'} sx={{ mb: 2 }}>
            <strong>Role Check:</strong> {state.user?.role === USER_ROLES.STATION_OPERATOR ? '✅ Operator Role Match' : '❌ Role Mismatch'}
          </Alert>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>User Information:</Typography>
            <pre style={{ fontSize: '0.8rem', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
              {JSON.stringify(state.user, null, 2)}
            </pre>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Expected Role:</Typography>
            <code>{USER_ROLES.STATION_OPERATOR}</code>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Actual Role:</Typography>
            <code>{state.user?.role || 'undefined'}</code>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Role Comparison:</Typography>
            <Alert severity={state.user?.role === USER_ROLES.STATION_OPERATOR ? 'success' : 'error'}>
              <code>"{state.user?.role}" === "{USER_ROLES.STATION_OPERATOR}"</code> = {String(state.user?.role === USER_ROLES.STATION_OPERATOR)}
            </Alert>
          </Box>

          {tokenInfo && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>JWT Token Payload:</Typography>
              <pre style={{ fontSize: '0.8rem', background: '#f5f5f5', padding: '8px', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
                {JSON.stringify(tokenInfo, null, 2)}
              </pre>
            </Box>
          )}

          <Button 
            variant="outlined" 
            onClick={() => {
              console.log('Debug Info:', {
                isAuthenticated: state.isAuthenticated,
                user: state.user,
                expectedRole: USER_ROLES.STATION_OPERATOR,
                actualRole: state.user?.role,
                roleMatch: state.user?.role === USER_ROLES.STATION_OPERATOR,
                token: localStorage.getItem('token')?.substring(0, 50) + '...',
                tokenPayload: tokenInfo
              });
            }}
          >
            Log Debug Info to Console
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};