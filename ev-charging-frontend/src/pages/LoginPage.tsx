import React, { useState, useEffect } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Container,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  ElectricCar,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNotificationContext } from "../context/NotificationContext";
import { ROUTES, USER_ROLES } from "../utils/constants";
import type { LoginRequest } from "../types";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, login, clearError } = useAuth();
  const { showSuccess, showError } = useNotificationContext();

  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      const redirectPath =
        state.user.role === USER_ROLES.BACKOFFICE
          ? ROUTES.BACKOFFICE.DASHBOARD
          : ROUTES.OPERATOR.DASHBOARD;
      navigate(redirectPath, { replace: true });
    }
  }, [state.isAuthenticated, state.user, navigate]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // clearError is stable and doesn't need to be in deps

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (state.error) {
      clearError();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      showError("Please enter both username and password");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData);
      showSuccess("Login successful");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // If already authenticated, don't render the login form
  if (state.isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            maxWidth: 400,
            mx: "auto",
            boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  mb: 2,
                }}
              >
                <ElectricCar sx={{ fontSize: 32, color: "white" }} />
              </Box>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                align="center"
                fontWeight="bold"
              >
                EV Charging
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                gutterBottom
                align="center"
                color="text.secondary"
              >
                System Portal
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Sign in to access your dashboard
              </Typography>
            </Box>

            {/* Error Alert */}
            {state.error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {state.error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="Username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                margin="normal"
                required
                autoComplete="username"
                autoFocus
                disabled={isSubmitting}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
                autoComplete="current-password"
                disabled={isSubmitting}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        disabled={isSubmitting}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={
                  isSubmitting ||
                  !formData.username.trim() ||
                  !formData.password.trim()
                }
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <LoginIcon />
                  )
                }
                sx={{
                  py: 1.5,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                  },
                }}
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </Box>

            {/* Demo Credentials */}
            <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                fontWeight="bold"
              >
                Demo Credentials:
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Admin:</strong> admin / admin123
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Operator:</strong> operator / operator123
              </Typography>
            </Box>

            {/* Registration Link */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Need to create new users?{' '}
                <Link 
                  to={ROUTES.USER_REGISTRATION}
                  style={{ 
                    color: 'inherit', 
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Register Here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
