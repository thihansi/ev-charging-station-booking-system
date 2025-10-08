import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowBack, Save } from "@mui/icons-material";
import { useNotificationContext } from "../context/NotificationContext";
import { chargingStationApi } from "../api";
import { ROUTES } from "../utils/constants";
import type {
  ChargingStation,
  CreateChargingStationRequest,
  UpdateChargingStationRequest,
  StationType,
} from "../types";

const ChargingStationFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useNotificationContext();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<CreateChargingStationRequest>({
    name: "",
    address: "",
    latitude: 0,
    longitude: 0,
    stationType: "AC",
    totalSlots: 1,
    operationalHours: {
      openTime: "06:00",
      closeTime: "22:00",
    },
  });

  const [station, setStation] = useState<ChargingStation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(isEditMode);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stationTypes: StationType[] = ["AC", "DC"];

  useEffect(() => {
    if (isEditMode && id) {
      loadStation();
    }
  }, [isEditMode, id]);

  const loadStation = async () => {
    if (!id) return;

    setIsInitialLoading(true);
    try {
      const stationData = await chargingStationApi.getById(id);
      setStation(stationData);

      // Set form data
      setFormData({
        name: stationData.name,
        address: stationData.address,
        latitude: stationData.latitude,
        longitude: stationData.longitude,
        stationType: stationData.stationType,
        totalSlots: stationData.totalSlots,
        operationalHours: stationData.operationalHours,
      });
    } catch (error) {
      showError("Failed to load charging station details");
      navigate(ROUTES.BACKOFFICE.CHARGING_STATIONS);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Station name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Station name must be at least 3 characters";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Address must be at least 10 characters";
    }

    if (!formData.latitude || formData.latitude === 0) {
      newErrors.latitude = "Latitude is required";
    } else if (formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = "Latitude must be between -90 and 90";
    }

    if (!formData.longitude || formData.longitude === 0) {
      newErrors.longitude = "Longitude is required";
    } else if (formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = "Longitude must be between -180 and 180";
    }

    if (formData.totalSlots < 1) {
      newErrors.totalSlots = "Total slots must be at least 1";
    }

    if (!formData.stationType) {
      newErrors.stationType = "Station type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (isEditMode && id) {
        const updateData: UpdateChargingStationRequest = {
          name: formData.name,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          stationType: formData.stationType,
          totalSlots: formData.totalSlots,
          operationalHours: formData.operationalHours,
        };
        await chargingStationApi.update(id, updateData);
        showSuccess("Charging station updated successfully");
      } else {
        await chargingStationApi.create(formData);
        showSuccess("Charging station created successfully");
      }

      navigate(ROUTES.BACKOFFICE.CHARGING_STATIONS);
    } catch (error: any) {
      showError(
        error.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} charging station`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.BACKOFFICE.CHARGING_STATIONS);
  };

  const handleInputChange = (
    field: keyof CreateChargingStationRequest,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleTimeChange = (
    timeType: "openTime" | "closeTime",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      operationalHours: {
        ...prev.operationalHours,
        [timeType]: value,
      },
    }));
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setIsLoading(false);
          showSuccess("Location updated successfully");
        },
        () => {
          setIsLoading(false);
          showError("Failed to get current location. Please enter manually.");
        }
      );
    } else {
      showError("Geolocation is not supported by this browser");
    }
  };

  if (isInitialLoading) {
    return (
      <Box>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: "center" }}>
          Loading charging station details...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleCancel}
        >
          Back to Stations
        </Button>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {isEditMode
              ? "Edit Charging Station"
              : "Create New Charging Station"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditMode
              ? `Update charging station details for ${station?.name}`
              : "Add a new EV charging station to the network"}
          </Typography>
        </Box>
      </Box>

      {/* Current Status (Edit Mode Only) */}
      {isEditMode && station && (
        <Alert
          severity={station.isActive ? "success" : "warning"}
          sx={{ mb: 3 }}
        >
          Current Status:{" "}
          <strong>{station.isActive ? "Active" : "Inactive"}</strong>
          {station.isActive
            ? " - Station is operational"
            : " - Station is temporarily disabled"}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 3,
          }}
        >
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Station Information
                </Typography>

                <Box sx={{ display: "grid", gap: 3 }}>
                  {/* Station Name */}
                  <TextField
                    label="Station Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    error={Boolean(errors.name)}
                    helperText={
                      errors.name ||
                      "Enter a descriptive name for the charging station"
                    }
                    required
                    fullWidth
                  />

                  {/* Address */}
                  <TextField
                    label="Address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    error={Boolean(errors.address)}
                    helperText={
                      errors.address ||
                      "Full street address of the charging station"
                    }
                    required
                    fullWidth
                    multiline
                    rows={2}
                  />

                  {/* Station Type */}
                  <FormControl
                    fullWidth
                    error={Boolean(errors.stationType)}
                    required
                  >
                    <InputLabel>Station Type</InputLabel>
                    <Select
                      value={formData.stationType}
                      label="Station Type"
                      onChange={(e) =>
                        handleInputChange(
                          "stationType",
                          e.target.value as StationType
                        )
                      }
                    >
                      {stationTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.stationType && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {errors.stationType}
                      </Typography>
                    )}
                  </FormControl>

                  {/* Total Slots */}
                  <TextField
                    label="Total Charging Slots"
                    type="number"
                    value={formData.totalSlots}
                    onChange={(e) =>
                      handleInputChange(
                        "totalSlots",
                        parseInt(e.target.value) || 1
                      )
                    }
                    error={Boolean(errors.totalSlots)}
                    helperText={
                      errors.totalSlots || "Number of charging slots available"
                    }
                    required
                    fullWidth
                    inputProps={{ min: 1 }}
                  />

                  {/* Operational Hours */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Operational Hours
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <TextField
                        label="Open Time"
                        type="time"
                        value={formData.operationalHours.openTime}
                        onChange={(e) =>
                          handleTimeChange("openTime", e.target.value)
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                      <TextField
                        label="Close Time"
                        type="time"
                        value={formData.operationalHours.closeTime}
                        onChange={(e) =>
                          handleTimeChange("closeTime", e.target.value)
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Box>
                  </Box>

                  {/* Location Coordinates */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Location Coordinates
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                      <TextField
                        label="Latitude"
                        type="number"
                        value={formData.latitude || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "latitude",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        error={Boolean(errors.latitude)}
                        helperText={errors.latitude}
                        required
                        fullWidth
                        inputProps={{ step: "any" }}
                      />
                      <TextField
                        label="Longitude"
                        type="number"
                        value={formData.longitude || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "longitude",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        error={Boolean(errors.longitude)}
                        helperText={errors.longitude}
                        required
                        fullWidth
                        inputProps={{ step: "any" }}
                      />
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={handleGetCurrentLocation}
                      disabled={isLoading}
                      size="small"
                    >
                      Use Current Location
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box>
            {/* Station Preview */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Station Preview
                </Typography>
                <Box sx={{ display: "grid", gap: 1 }}>
                  <Typography variant="body2">
                    <strong>Name:</strong>{" "}
                    {formData.name || "Enter station name"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {formData.stationType}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Address:</strong>{" "}
                    {formData.address || "Enter address"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Slots:</strong> {formData.totalSlots}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hours:</strong> {formData.operationalHours.openTime}{" "}
                    - {formData.operationalHours.closeTime}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Coordinates:</strong> {formData.latitude},{" "}
                    {formData.longitude}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={isLoading}
                    fullWidth
                  >
                    {isLoading
                      ? isEditMode
                        ? "Updating..."
                        : "Creating..."
                      : isEditMode
                      ? "Update Station"
                      : "Create Station"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isLoading}
                    fullWidth
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </form>

      {/* Loading Overlay */}
      {isLoading && <LinearProgress sx={{ mt: 2 }} />}
    </Box>
  );
};

export default ChargingStationFormPage;
