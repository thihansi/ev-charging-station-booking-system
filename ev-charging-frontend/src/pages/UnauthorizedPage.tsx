import React from "react";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { Lock, Home } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES, USER_ROLES } from "../utils/constants";

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();

  const handleGoHome = () => {
    if (state.user?.role === USER_ROLES.BACKOFFICE) {
      navigate(ROUTES.BACKOFFICE.DASHBOARD);
    } else if (state.user?.role === USER_ROLES.STATION_OPERATOR) {
      navigate(ROUTES.OPERATOR.DASHBOARD);
    } else {
      navigate(ROUTES.HOME);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 4,
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              bgcolor: "error.light",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock sx={{ fontSize: 60, color: "white" }} />
          </Box>
        </Box>

        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Access Denied
        </Typography>

        <Typography variant="h6" color="text.secondary" paragraph>
          You don't have permission to access this resource.
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          This page requires specific permissions that your account doesn't
          have. Please contact your administrator if you believe this is an
          error.
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Home />}
            onClick={handleGoHome}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UnauthorizedPage;
