import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  InputAdornment,
  Toolbar,
} from "@mui/material";
import {
  Add,
  Search,
  Refresh,
  MoreVert,
  LocationOn,
  Edit,
  Visibility,
  PowerSettingsNew,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useNotificationContext } from "../context/NotificationContext";
import { chargingStationApi } from "../api";
import { ROUTES } from "../utils/constants";
import { formatDateTime } from "../utils/helpers";
import type { ChargingStation } from "../types";

const ChargingStationListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotificationContext();

  const [chargingStations, setChargingStations] = useState<ChargingStation[]>(
    []
  );
  const [filteredStations, setFilteredStations] = useState<ChargingStation[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStation, setSelectedStation] =
    useState<ChargingStation | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    action: () => {},
  });

  useEffect(() => {
    loadChargingStations();
  }, []);

  useEffect(() => {
    // Filter stations based on search term
    if (!searchTerm.trim()) {
      setFilteredStations(chargingStations);
    } else {
      const filtered = chargingStations.filter(
        (station) =>
          station.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          station.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          station.stationType.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStations(filtered);
    }
  }, [searchTerm, chargingStations]);

  const loadChargingStations = async () => {
    setIsLoading(true);
    try {
      const stations = await chargingStationApi.getAll();
      setChargingStations(stations);
      setFilteredStations(stations);
    } catch (error) {
      showError("Failed to load charging stations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    station: ChargingStation
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedStation(station);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedStation(null);
  };

  const handleView = () => {
    if (selectedStation) {
      navigate(
        ROUTES.BACKOFFICE.CHARGING_STATIONS_VIEW.replace(
          ":id",
          selectedStation.id
        )
      );
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedStation) {
      navigate(
        ROUTES.BACKOFFICE.CHARGING_STATIONS_EDIT.replace(
          ":id",
          selectedStation.id
        )
      );
    }
    handleMenuClose();
  };

  const handleDeactivate = () => {
    if (!selectedStation) return;

    setConfirmDialog({
      open: true,
      title: "Deactivate Charging Station",
      message: `Are you sure you want to deactivate ${selectedStation.name}? This will remove it from the system.`,
      action: async () => {
        try {
          await chargingStationApi.delete(selectedStation.id);
          showSuccess("Charging station deactivated successfully");
          await loadChargingStations();
        } catch (error) {
          showError("Failed to deactivate charging station");
        }
      },
    });
    handleMenuClose();
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "success" : "error";
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive";
  };

  const handleConfirmAction = () => {
    confirmDialog.action();
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Charging Station Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage charging stations and their locations
        </Typography>
      </Box>

      {/* Toolbar */}
      <Card sx={{ mb: 3 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <TextField
            placeholder="Search by ID, name, location, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadChargingStations}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() =>
                navigate(ROUTES.BACKOFFICE.CHARGING_STATIONS_CREATE)
              }
            >
              Add Charging Station
            </Button>
          </Box>
        </Toolbar>
      </Card>

      {/* Loading */}
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Stations Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Station ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStations.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchTerm
                          ? "No charging stations found matching your search."
                          : "No charging stations found."}
                      </Typography>
                      {!searchTerm && (
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() =>
                            navigate(ROUTES.BACKOFFICE.CHARGING_STATIONS_CREATE)
                          }
                          sx={{ mt: 2 }}
                        >
                          Add First Charging Station
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStations.map((station) => (
                    <TableRow key={station.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {station.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {station.name}
                        </Typography>
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
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(station.isActive)}
                          color={getStatusColor(station.isActive)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(station.updatedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, station)}
                        >
                          <MoreVert />
                        </IconButton>
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
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeactivate} sx={{ color: "warning.main" }}>
          <PowerSettingsNew fontSize="small" sx={{ mr: 1 }} />
          Deactivate
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChargingStationListPage;
