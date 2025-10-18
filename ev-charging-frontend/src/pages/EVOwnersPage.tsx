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
} from "@mui/material";
import {
  PersonAdd,
  Edit,
  Delete,
  Refresh,
  MoreVert,
  Person,
  ToggleOn,
  ToggleOff,
  PersonOff,
  Check,
} from "@mui/icons-material";
import { evOwnerApi } from "../api";
import type { EVOwner, CreateEVOwnerRequest, UpdateEVOwnerRequest } from "../types";

interface EVOwnerFormData {
  nic: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  createWithPassword: boolean;
}

const EVOwnersPage: React.FC = () => {
  const [evOwners, setEvOwners] = useState<EVOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvOwner, setEditingEvOwner] = useState<EVOwner | null>(null);
  const [formData, setFormData] = useState<EVOwnerFormData>({
    nic: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    createWithPassword: false,
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
  const [evOwnerToDelete, setEvOwnerToDelete] = useState<EVOwner | null>(null);
  const [statusAction, setStatusAction] = useState<"activate" | "deactivate" | "reactivate" | null>(null);
  const [statusActionEvOwner, setStatusActionEvOwner] = useState<EVOwner | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEvOwner, setSelectedEvOwner] = useState<EVOwner | null>(null);

  const fetchEvOwners = async () => {
    try {
      setLoading(true);
      setError(null);
      const evOwnersData = await evOwnerApi.getAll();
      setEvOwners(evOwnersData);
    } catch (err: any) {
      console.error("Error fetching EV owners:", err);
      setError(err.response?.data?.message || "Failed to fetch EV owners");
      setEvOwners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvOwners();
  }, []);

  const showSnackbar = (message: string, severity: "success" | "error" | "info" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const resetForm = () => {
    setFormData({
      nic: "",
      name: "",
      email: "",
      phone: "",
      password: "",
      createWithPassword: false,
    });
    setEditingEvOwner(null);
  };

  const handleOpenDialog = (evOwner?: EVOwner) => {
    if (evOwner) {
      setEditingEvOwner(evOwner);
      setFormData({
        nic: evOwner.nic,
        name: evOwner.name,
        email: evOwner.email,
        phone: evOwner.phone,
        password: "",
        createWithPassword: false,
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

  const handleInputChange = (field: keyof EVOwnerFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (editingEvOwner) {
      setUpdateConfirmOpen(true);
    } else {
      await performSubmit();
    }
  };

  const performSubmit = async () => {
    try {
      setSubmitting(true);

      if (editingEvOwner) {
        // Update existing EV owner
        // Note: Don't include NIC in update data as it's in the URL
        const updateData: UpdateEVOwnerRequest = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        };
        
        console.log("Updating EV Owner:", {
          nic: editingEvOwner.nic,
          updateData,
          originalData: editingEvOwner,
        });
        
        await evOwnerApi.update(editingEvOwner.nic, updateData);
        showSnackbar("EV Owner updated successfully");
      } else {
        // Create new EV owner
        const createData: CreateEVOwnerRequest = {
          nic: formData.nic,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          isActive: true,
          password: formData.createWithPassword ? formData.password : undefined,
        };

        if (formData.createWithPassword) {
          await evOwnerApi.createWithPassword(createData);
          showSnackbar("EV Owner created with login credentials");
        } else {
          await evOwnerApi.create(createData);
          showSnackbar("EV Owner profile created");
        }
      }

      handleCloseDialog();
      setUpdateConfirmOpen(false);
      fetchEvOwners();
    } catch (err: any) {
      console.error("Error submitting form:", err);
      console.error("Error response data:", JSON.stringify(err.response?.data, null, 2));
      console.error("Error response status:", err.response?.status);
      console.error("Error response headers:", err.response?.headers);
      
      // Extract detailed error message
      let errorMessage = "Operation failed";
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Check for different error formats
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.title) {
          errorMessage = errorData.title;
        } else if (errorData.errors) {
          // Handle validation errors object
          const errors = errorData.errors;
          if (typeof errors === 'object') {
            errorMessage = Object.entries(errors)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join('; ');
          } else {
            errorMessage = JSON.stringify(errors);
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      }
      
      showSnackbar(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (evOwner: EVOwner) => {
    setEvOwnerToDelete(evOwner);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!evOwnerToDelete) return;
    
    try {
      await evOwnerApi.delete(evOwnerToDelete.nic);
      showSnackbar("EV Owner deleted successfully");
      fetchEvOwners();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || "Failed to delete EV owner", "error");
      console.error("Error deleting EV owner:", err);
    } finally {
      setDeleteConfirmOpen(false);
      setEvOwnerToDelete(null);
    }
  };

  const handleStatusAction = (evOwner: EVOwner, action: "activate" | "deactivate" | "reactivate") => {
    setStatusActionEvOwner(evOwner);
    setStatusAction(action);
    setStatusConfirmOpen(true);
    handleCloseMenu();
  };

  const confirmStatusAction = async () => {
    if (!statusActionEvOwner || !statusAction) return;

    try {
      switch (statusAction) {
        case "activate":
          await evOwnerApi.activate(statusActionEvOwner.nic);
          showSnackbar("EV Owner activated successfully");
          break;
        case "deactivate":
          await evOwnerApi.deactivate(statusActionEvOwner.nic);
          showSnackbar("EV Owner deactivated successfully");
          break;
        case "reactivate":
          await evOwnerApi.reactivate(statusActionEvOwner.nic);
          showSnackbar("EV Owner reactivated successfully");
          break;
      }
      fetchEvOwners();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || `Failed to ${statusAction} EV owner`, "error");
      console.error(`Error ${statusAction} EV owner:`, err);
    } finally {
      setStatusConfirmOpen(false);
      setStatusActionEvOwner(null);
      setStatusAction(null);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "success" : "error";
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <Check /> : <PersonOff />;
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, evOwner: EVOwner) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvOwner(evOwner);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedEvOwner(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          EV Owners Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage electric vehicle owners, their profiles, and account status
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Action Bar */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Create New EV Owner
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchEvOwners}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* EV Owners Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>NIC</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(evOwners) || evOwners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">
                        {!Array.isArray(evOwners) 
                          ? "Error: Invalid data format" 
                          : "No EV owners found. Create your first EV owner to get started."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  evOwners.map((evOwner) => (
                    <TableRow key={evOwner.nic} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Person />
                          <Typography fontWeight="medium" sx={{ fontFamily: "monospace" }}>
                            {evOwner.nic}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">{evOwner.name}</Typography>
                      </TableCell>
                      <TableCell>{evOwner.email}</TableCell>
                      <TableCell>{evOwner.phone}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(evOwner.isActive)}
                          label={evOwner.isActive ? "Active" : "Inactive"}
                          color={getStatusColor(evOwner.isActive)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Tooltip title="Edit EV Owner">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(evOwner)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More Actions">
                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenMenu(e, evOwner)}
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
        {selectedEvOwner?.isActive ? [
          <MenuItem key="deactivate" onClick={() => handleStatusAction(selectedEvOwner, "deactivate")}>
            <ToggleOff sx={{ mr: 1 }} />
            Deactivate
          </MenuItem>
        ] : [
          <MenuItem key="activate" onClick={() => handleStatusAction(selectedEvOwner!, "activate")}>
            <ToggleOn sx={{ mr: 1 }} />
            Activate
          </MenuItem>,
          <MenuItem key="reactivate" onClick={() => handleStatusAction(selectedEvOwner!, "reactivate")}>
            <Check sx={{ mr: 1 }} />
            Reactivate
          </MenuItem>
        ]}
        <MenuItem onClick={() => handleDelete(selectedEvOwner!)}>
          <Delete sx={{ mr: 1 }} color="error" />
          Delete
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvOwner ? "Edit EV Owner" : "Create New EV Owner"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="NIC Number"
              value={formData.nic}
              onChange={(e) => handleInputChange("nic", e.target.value)}
              fullWidth
              required
              disabled={!!editingEvOwner}
              helperText={editingEvOwner ? "NIC cannot be changed" : ""}
            />

            <TextField
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              fullWidth
              required
            />

            {!editingEvOwner && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    value={formData.createWithPassword ? "with-password" : "profile-only"}
                    onChange={(e) => handleInputChange("createWithPassword", e.target.value === "with-password")}
                    label="Account Type"
                  >
                    <MenuItem value="profile-only">Profile Only</MenuItem>
                    <MenuItem value="with-password">Profile + Login Credentials</MenuItem>
                  </Select>
                </FormControl>

                {formData.createWithPassword && (
                  <TextField
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    fullWidth
                    required
                    helperText="Minimum 6 characters"
                  />
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              submitting || 
              !formData.nic || 
              !formData.name || 
              !formData.email || 
              !formData.phone || 
              (formData.createWithPassword && !formData.password)
            }
          >
            {submitting ? <CircularProgress size={20} /> : (editingEvOwner ? "Update" : "Create")}
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
          <Typography variant="h6" component="div" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Delete color="error" />
            Confirm Delete EV Owner
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete EV owner <strong>"{evOwnerToDelete?.name}"</strong> (NIC: {evOwnerToDelete?.nic})?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            This action cannot be undone. All associated data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete EV Owner
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
          <Typography variant="h6" component="div" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Edit color="primary" />
            Confirm Update EV Owner
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to update EV owner <strong>"{editingEvOwner?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            The EV owner's information will be permanently changed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateConfirmOpen(false)}>
            Cancel
          </Button>
          <Button onClick={performSubmit} color="primary" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : "Update EV Owner"}
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
          <Typography variant="h6" component="div" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {statusAction === "deactivate" ? <ToggleOff color="error" /> : <ToggleOn color="success" />}
            Confirm {statusAction ? statusAction.charAt(0).toUpperCase() + statusAction.slice(1) : ""} EV Owner
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to <strong>{statusAction}</strong> EV owner <strong>"{statusActionEvOwner?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {statusAction === "deactivate" 
              ? "The EV owner will lose access to the system temporarily."
              : "The EV owner will regain access to the system."
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusConfirmOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={confirmStatusAction} 
            color={statusAction === "deactivate" ? "error" : "success"} 
            variant="contained"
          >
            {statusAction ? statusAction.charAt(0).toUpperCase() + statusAction.slice(1) : "Action"}
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

export default EVOwnersPage;