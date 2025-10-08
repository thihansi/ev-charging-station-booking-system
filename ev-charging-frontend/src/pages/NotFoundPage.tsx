import React from "react";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { SearchOff, Home } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES, USER_ROLES } from "../utils/constants";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();

  const handleGoHome = () => {
    if (state.user?.role === USER_ROLES.BACKOFFICE) {
      navigate(ROUTES.BACKOFFICE.DASHBOARD);
    } else if (state.user?.role === USER_ROLES.STATION_OPERATOR) {
      navigate(ROUTES.OPERATOR.DASHBOARD);
    } else {
      navigate(ROUTES.LOGIN);
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
              bgcolor: "warning.light",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SearchOff sx={{ fontSize: 60, color: "white" }} />
          </Box>
        </Box>

        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Page Not Found
        </Typography>

        <Typography variant="h6" color="text.secondary" paragraph>
          The page you're looking for doesn't exist.
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          The page might have been moved, deleted, or you entered a wrong URL.
          Please check the URL or return to the dashboard.
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

export default NotFoundPage;
