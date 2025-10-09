import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
} from "@mui/material";
import {
  BookOnline,
  CheckCircle,
  Cancel,
  Refresh,
  QrCodeScanner,
  EvStation,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotificationContext } from "../context/NotificationContext";
import { bookingApi } from "../api";
import { ROUTES, BOOKING_STATUS } from "../utils/constants";
import {
  formatDateTime,
} from "../utils/helpers";
import { getBookingStatusDisplay } from "../types";
import type { Booking } from "../types";
import { OperatorDebugInfo } from "../components/OperatorDebugInfo";

const OperatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { showError, showSuccess } = useNotificationContext();

  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [hasPermissionError, setHasPermissionError] = useState(false);

  const loadBookings = async () => {
    setIsLoading(true);
    setHasPermissionError(false);
    try {
      const allBookings = await bookingApi.getAll();

      // Filter pending bookings
      const pending = allBookings.filter(
        (booking) => booking.status === BOOKING_STATUS.PENDING
      );
      setPendingBookings(pending);

      // Get recent bookings (last 10, sorted by creation date)
      const recent = allBookings
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10);
      setRecentBookings(recent);
    } catch (error: any) {
      console.error("Bookings loading error:", error);
      
      if (error.response?.status === 403) {
        setHasPermissionError(true);
        showError("Access denied: You don't have permission to view bookings. Please contact your administrator.");
      } else if (error.response?.status === 401) {
        showError("Session expired. Please log in again.");
      } else {
        showError("Failed to load bookings. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleApproveBooking = async (bookingId: string) => {
    setProcessingIds((prev) => new Set(prev).add(bookingId));
    try {
      await bookingApi.approve(bookingId);
      showSuccess("Booking approved successfully");
      await loadBookings(); // Reload data
    } catch (error) {
      showError("Failed to approve booking");
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
      showSuccess("Booking rejected successfully");
      await loadBookings(); // Reload data
    } catch (error) {
      showError("Failed to reject booking");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case BOOKING_STATUS.PENDING:
        return "warning";
      case BOOKING_STATUS.APPROVED:
        return "success";
      case BOOKING_STATUS.REJECTED:
        return "error";
      case BOOKING_STATUS.COMPLETED:
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Station Operator Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {state.user?.username}! Manage your station bookings
          </Typography>
        </Box>
        
        {/* Temporary Debug Info - Remove after fixing */}
        {import.meta.env.DEV && <OperatorDebugInfo />}
        
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<QrCodeScanner />}
            onClick={() => navigate(ROUTES.OPERATOR.QR_SCANNER)}
          >
            QR Scanner
          </Button>
          <IconButton onClick={loadBookings} disabled={isLoading}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Loading indicator */}
      {isLoading && <LinearProgress sx={{ mb: 4 }} />}

      {/* Permission Error Display */}
      {hasPermissionError && (
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Permission Issue Detected
          </Typography>
          <Typography variant="body2" gutterBottom>
            Your operator account doesn't have permission to access the bookings API. This is a backend configuration issue.
          </Typography>
          <Typography variant="body2">
            <strong>Solution:</strong> The backend admin needs to configure the API permissions for the "StationOperator" role to access the /api/bookings endpoint.
          </Typography>
        </Alert>
      )}

      {/* Quick Stats */}
      <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ textAlign: "center" }}>
            <BookOnline sx={{ fontSize: 40, color: "warning.main", mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {pendingBookings.length}
            </Typography>
            <Typography color="text.secondary">Pending Approvals</Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ textAlign: "center" }}>
            <EvStation sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {
                recentBookings.filter(
                  (b) => b.status === BOOKING_STATUS.APPROVED
                ).length
              }
            </Typography>
            <Typography color="text.secondary">Approved Today</Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Pending Bookings */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Pending Booking Requests
            </Typography>
            {pendingBookings.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No pending bookings
              </Typography>
            ) : (
              <List>
                {pendingBookings.map((booking, index) => (
                  <React.Fragment key={booking.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight="bold">
                              {booking.evOwnerNic}
                            </Typography>
                            <Chip
                              label={getBookingStatusDisplay(booking.status)}
                              size="small"
                              color={
                                getBookingStatusColor(booking.status) as any
                              }
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Reservation:{" "}
                              {formatDateTime(booking.reservationDateTime)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Requested: {formatDateTime(booking.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            color="success"
                            onClick={() => handleApproveBooking(booking.id)}
                            disabled={processingIds.has(booking.id)}
                            size="small"
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleRejectBooking(booking.id)}
                            disabled={processingIds.has(booking.id)}
                            size="small"
                          >
                            <Cancel />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Recent Bookings
              </Typography>
              <Button
                size="small"
                onClick={() => navigate(ROUTES.OPERATOR.BOOKINGS_PENDING)}
              >
                View All
              </Button>
            </Box>

            {recentBookings.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No bookings yet
              </Typography>
            ) : (
              <List>
                {recentBookings.map((booking, index) => (
                  <React.Fragment key={booking.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="subtitle2">
                              {booking.evOwnerNic}
                            </Typography>
                            <Chip
                              label={getBookingStatusDisplay(booking.status)}
                              size="small"
                              color={
                                getBookingStatusColor(booking.status) as any
                              }
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={formatDateTime(booking.reservationDateTime)}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Quick Actions
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<QrCodeScanner />}
            onClick={() => navigate(ROUTES.OPERATOR.QR_SCANNER)}
          >
            Scan QR Code
          </Button>
          <Button
            variant="outlined"
            startIcon={<BookOnline />}
            onClick={() => navigate(ROUTES.OPERATOR.BOOKINGS_PENDING)}
          >
            Manage Bookings
          </Button>
          <Button
            variant="outlined"
            startIcon={<EvStation />}
            onClick={() => navigate(ROUTES.OPERATOR.QR_SCANNER)}
          >
            QR Scanner
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default OperatorDashboard;
