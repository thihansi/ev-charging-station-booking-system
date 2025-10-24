import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NotificationProvider } from "../context/NotificationContext";
import Layout from "../components/Layout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import BookingForm from "../pages/BookingForm";
import BookingHistory from "../pages/BookingHistory";
import ChargingStations from "../pages/ChargingStations";
import PaymentSuccess from "../pages/PaymentSuccess";
import OperatorDashboard from "../pages/OperatorDashboard";
import BookingsManagement from "../pages/BookingsManagement";
import MyStations from "../pages/MyStations";
import QRScanner from "../pages/QRScanner";

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { state } = useAuth();

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(state.user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { state } = useAuth();

  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <NotificationProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/charging-stations"
          element={
            <ProtectedRoute>
              <Layout>
                <ChargingStations />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/book/:stationId"
          element={
            <ProtectedRoute>
              <Layout>
                <BookingForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking-history"
          element={
            <ProtectedRoute>
              <Layout>
                <BookingHistory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment/success"
          element={
            <ProtectedRoute>
              <Layout>
                <PaymentSuccess />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Station Operator Routes */}
        <Route
          path="/operator/dashboard"
          element={
            <ProtectedRoute roles={["StationOperator"]}>
              <Layout>
                <OperatorDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/operator/bookings"
          element={
            <ProtectedRoute roles={["StationOperator"]}>
              <Layout>
                <BookingsManagement />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/operator/stations"
          element={
            <ProtectedRoute roles={["StationOperator"]}>
              <Layout>
                <MyStations />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/operator/qr-scanner"
          element={
            <ProtectedRoute roles={["StationOperator"]}>
              <Layout>
                <QRScanner />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </NotificationProvider>
  );
};

export default AppRoutes;
