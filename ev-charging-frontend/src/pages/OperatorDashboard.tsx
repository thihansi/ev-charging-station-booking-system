import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import {
  Dashboard,
  EventNote,
  ElectricCar,
  QrCodeScanner,
  CheckCircle,
  Cancel,
  People,
  AttachMoney,
  Refresh,
  NavigateNext,
  PendingActions,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNotificationContext } from "../context/NotificationContext";
import { bookingApi, chargingStationApi } from "../api";
import type { Booking, ChargingStation } from "../types";
import { BOOKING_STATUS } from "../types/enums.js";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  pendingBookings: number;
  activeStations: number;
  todayBookings: number;
  totalRevenue: number;
}

const OperatorDashboard: React.FC = () => {
  const { state } = useAuth();
  const { showError, showSuccess } = useNotificationContext();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    pendingBookings: 0,
    activeStations: 0,
    todayBookings: 0,
    totalRevenue: 0,
  });
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>([]);

  useEffect(() => {
    if (state.isAuthenticated && state.user?.role === 'StationOperator') {
      loadDashboardData();
    }
  }, [state.isAuthenticated, state.user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    try {
      console.log("🔄 Loading dashboard data...");

      // Use Promise.allSettled to handle partial failures gracefully
      const [summaryResult, bookingsResult, stationsResult] = await Promise.allSettled([
        bookingApi.getSummary().catch((err) => {
          console.warn("⚠️ Summary API failed:", err);
          return null;
        }),
        bookingApi.getAll().catch((err) => {
          console.warn("⚠️ All bookings API failed, trying pending only:", err);
          return bookingApi.getPending().catch(() => []);
        }),
        chargingStationApi.getAll().catch((err) => {
          console.warn("⚠️ Stations API failed:", err);
          return [];
        })
      ]);

      // Extract results
      const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
      const allBookings = bookingsResult.status === 'fulfilled' ? bookingsResult.value : [];
      const stations = stationsResult.status === 'fulfilled' ? stationsResult.value : [];

      console.log("📊 Dashboard data loaded:", { 
        summary, 
        bookingsCount: allBookings.length, 
        stationsCount: stations.length,
        summaryStatus: summaryResult.status,
        bookingsStatus: bookingsResult.status,
        stationsStatus: stationsResult.status
      });

      // Filter pending bookings
      const pending = allBookings.filter(
        (booking) => booking.status === "Pending"
      );
      setPendingBookings(pending.slice(0, 5));

      // Set recent bookings
      const recent = allBookings
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      setRecentBookings(recent);

      // Set charging stations
      const activeStations = stations.filter(station => station.isActive);
      setChargingStations(activeStations.slice(0, 4));

      // Calculate stats using summary data or calculate from local data
      const today = new Date().toDateString();
      const todayBookings = allBookings.filter(booking => 
        new Date(booking.createdAt).toDateString() === today
      ).length;

      setStats({
        pendingBookings: summary?.pendingBookings || pending.length,
        activeStations: summary?.activeStations || activeStations.length,
        todayBookings: summary?.todayBookings || todayBookings,
        totalRevenue: summary?.totalRevenue || allBookings
          .filter(b => b.status === "Approved")
          .length * 50,
      });

      console.log("✅ Dashboard data loaded successfully");

    } catch (error: any) {
      console.error("❌ Dashboard loading error:", error);
      if (error.response?.status === 403) {
        showError("Access denied. Please ensure you have Station Operator permissions.");
      } else if (error.response?.status === 401) {
        showError("Session expired. Please log in again.");
      } else {
        showError("Failed to load dashboard data. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      await bookingApi.approve(bookingId);
      showSuccess("Booking approved successfully!");
      await loadDashboardData();
    } catch (error) {
      showError("Failed to approve booking. Please try again.");
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await bookingApi.reject(bookingId);
      showSuccess("Booking rejected successfully!");
      await loadDashboardData();
    } catch (error) {
      showError("Failed to reject booking. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case BOOKING_STATUS.PENDING:
        return "warning";
      case "Approved":
        return "success";
      case BOOKING_STATUS.REJECTED:
        return "error";
      case BOOKING_STATUS.COMPLETED:
        return "info";
      default:
        return "default";
    }
  };

  if (!state.isAuthenticated || state.user?.role !== 'StationOperator') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access denied. This page is only accessible to Station Operators.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Station Operator Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {state.user?.username}! Manage your charging stations and bookings.
          </Typography>
        </Box>
        <IconButton onClick={loadDashboardData} disabled={isLoading}>
          <Refresh />
        </IconButton>
      </Box>

      {isLoading && (
        <Box sx={{ mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <PendingActions sx={{ mr: 1, color: "warning.main" }} />
                <Typography variant="h6">Pending Bookings</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {stats.pendingBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <ElectricCar sx={{ mr: 1, color: "success.main" }} />
                <Typography variant="h6">Active Stations</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {stats.activeStations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <People sx={{ mr: 1, color: "info.main" }} />
                <Typography variant="h6">Today's Bookings</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {stats.todayBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <AttachMoney sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Revenue</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                ${stats.totalRevenue}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            fullWidth
            sx={{ py: 2 }}
            startIcon={<EventNote />}
            onClick={() => navigate('/operator/bookings')}
          >
            Manage Bookings
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            fullWidth
            sx={{ py: 2 }}
            startIcon={<ElectricCar />}
            onClick={() => navigate('/operator/stations')}
          >
            My Stations
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            fullWidth
            sx={{ py: 2 }}
            startIcon={<QrCodeScanner />}
            onClick={() => navigate('/operator/qr-scanner')}
          >
            QR Scanner
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            fullWidth
            sx={{ py: 2 }}
            startIcon={<Dashboard />}
            onClick={() => navigate('/operator/profile')}
          >
            Profile
          </Button>
        </Grid>
      </Grid>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Pending Bookings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "400px", display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">Pending Bookings</Typography>
              <Button 
                size="small" 
                endIcon={<NavigateNext />}
                onClick={() => navigate('/operator/bookings')}
              >
                View All
              </Button>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: "auto" }}>
              {pendingBookings.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
                  No pending bookings
                </Typography>
              ) : (
                <List>
                  {pendingBookings.map((booking, index) => (
                    <React.Fragment key={booking.id}>
                      <ListItem>
                        <ListItemText
                          primary={`Booking #${booking.id.slice(-6)}`}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                EV Owner: {booking.evOwnerNic}
                              </Typography>
                              <Typography variant="body2">
                                Date: {new Date(booking.reservationDateTime).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApproveBooking(booking.id)}
                            >
                              <CheckCircle />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRejectBooking(booking.id)}
                            >
                              <Cancel />
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < pendingBookings.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Bookings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "400px", display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">Recent Bookings</Typography>
              <Button 
                size="small" 
                endIcon={<NavigateNext />}
                onClick={() => navigate('/operator/bookings')}
              >
                View All
              </Button>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: "auto" }}>
              {recentBookings.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
                  No recent bookings
                </Typography>
              ) : (
                <List>
                  {recentBookings.map((booking, index) => (
                    <React.Fragment key={booking.id}>
                      <ListItem>
                        <ListItemText
                          primary={`Booking #${booking.id.slice(-6)}`}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                EV Owner: {booking.evOwnerNic}
                              </Typography>
                              <Typography variant="body2">
                                Date: {new Date(booking.reservationDateTime).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={booking.status}
                            color={getStatusColor(booking.status) as any}
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < recentBookings.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charging Stations Overview */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Your Charging Stations</Typography>
            <Button 
              size="small" 
              endIcon={<NavigateNext />}
              onClick={() => navigate('/operator/stations')}
            >
              Manage All
            </Button>
          </Box>
          {chargingStations.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
              No charging stations found
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {chargingStations.map((station) => (
                <Grid item xs={12} sm={6} md={3} key={station.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {station.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {station.address}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={station.isActive ? "Active" : "Inactive"}
                          color={station.isActive ? "success" : "default"}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default OperatorDashboard;
