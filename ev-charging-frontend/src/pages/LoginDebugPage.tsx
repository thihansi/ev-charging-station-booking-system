import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { USER_ROLES, ROUTES } from '../utils/constants';

export const LoginDebugPage: React.FC = () => {
  const { state, login, logout } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginResult, setLoginResult] = useState<any>(null);
  const [profileResult, setProfileResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.user) {
      setProfileResult(state.user);
    }
  }, [state.user]);

  const testLogin = async () => {
    setLoading(true);
    setError('');
    setLoginResult(null);
    setProfileResult(null);

    try {
      console.log('🔐 Testing login with:', credentials.username);
      
      // Step 1: Direct API login call
      const loginResponse = await authApi.login(credentials);
      console.log('✅ Login response:', loginResponse);
      setLoginResult(loginResponse);

      // Step 2: Store token temporarily
      localStorage.setItem('token', loginResponse.token);

      // Step 3: Fetch profile
      const profileResponse = await authApi.getProfile();
      console.log('👤 Profile response:', profileResponse);
      setProfileResult(profileResponse);

      // Step 4: Check role and expected redirect
      const expectedRoute = profileResponse.role === USER_ROLES.BACKOFFICE 
        ? ROUTES.BACKOFFICE.DASHBOARD 
        : ROUTES.OPERATOR.DASHBOARD;
      
      console.log('🎯 Expected redirect route:', expectedRoute);
      console.log('🔍 Role check:', {
        receivedRole: profileResponse.role,
        expectedOperatorRole: USER_ROLES.STATION_OPERATOR,
        expectedBackofficeRole: USER_ROLES.BACKOFFICE,
        isOperator: profileResponse.role === USER_ROLES.STATION_OPERATOR,
        isBackoffice: profileResponse.role === USER_ROLES.BACKOFFICE,
      });

    } catch (error: any) {
      console.error('❌ Login test failed:', error);
      setError(error.response?.data?.message || error.message);
    }

    setLoading(false);
  };

  const testContextLogin = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Testing context login...');
      await login(credentials);
      console.log('✅ Context login successful');
    } catch (error: any) {
      console.error('❌ Context login failed:', error);
      setError(error.response?.data?.message || error.message);
    }

    setLoading(false);
  };

  const clearTest = () => {
    logout();
    setLoginResult(null);
    setProfileResult(null);
    setError('');
    localStorage.removeItem('token');
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Operator Login Debug Tool
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This tool helps debug operator login issues. Test both direct API calls and context login.
      </Alert>

      {/* Current State */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Auth State
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell><strong>Is Authenticated</strong></TableCell>
                  <TableCell>
                    <Chip 
                      label={state.isAuthenticated ? 'Yes' : 'No'} 
                      color={state.isAuthenticated ? 'success' : 'error'} 
                      size="small" 
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Is Loading</strong></TableCell>
                  <TableCell>
                    <Chip 
                      label={state.isLoading ? 'Yes' : 'No'} 
                      color={state.isLoading ? 'warning' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>User</strong></TableCell>
                  <TableCell>{state.user ? JSON.stringify(state.user, null, 2) : 'None'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Token in localStorage</strong></TableCell>
                  <TableCell>
                    <Chip 
                      label={localStorage.getItem('token') ? 'Present' : 'Missing'} 
                      color={localStorage.getItem('token') ? 'success' : 'error'} 
                      size="small" 
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Error</strong></TableCell>
                  <TableCell>{state.error || 'None'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Test Login */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Login
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Username"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              margin="normal"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={testLogin}
              disabled={loading || !credentials.username || !credentials.password}
            >
              Test Direct API Login
            </Button>
            <Button
              variant="outlined"
              onClick={testContextLogin}
              disabled={loading || !credentials.username || !credentials.password}
            >
              Test Context Login
            </Button>
            <Button
              variant="text"
              onClick={clearTest}
              color="secondary"
            >
              Clear Test
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Login Result */}
      {loginResult && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Login API Response
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Has Token</strong></TableCell>
                    <TableCell>
                      <Chip 
                        label={loginResult.token ? 'Yes' : 'No'} 
                        color={loginResult.token ? 'success' : 'error'} 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Token Length</strong></TableCell>
                    <TableCell>{loginResult.token ? loginResult.token.length : 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Full Response</strong></TableCell>
                    <TableCell>
                      <pre style={{ fontSize: '0.75rem', margin: 0 }}>
                        {JSON.stringify(loginResult, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Profile Result */}
      {profileResult && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profile API Response
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell>
                      <Chip 
                        label={profileResult.role || 'Unknown'} 
                        color={profileResult.role === USER_ROLES.STATION_OPERATOR ? 'primary' : 'secondary'} 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Username</strong></TableCell>
                    <TableCell>{profileResult.username || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Expected Role (Operator)</strong></TableCell>
                    <TableCell>
                      <Chip 
                        label={USER_ROLES.STATION_OPERATOR} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Expected Role (Backoffice)</strong></TableCell>
                    <TableCell>
                      <Chip 
                        label={USER_ROLES.BACKOFFICE} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Role Match Check</strong></TableCell>
                    <TableCell>
                      {profileResult.role === USER_ROLES.STATION_OPERATOR ? (
                        <Chip label="✅ Operator Match" color="success" size="small" />
                      ) : profileResult.role === USER_ROLES.BACKOFFICE ? (
                        <Chip label="✅ Backoffice Match" color="primary" size="small" />
                      ) : (
                        <Chip label="❌ No Match" color="error" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Expected Redirect</strong></TableCell>
                    <TableCell>
                      <code>
                        {profileResult.role === USER_ROLES.BACKOFFICE 
                          ? ROUTES.BACKOFFICE.DASHBOARD 
                          : ROUTES.OPERATOR.DASHBOARD}
                      </code>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Full Profile</strong></TableCell>
                    <TableCell>
                      <pre style={{ fontSize: '0.75rem', margin: 0 }}>
                        {JSON.stringify(profileResult, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Role Constants Reference */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Role Constants Reference
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell><strong>USER_ROLES.STATION_OPERATOR</strong></TableCell>
                  <TableCell><code>"{USER_ROLES.STATION_OPERATOR}"</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>USER_ROLES.BACKOFFICE</strong></TableCell>
                  <TableCell><code>"{USER_ROLES.BACKOFFICE}"</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>ROUTES.OPERATOR.DASHBOARD</strong></TableCell>
                  <TableCell><code>"{ROUTES.OPERATOR.DASHBOARD}"</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>ROUTES.BACKOFFICE.DASHBOARD</strong></TableCell>
                  <TableCell><code>"{ROUTES.BACKOFFICE.DASHBOARD}"</code></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};