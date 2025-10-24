import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Search,
  FilterList,
  CheckCircle,
  Cancel,
  Visibility,
  QrCode,
  Download,
  Refresh,
  Event,
  Person,
  LocationOn,
  ElectricCar,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNotificationContext } from "../context/NotificationContext";
import { bookingApi } from "../api";
import type { Booking } from "../types";
import { BOOKING_STATUS } from "../types/enums.js";

const BookingsManagement: React.FC = () => {
  const { state } = useAuth();
  const { showError, showSuccess } = useNotificationContext();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      console.log("🔄 Loading bookings...");
      const data = await bookingApi.getAll();
      console.log("📋 Loaded bookings:", data);
      console.log("🚀 About to enrich bookings...");
      
      // Enrich bookings with names
      const enrichedBookings = await enrichBookingsWithNames(data);
      console.log("🎉 Enrichment done, setting bookings...");
      setBookings(enrichedBookings);
    } catch (error: any) {
      console.error("❌ Error loading bookings:", error);
      if (error.response?.status === 403) {
        showError("Access denied. You don't have permission to view bookings.");
      } else {
        showError("Failed to load bookings. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const enrichBookingsWithNames = async (bookings: Booking[]): Promise<Booking[]> => {
    const { chargingStationApi, evOwnerApi } = await import("../api");
    
    console.log("🔄 Starting enrichment for", bookings.length, "bookings");
    console.log("👤 User role:", state.user?.role);
    
    // Fetch all charging stations and EV owners once
    let allStations: any[] = [];
    let allEvOwners: any[] = [];
    
    try {
      allStations = await chargingStationApi.getAll();
      console.log("✅ Fetched all charging stations:", allStations.length);
      console.log("📋 Sample station:", allStations[0]);
    } catch (error) {
      console.error("❌ Failed to fetch charging stations:", error);
    }
    
    // Only fetch EV owners for backoffice users (not operators)
    if (state.user?.role === "Backoffice") {
      try {
        allEvOwners = await evOwnerApi.getAll();
        console.log("✅ Fetched all EV owners:", allEvOwners.length);
        console.log("📋 Sample EV owner:", allEvOwners[0]);
      } catch (error) {
        console.error("❌ Failed to fetch EV owners:", error);
      }
    }
    
    // Enrich each booking
    const enriched = bookings.map((booking, index) => {
      const enrichedBooking = { ...booking };
      
      console.log(`📦 Processing booking ${index + 1}:`, {
        id: booking.id?.slice(-8),
        evOwnerNic: booking.evOwnerNic,
        chargingStationId: booking.chargingStationId?.slice(-8),
        hasEvOwner: !!booking.evOwner,
        hasStation: !!booking.chargingStation,
      });
      
      // Find and attach charging station
      if (!booking.chargingStation && booking.chargingStationId) {
        const station = allStations.find(s => s.id === booking.chargingStationId);
        if (station) {
          enrichedBooking.chargingStation = station;
          console.log(`  ✅ Matched station: ${station.name}`);
        } else {
          console.log(`  ⚠️ No station found for ID: ${booking.chargingStationId}`);
        }
      }
      
      // Find and attach EV owner (only for backoffice)
      if (state.user?.role === "Backoffice" && !booking.evOwner && booking.evOwnerNic) {
        const evOwner = allEvOwners.find(e => e.nic === booking.evOwnerNic);
        if (evOwner) {
          enrichedBooking.evOwner = evOwner;
          console.log(`  ✅ Matched EV owner: ${evOwner.name}`);
        } else {
          console.log(`  ⚠️ No EV owner found for NIC: ${booking.evOwnerNic}`);
        }
      }
      
      // For operators, create a simple display name from NIC
      if (state.user?.role === "StationOperator" && !enrichedBooking.evOwner && booking.evOwnerNic) {
        enrichedBooking.evOwner = {
          nic: booking.evOwnerNic,
          name: booking.evOwnerNic,
          email: "",
          phone: "",
          isActive: true,
        };
        console.log(`  📝 Created placeholder for operator: ${booking.evOwnerNic}`);
      }
      
      return enrichedBooking;
    });
    
    console.log("✅ Enrichment complete. Sample enriched booking:", {
      id: enriched[0]?.id?.slice(-8),
      evOwnerName: enriched[0]?.evOwner?.name,
      stationName: enriched[0]?.chargingStation?.name,
    });
    
    return enriched;
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.evOwnerNic.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.evOwner?.name &&
            booking.evOwner.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (booking.chargingStation?.name &&
            booking.chargingStation.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
    setPage(1); // Reset to first page when filtering
  };

  const handleApproveBooking = async (bookingId: string) => {
    setProcessingIds((prev) => new Set(prev).add(bookingId));
    try {
      await bookingApi.approve(bookingId);
      showSuccess("Booking approved successfully!");
      await loadBookings();
    } catch (error) {
      showError("Failed to approve booking. Please try again.");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    setProcessingIds((prev) => new Set(prev).add(bookingId));
    try {
      await bookingApi.reject(bookingId);
      showSuccess("Booking rejected successfully!");
      await loadBookings();
    } catch (error) {
      showError("Failed to reject booking. Please try again.");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case BOOKING_STATUS.PENDING:
        return "warning";
      case BOOKING_STATUS.APPROVED:
        return "success";
      case BOOKING_STATUS.REJECTED:
        return "error";
      case BOOKING_STATUS.COMPLETED:
        return "info";
      case BOOKING_STATUS.CANCELLED:
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case BOOKING_STATUS.PENDING:
        return <Event />;
      case BOOKING_STATUS.APPROVED:
        return <CheckCircle />;
      case BOOKING_STATUS.REJECTED:
        return <Cancel />;
      case BOOKING_STATUS.COMPLETED:
        return <ElectricCar />;
      default:
        return <Event />;
    }
  };

  const exportBookings = () => {
    const csvContent = [
      ["ID", "EV Owner", "Station", "Date", "Status"],
      ...filteredBookings.map((booking) => [
        booking.id,
        booking.evOwner?.name || booking.evOwnerNic,
        booking.chargingStation?.name || "Unknown",
        new Date(booking.reservationDateTime).toLocaleDateString(),
        booking.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  // Debug: Log unique statuses in bookings
  const uniqueStatuses = [...new Set(bookings.map(b => b.status))];
  console.log("📊 Unique booking statuses:", uniqueStatuses);
  
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === BOOKING_STATUS.PENDING).length,
    approved: bookings.filter((b) => b.status === BOOKING_STATUS.APPROVED).length,
    rejected: bookings.filter((b) => b.status === BOOKING_STATUS.REJECTED).length,
  };

  if (!state.isAuthenticated || state.user?.role !== "StationOperator") {
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
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Bookings Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track all charging station bookings
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportBookings}
            disabled={filteredBookings.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadBookings}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Event sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Total Bookings</Typography>
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
                <Event sx={{ mr: 1, color: "warning.main" }} />
                <Typography variant="h6">Pending</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <CheckCircle sx={{ mr: 1, color: "success.main" }} />
                <Typography variant="h6">Approved</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {stats.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Cancel sx={{ mr: 1, color: "error.main" }} />
                <Typography variant="h6">Rejected</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {stats.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by booking ID, EV owner, or station name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Status Filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterList />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value={BOOKING_STATUS.PENDING}>Pending</MenuItem>
                <MenuItem value={BOOKING_STATUS.APPROVED}>Approved</MenuItem>
                <MenuItem value={BOOKING_STATUS.REJECTED}>Rejected</MenuItem>
                <MenuItem value={BOOKING_STATUS.COMPLETED}>Completed</MenuItem>
                <MenuItem value={BOOKING_STATUS.CANCELLED}>Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Booking ID</TableCell>
                      <TableCell>EV Owner</TableCell>
                      <TableCell>Charging Station</TableCell>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedBookings.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          sx={{ textAlign: "center", py: 4 }}
                        >
                          <Typography color="text.secondary">
                            {searchTerm || statusFilter !== "ALL"
                              ? "No bookings match your filters"
                              : "No bookings found"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedBookings.map((booking) => (
                        <TableRow key={booking.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              #{booking.id ? booking.id.slice(-8) : "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Person
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {booking.evOwner?.name || "Unknown"}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <LocationOn
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography variant="body2">
                                {booking.chargingStation?.name ||
                                  "Unknown Station"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(
                                booking.reservationDateTime
                              ).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(booking.status)}
                              label={booking.status}
                              color={getStatusColor(booking.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(booking)}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>

                              {booking.status === BOOKING_STATUS.PENDING && (
                                <>
                                  <Tooltip title="Approve Booking">
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={() =>
                                        handleApproveBooking(booking.id)
                                      }
                                      disabled={processingIds.has(booking.id)}
                                    >
                                      <CheckCircle />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject Booking">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() =>
                                        handleRejectBooking(booking.id)
                                      }
                                      disabled={processingIds.has(booking.id)}
                                    >
                                      <Cancel />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}

                              {booking.status === BOOKING_STATUS.APPROVED &&
                                booking.qrCodeData && (
                                  <Tooltip title="View QR Code">
                                    <IconButton size="small" color="primary">
                                      <QrCode />
                                    </IconButton>
                                  </Tooltip>
                                )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            Booking Details - #
            {selectedBooking?.id ? selectedBooking.id.slice(-8) : "N/A"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  EV Owner Information
                </Typography>
                <Box sx={{ p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Name:</strong>{" "}
                    {selectedBooking.evOwner?.name || "Unknown"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>NIC:</strong> {selectedBooking.evOwnerNic}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Contact:</strong>{" "}
                    {selectedBooking.evOwner?.email || "Not provided"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Charging Station
                </Typography>
                <Box sx={{ p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Name:</strong>{" "}
                    {selectedBooking.chargingStation?.name || "Unknown"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Address:</strong>{" "}
                    {selectedBooking.chargingStation?.address || "Not provided"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong>{" "}
                    {selectedBooking.chargingStation?.stationType || "Unknown"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Booking Information
                </Typography>
                <Box sx={{ p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Status:</strong>{" "}
                    <Chip
                      label={selectedBooking.status}
                      color={getStatusColor(selectedBooking.status) as any}
                      size="small"
                    />
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Reservation Date:</strong>{" "}
                    {new Date(
                      selectedBooking.reservationDateTime
                    ).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Created:</strong>{" "}
                    {new Date(selectedBooking.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>

              {selectedBooking.qrCodeData && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    QR Code
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: "grey.50",
                      borderRadius: 1,
                      textAlign: "center",
                    }}
                  >
                    <QrCode
                      sx={{ fontSize: 80, color: "primary.main", mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      QR Code available for validation
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedBooking?.status === BOOKING_STATUS.PENDING && (
            <>
              <Button
                onClick={() => {
                  handleApproveBooking(selectedBooking.id);
                  setDetailsDialogOpen(false);
                }}
                color="success"
                variant="contained"
                startIcon={<CheckCircle />}
              >
                Approve
              </Button>
              <Button
                onClick={() => {
                  handleRejectBooking(selectedBooking.id);
                  setDetailsDialogOpen(false);
                }}
                color="error"
                variant="outlined"
                startIcon={<Cancel />}
              >
                Reject
              </Button>
            </>
          )}
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsManagement;
