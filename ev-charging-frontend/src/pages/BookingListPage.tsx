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
  Schedule,
  Visibility,
  Edit,
  Delete,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useNotificationContext } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import { bookingApi } from "../api";
import { ROUTES } from "../utils/constants";
import { formatDateTime } from "../utils/helpers";
import type { Booking, BookingStatus } from "../types";

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
    "NoShow",
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
          booking.evOwner?.fullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.chargingStation?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Filter by tabs
    if (tabValue === 1) {
      // Pending bookings tab
      filtered = filtered.filter((booking) => booking.status === "Pending");
    } else if (tabValue === 2) {
      // Active bookings tab
      filtered = filtered.filter(
        (booking) =>
          booking.status === "Approved" || booking.status === "Completed"
      );
    }

    setFilteredBookings(filtered);
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
        ROUTES.BACKOFFICE.BOOKINGS_VIEW.replace(":id", selectedBooking.id)
      );
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedBooking) {
      navigate(
        ROUTES.BACKOFFICE.BOOKINGS_EDIT.replace(":id", selectedBooking.id)
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

  const handleMarkNoShow = () => {
    if (!selectedBooking) return;

    setConfirmDialog({
      open: true,
      title: "Mark as No-Show",
      message: `Are you sure you want to mark booking ${selectedBooking.id} as no-show?`,
      action: async () => {
        try {
          await bookingApi.markNoShow(selectedBooking.id);
          showSuccess("Booking marked as no-show");
          await loadBookings();
        } catch (error) {
          showError("Failed to mark booking as no-show");
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

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Approved":
        return "info";
      case "Completed":
        return "success";
      case "Rejected":
      case "Cancelled":
      case "NoShow":
        return "error";
      default:
        return "default";
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

  const canMarkNoShow = (booking: Booking) => {
    return (
      booking.status === "Approved" &&
      (user?.role === "Backoffice" || user?.role === "StationOperator")
    );
  };

  const handleConfirmAction = () => {
    confirmDialog.action();
    setConfirmDialog({ ...confirmDialog, open: false });
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
          onChange={(_, newValue) => setTabValue(newValue)}
        >
          <Tab label={`All Bookings (${bookings.length})`} />
          <Tab label={`Pending (${getPendingCount()})`} />
          <Tab label={`Active (${getActiveCount()})`} />
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
                    {status}
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
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate(ROUTES.BACKOFFICE.BOOKINGS_CREATE)}
            >
              Create Booking
            </Button>
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
        {selectedBooking && canMarkNoShow(selectedBooking) && (
          <MenuItem onClick={handleMarkNoShow} sx={{ color: "warning.main" }}>
            <Schedule fontSize="small" sx={{ mr: 1 }} />
            Mark No-Show
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
                            navigate(ROUTES.BACKOFFICE.BOOKINGS_CREATE)
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
                            {booking.evOwner?.fullName || booking.evOwnerNic}
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
                          label={booking.status}
                          color={getStatusColor(booking.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(booking.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, booking)}
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
