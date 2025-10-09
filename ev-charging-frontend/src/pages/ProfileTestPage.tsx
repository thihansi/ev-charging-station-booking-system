import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

export const ProfileTestPage: React.FC = () => {
  const navigate = useNavigate();

  const testRoutes = [
    { label: 'Generic Profile Page', route: ROUTES.PROFILE },
    { label: 'Admin Profile Page', route: ROUTES.ADMIN.PROFILE },
    { label: 'Operator Profile Page', route: ROUTES.OPERATOR.PROFILE },
    { label: 'Admin Dashboard', route: ROUTES.ADMIN.DASHBOARD },
    { label: 'Operator Dashboard', route: ROUTES.OPERATOR.DASHBOARD },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Route Test Page
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Test navigation to different routes to identify any "Page Not Found" issues.
      </Typography>
      
      {testRoutes.map((route) => (
        <Button
          key={route.route}
          variant="outlined"
          onClick={() => navigate(route.route)}
          sx={{ mr: 2, mb: 2 }}
        >
          Go to {route.label}
        </Button>
      ))}
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Current Routes Available:
        </Typography>
        <Typography variant="body2" component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
          {JSON.stringify(ROUTES, null, 2)}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProfileTestPage;