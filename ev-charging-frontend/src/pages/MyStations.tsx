import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Paper,
  Divider,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  ElectricCar,
  LocationOn,
  PowerSettingsNew,
  Assessment,
  Refresh,
  Visibility,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNotificationContext } from "../context/NotificationContext";
import { chargingStationApi } from "../api";
import type { ChargingStation, CreateChargingStationRequest, UpdateChargingStationRequest, StationType, OperationalHours } from "../types";

interface StationFormData {
  name: string;
  address: string;
  stationType: StationType;
  latitude: number;
  longitude: number;
  totalSlots: number;
  operationalHours: OperationalHours;
  isActive: boolean;
}

const MyStations: React.FC = () => {
  const { state } = useAuth();
  const { showError, showSuccess } = useNotificationContext();
  
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [formData, setFormData] = useState<StationFormData>({
    name: "",
    address: "",
    stationType: "AC",
    latitude: 0,
    longitude: 0,
    totalSlots: 1,
    operationalHours: {
      openTime: "00:00",
      closeTime: "23:59",
    },
    isActive: true,
  });

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    setIsLoading(true);
    try {
      console.log("🔄 Loading charging stations...");
      const data = await chargingStationApi.getAll();
      // Filter stations owned by current operator (if API supports it)
      // For now, we'll show all stations - in real implementation, this should be filtered by operator
      console.log("✅ Stations loaded:", data);
      setStations(data);
    } catch (error: any) {
      console.error("❌ Error loading stations:", error);
      if (error.response?.status === 403) {
        showError("Access denied. You don't have permission to view charging stations.");
      } else if (error.response?.status === 401) {
        showError("Session expired. Please log in again.");
      } else {
        showError("Failed to load charging stations. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStation = () => {
    setFormData({
      name: "",
      address: "",
      stationType: "AC",
      latitude: 0,
      longitude: 0,
      totalSlots: 1,
      operationalHours: {
        openTime: "08:00",
        closeTime: "20:00",
      },
      isActive: true,
    });
    setAddDialogOpen(true);
  };

  const handleViewStation = (station: ChargingStation) => {
    setSelectedStation(station);
    setViewDialogOpen(true);
  };

  const handleEditStation = (station: ChargingStation) => {
    setSelectedStation(station);
    setFormData({
      name: station.name,
      address: station.address,
      stationType: station.stationType,
      latitude: station.latitude,
      longitude: station.longitude,
      totalSlots: station.totalSlots,
      operationalHours: station.operationalHours || {
        openTime: "08:00",
        closeTime: "20:00",
      },
      isActive: station.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteStation = async (stationId: string) => {
    if (!confirm("Are you sure you want to delete this charging station?")) {
      return;
    }

    try {
      console.log("🗑️ Deleting station with ID:", stationId);
      await chargingStationApi.delete(stationId);
      console.log("✅ Station deleted successfully");
      showSuccess("Charging station deleted successfully!");
      await loadStations();
    } catch (error: any) {
      console.error("❌ Error deleting station:", {
        stationId,
        status: error.response?.status,
        data: error.response?.data,
        error,
      });
      
      if (error.response?.status === 404) {
        showError("Station not found. It may have already been deleted.");
      } else if (error.response?.status === 403) {
        showError("You don't have permission to delete this station.");
      } else {
        showError(
          error.response?.data?.message || "Failed to delete charging station. Please try again."
        );
      }
    }
  };

  const handleToggleStatus = async (station: ChargingStation) => {
    try {
      const newStatus = !station.isActive;
      console.log("🔄 Toggling station status:", {
        stationId: station.id,
        stationName: station.name,
        currentStatus: station.isActive,
        newStatus: newStatus,
      });

      // Use the dedicated activate/deactivate endpoints
      if (newStatus) {
        console.log("🟢 Calling activate endpoint");
        await chargingStationApi.activate(station.id);
        showSuccess("Station activated successfully!");
      } else {
        console.log("� Calling deactivate endpoint");
        await chargingStationApi.deactivate(station.id);
        showSuccess("Station deactivated successfully!");
      }
      
      await loadStations();
    } catch (error: any) {
      console.error("❌ Failed to toggle station status:", error);
      console.error("Error response:", JSON.stringify(error.response?.data, null, 2));
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.title
        || "Failed to update station status. Please try again.";
      
      showError(errorMessage);
    }
  };

  const handleSaveStation = async () => {
    try {
      if (selectedStation) {
        // Update existing station
        const updateData: UpdateChargingStationRequest = {
          name: formData.name,
          address: formData.address,
          stationType: formData.stationType,
          latitude: formData.latitude,
          longitude: formData.longitude,
          totalSlots: formData.totalSlots,
          operationalHours: formData.operationalHours,
        };
        await chargingStationApi.update(selectedStation.id, updateData);
        showSuccess("Charging station updated successfully!");
        setEditDialogOpen(false);
      } else {
        // Create new station
        const createData: CreateChargingStationRequest = {
          name: formData.name,
          address: formData.address,
          stationType: formData.stationType,
          latitude: formData.latitude,
          longitude: formData.longitude,
          totalSlots: formData.totalSlots,
          operationalHours: formData.operationalHours,
        };
        await chargingStationApi.create(createData);
        showSuccess("Charging station created successfully!");
        setAddDialogOpen(false);
      }
      await loadStations();
    } catch (error: any) {
      showError(
        error.response?.data?.message || "Failed to save charging station. Please try again."
      );
    }
  };

  const handleFormChange = (field: keyof StationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getStationTypeColor = (type: string) => {
    switch (type) {
      case "DC":
        return "error";
      case "AC":
        return "primary";
      case "CHAdeMO":
        return "warning";
      case "CCS":
        return "info";
      default:
        return "default";
    }
  };

  const stats = {
    total: stations.length,
    active: stations.filter((s) => s.isActive).length,
    inactive: stations.filter((s) => !s.isActive).length,
    totalSlots: stations.reduce((sum, station) => sum + station.totalSlots, 0),
  };

  if (!state.isAuthenticated || state.user?.role !== 'StationOperator') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access denied. This page is only accessible to Station Operators.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            My Charging Stations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your charging stations and monitor their performance
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadStations}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddStation}
          >
            Add Station
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <ElectricCar sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Total Stations</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <PowerSettingsNew sx={{ mr: 1, color: "success.main" }} />
                <Typography variant="h6">Active Stations</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <PowerSettingsNew sx={{ mr: 1, color: "error.main" }} />
                <Typography variant="h6">Inactive Stations</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {stats.inactive}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Assessment sx={{ mr: 1, color: "info.main" }} />
                <Typography variant="h6">Total Slots</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {stats.totalSlots}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Stations Grid */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : stations.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <ElectricCar sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Charging Stations Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start by adding your first charging station to begin managing bookings.
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleAddStation}>
            Add Your First Station
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {stations.map((station) => (
            <Grid item xs={12} sm={6} lg={4} key={station.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: (theme) => theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Station Header */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {station.name}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {station.address}
                        </Typography>
                      </Box>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={station.isActive}
                          onChange={() => handleToggleStatus(station)}
                          size="small"
                        />
                      }
                      label=""
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Station Details */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                      <Chip
                        label={station.stationType}
                        color={getStationTypeColor(station.stationType) as any}
                        size="small"
                      />
                      <Chip
                        label={station.isActive ? "Active" : "Inactive"}
                        color={station.isActive ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Slots:</strong> {station.availableSlots}/{station.totalSlots}
                    </Typography>
                    {station.operationalHours && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Hours:</strong> {station.operationalHours.openTime} - {station.operationalHours.closeTime}
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Action Buttons */}
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleViewStation(station)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Edit Station">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditStation(station)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Station">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteStation(station.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Station Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Charging Station</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Station Name"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Station Type"
                value={formData.stationType}
                onChange={(e) => handleFormChange("stationType", e.target.value as StationType)}
              >
                <MenuItem value="AC">AC Charging</MenuItem>
                <MenuItem value="DC">DC Fast Charging</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => handleFormChange("address", e.target.value)}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={formData.latitude}
                onChange={(e) => handleFormChange("latitude", parseFloat(e.target.value))}
                inputProps={{ step: "any" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={formData.longitude}
                onChange={(e) => handleFormChange("longitude", parseFloat(e.target.value))}
                inputProps={{ step: "any" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Slots"
                type="number"
                value={formData.totalSlots}
                onChange={(e) => handleFormChange("totalSlots", parseInt(e.target.value))}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleFormChange("isActive", e.target.checked)}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Opening Time"
                type="time"
                value={formData.operationalHours.openTime}
                onChange={(e) => handleFormChange("operationalHours", {
                  ...formData.operationalHours,
                  openTime: e.target.value
                })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Closing Time"
                type="time"
                value={formData.operationalHours.closeTime}
                onChange={(e) => handleFormChange("operationalHours", {
                  ...formData.operationalHours,
                  closeTime: e.target.value
                })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveStation} variant="contained">
            Add Station
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Station Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Charging Station</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Station Name"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Station Type"
                value={formData.stationType}
                onChange={(e) => handleFormChange("stationType", e.target.value as StationType)}
              >
                <MenuItem value="AC">AC Charging</MenuItem>
                <MenuItem value="DC">DC Fast Charging</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => handleFormChange("address", e.target.value)}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={formData.latitude}
                onChange={(e) => handleFormChange("latitude", parseFloat(e.target.value))}
                inputProps={{ step: "any" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={formData.longitude}
                onChange={(e) => handleFormChange("longitude", parseFloat(e.target.value))}
                inputProps={{ step: "any" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Slots"
                type="number"
                value={formData.totalSlots}
                onChange={(e) => handleFormChange("totalSlots", parseInt(e.target.value))}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleFormChange("isActive", e.target.checked)}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Opening Time"
                type="time"
                value={formData.operationalHours.openTime}
                onChange={(e) => handleFormChange("operationalHours", {
                  ...formData.operationalHours,
                  openTime: e.target.value
                })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Closing Time"
                type="time"
                value={formData.operationalHours.closeTime}
                onChange={(e) => handleFormChange("operationalHours", {
                  ...formData.operationalHours,
                  closeTime: e.target.value
                })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveStation} variant="contained">
            Update Station
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Station Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Station Details</DialogTitle>
        <DialogContent>
          {selectedStation && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="h6" gutterBottom>
                    {selectedStation.name}
                  </Typography>
                  <Chip
                    label={selectedStation.isActive ? "Active" : "Inactive"}
                    color={selectedStation.isActive ? "success" : "default"}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Station Type
                </Typography>
                <Chip
                  label={selectedStation.stationType}
                  color={getStationTypeColor(selectedStation.stationType)}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Available Slots
                </Typography>
                <Typography variant="body1">
                  {selectedStation.totalSlots} slots
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <LocationOn fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />
                  Address
                </Typography>
                <Typography variant="body1">
                  {selectedStation.address}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Latitude
                </Typography>
                <Typography variant="body1">
                  {selectedStation.latitude}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Longitude
                </Typography>
                <Typography variant="body1">
                  {selectedStation.longitude}
                </Typography>
              </Grid>

              {selectedStation.operationalHours && (
                <>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Opening Time
                    </Typography>
                    <Typography variant="body1">
                      {selectedStation.operationalHours.openTime}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Closing Time
                    </Typography>
                    <Typography variant="body1">
                      {selectedStation.operationalHours.closeTime}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedStation && (
            <Button 
              onClick={() => {
                setViewDialogOpen(false);
                handleEditStation(selectedStation);
              }} 
              variant="contained"
            >
              Edit Station
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyStations;