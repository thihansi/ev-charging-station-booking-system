import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Alert,
} from "@mui/material";
import {
  AccountCircle,
  ExitToApp,
  ElectricCar,
  History,
  LocationOn,
  Schedule,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { evOwnerAuthApi, bookingApi, chargingStationApi } from "../api";
import type { EVOwnerProfile } from "../api/evOwnerAuth";
import type { Booking, ChargingStation } from "../types";

export const EVOwnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [evOwner, setEvOwner] = useState<EVOwnerProfile | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [nearbyStations, setNearbyStations] = useState<ChargingStation[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if EV Owner is logged in
    const evOwnerToken = localStorage.getItem("evOwnerToken");
    const evOwnerData = localStorage.getItem("evOwnerData");

    console.log("EV Owner token exists:", !!evOwnerToken);
    console.log("EV Owner data exists:", !!evOwnerData);

    if (!evOwnerToken) {
      console.error("No EV Owner token found, redirecting to login");
      navigate("/ev-owner-login");
      return;
    }

    if (evOwnerData) {
      try {
        const parsedData = JSON.parse(evOwnerData);
        console.log("Stored EV Owner data:", parsedData);
      } catch (e) {
        console.error("Error parsing stored EV Owner data:", e);
      }
    }

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Load EV Owner profile
      try {
        console.log("Loading EV Owner profile...");
        const profileData = await evOwnerAuthApi.getProfile();
        setEvOwner(profileData);
        console.log("Profile loaded successfully:", profileData);
      } catch (profileError: any) {
        console.error("Failed to load profile:", profileError);
        setError(
          "Failed to load profile. Please check if you're logged in as an EV Owner."
        );
        return; // Don't proceed if profile loading fails
      }

      // Load upcoming bookings
      try {
        console.log("Loading upcoming bookings...");
        const upcomingData = await bookingApi.getMyUpcomingBookings();
        setUpcomingBookings(upcomingData);
        console.log("Upcoming bookings loaded:", upcomingData);
      } catch (bookingError: any) {
        console.error("Failed to load upcoming bookings:", bookingError);
        // Fallback: try to get all bookings and filter (if available)
        try {
          console.log("Trying fallback: loading all bookings...");
          const allBookings = await bookingApi.getAll();
          const evOwnerNic = JSON.parse(
            localStorage.getItem("evOwnerData") || "{}"
          ).nic;
          if (evOwnerNic) {
            const myBookings = allBookings.filter(
              (booking) =>
                booking.evOwnerNic === evOwnerNic &&
                new Date(booking.reservationDateTime) > new Date()
            );
            setUpcomingBookings(myBookings);
            console.log("Fallback upcoming bookings loaded:", myBookings);
          }
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
      }

      // Load recent booking history (last 5)
      try {
        console.log("Loading booking history...");
        const historyData = await bookingApi.getMyBookingHistory();
        setRecentBookings(historyData.slice(0, 5));
        console.log("Booking history loaded:", historyData);
      } catch (historyError: any) {
        console.error("Failed to load booking history:", historyError);
        // Fallback: try to get all bookings and filter for history
        try {
          console.log("Trying fallback: loading all bookings for history...");
          const allBookings = await bookingApi.getAll();
          const evOwnerNic = JSON.parse(
            localStorage.getItem("evOwnerData") || "{}"
          ).nic;
          if (evOwnerNic) {
            const myPastBookings = allBookings
              .filter(
                (booking) =>
                  booking.evOwnerNic === evOwnerNic &&
                  new Date(booking.reservationDateTime) <= new Date()
              )
              .slice(0, 5);
            setRecentBookings(myPastBookings);
            console.log("Fallback booking history loaded:", myPastBookings);
          }
        } catch (fallbackError) {
          console.error("History fallback also failed:", fallbackError);
        }
      }

      // Load nearby charging stations
      try {
        console.log("Loading charging stations...");
        const stationsData = await chargingStationApi.getAll();
        setNearbyStations(stationsData.slice(0, 6)); // Show first 6 for now
        console.log("Charging stations loaded:", stationsData);
      } catch (stationsError: any) {
        console.error("Failed to load charging stations:", stationsError);
        // Continue even if stations fail
      }
    } catch (err: any) {
      console.error("General dashboard error:", err);
      setError(
        "Failed to load dashboard data. Please try refreshing the page."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("evOwnerToken");
    localStorage.removeItem("evOwnerData");
    navigate("/ev-owner-login");
  };

  const handleProfile = () => {
    navigate("/ev-owner-profile");
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "success";
      case "Pending":
        return "warning";
      case "Completed":
        return "info";
      case "Cancelled":
      case "Rejected":
        return "error";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <ElectricCar sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EV Charging Dashboard
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Welcome, {evOwner?.name}
            </Typography>
            <IconButton size="large" onClick={handleMenuOpen} color="inherit">
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleProfile}>
          <AccountCircle sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ExitToApp sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Welcome Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {evOwner?.name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your EV charging bookings and discover nearby stations.
          </Typography>
        </Paper>

        {/* Stats Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 3,
            mb: 3,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Bookings
              </Typography>
              <Typography variant="h3" color="primary">
                {upcomingBookings.length}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Bookings
              </Typography>
              <Typography variant="h3" color="secondary">
                {recentBookings.length + upcomingBookings.length}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Stations
              </Typography>
              <Typography variant="h3" color="success.main">
                {nearbyStations.filter((s) => s.isActive).length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<LocationOn />}
              onClick={() => navigate("/ev-owner-stations")}
            >
              Find Stations
            </Button>
            <Button
              variant="outlined"
              startIcon={<Schedule />}
              onClick={() => navigate("/ev-owner-bookings")}
            >
              My Bookings
            </Button>
            <Button
              variant="outlined"
              startIcon={<History />}
              onClick={() => navigate("/ev-owner-history")}
            >
              Booking History
            </Button>
          </Box>
        </Paper>

        {/* Content Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          {/* Upcoming Bookings */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Bookings
            </Typography>
            {upcomingBookings.length === 0 ? (
              <Typography color="text.secondary">
                No upcoming bookings. Book a charging station now!
              </Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                {upcomingBookings.map((booking) => (
                  <Card key={booking.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="subtitle1">
                          Station: {booking.chargingStationId}
                        </Typography>
                        <Chip
                          label={booking.status}
                          color={getStatusColor(booking.status) as any}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(
                          booking.reservationDateTime
                        ).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(
                          booking.reservationDateTime
                        ).toLocaleTimeString()}
                      </Typography>
                      <Typography variant="body2">
                        Created:{" "}
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>

          {/* Nearby Stations */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Nearby Charging Stations
            </Typography>
            {nearbyStations.length === 0 ? (
              <Typography color="text.secondary">
                No charging stations available.
              </Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                {nearbyStations.slice(0, 4).map((station) => (
                  <Card key={station.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        {station.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {station.address}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: 1,
                        }}
                      >
                        <Typography variant="body2">
                          Type: {station.stationType}
                        </Typography>
                        <Chip
                          label={station.isActive ? "Available" : "Offline"}
                          color={station.isActive ? "success" : "error"}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};
