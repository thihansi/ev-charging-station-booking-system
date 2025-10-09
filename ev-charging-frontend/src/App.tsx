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
import LoginPage from "./pages/LoginPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFoundPage from "./pages/NotFoundPage";
import BackofficeDashboard from "./pages/BackofficeDashboard";
import OperatorDashboard from "./pages/OperatorDashboard";
import EVOwnerListPage from "./pages/EVOwnerListPage";
import EVOwnerFormPage from "./pages/EVOwnerFormPage";
import ChargingStationListPage from "./pages/ChargingStationListPage";
import ChargingStationFormPage from "./pages/ChargingStationFormPage";
import BookingListPage from "./pages/BookingListPage";
import BookingFormPage from "./pages/BookingFormPage";
import QRScannerPage from "./pages/QRScannerPage";
import LandingPage from "./pages/LandingPage";
import UserRegistrationPage from "./pages/UserRegistrationPage";
import ProfilePage from "./pages/ProfilePage";
import SystemUsersPage from "./pages/SystemUsersPage";
import ProfileTestPage from "./pages/ProfileTestPage";
import { APITestPage } from "./pages/APITestPage";
import { APIConnectionTest } from "./components/APIConnectionTest";
import { LoginDebugPage } from "./pages/LoginDebugPage";
import { ROUTES, USER_ROLES } from "./utils/constants";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route
                path={ROUTES.USER_REGISTRATION}
                element={<UserRegistrationPage />}
              />
              <Route
                path={ROUTES.UNAUTHORIZED}
                element={<UnauthorizedPage />}
              />
              <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
              
              {/* API Test Route - For backend connectivity testing */}
              <Route path="/api-test" element={<APITestPage />} />
              
              {/* Route Test Page - For debugging navigation issues */}
              <Route path="/route-test" element={<ProfileTestPage />} />
              
              {/* Simple API Connection Test */}
              <Route path="/test-connection" element={<APIConnectionTest />} />
              
              {/* Login Debug Tool */}
              <Route path="/login-debug" element={<LoginDebugPage />} />

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
                      <EVOwnerListPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.BACKOFFICE.EV_OWNERS_CREATE}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.BACKOFFICE}>
                    <DashboardLayout>
                      <EVOwnerFormPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.BACKOFFICE.EV_OWNERS_EDIT}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.BACKOFFICE}>
                    <DashboardLayout>
                      <EVOwnerFormPage />
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
                      <ChargingStationListPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.BACKOFFICE.CHARGING_STATIONS_CREATE}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.BACKOFFICE}>
                    <DashboardLayout>
                      <ChargingStationFormPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.BACKOFFICE.CHARGING_STATIONS_VIEW}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.BACKOFFICE}>
                    <DashboardLayout>
                      <div>Charging Station View Page (TODO)</div>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.BACKOFFICE.CHARGING_STATIONS_EDIT}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.BACKOFFICE}>
                    <DashboardLayout>
                      <ChargingStationFormPage />
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

              {/* Admin Profile Route */}
              <Route
                path={ROUTES.PROFILE}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.BACKOFFICE}>
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
                      <div>Pending Bookings (TODO)</div>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operator/bookings/history"
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.STATION_OPERATOR}>
                    <DashboardLayout>
                      <BookingListPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.OPERATOR.QR_SCANNER}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.STATION_OPERATOR}>
                    <DashboardLayout>
                      <QRScannerPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.PROFILE}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.STATION_OPERATOR}>
                    <DashboardLayout>
                      <ProfilePage />
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
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const redirectPath =
    state.user.role === USER_ROLES.BACKOFFICE
      ? ROUTES.BACKOFFICE.DASHBOARD
      : ROUTES.OPERATOR.DASHBOARD;

  return <Navigate to={redirectPath} replace />;
};

export default App;
