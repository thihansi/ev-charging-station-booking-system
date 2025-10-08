import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { theme } from "./utils/theme";
import { AuthProvider } from "./context/AuthContext";
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

              {/* Protected Backoffice Routes */}
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

              {/* EV Owner Management Routes */}
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
                      <ChargingStationFormPage />
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
                      <BookingFormPage />
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
                      <BookingListPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.OPERATOR.STATIONS}
                element={
                  <ProtectedRoute requiredRole={USER_ROLES.STATION_OPERATOR}>
                    <DashboardLayout>
                      <ChargingStationListPage />
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

              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />

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

export default App;
