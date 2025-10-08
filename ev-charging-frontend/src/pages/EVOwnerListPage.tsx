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
  Paper,
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
  MoreVert,
  Edit,
  Delete,
  PersonOff,
  PersonAdd,
  Refresh,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useNotificationContext } from "../context/NotificationContext";
import { evOwnerApi } from "../api";
import { ROUTES } from "../utils/constants";
import { formatDateTime } from "../utils/helpers";
import type { EVOwner } from "../types";

const EVOwnerListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotificationContext();

  const [evOwners, setEvOwners] = useState<EVOwner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<EVOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOwner, setSelectedOwner] = useState<EVOwner | null>(null);
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

  const loadEvOwners = async () => {
    setIsLoading(true);
    try {
      const owners = await evOwnerApi.getAll();
      setEvOwners(owners);
      setFilteredOwners(owners);
    } catch (error) {
      showError("Failed to load EV owners");
      console.error("Error loading EV owners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvOwners();
  }, []);

  useEffect(() => {
    // Filter owners based on search term
    if (searchTerm.trim() === "") {
      setFilteredOwners(evOwners);
    } else {
      const filtered = evOwners.filter(
        (owner) =>
          owner.nic.toLowerCase().includes(searchTerm.toLowerCase()) ||
          owner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          owner.phoneNumber.includes(searchTerm)
      );
      setFilteredOwners(filtered);
    }
  }, [searchTerm, evOwners]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    owner: EVOwner
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedOwner(owner);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedOwner(null);
  };

  const handleEdit = () => {
    if (selectedOwner) {
      navigate(
        ROUTES.BACKOFFICE.EV_OWNERS_EDIT.replace(":nic", selectedOwner.nic)
      );
    }
    handleMenuClose();
  };

  const handleActivate = async () => {
    if (!selectedOwner) return;

    try {
      await evOwnerApi.activate(selectedOwner.nic);
      showSuccess("EV Owner activated successfully");
      await loadEvOwners();
    } catch (error) {
      showError("Failed to activate EV owner");
    }
    handleMenuClose();
  };

  const handleDeactivate = async () => {
    if (!selectedOwner) return;

    setConfirmDialog({
      open: true,
      title: "Deactivate EV Owner",
      message: `Are you sure you want to deactivate ${selectedOwner.fullName}? They won't be able to make new bookings.`,
      action: async () => {
        try {
          await evOwnerApi.deactivate(selectedOwner.nic);
          showSuccess("EV Owner deactivated successfully");
          await loadEvOwners();
        } catch (error) {
          showError("Failed to deactivate EV owner");
        }
      },
    });
    handleMenuClose();
  };

  const handleDelete = () => {
    if (!selectedOwner) return;

    setConfirmDialog({
      open: true,
      title: "Delete EV Owner",
      message: `Are you sure you want to permanently delete ${selectedOwner.fullName}? This action cannot be undone.`,
      action: async () => {
        try {
          await evOwnerApi.delete(selectedOwner.nic);
          showSuccess("EV Owner deleted successfully");
          await loadEvOwners();
        } catch (error) {
          showError("Failed to delete EV owner");
        }
      },
    });
    handleMenuClose();
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
          EV Owner Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage electric vehicle owners and their accounts
        </Typography>
      </Box>

      {/* Toolbar */}
      <Card sx={{ mb: 3 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <TextField
            placeholder="Search by NIC, name, email, or phone..."
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
              onClick={loadEvOwners}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate(ROUTES.BACKOFFICE.EV_OWNERS_CREATE)}
            >
              Add EV Owner
            </Button>
          </Box>
        </Toolbar>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading && <LinearProgress />}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>NIC</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Full Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Email</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Phone</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Created</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOwners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {isLoading
                          ? "Loading..."
                          : searchTerm
                          ? "No EV owners found matching your search"
                          : "No EV owners yet"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOwners.map((owner) => (
                    <TableRow key={owner.nic} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {owner.nic}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {owner.fullName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{owner.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {owner.phoneNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Chip
                            label={owner.isActive ? "Active" : "Inactive"}
                            color={owner.isActive ? "success" : "default"}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={owner.isVerified ? "Verified" : "Unverified"}
                            color={owner.isVerified ? "info" : "warning"}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(owner.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, owner)}
                          size="small"
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

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        {selectedOwner?.isActive ? (
          <MenuItem onClick={handleDeactivate}>
            <PersonOff sx={{ mr: 2 }} />
            Deactivate
          </MenuItem>
        ) : (
          <MenuItem onClick={handleActivate}>
            <PersonAdd sx={{ mr: 2 }} />
            Activate
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Delete sx={{ mr: 2 }} />
          Delete
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

export default EVOwnerListPage;
