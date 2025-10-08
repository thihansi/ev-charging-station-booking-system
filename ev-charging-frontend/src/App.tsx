import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './utils/theme';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import BackofficeDashboard from './pages/BackofficeDashboard';
import OperatorDashboard from './pages/OperatorDashboard';
import { ROUTES, USER_ROLES } from './utils/constants';

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
              <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
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
              
              {/* Default redirect to login */}
              <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
              
              {/* Catch all - redirect to 404 */}
              <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
