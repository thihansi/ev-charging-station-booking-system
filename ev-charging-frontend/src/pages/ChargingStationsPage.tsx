import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Snackbar,
  Tooltip,
  Menu,
  Grid,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Refresh,
  MoreVert,
  LocationOn,
  PowerSettingsNew,
  EvStation,
  Visibility,
  QrCode,
} from "@mui/icons-material";
import { chargingStationApi } from "../api";
import type {
  ChargingStation,
  CreateChargingStationRequest,
  UpdateChargingStationRequest,
  StationType,
  OperationalHours,
} from "../types";

interface ChargingStationFormData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  stationType: StationType;
  totalSlots: number;
  openTime: string;
  closeTime: string;
}

const ChargingStationsPage: React.FC = () => {
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStation, setEditingStation] = useState<ChargingStation | null>(
    null
  );
  const [formData, setFormData] = useState<ChargingStationFormData>({
    name: "",
    address: "",
    latitude: 0,
    longitude: 0,
    stationType: "AC",
    totalSlots: 1,
    openTime: "08:00",
    closeTime: "18:00",
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [updateConfirmOpen, setUpdateConfirmOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [stationToDelete, setStationToDelete] =
    useState<ChargingStation | null>(null);
  const [statusAction, setStatusAction] = useState<
    "activate" | "deactivate" | null
  >(null);
  const [statusActionStation, setStatusActionStation] =
    useState<ChargingStation | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStation, setSelectedStation] =
    useState<ChargingStation | null>(null);

  const fetchChargingStations = async () => {
    try {
      setLoading(true);
      setError(null);
      const stationsData = await chargingStationApi.getAll();

      // Handle potential wrapped response format
      if (Array.isArray(stationsData)) {
        setChargingStations(stationsData);
      } else if (
        stationsData &&
        typeof stationsData === "object" &&
        "stations" in stationsData
      ) {
        const wrappedResponse = stationsData as { stations: ChargingStation[] };
        if (Array.isArray(wrappedResponse.stations)) {
          setChargingStations(wrappedResponse.stations);
        } else {
          setChargingStations([]);
          setError("Invalid stations data format");
        }
      } else {
        setChargingStations([]);
        setError("Unexpected data format received from server");
      }
    } catch (err: any) {
      console.error("❌ Error fetching charging stations:", err);
      setError(
        err.response?.data?.message || "Failed to fetch charging stations"
      );
      setChargingStations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChargingStations();
  }, []);

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      latitude: 0,
      longitude: 0,
      stationType: "AC",
      totalSlots: 1,
      openTime: "08:00",
      closeTime: "18:00",
    });
    setEditingStation(null);
  };

  const handleOpenDialog = (station?: ChargingStation) => {
    if (station) {
      setEditingStation(station);
      setFormData({
        name: station.name,
        address: station.address,
        latitude: station.latitude,
        longitude: station.longitude,
        stationType: station.stationType,
        totalSlots: station.totalSlots,
        openTime: station.operationalHours?.openTime || "08:00",
        closeTime: station.operationalHours?.closeTime || "18:00",
      });
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleInputChange = (
    field: keyof ChargingStationFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (editingStation) {
      setUpdateConfirmOpen(true);
    } else {
      await performSubmit();
    }
  };

  const performSubmit = async () => {
    try {
      setSubmitting(true);

      const operationalHours: OperationalHours = {
        openTime: formData.openTime,
        closeTime: formData.closeTime,
      };

      if (editingStation) {
        // Update existing charging station
        const updateData: UpdateChargingStationRequest = {
          name: formData.name,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          stationType: formData.stationType,
          totalSlots: formData.totalSlots,
          operationalHours,
        };
        await chargingStationApi.update(editingStation.id, updateData);
        showSnackbar("Charging station updated successfully");
      } else {
        // Create new charging station
        const createData: CreateChargingStationRequest = {
          name: formData.name,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          stationType: formData.stationType,
          totalSlots: formData.totalSlots,
          operationalHours,
        };
        await chargingStationApi.create(createData);
        showSnackbar("Charging station created successfully");
      }

      handleCloseDialog();
      setUpdateConfirmOpen(false);
      fetchChargingStations();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || "Operation failed", "error");
      console.error("Error submitting form:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (station: ChargingStation) => {
    setStationToDelete(station);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!stationToDelete) return;

    try {
      await chargingStationApi.delete(stationToDelete.id);
      showSnackbar("Charging station deleted successfully");
      fetchChargingStations();
    } catch (err: any) {
      showSnackbar(
        err.response?.data?.message || "Failed to delete charging station",
        "error"
      );
      console.error("Error deleting charging station:", err);
    } finally {
      setDeleteConfirmOpen(false);
      setStationToDelete(null);
    }
  };

  const handleStatusAction = (
    station: ChargingStation,
    action: "activate" | "deactivate"
  ) => {
    setStatusActionStation(station);
    setStatusAction(action);
    setStatusConfirmOpen(true);
    handleCloseMenu();
  };

  const confirmStatusAction = async () => {
    if (!statusActionStation || !statusAction) return;

    try {
      if (statusAction === "activate") {
        await chargingStationApi.activate(statusActionStation.id);
        showSnackbar("Charging station activated successfully");
      } else {
        await chargingStationApi.deactivate(statusActionStation.id);
        showSnackbar("Charging station deactivated successfully");
      }
      fetchChargingStations();
    } catch (err: any) {
      showSnackbar(
        err.response?.data?.message ||
          `Failed to ${statusAction} charging station`,
        "error"
      );
      console.error(`Error ${statusAction} charging station:`, err);
    } finally {
      setStatusConfirmOpen(false);
      setStatusActionStation(null);
      setStatusAction(null);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "success" : "error";
  };

  const getStationTypeColor = (type: StationType) => {
    return type === "AC" ? "primary" : "secondary";
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    station: ChargingStation
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedStation(station);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedStation(null);
  };

  const handleViewQRCode = (station: ChargingStation) => {
    // TODO: Implement QR code viewing functionality
    showSnackbar(`QR Code for ${station.name}`, "info");
    handleCloseMenu();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Charging Stations Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage electric vehicle charging stations, their locations, and
          operational status
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Action Bar */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Create New Station
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchChargingStations}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Charging Stations Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Station Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Slots</TableCell>
                  <TableCell>Hours</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(chargingStations) ||
                  chargingStations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">
                        {!Array.isArray(chargingStations)
                          ? "Error: Invalid data format"
                          : "No charging stations found. Create your first station to get started."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  chargingStations.map((station) => (
                    <TableRow key={station.id} hover>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <EvStation />
                          <Typography fontWeight="medium">
                            {station.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2">
                            {station.address}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={station.stationType}
                          color={getStationTypeColor(station.stationType)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography>{station.availableSlots}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {station.operationalHours?.openTime &&
                          station.operationalHours?.closeTime
                            ? `${station.operationalHours.openTime} - ${station.operationalHours.closeTime}`
                            : "Not specified"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<PowerSettingsNew />}
                          label={station.isActive ? "Active" : "Inactive"}
                          color={getStatusColor(station.isActive)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Tooltip title="Edit Station">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(station)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More Actions">
                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenMenu(e, station)}
                            >
                              <MoreVert />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {selectedStation?.isActive
          ? [
              <MenuItem
                key="deactivate"
                onClick={() =>
                  handleStatusAction(selectedStation, "deactivate")
                }
              >
                <PowerSettingsNew sx={{ mr: 1 }} />
                Deactivate
              </MenuItem>,
            ]
          : [
              <MenuItem
                key="activate"
                onClick={() => handleStatusAction(selectedStation!, "activate")}
              >
                <PowerSettingsNew sx={{ mr: 1 }} />
                Activate
              </MenuItem>,
            ]}
        <MenuItem onClick={() => handleViewQRCode(selectedStation!)}>
          <QrCode sx={{ mr: 1 }} />
          View QR Code
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedStation!)}>
          <Delete sx={{ mr: 1 }} color="error" />
          Delete
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStation
            ? "Edit Charging Station"
            : "Create New Charging Station"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Station Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  fullWidth
                  required
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Latitude"
                  type="number"
                  value={formData.latitude}
                  onChange={(e) =>
                    handleInputChange(
                      "latitude",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  fullWidth
                  required
                  inputProps={{ step: "any" }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Longitude"
                  type="number"
                  value={formData.longitude}
                  onChange={(e) =>
                    handleInputChange(
                      "longitude",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  fullWidth
                  required
                  inputProps={{ step: "any" }}
                />
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Station Type</InputLabel>
                  <Select
                    value={formData.stationType}
                    onChange={(e) =>
                      handleInputChange(
                        "stationType",
                        e.target.value as StationType
                      )
                    }
                    label="Station Type"
                  >
                    <MenuItem value="AC">AC</MenuItem>
                    <MenuItem value="DC">DC</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Total Slots"
                  type="number"
                  value={formData.totalSlots}
                  onChange={(e) =>
                    handleInputChange(
                      "totalSlots",
                      parseInt(e.target.value) || 1
                    )
                  }
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Opening Time"
                  type="time"
                  value={formData.openTime}
                  onChange={(e) =>
                    handleInputChange("openTime", e.target.value)
                  }
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Closing Time"
                  type="time"
                  value={formData.closeTime}
                  onChange={(e) =>
                    handleInputChange("closeTime", e.target.value)
                  }
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              submitting ||
              !formData.name ||
              !formData.address ||
              !formData.latitude ||
              !formData.longitude ||
              !formData.totalSlots
            }
          >
            {submitting ? (
              <CircularProgress size={20} />
            ) : editingStation ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography
            variant="h6"
            component="div"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Delete color="error" />
            Confirm Delete Charging Station
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete charging station{" "}
            <strong>"{stationToDelete?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            This action cannot be undone. All associated bookings and data will
            be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete Station
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Confirmation Dialog */}
      <Dialog
        open={updateConfirmOpen}
        onClose={() => setUpdateConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography
            variant="h6"
            component="div"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Edit color="primary" />
            Confirm Update Charging Station
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to update charging station{" "}
            <strong>"{editingStation?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            The station's information will be permanently changed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={performSubmit}
            color="primary"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : "Update Station"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Action Confirmation Dialog */}
      <Dialog
        open={statusConfirmOpen}
        onClose={() => setStatusConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography
            variant="h6"
            component="div"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <PowerSettingsNew
              color={statusAction === "deactivate" ? "error" : "success"}
            />
            Confirm{" "}
            {statusAction
              ? statusAction.charAt(0).toUpperCase() + statusAction.slice(1)
              : ""}{" "}
            Station
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to <strong>{statusAction}</strong> charging
            station <strong>"{statusActionStation?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {statusAction === "deactivate"
              ? "The station will be unavailable for new bookings."
              : "The station will be available for bookings again."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmStatusAction}
            color={statusAction === "deactivate" ? "error" : "success"}
            variant="contained"
          >
            {statusAction
              ? statusAction.charAt(0).toUpperCase() + statusAction.slice(1)
              : "Action"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Box>
  );
};

export default ChargingStationsPage;
