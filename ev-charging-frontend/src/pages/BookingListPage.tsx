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
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  InputAdornment,
  Toolbar,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Add,
  Search,
  Refresh,
  MoreVert,
  CheckCircle,
  Cancel,
  Visibility,
  Edit,
  Delete,
  AccessTime,
  ThumbUp,
  Done,
  Block,
  Close,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useNotificationContext } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import { bookingApi } from "../api";
import { ROUTES } from "../utils/constants";
import { formatDateTime } from "../utils/helpers";
import type { Booking, BookingStatus } from "../types";
import { getBookingStatusDisplay, getBookingStatusColor } from "../types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const BookingListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotificationContext();
  const { state } = useAuth();
  const user = state.user;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "All">(
    "All"
  );
  const [tabValue, setTabValue] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
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

  const statusList: (BookingStatus | "All")[] = [
    "All",
    "Pending",
    "Approved",
    "Rejected",
    "Completed",
    "Cancelled",
  ];

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, tabValue]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const bookingsData = await bookingApi.getAll();
      setBookings(bookingsData);
    } catch (error) {
      showError("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (booking) =>
          booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.evOwnerNic.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.chargingStationId
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.evOwner?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.chargingStation?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tabs (tabs override status filter)
    if (tabValue === 1) {
      // Pending bookings tab
      filtered = filtered.filter((booking) => booking.status === "Pending");
    } else if (tabValue === 2) {
      // Active bookings tab
      filtered = filtered.filter(
        (booking) =>
          booking.status === "Approved" || booking.status === "Completed"
      );
    } else if (tabValue === 0) {
      // All bookings tab - apply status filter only if not on specific tabs
      if (statusFilter !== "All") {
        filtered = filtered.filter((booking) => booking.status === statusFilter);
      }
    }

    setFilteredBookings(filtered);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Reset status filter when switching to specific tabs
    if (newValue === 1 || newValue === 2) {
      setStatusFilter("All");
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    booking: Booking
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedBooking(null);
  };

  const handleView = () => {
    if (selectedBooking) {
      navigate(
        ROUTES.ADMIN.BOOKINGS_VIEW.replace(":id", selectedBooking.id)
      );
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedBooking) {
      navigate(
        ROUTES.ADMIN.BOOKINGS_EDIT.replace(":id", selectedBooking.id)
      );
    }
    handleMenuClose();
  };

  const handleApprove = () => {
    if (!selectedBooking) return;

    setConfirmDialog({
      open: true,
      title: "Approve Booking",
      message: `Are you sure you want to approve booking ${selectedBooking.id}?`,
      action: async () => {
        try {
          await bookingApi.approve(selectedBooking.id);
          showSuccess("Booking approved successfully");
          await loadBookings();
        } catch (error) {
          showError("Failed to approve booking");
        }
      },
    });
    handleMenuClose();
  };

  const handleReject = () => {
    if (!selectedBooking) return;

    setConfirmDialog({
      open: true,
      title: "Reject Booking",
      message: `Are you sure you want to reject booking ${selectedBooking.id}?`,
      action: async () => {
        try {
          await bookingApi.reject(selectedBooking.id);
          showSuccess("Booking rejected successfully");
          await loadBookings();
        } catch (error) {
          showError("Failed to reject booking");
        }
      },
    });
    handleMenuClose();
  };

  const handleComplete = () => {
    if (!selectedBooking) return;

    setConfirmDialog({
      open: true,
      title: "Complete Booking",
      message: `Are you sure you want to mark booking ${selectedBooking.id} as completed?`,
      action: async () => {
        try {
          await bookingApi.complete(selectedBooking.id);
          showSuccess("Booking completed successfully");
          await loadBookings();
        } catch (error) {
          showError("Failed to complete booking");
        }
      },
    });
    handleMenuClose();
  };

  const handleCancel = () => {
    if (!selectedBooking) return;

    setConfirmDialog({
      open: true,
      title: "Cancel Booking",
      message: `Are you sure you want to cancel booking ${selectedBooking.id}? This action cannot be undone.`,
      action: async () => {
        try {
          await bookingApi.cancel(selectedBooking.id);
          showSuccess("Booking cancelled successfully");
          await loadBookings();
        } catch (error) {
          showError("Failed to cancel booking");
        }
      },
    });
    handleMenuClose();
  };

  const getStatusColor = getBookingStatusColor;

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case "Pending":
        return <AccessTime sx={{ fontSize: 16 }} />;
      case "Approved":
        return <ThumbUp sx={{ fontSize: 16 }} />;
      case "Completed":
        return <Done sx={{ fontSize: 16 }} />;
      case "Rejected":
        return <Block sx={{ fontSize: 16 }} />;
      case "Cancelled":
        return <Close sx={{ fontSize: 16 }} />;
      default:
        return <AccessTime sx={{ fontSize: 16 }} />;
    }
  };

  const canApproveReject = (booking: Booking) => {
    return (
      booking.status === "Pending" &&
      (user?.role === "Backoffice" || user?.role === "StationOperator")
    );
  };

  const canComplete = (booking: Booking) => {
    return (
      booking.status === "Approved" &&
      (user?.role === "Backoffice" || user?.role === "StationOperator")
    );
  };

  const handleConfirmAction = () => {
    confirmDialog.action();
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  // Get tab indicator color based on selected tab
  const getTabIndicatorColor = () => {
    switch (tabValue) {
      case 0: return '#1976d2'; // Blue for All Bookings
      case 1: return '#f57c00'; // Orange for Pending
      case 2: return '#2e7d32'; // Green for Active
      default: return '#1976d2';
    }
  };

  // Get tab text color when selected
  const getTabTextColor = () => {
    switch (tabValue) {
      case 0: return '#1976d2'; // Blue for All Bookings
      case 1: return '#f57c00'; // Orange for Pending
      case 2: return '#2e7d32'; // Green for Active
      default: return '#1976d2';
    }
  };

  const getPendingCount = () => {
    return bookings.filter((b) => b.status === "Pending").length;
  };

  const getActiveCount = () => {
    return bookings.filter(
      (b) => b.status === "Approved" || b.status === "Completed"
    ).length;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Booking Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage EV charging station bookings and reservations
        </Typography>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: getTabIndicatorColor(),
              height: 3,
            },
            '& .MuiTab-root': {
              textTransform: 'uppercase',
              fontWeight: 600,
              minHeight: 48,
              color: '#666',
              '&.Mui-selected': {
                color: getTabTextColor(),
              },
            },
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#1976d2',
                  }}
                />
                {`ALL BOOKINGS (${bookings.length})`}
              </Box>
            }
            sx={{
              '&.Mui-selected': {
                color: '#1976d2',
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              },
            }}
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#f57c00',
                  }}
                />
                {`PENDING (${getPendingCount()})`}
              </Box>
            }
            sx={{
              '&.Mui-selected': {
                color: '#f57c00',
                backgroundColor: 'rgba(245, 124, 0, 0.08)',
              },
            }}
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#2e7d32',
                  }}
                />
                {`ACTIVE (${getActiveCount()})`}
              </Box>
            }
            sx={{
              '&.Mui-selected': {
                color: '#2e7d32',
                backgroundColor: 'rgba(46, 125, 50, 0.08)',
              },
            }}
          />
        </Tabs>
      </Card>

      {/* Toolbar */}
      <Card sx={{ mb: 3 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              placeholder="Search by ID, EV Owner, or Station..."
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
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) =>
                  setStatusFilter(e.target.value as BookingStatus | "All")
                }
              >
                {statusList.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status === "All" ? "All" : getBookingStatusDisplay(status as BookingStatus)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadBookings}
              disabled={isLoading}
            >
              Refresh
            </Button>
            {/* Note: Only EV Owners can create bookings per API specification */}
          </Box>
        </Toolbar>
      </Card>

      {/* Loading */}
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <BookingTable />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <BookingTable />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <BookingTable />
      </TabPanel>

      {/* Actions Menu */}
      <Menu
        id="action-menu"
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        disableScrollLock={true}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        PaperProps={{
          style: {
            maxHeight: 200,
            width: '20ch',
          },
        }}
      >
        <MenuItem onClick={handleView}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        {selectedBooking &&
          canApproveReject(selectedBooking) && [
            <MenuItem
              key="approve"
              onClick={handleApprove}
              sx={{ color: "success.main" }}
            >
              <CheckCircle fontSize="small" sx={{ mr: 1 }} />
              Approve
            </MenuItem>,
            <MenuItem
              key="reject"
              onClick={handleReject}
              sx={{ color: "error.main" }}
            >
              <Cancel fontSize="small" sx={{ mr: 1 }} />
              Reject
            </MenuItem>,
          ]}
        {selectedBooking && canComplete(selectedBooking) && (
          <MenuItem onClick={handleComplete} sx={{ color: "success.main" }}>
            <CheckCircle fontSize="small" sx={{ mr: 1 }} />
            Complete
          </MenuItem>
        )}
        <MenuItem onClick={handleCancel} sx={{ color: "error.main" }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Cancel
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

  // Extracted BookingTable component for reuse across tabs
  function BookingTable() {
    return (
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>EV Owner</TableCell>
                  <TableCell>Charging Station</TableCell>
                  <TableCell>Reservation Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchTerm || statusFilter !== "All"
                          ? "No bookings found matching your criteria."
                          : "No bookings found."}
                      </Typography>
                      {!searchTerm && statusFilter === "All" && (
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() =>
                            navigate(ROUTES.ADMIN.BOOKINGS_CREATE)
                          }
                          sx={{ mt: 2 }}
                        >
                          Create First Booking
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {booking.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {booking.evOwner?.name || booking.evOwnerNic}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {booking.evOwnerNic}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {booking.chargingStation?.name ||
                            booking.chargingStationId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(booking.reservationDateTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(booking.status)}
                          label={getBookingStatusDisplay(booking.status)}
                          color={getStatusColor(booking.status)}
                          size="small"
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(booking.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          id={`action-button-${booking.id}`}
                          size="small"
                          onClick={(e) => handleMenuClick(e, booking)}
                          aria-controls={Boolean(menuAnchorEl) ? 'action-menu' : undefined}
                          aria-haspopup="true"
                          aria-expanded={Boolean(menuAnchorEl) ? 'true' : undefined}
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
    );
  }
};

export default BookingListPage;
