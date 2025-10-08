import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  People,
  EvStation,
  BookOnline,
  TrendingUp,
  Refresh,
  Add,
  Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotificationContext } from '../context/NotificationContext';
import { evOwnerApi, chargingStationApi, bookingApi } from '../api';
import { ROUTES, BOOKING_STATUS } from '../utils/constants';
import { formatDateTime } from '../utils/helpers';
import type { EVOwner, ChargingStation, Booking } from '../types';

interface DashboardStats {
  totalEvOwners: number;
  activeEvOwners: number;
  totalStations: number;
  activeStations: number;
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  rejectedBookings: number;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactElement;
  path: string;
  color: 'primary' | 'secondary' | 'success' | 'warning';
}

const BackofficeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { showError } = useNotificationContext();

  const [stats, setStats] = useState<DashboardStats>({
    totalEvOwners: 0,
    activeEvOwners: 0,
    totalStations: 0,
    activeStations: 0,
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const quickActions: QuickAction[] = [
    {
      title: 'Add EV Owner',
      description: 'Register a new EV owner',
      icon: <Add />,
      path: ROUTES.BACKOFFICE.EV_OWNERS_CREATE,
      color: 'primary',
    },
    {
      title: 'Add Charging Station',
      description: 'Create a new charging station',
      icon: <EvStation />,
      path: ROUTES.BACKOFFICE.CHARGING_STATIONS_CREATE,
      color: 'success',
    },
    {
      title: 'View All Bookings',
      description: 'Manage booking requests',
      icon: <BookOnline />,
      path: ROUTES.BACKOFFICE.BOOKINGS,
      color: 'warning',
    },
    {
      title: 'Manage EV Owners',
      description: 'View and edit EV owners',
      icon: <People />,
      path: ROUTES.BACKOFFICE.EV_OWNERS,
      color: 'secondary',
    },
  ];

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load all data in parallel
      const [evOwners, stations, bookings] = await Promise.all([
        evOwnerApi.getAll(),
        chargingStationApi.getAll(),
        bookingApi.getAll(),
      ]);

      // Calculate statistics
      const newStats: DashboardStats = {
        totalEvOwners: evOwners.length,
        activeEvOwners: evOwners.filter(owner => owner.isActive).length,
        totalStations: stations.length,
        activeStations: stations.filter(station => station.isActive).length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(booking => booking.status === BOOKING_STATUS.PENDING).length,
        approvedBookings: bookings.filter(booking => booking.status === BOOKING_STATUS.APPROVED).length,
        rejectedBookings: bookings.filter(booking => booking.status === BOOKING_STATUS.REJECTED).length,
      };

      setStats(newStats);

      // Get recent bookings (last 10)
      const sortedBookings = bookings
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      setRecentBookings(sortedBookings);
      
      setLastUpdated(new Date());
    } catch (error) {
      showError('Failed to load dashboard data');
      console.error('Dashboard data loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case BOOKING_STATUS.PENDING:
        return 'warning';
      case BOOKING_STATUS.APPROVED:
        return 'success';
      case BOOKING_STATUS.REJECTED:
        return 'error';
      case BOOKING_STATUS.COMPLETED:
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Welcome back, {state.user?.username}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's an overview of your EV charging system
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {formatDateTime(lastUpdated.toISOString())}
          </Typography>
          <IconButton onClick={loadDashboardData} disabled={isLoading}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Loading indicator */}
      {isLoading && <LinearProgress sx={{ mb: 4 }} />}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    EV Owners
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalEvOwners}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {stats.activeEvOwners} active
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Stations
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalStations}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {stats.activeStations} active
                  </Typography>
                </Box>
                <EvStation sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Total Bookings
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalBookings}
                  </Typography>
                  <Typography variant="body2" color="warning.main">
                    {stats.pendingBookings} pending
                  </Typography>
                </Box>
                <BookOnline sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Performance
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalBookings > 0 
                      ? Math.round((stats.approvedBookings / stats.totalBookings) * 100)
                      : 0}%
                  </Typography>
                  <Typography variant="body2" color="info.main">
                    Approval rate
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action) => (
                  <Grid item xs={12} sm={6} key={action.title}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2,
                        },
                      }}
                      onClick={() => navigate(action.path)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: `${action.color}.light`,
                            color: `${action.color}.dark`,
                            mb: 2,
                          }}
                        >
                          {action.icon}
                        </Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Bookings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Bookings
                </Typography>
                <Button
                  startIcon={<Visibility />}
                  onClick={() => navigate(ROUTES.BACKOFFICE.BOOKINGS)}
                  size="small"
                >
                  View All
                </Button>
              </Box>
              
              {recentBookings.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={3}>
                  No bookings yet
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {recentBookings.map((booking) => (
                    <Box
                      key={booking.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {booking.evOwnerNic}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(booking.reservationDateTime)}
                        </Typography>
                      </Box>
                      <Chip
                        label={booking.status}
                        size="small"
                        color={getBookingStatusColor(booking.status) as any}
                        variant="outlined"
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BackofficeDashboard;