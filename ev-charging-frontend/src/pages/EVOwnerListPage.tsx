import React, { useState } from "react";
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
import type { EVOwner } from "../types";

const EVOwnerListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotificationContext();

  const [evOwners, setEvOwners] = useState<EVOwner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<EVOwner[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Changed from true to false
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

  // Remove auto-loading since the API endpoint may not be implemented
  // useEffect(() => {
  //   loadEvOwners();
  // }, []);

  // Since we're using search-based approach, we don't need filtering
  // The search will directly set the evOwners and filteredOwners

  const handleSearchOwner = async () => {
    if (!searchTerm.trim()) {
      showError("Please enter a NIC to search for");
      return;
    }

    setIsLoading(true);
    try {
      const owner = await evOwnerApi.getByNic(searchTerm.trim());
      setEvOwners([owner]);
      setFilteredOwners([owner]);
      showSuccess(`Found EV owner: ${owner.name}`);
    } catch (error: any) {
      console.error("Error searching for EV owner:", error);
      
      if (error.response?.status === 404) {
        showError(`No EV owner found with NIC: ${searchTerm}`);
      } else if (error.response?.data?.message) {
        showError(`Search error: ${error.response.data.message}`);
      } else {
        showError("Failed to search for EV owner. Please check the NIC format and try again.");
      }
      setEvOwners([]);
      setFilteredOwners([]);
    } finally {
      setIsLoading(false);
    }
  };

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
        ROUTES.ADMIN.EV_OWNERS_EDIT.replace(":nic", selectedOwner.nic)
      );
    }
    handleMenuClose();
  };

  const handleActivate = async () => {
    if (!selectedOwner) return;

    try {
      await evOwnerApi.activate(selectedOwner.nic);
      showSuccess("EV Owner activated successfully");
      
      // Update the owner in the current list
      const updatedOwners = evOwners.map(owner => 
        owner.nic === selectedOwner.nic 
          ? { ...owner, isActive: true }
          : owner
      );
      setEvOwners(updatedOwners);
      setFilteredOwners(updatedOwners);
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
      message: `Are you sure you want to deactivate ${selectedOwner.name}? They won't be able to make new bookings.`,
      action: async () => {
        try {
          await evOwnerApi.deactivate(selectedOwner.nic);
          showSuccess("EV Owner deactivated successfully");
          
          // Update the owner in the current list
          const updatedOwners = evOwners.map(owner => 
            owner.nic === selectedOwner.nic 
              ? { ...owner, isActive: false }
              : owner
          );
          setEvOwners(updatedOwners);
          setFilteredOwners(updatedOwners);
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
      message: `Are you sure you want to permanently delete ${selectedOwner.name}? This action cannot be undone.`,
      action: async () => {
        try {
          await evOwnerApi.delete(selectedOwner.nic);
          showSuccess("EV Owner deleted successfully");
          
          // Remove the owner from the current list
          const updatedOwners = evOwners.filter(owner => owner.nic !== selectedOwner.nic);
          setEvOwners(updatedOwners);
          setFilteredOwners(updatedOwners);
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
          Search for individual EV owners by NIC or manage EV owner accounts
        </Typography>
      </Box>

      {/* Search and Action Section */}
      <Card sx={{ mb: 3 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              label="Search by NIC"
              placeholder="Enter NIC (e.g., 123456789V or 200012345678)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 350 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<Search />}
              onClick={handleSearchOwner}
              disabled={!searchTerm.trim() || isLoading}
            >
              Search Owner
            </Button>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setEvOwners([]);
                setFilteredOwners([]);
                setSearchTerm("");
              }}
              disabled={isLoading}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate(ROUTES.ADMIN.EV_OWNERS_CREATE)}
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
                    <strong>Name</strong>
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
                  <TableCell align="center">
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOwners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {isLoading
                          ? "Searching..."
                          : "Use the search box above to find EV owners by NIC, or add a new EV owner."}
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
                          {owner.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{owner.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {owner.phone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={owner.isActive ? "Active" : "Inactive"}
                          color={owner.isActive ? "success" : "default"}
                          size="small"
                          variant="outlined"
                        />
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
