import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  LinearProgress,
} from "@mui/material";
import {
  People,
  EvStation,
  CalendarToday,
  AttachMoney,
  TrendingUp,
  MoreVert,
  Notifications,
  Assessment,
  Refresh,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotificationContext } from "../context/NotificationContext";
import { ROUTES } from "../utils/constants";
import { bookingApi, evOwnerApi, chargingStationApi } from "../api";
import { GRADIENT_STYLES } from "../utils/gradients";
import type { EVOwner } from "../types";

const BackofficeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { showSuccess } = useNotificationContext();
  const [isLoading, setIsLoading] = useState(true);

  // Real dashboard statistics
  const [stats, setStats] = useState({
    totalEvOwners: 0,
    activeEvOwners: 0,
    totalStations: 0,
    operationalStations: 0,
    totalBookings: 0,
    pendingBookings: 0,
    monthlyRevenue: 0,
  });

  // Sample recent activities
  const [recentActivities] = useState([
    {
      id: 1,
      type: "booking",
      message: "New booking request from John Doe",
      time: "2 minutes ago",
      status: "pending",
    },
    {
      id: 2,
      type: "evowner",
      message: "EV Owner Sarah Wilson registered",
      time: "1 hour ago",
      status: "completed",
    },
    {
      id: 3,
      type: "station",
      message: "Station ST-001 reported maintenance issue",
      time: "3 hours ago",
      status: "warning",
    },
  ]);

  // Quick action items
  const quickActions = [
    {
      title: "Add EV Owner",
      description: "Register a new electric vehicle owner",
      icon: <People />,
      color: "primary",
      action: () => navigate(ROUTES.BACKOFFICE.EV_OWNERS),
    },
    {
      title: "Add Charging Station",
      description: "Register a new charging station",
      icon: <EvStation />,
      color: "info",
      action: () => navigate(ROUTES.BACKOFFICE.CHARGING_STATIONS),
    },
    {
      title: "View Bookings",
      description: "Manage booking requests",
      icon: <CalendarToday />,
      color: "warning",
      action: () => navigate(ROUTES.BACKOFFICE.BOOKINGS),
    },
    {
      title: "Generate Reports",
      description: "View analytics and reports",
      icon: <Assessment />,
      color: "success",
      action: () => showSuccess("Reports feature coming soon!"),
    },
  ];

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch data from APIs
      const [bookings, stations] = await Promise.all([
        bookingApi.getAll(),
        chargingStationApi.getAll(),
      ]);

      // Try to fetch EV owners
      let evOwners: EVOwner[] = [];
      try {
        evOwners = await evOwnerApi.getAll();
      } catch (error) {
        console.warn("Could not fetch EV owners:", error);
      }

      // Calculate statistics from real data
      const pendingBookings = bookings.filter((b) => {
        if (typeof b.status === "string") {
          return b.status === "Pending";
        } else if (typeof b.status === "number") {
          return b.status === 0; // 0 is Pending in the backend enum
        }
        return false;
      }).length;
      const operationalStations = stations.filter((s) => s.isActive).length;

      setStats({
        totalEvOwners: evOwners.length,
        activeEvOwners: evOwners.length, // All registered owners are considered active
        totalStations: stations.length,
        operationalStations: operationalStations,
        totalBookings: bookings.length,
        pendingBookings: pendingBookings,
        monthlyRevenue: 0, // Revenue calculation would need additional business logic
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f8fafc", // Clean gray background
        p: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
            sx={{
              color: "#1e293b", // Clean dark text instead of gradient
              fontSize: "2.25rem",
            }}
          >
            Backoffice Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {state.user?.fullName || "Admin"}! Here's your system
            overview.
          </Typography>
        </Box>
        <IconButton
          onClick={loadDashboardData}
          disabled={isLoading}
          sx={{
            mt: 1,
            backgroundColor: "#f1f5f9",
            color: "#64748b",
            "&:hover": {
              backgroundColor: "#e2e8f0",
              color: "#475569",
            },
          }}
        >
          <Refresh />
        </IconButton>
      </Box>

      {isLoading && <LinearProgress sx={{ mb: 4 }} />}

      {/* Statistics Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Card sx={{ ...GRADIENT_STYLES.cleanCard }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography color="text.secondary" gutterBottom variant="h6">
                  EV Owners
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ color: "#1e293b", mb: 1 }}
                >
                  {stats.totalEvOwners}
                </Typography>
                <Chip
                  icon={<TrendingUp sx={{ color: "white !important" }} />}
                  label={`+${stats.activeEvOwners} Active`}
                  sx={{
                    backgroundColor: "#10b981",
                    color: "white",
                    fontWeight: 500,
                  }}
                  size="small"
                />
              </Box>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: "#3b82f6", // Blue instead of purple
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <People sx={{ fontSize: 28 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ ...GRADIENT_STYLES.cleanCard }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography color="text.secondary" gutterBottom variant="h6">
                  Charging Stations
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ color: "#1e293b", mb: 1 }}
                >
                  {stats.totalStations}
                </Typography>
                <Chip
                  icon={<TrendingUp sx={{ color: "white !important" }} />}
                  label={`${stats.operationalStations} Operational`}
                  sx={{
                    backgroundColor: "#10b981",
                    color: "white",
                    fontWeight: 500,
                  }}
                  size="small"
                />
              </Box>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: "#8b5cf6", // Purple for charging stations (relevant)
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <EvStation sx={{ fontSize: 28 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ ...GRADIENT_STYLES.cleanCard }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography color="text.secondary" gutterBottom variant="h6">
                  Total Bookings
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ color: "#1e293b", mb: 1 }}
                >
                  {stats.totalBookings}
                </Typography>
                <Chip
                  icon={<Notifications sx={{ color: "white !important" }} />}
                  label={`${stats.pendingBookings} Pending`}
                  sx={{
                    backgroundColor: "#f59e0b",
                    color: "white",
                    fontWeight: 500,
                  }}
                  size="small"
                />
              </Box>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: "#f59e0b", // Orange for bookings
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <CalendarToday sx={{ fontSize: 28 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ ...GRADIENT_STYLES.cleanCard }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography color="text.secondary" gutterBottom variant="h6">
                  Monthly Revenue
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ color: "#1e293b", mb: 1 }}
                >
                  {stats.monthlyRevenue > 0
                    ? `$${stats.monthlyRevenue.toLocaleString()}`
                    : "N/A"}
                </Typography>
                <Chip
                  icon={<TrendingUp sx={{ color: "white !important" }} />}
                  label={
                    stats.monthlyRevenue > 0
                      ? "+12% vs last month"
                      : "Revenue tracking TBD"
                  }
                  sx={{
                    backgroundColor:
                      stats.monthlyRevenue > 0 ? "#10b981" : "#64748b",
                    color: "white",
                    fontWeight: 500,
                  }}
                  size="small"
                />
              </Box>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: "#10b981", // Green for revenue
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <AttachMoney sx={{ fontSize: 28 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions and Recent Activities */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        {/* Quick Actions */}
        <Card>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Quick Actions
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: 2,
                mt: 2,
              }}
            >
              {quickActions.map((action, index) => {
                // Define colors for each action
                const actionColors = [
                  { bg: "#3b82f6", icon: "#ffffff" }, // Blue for EV Owners
                  { bg: "#8b5cf6", icon: "#ffffff" }, // Purple for Charging Stations
                  { bg: "#f59e0b", icon: "#ffffff" }, // Orange for Bookings
                  { bg: "#10b981", icon: "#ffffff" }, // Green for Reports
                ];
                const colors = actionColors[index] || actionColors[0];

                return (
                  <Card
                    key={action.title}
                    variant="outlined"
                    sx={{
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      "&:hover": {
                        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                        transform: "translateY(-4px)",
                        borderColor: colors.bg,
                      },
                    }}
                    onClick={action.action}
                  >
                    <CardContent sx={{ textAlign: "center", p: 3 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          mx: "auto",
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          backgroundColor: colors.bg,
                          color: colors.icon,
                          boxShadow: `0 4px 15px ${colors.bg}40`,
                        }}
                      >
                        {React.cloneElement(action.icon, { fontSize: "large" })}
                      </Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ color: "#1e293b", mb: 0.5 }}
                      >
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h2">
                Recent Activities
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
              {recentActivities.map((activity) => (
                <Box
                  key={activity.id}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    p: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": {
                      borderBottom: "none",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor:
                        activity.status === "pending"
                          ? "warning.main"
                          : activity.status === "completed"
                          ? "success.main"
                          : "error.main",
                      mt: 1,
                      mr: 2,
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {activity.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default BackofficeDashboard;
