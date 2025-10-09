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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Api,
} from '@mui/icons-material';
import apiClient from '../api/client';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: any;
  time?: number;
}

export const APITestPage: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  // Test Basic Backend Connectivity
  const testBasicConnectivity = async () => {
    const startTime = Date.now();
    try {
      const response = await fetch('https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net', {
        method: 'GET',
        mode: 'cors',
      });

      addResult({
        name: 'Backend Server Status',
        status: response.ok ? 'success' : 'warning',
        message: `Server responded with ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        },
        time: Date.now() - startTime
      });
    } catch (error: any) {
      addResult({
        name: 'Backend Server Status',
        status: 'error',
        message: `Connection failed: ${error.message}`,
        details: { error: error.toString() },
        time: Date.now() - startTime
      });
    }
  };

  // Test Authentication
  const testAuthentication = async () => {
    if (!credentials.username || !credentials.password) {
      addResult({
        name: 'Authentication Test',
        status: 'warning',
        message: 'Please provide username and password to test authentication',
        time: 0
      });
      return;
    }

    const startTime = Date.now();
    try {
      const response = await apiClient.post('/api/auth/login', {
        username: credentials.username,
        password: credentials.password
      });

      addResult({
        name: 'Authentication Test',
        status: 'success',
        message: `Login successful: ${response.status}`,
        details: {
          status: response.status,
          hasToken: !!response.data.token,
          tokenLength: response.data.token?.length
        },
        time: Date.now() - startTime
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
    } catch (error: any) {
      addResult({
        name: 'Authentication Test',
        status: 'error',
        message: `Login failed: ${error.response?.status || 'Network Error'} - ${error.message}`,
        details: {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        },
        time: Date.now() - startTime
      });
    }
  };

  // Run All Tests
  const runAllTests = async () => {
    setLoading(true);
    clearResults();

    await testBasicConnectivity();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testAuthentication();

    setLoading(false);
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle color="success" />;
      case 'error': return <Error color="error" />;
      case 'warning': return <Warning color="warning" />;
      default: return <Info color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Backend API Testing Tool
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Testing Backend: <strong>https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net</strong>
        </Typography>
        This tool helps you verify if your Azure backend APIs are working correctly.
      </Alert>

      {/* Quick Test Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Backend Test
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Run a comprehensive test of your backend APIs
          </Typography>

          <Button
            variant="contained"
            onClick={runAllTests}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Api />}
            size="large"
            sx={{ mb: 2 }}
          >
            {loading ? 'Testing...' : 'Run All Tests'}
          </Button>
        </CardContent>
      </Card>

      {/* Authentication Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Authentication Test
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Username"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              variant="outlined"
            />
          </Box>

          <Button
            variant="contained"
            onClick={testAuthentication}
            disabled={loading}
          >
            Test Login
          </Button>
        </CardContent>
      </Card>

      {/* Individual Tests */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Individual API Tests
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => testBasicConnectivity()}
              disabled={loading}
            >
              Server Status
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results.length > 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Test Results ({results.length})
              </Typography>
              <Button
                variant="outlined"
                onClick={clearResults}
                size="small"
              >
                Clear Results
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <List>
              {results.map((result, index) => (
                <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box display="flex" alignItems="center" width="100%" mb={1}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getIcon(result.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">
                            {result.name}
                          </Typography>
                          <Chip 
                            label={result.status} 
                            size="small" 
                            color={getStatusColor(result.status) as any}
                          />
                          {result.time !== undefined && (
                            <Chip 
                              label={`${result.time}ms`} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={result.message}
                    />
                  </Box>
                  
                  {result.details && (
                    <Box sx={{ width: '100%', ml: 5 }}>
                      <details>
                        <summary style={{ cursor: 'pointer', fontSize: '0.875rem', marginBottom: 8 }}>
                          View Details
                        </summary>
                        <Box
                          component="pre"
                          sx={{
                            fontSize: '0.75rem',
                            backgroundColor: 'grey.100',
                            p: 1,
                            borderRadius: 1,
                            overflow: 'auto',
                            maxHeight: 200
                          }}
                        >
                          {JSON.stringify(result.details, null, 2)}
                        </Box>
                      </details>
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Configuration Info */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Configuration
          </Typography>
          
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2" component="div">
              • <strong>Backend URL:</strong> https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net<br/>
              • <strong>Token Storage:</strong> localStorage['token']<br/>
              • <strong>Connection:</strong> Direct (no proxy)<br/>
              • <strong>Headers:</strong> Content-Type: application/json, Authorization: Bearer
            </Typography>
          </Alert>

          <Alert severity="warning">
            <Typography variant="subtitle2" gutterBottom>
              Common Issues:
            </Typography>
            <Typography variant="body2" component="div">
              1. <strong>CORS Errors:</strong> Azure backend may not allow requests from localhost<br/>
              2. <strong>401/403 Errors:</strong> Authentication required or invalid credentials<br/>
              3. <strong>Network Errors:</strong> Check internet connection or Azure server status<br/>
              4. <strong>Timeout:</strong> Server may be slow to respond
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};