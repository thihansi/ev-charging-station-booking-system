import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  useTheme,
  alpha,
  Modal,
  TextField,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from "@mui/material";
import {
  EvStation,
  Speed,
  Security,
  Nature,
  QrCodeScanner,
  Dashboard,
  ArrowForward,
  LoginOutlined,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  ElectricCar,
  Close,
  AdminPanelSettings,
  Engineering,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotificationContext } from "../context/NotificationContext";
import { ROUTES, USER_ROLES } from "../utils/constants";
import type { LoginRequest } from "../types";

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { state, login, clearError } = useAuth();
  const { showSuccess, showError } = useNotificationContext();

  // Login modal state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginType, setLoginType] = useState<"backoffice" | "operator">(
    "backoffice"
  );
  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle authentication state changes
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      handleCloseLoginModal();
      const redirectPath =
        state.user.role === USER_ROLES.BACKOFFICE
          ? ROUTES.BACKOFFICE.DASHBOARD
          : ROUTES.OPERATOR.DASHBOARD;
      navigate(redirectPath, { replace: true });
    }
  }, [state.isAuthenticated, state.user, navigate]);

  // Handle login modal
  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
    clearError();
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    setFormData({ username: "", password: "" });
    setShowPassword(false);
    setLoginType("backoffice");
    clearError();
  };

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
      // Navigation will be handled by the useEffect hook
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

  const handleLoginTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newLoginType: "backoffice" | "operator"
  ) => {
    if (newLoginType !== null) {
      setLoginType(newLoginType);
      // Clear form when switching types
      setFormData({ username: "", password: "" });
      clearError();
    }
  };

  const features = [
    {
      icon: <EvStation />,
      title: "Smart Charging Network",
      description:
        "Comprehensive management of EV charging stations with real-time monitoring and availability tracking.",
    },
    {
      icon: <Speed />,
      title: "Fast & Efficient",
      description:
        "Quick booking process with instant confirmation and seamless charging session management.",
    },
    {
      icon: <QrCodeScanner />,
      title: "QR Code Integration",
      description:
        "Simple QR code scanning for booking validation and charging session initialization.",
    },
    {
      icon: <Security />,
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security with role-based access control and data protection.",
    },
    {
      icon: <Dashboard />,
      title: "Advanced Analytics",
      description:
        "Comprehensive dashboards with booking statistics, station utilization, and revenue insights.",
    },
    {
      icon: <Nature />,
      title: "Eco-Friendly",
      description:
        "Promoting sustainable transportation through efficient EV charging infrastructure management.",
    },
  ];

  const stats = [
    { number: "1,000+", label: "Charging Stations" },
    { number: "50K+", label: "Registered EV Owners" },
    { number: "99.9%", label: "Uptime Reliability" },
    { number: "24/7", label: "Customer Support" },
  ];

  return (
    <Box>
      {/* Navigation Header */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${alpha("#e2e8f0", 0.8)}`,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                }}
              >
                <EvStation sx={{ fontSize: 24, color: "white" }} />
              </Box>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                EV Charging System
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<LoginOutlined />}
              onClick={handleOpenLoginModal}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                px: 3,
                py: 1,
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                  boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              Admin/Operator Login
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "white",
          pt: 12,
          pb: 8,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.1"><circle cx="30" cy="30" r="2"/></g></svg>') repeat`,
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Box sx={{ textAlign: "center", maxWidth: 800, mx: "auto" }}>
            <Typography
              variant="h2"
              component="h1"
              fontWeight="bold"
              gutterBottom
              sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" } }}
            >
              Power Your Journey with
              <br />
              Smart EV Charging
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.9,
                fontWeight: 300,
                fontSize: { xs: "1.2rem", md: "1.5rem" },
              }}
            >
              Comprehensive EV charging station management system with advanced
              booking, monitoring, and analytics capabilities.
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "white",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  borderWidth: "2px",
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                    borderWidth: "2px",
                  },
                }}
                endIcon={<ArrowForward />}
                onClick={handleOpenLoginModal}
              >
                Admin/Operator Login
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, bgcolor: "background.paper" }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 4,
              textAlign: "center",
            }}
          >
            {stats.map((stat, index) => (
              <Box key={index}>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  color="primary.main"
                  gutterBottom
                >
                  {stat.number}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: "grey.50" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              component="h2"
              fontWeight="bold"
              gutterBottom
            >
              Why Choose Our Platform?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: "auto" }}
            >
              Built for the future of electric mobility with cutting-edge
              technology and user-centric design.
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 4,
            }}
          >
            {features.map((feature, index) => (
              <Card
                key={index}
                sx={{
                  height: "100%",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-8px)",
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: "center" }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      p: 2,
                      borderRadius: "50%",
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      mb: 3,
                    }}
                  >
                    {React.cloneElement(feature.icon, { sx: { fontSize: 40 } })}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: "white",
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            gutterBottom
          >
            Ready to Get Started?
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, opacity: 0.9, fontWeight: 300 }}
          >
            Join thousands of businesses already using our EV charging
            management system. Start your journey towards sustainable
            transportation today.
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: "white",
                color: "white",
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                borderWidth: "2px",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: alpha(theme.palette.common.white, 0.1),
                  borderWidth: "2px",
                },
              }}
              onClick={handleOpenLoginModal}
            >
              Access Dashboard
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{ py: 4, bgcolor: "grey.900", color: "white", textAlign: "center" }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <EvStation sx={{ fontSize: 28 }} />
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: "white", mb: 1 }}
            >
              EV Charging System
            </Typography>
          </Box>
          <Typography variant="body2" color="white">
            © 2025 EV Charging System. All rights reserved. Powering the future
            of electric mobility.
          </Typography>
        </Container>
      </Box>

      {/* Login Modal */}
      <Modal
        open={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        aria-labelledby="login-modal-title"
        aria-describedby="login-modal-description"
        sx={{
          backdropFilter: "blur(8px)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "85%", sm: 380 },
            maxWidth: 380,
            bgcolor: "background.paper",
            borderRadius: 4,
            boxShadow:
              "0 25px 50px -12px rgb(0 0 0 / 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Modal Header with Gradient */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              p: 2.5,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  'url(\'data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.1"><circle cx="30" cy="30" r="2"/></g></svg>\') repeat',
              },
            }}
          >
            {/* Close Button */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mb: 2,
                position: "relative",
                zIndex: 1,
              }}
            >
              <IconButton
                onClick={handleCloseLoginModal}
                size="small"
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  },
                }}
              >
                <Close />
              </IconButton>
            </Box>

            {/* Header Content */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  mb: 2.5,
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                }}
              >
                <ElectricCar sx={{ fontSize: 36, color: "white" }} />
              </Box>
              <Typography
                variant="h5"
                component="h1"
                gutterBottom
                align="center"
                fontWeight="bold"
                sx={{ color: "white !important", mb: 1 }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body1"
                align="center"
                sx={{ color: "white !important", mb: 0 }}
              >
                Choose your access level and sign in
              </Typography>
            </Box>
          </Box>

          {/* Modal Body */}
          <Box sx={{ p: 3 }}>
            {/* Login Type Toggle */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <ToggleButtonGroup
                value={loginType}
                exclusive
                onChange={handleLoginTypeChange}
                aria-label="login type"
                size="medium"
                sx={{
                  backgroundColor: "grey.50",
                  borderRadius: 3,
                  p: 0.5,
                  "& .MuiToggleButton-root": {
                    px: 3,
                    py: 1.5,
                    borderRadius: 2.5,
                    border: "none",
                    color: "text.secondary",
                    fontWeight: 500,
                    transition: "all 0.2s ease-in-out",
                    "&.Mui-selected": {
                      backgroundColor: "white",
                      color: "primary.main",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      "&:hover": {
                        backgroundColor: "white",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "grey.100",
                    },
                  },
                }}
              >
                <ToggleButton value="backoffice" aria-label="backoffice login">
                  <AdminPanelSettings sx={{ mr: 1.5, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight={600}>
                    Admin Portal
                  </Typography>
                </ToggleButton>
                <ToggleButton value="operator" aria-label="operator login">
                  <Engineering sx={{ mr: 1.5, fontSize: 20 }} />
                  <Typography variant="body2" fontWeight={600}>
                    Operator Portal
                  </Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Login Type Info */}
            <Box sx={{ mb: 3, textAlign: "center" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 3,
                  py: 1.5,
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                {loginType === "backoffice" ? (
                  <AdminPanelSettings />
                ) : (
                  <Engineering />
                )}
                <Typography
                  variant="body2"
                  fontWeight={500}
                  color="primary.main"
                >
                  {loginType === "backoffice"
                    ? "Full Administrative Access"
                    : "Station Management Access"}
                </Typography>
              </Box>
            </Box>

            {/* Error Alert */}
            {state.error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    fontSize: 20,
                  },
                }}
              >
                {state.error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                id="username"
                name="username"
                label={`${
                  loginType === "backoffice" ? "Admin" : "Operator"
                } Username`}
                placeholder={
                  loginType === "backoffice"
                    ? "Enter admin username"
                    : "Enter operator username"
                }
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                margin="normal"
                required
                autoComplete="username"
                autoFocus
                disabled={isSubmitting}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "grey.50",
                    "&:hover": {
                      backgroundColor: "white",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "white",
                    },
                  },
                }}
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
                        sx={{ color: "text.secondary" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 4,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "grey.50",
                    "&:hover": {
                      backgroundColor: "white",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "white",
                    },
                  },
                }}
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
                  py: 2,
                  borderRadius: 2.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                    boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                    transform: "translateY(-1px)",
                  },
                  "&:disabled": {
                    background: "grey.300",
                    boxShadow: "none",
                    transform: "none",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {isSubmitting
                  ? "Signing In..."
                  : `Sign In as ${
                      loginType === "backoffice" ? "Admin" : "Operator"
                    }`}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default LandingPage;
