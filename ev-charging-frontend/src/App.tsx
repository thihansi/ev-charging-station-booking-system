import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { theme } from "./utils/theme";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFoundPage from "./pages/NotFoundPage";
import BackofficeDashboard from "./pages/BackofficeDashboard";
import OperatorDashboard from "./pages/OperatorDashboard";
import BookingsManagement from "./pages/BookingsManagement";
import MyStations from "./pages/MyStations";
import QRScanner from "./pages/QRScanner";
import EVOwnersPage from "./pages/EVOwnersPage";
import ChargingStationsPage from "./pages/ChargingStationsPage";
import BookingListPage from "./pages/BookingListPage";
import BookingFormPage from "./pages/BookingFormPage";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import SystemUsersPage from "./pages/SystemUsersPage";

import { APIConnectionTest } from "./components/APIConnectionTest";

import { ROUTES, USER_ROLES } from "./utils/constants";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <AuthProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              {/* Public Routes */}
              <Route
                path={ROUTES.UNAUTHORIZED}
                element={<UnauthorizedPage />}
              />
              <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />

              {/* Admin Dashboard */}
              <Route
                path={ROUTES.BACKOFFICE.DASHBOARD}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.BACKOFFICE}>
                    <DashboardLayout>
                      <BackofficeDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* System Users Management */}
              <Route
                path={ROUTES.BACKOFFICE.USERS}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.BACKOFFICE}>
                    <DashboardLayout>
                      <SystemUsersPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* EV Owners Management */}
              <Route
                path={ROUTES.BACKOFFICE.EV_OWNERS}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.BACKOFFICE}>
                    <DashboardLayout>
                      <EVOwnersPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              {/* Charging Station Management Routes */}
              {/* Charging Stations Management */}
              <Route
                path={ROUTES.BACKOFFICE.CHARGING_STATIONS}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.BACKOFFICE}>
                    <DashboardLayout>
                      <ChargingStationsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              {/* Booking Management Routes */}
              <Route
                path={ROUTES.BACKOFFICE.BOOKINGS}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.BACKOFFICE}>
                    <DashboardLayout>
                      <BookingListPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              {/* Note: Booking creation removed - only EV owners can create bookings per API */}
              {/* 
              <Route
                path={ROUTES.BACKOFFICE.BOOKINGS_CREATE}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.BACKOFFICE}>
                    <DashboardLayout>
                      <BookingFormPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              */}
              <Route
                path={ROUTES.BACKOFFICE.BOOKINGS_CREATE}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.BACKOFFICE}>
                    <DashboardLayout>
                      <BookingFormPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.BACKOFFICE.BOOKINGS_VIEW}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.BACKOFFICE}>
                    <DashboardLayout>
                      <div>Booking View Page (TODO)</div>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.BACKOFFICE.BOOKINGS_EDIT}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.BACKOFFICE}>
                    <DashboardLayout>
                      <BookingFormPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Profile Route - Available to all authenticated users */}
              <Route
                path={ROUTES.PROFILE}
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ProfilePage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Protected Operator Routes */}
              <Route
                path={ROUTES.OPERATOR.DASHBOARD}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.STATION_OPERATOR}>
                    <DashboardLayout>
                      <OperatorDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.OPERATOR.BOOKINGS}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.STATION_OPERATOR}>
                    <DashboardLayout>
                      <BookingsManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operator/bookings/history"
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.STATION_OPERATOR}>
                    <DashboardLayout>
                      <BookingsManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.OPERATOR.QR_SCANNER}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.STATION_OPERATOR}>
                    <DashboardLayout>
                      <QRScanner />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.OPERATOR.STATIONS}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.STATION_OPERATOR}>
                    <DashboardLayout>
                      <MyStations />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Dashboard redirect - redirect to appropriate dashboard based on role */}
              <Route
                path={ROUTES.DASHBOARD}
                element={
                  <ProtectedRoute>
                    <DashboardRedirect />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to 404 */}
              <Route
                path="*"
                element={<Navigate to={ROUTES.NOT_FOUND} replace />}
              />
            </Routes>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

// Dashboard redirect component
const DashboardRedirect: React.FC = () => {
  const { state } = useAuth();

  if (!state.user) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  const redirectPath =
    state.user.role === USER_ROLES.BACKOFFICE
      ? ROUTES.BACKOFFICE.DASHBOARD
      : ROUTES.OPERATOR.DASHBOARD;

  return <Navigate to={redirectPath} replace />;
};

export default App;
