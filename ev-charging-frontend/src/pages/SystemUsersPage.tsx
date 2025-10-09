import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import {
  AdminPanelSettings,
  Engineering,
} from "@mui/icons-material";

const SystemUsersPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          System Users Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system users including backoffice administrators and station operators
        </Typography>
      </Box>

      {/* API Limitation Notice */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <strong>API Limitation:</strong> The current API does not provide endpoints for listing system users. 
        User creation is available through dedicated endpoints below.
      </Alert>

      {/* User Creation Options */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography color="text.secondary" gutterBottom variant="h6">
                  Create Backoffice User
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Create new administrative users with full system access
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => window.open('/api/auth/create-backoffice-user', '_blank')}
                >
                  Use API Endpoint
                </Button>
              </Box>
              <AdminPanelSettings sx={{ fontSize: 48, color: "primary.main" }} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography color="text.secondary" gutterBottom variant="h6">
                  Create Station Operator
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Create new station operators for charging station management
                </Typography>
                <Button 
                  variant="contained" 
                  color="info"
                  onClick={() => window.open('/api/auth/create-station-operator', '_blank')}
                >
                  Use API Endpoint
                </Button>
              </Box>
              <Engineering sx={{ fontSize: 48, color: "info.main" }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* API Documentation */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Available User Management API Endpoints
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              <strong>Create Backoffice User</strong> (No authentication required)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              POST /api/auth/create-backoffice-user
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              <strong>Create Station Operator</strong> (No authentication required)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              POST /api/auth/create-station-operator
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              <strong>Legacy User Creation</strong> (Backoffice authentication required)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              POST /api/auth/register
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SystemUsersPage;