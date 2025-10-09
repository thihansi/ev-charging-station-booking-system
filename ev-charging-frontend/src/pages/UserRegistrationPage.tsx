import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Container,
  Paper,
  Divider,
  CircularProgress,
  FormHelperText,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  AdminPanelSettings as AdminIcon,
  Engineering as OperatorIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api";

interface UserRegistrationData {
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  email: string;
  role: "Backoffice" | "StationOperator" | "";
  assignedStationId?: string;
}

interface FormErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  email?: string;
  role?: string;
}

const UserRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<UserRegistrationData>({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    email: "",
    role: "",
    assignedStationId: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Sample charging stations for dropdown (in real app, fetch from API)
  const chargingStations = [
    { id: "STATION_001", name: "Colombo Central Station" },
    { id: "STATION_002", name: "Kandy Main Station" },
    { id: "STATION_003", name: "Highway Rest Stop" },
    { id: "STATION_004", name: "Airport Terminal" },
    { id: "STATION_005", name: "Galle Shopping Center" },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof UserRegistrationData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const requestBody = {
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
        ...(formData.role === "StationOperator" &&
          formData.assignedStationId && {
            assignedStationId: formData.assignedStationId,
          }),
      };

      if (formData.role === "Backoffice") {
        await authApi.createBackofficeUser(requestBody);
      } else {
        await authApi.createStationOperator(requestBody);
      }

      setSuccess(true);
      setError("");

      // Clear form
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        email: "",
        role: "",
        assignedStationId: "",
      });

      // Show success message and redirect after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      role: "",
      assignedStationId: "",
    });
    setErrors({});
    setError("");
    setSuccess(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            User Registration
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Create new Backoffice Admin or Station Operator accounts
          </Typography>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            User registered successfully! Redirecting to dashboard...
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                error={!!errors.username}
                helperText={errors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                required
              />

              <TextField
                fullWidth
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                error={!!errors.fullName}
                helperText={errors.fullName}
                required
              />
            </Box>

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
              required
            />

            {/* Password Section */}
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                color="primary"
                sx={{ mt: 2 }}
              >
                Password Setup
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                error={!!errors.password}
                helperText={errors.password || "Minimum 6 characters"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
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
                required
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Box>

            {/* Role Selection */}
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                color="primary"
                sx={{ mt: 2 }}
              >
                Role Assignment
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Box>

            <Box display="flex" gap={2}>
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel>User Role *</InputLabel>
                <Select
                  value={formData.role}
                  label="User Role *"
                  onChange={(e) => handleInputChange("role", e.target.value)}
                >
                  <MenuItem value="Backoffice">
                    <Box display="flex" alignItems="center">
                      <AdminIcon sx={{ mr: 1 }} />
                      Backoffice Admin
                    </Box>
                  </MenuItem>
                  <MenuItem value="StationOperator">
                    <Box display="flex" alignItems="center">
                      <OperatorIcon sx={{ mr: 1 }} />
                      Station Operator
                    </Box>
                  </MenuItem>
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>

              {/* Station Assignment (only for Station Operators) */}
              {formData.role === "StationOperator" && (
                <FormControl fullWidth>
                  <InputLabel>Assigned Station (Optional)</InputLabel>
                  <Select
                    value={formData.assignedStationId || ""}
                    label="Assigned Station (Optional)"
                    onChange={(e) =>
                      handleInputChange("assignedStationId", e.target.value)
                    }
                  >
                    <MenuItem value="">
                      <em>No specific assignment</em>
                    </MenuItem>
                    {chargingStations.map((station) => (
                      <MenuItem key={station.id} value={station.id}>
                        {station.name} ({station.id})
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Station operators can be assigned to specific stations
                  </FormHelperText>
                </FormControl>
              )}
            </Box>

            {/* Role Description */}
            {formData.role && (
              <Card variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {formData.role === "Backoffice"
                    ? "Backoffice Admin"
                    : "Station Operator"}{" "}
                  Permissions:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.role === "Backoffice"
                    ? "• Full system access • User management • Station management • Booking oversight • System configuration • Reports and analytics"
                    : "• Station-specific access • Booking management • QR code scanning • Session monitoring • Customer support • Station maintenance logs"}
                </Typography>
              </Card>
            )}

            {/* Action Buttons */}
            <Box display="flex" gap={2} justifyContent="center" sx={{ mt: 3 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={handleClear}
                startIcon={<ClearIcon />}
                disabled={loading}
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <SaveIcon />
                }
                sx={{ minWidth: 150 }}
              >
                {loading ? "Creating..." : "Register User"}
              </Button>
            </Box>

            {/* Information Cards */}
            <Box mt={4}>
              <Typography variant="h6" gutterBottom color="primary">
                Registration Information
              </Typography>
              <Box display="flex" gap={2}>
                <Card variant="outlined" sx={{ p: 2, flex: 1 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    🔐 Security Requirements
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Minimum 6 characters for password
                    <br />
                    • Unique username required
                    <br />
                    • Valid email address
                    <br />• Passwords are securely hashed
                  </Typography>
                </Card>
                <Card variant="outlined" sx={{ p: 2, flex: 1 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    ⚡ Quick Setup
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Users can login immediately
                    <br />
                    • No email verification required
                    <br />
                    • Role-based access automatically applied
                    <br />• Station assignments can be modified later
                  </Typography>
                </Card>
              </Box>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default UserRegistrationPage;
