import React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  useTheme,
  alpha,
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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../utils/constants";

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <EvStation />,
      title: "Smart Charging Network",
      description: "Comprehensive management of EV charging stations with real-time monitoring and availability tracking.",
    },
    {
      icon: <Speed />,
      title: "Fast & Efficient",
      description: "Quick booking process with instant confirmation and seamless charging session management.",
    },
    {
      icon: <QrCodeScanner />,
      title: "QR Code Integration",
      description: "Simple QR code scanning for booking validation and charging session initialization.",
    },
    {
      icon: <Security />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with role-based access control and data protection.",
    },
    {
      icon: <Dashboard />,
      title: "Advanced Analytics",
      description: "Comprehensive dashboards with booking statistics, station utilization, and revenue insights.",
    },
    {
      icon: <Nature />,
      title: "Eco-Friendly",
      description: "Promoting sustainable transportation through efficient EV charging infrastructure management.",
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
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${theme.palette.divider}`,
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
              <EvStation sx={{ fontSize: 32, color: "primary.main" }} />
              <Typography variant="h6" fontWeight="bold" color="primary">
                EV Charging System
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<LoginOutlined />}
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Login
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
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.common.white, 0.9),
                  },
                }}
                endIcon={<ArrowForward />}
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "white",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                  },
                }}
              >
                Learn More
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
              gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
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
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
              Why Choose Our Platform?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
              Built for the future of electric mobility with cutting-edge technology
              and user-centric design.
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
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
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, opacity: 0.9, fontWeight: 300 }}
          >
            Join thousands of businesses already using our EV charging management system.
            Start your journey towards sustainable transportation today.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "secondary.main",
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                "&:hover": {
                  bgcolor: alpha(theme.palette.common.white, 0.9),
                },
              }}
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Access Dashboard
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, bgcolor: "grey.900", color: "white", textAlign: "center" }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 2 }}>
            <EvStation sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold">
              EV Charging System
            </Typography>
          </Box>
          <Typography variant="body2" color="grey.400">
            © 2025 EV Charging System. All rights reserved. Powering the future of electric mobility.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;