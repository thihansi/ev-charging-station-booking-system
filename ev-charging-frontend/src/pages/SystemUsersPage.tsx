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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Snackbar,
  Tooltip,
} from "@mui/material";
import {
  AdminPanelSettings,
  Engineering,
  Add,
  Edit,
  Delete,
  Refresh,
} from "@mui/icons-material";
import { authApi } from "../api";
import type { User, CreateUserRequest } from "../types";

interface UserFormData {
  username: string;
  password: string;
  role: 0 | 1; // 0 = Backoffice, 1 = StationOperator
  assignedStationId?: string;
}

const SystemUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    password: "",
    role: 0,
    assignedStationId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [updateConfirmOpen, setUpdateConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await authApi.getAllUsers();
      setUsers(usersData);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
      username: "",
      password: "",
      role: 0,
      assignedStationId: "",
    });
    setEditingUser(null);
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: "", // Don't populate password for editing
        role: user.role === "Backoffice" ? 0 : 1,
        assignedStationId: "",
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
    field: keyof UserFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (editingUser) {
      // Show confirmation for update
      setUpdateConfirmOpen(true);
    } else {
      // For new users, proceed directly
      await performSubmit();
    }
  };

  const performSubmit = async () => {
    try {
      setSubmitting(true);

      if (editingUser) {
        // Update existing user
        await authApi.updateUser(editingUser.id, {
          username: formData.username,
          password: formData.password || undefined, // Only send password if provided
          role: formData.role,
        });
        showSnackbar("User updated successfully");
      } else {
        // Create new user
        const userData: CreateUserRequest = {
          username: formData.username,
          password: formData.password,
          fullName: formData.username, // Use username as fullName fallback
          email: `${formData.username}@system.local`, // Generate email from username
          assignedStationId:
            formData.role === 1 ? formData.assignedStationId : undefined,
        };

        if (formData.role === 0) {
          await authApi.createBackofficeUser(userData);
        } else {
          await authApi.createStationOperator(userData);
        }
        showSnackbar("User created successfully");
      }

      handleCloseDialog();
      setUpdateConfirmOpen(false);
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || "Operation failed", "error");
      console.error("Error submitting form:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await authApi.deleteUser(userToDelete.id);
      showSnackbar("User deleted successfully");
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      showSnackbar(
        err.response?.data?.message || "Failed to delete user",
        "error"
      );
      console.error("Error deleting user:", err);
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const getRoleColor = (role: string) => {
    return role === "Backoffice" ? "primary" : "secondary";
  };

  const getRoleIcon = (role: string) => {
    return role === "Backoffice" ? <AdminPanelSettings /> : <Engineering />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          System Users Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system users including backoffice administrators and station
          operators
        </Typography>
      </Box>

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
          Create New User
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchUsers}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">
                        No users found. Create your first user to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {getRoleIcon(user.role)}
                          <Typography fontWeight="medium">
                            {user.username}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {user.id}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(user)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(user)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit User Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? "Edit User" : "Create New User"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            <TextField
              label="Username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              fullWidth
              required
              disabled={!!editingUser} // Can't change username when editing
              helperText={editingUser ? "Username cannot be changed" : ""}
            />

            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              fullWidth
              required={!editingUser}
              helperText={
                editingUser
                  ? "Leave blank to keep current password"
                  : "Minimum 6 characters"
              }
            />

            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                label="Role"
              >
                <MenuItem value={0}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AdminPanelSettings />
                    Backoffice
                  </Box>
                </MenuItem>
                <MenuItem value={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Engineering />
                    Station Operator
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {formData.role === 1 && (
              <TextField
                label="Assigned Station ID"
                value={formData.assignedStationId}
                onChange={(e) =>
                  handleInputChange("assignedStationId", e.target.value)
                }
                fullWidth
                required
                helperText="Required for Station Operators"
              />
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
              !formData.username ||
              (!editingUser && !formData.password)
            }
          >
            {submitting ? (
              <CircularProgress size={20} />
            ) : editingUser ? (
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
            Confirm Delete User
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user{" "}
            <strong>"{userToDelete?.username}"</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            This action cannot be undone. The user will permanently lose access
            to the system.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete User
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
            Confirm Update User
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to update user{" "}
            <strong>"{editingUser?.username}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            The user's information will be permanently changed.
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
            {submitting ? <CircularProgress size={20} /> : "Update User"}
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

export default SystemUsersPage;
