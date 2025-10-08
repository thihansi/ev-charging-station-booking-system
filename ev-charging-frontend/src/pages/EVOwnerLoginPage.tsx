import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { evOwnerAuthApi } from "../api";
import type { EVOwnerLoginRequest } from "../api/evOwnerAuth";

export const EVOwnerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EVOwnerLoginRequest>({
    nic: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.nic || !formData.password) {
      setError("Please enter both NIC and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await evOwnerAuthApi.login(formData);

      console.log("Login response:", response);

      // Store token and user data
      localStorage.setItem("evOwnerToken", response.token);
      localStorage.setItem("evOwnerData", JSON.stringify(response.evOwner));

      console.log("Token stored:", response.token);
      console.log("EV Owner data stored:", response.evOwner);

      // Redirect to EV Owner dashboard
      navigate("/ev-owner-dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 3,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            EV Owner Login
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 3 }}
          >
            Sign in to book charging stations
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="nic"
              label="NIC Number"
              value={formData.nic}
              onChange={handleInputChange}
              margin="normal"
              required
              autoFocus
            />

            <TextField
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              value={formData.password}
              onChange={handleInputChange}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

            <Box textAlign="center">
              <Typography variant="body2">
                Don't have an account?{" "}
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate("/ev-owner-register")}
                  underline="hover"
                >
                  Register
                </Link>
              </Typography>
            </Box>

            <Box textAlign="center" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Are you a station operator?{" "}
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate("/login")}
                  underline="hover"
                >
                  Operator Login
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
