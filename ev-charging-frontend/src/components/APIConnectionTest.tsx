/**
 * Simple API Connection Test
 * 
 * This component helps verify the direct connection to Azure backend
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  TextField,
  CircularProgress,
} from '@mui/material';
import apiClient from '../api/client';

export const APIConnectionTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const testConnection = async () => {
    setLoading(true);
    setResult('');

    try {
      // Test 1: Basic connectivity
      console.log('🔗 Testing API connection to Azure backend...');
      const response = await apiClient.post('/api/auth/login', {
        username: credentials.username,
        password: credentials.password
      });

      if (response.data.token) {
        setResult(`✅ Connection successful!\n\nBackend URL: https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net\nToken received: ${response.data.token.substring(0, 20)}...\nResponse status: ${response.status}`);
        
        // Store token for future requests
        localStorage.setItem('token', response.data.token);
      } else {
        setResult(`❌ Login failed: No token in response\nResponse: ${JSON.stringify(response.data, null, 2)}`);
      }
    } catch (error: any) {
      console.error('API Test Error:', error);
      setResult(`❌ Connection failed: ${error.message}\n\nDetails:\n${error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'No response data'}\n\nStatus: ${error.response?.status || 'Network Error'}`);
    }

    setLoading(false);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        API Connection Test
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This tool tests the direct connection to your Azure backend:
        <br />
        <strong>https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net</strong>
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Login Endpoint
          </Typography>
          
          <Box component="form" sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Username"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              margin="normal"
              required
            />
          </Box>

          <Button
            variant="contained"
            onClick={testConnection}
            disabled={loading || !credentials.username || !credentials.password}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ mb: 2 }}
          >
            {loading ? 'Testing Connection...' : 'Test API Connection'}
          </Button>

          {result && (
            <Alert 
              severity={result.startsWith('✅') ? 'success' : 'error'} 
              sx={{ mt: 2 }}
            >
              <pre style={{ 
                fontSize: '0.875rem', 
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {result}
              </pre>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Configuration Summary
          </Typography>
          
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Setup:
            </Typography>
            <Typography variant="body2" component="div">
              • <strong>Direct Connection:</strong> ✅ Enabled<br/>
              • <strong>Backend URL:</strong> https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net<br/>
              • <strong>Proxy:</strong> ❌ Disabled<br/>
              • <strong>Token Storage:</strong> localStorage['token']<br/>
              • <strong>Headers:</strong> Content-Type: application/json, Authorization: Bearer
            </Typography>
          </Alert>

          <Alert severity="warning">
            <Typography variant="subtitle2" gutterBottom>
              Important Notes:
            </Typography>
            <Typography variant="body2" component="div">
              1. <strong>CORS:</strong> Azure backend must allow requests from your domain<br/>
              2. <strong>Authentication:</strong> Use valid credentials to test<br/>
              3. <strong>Network:</strong> Ensure internet connectivity to Azure<br/>
              4. <strong>Token:</strong> Will be stored in localStorage after successful login
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};