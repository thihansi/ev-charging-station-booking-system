import React, { useState, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  ArrowBack,
  QrCodeScanner,
  CheckCircle,
  Cancel,
  Schedule,
  Person,
  LocationOn,
  AccessTime,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useNotificationContext } from "../context/NotificationContext";
import { bookingApi } from "../api";
import { ROUTES } from "../utils/constants";
import { formatDateTime } from "../utils/helpers";
import type { Booking } from "../types";
import { getBookingStatusDisplay } from "../types";

const QRScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotificationContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [scannedBooking, setScannedBooking] = useState<Booking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState("");

  // Simulate camera scanner (in a real app, you'd use a camera library)
  const handleScanFromCamera = () => {
    showError(
      "Camera scanning not implemented. Please use QR code input or file upload instead."
    );
  };

  // Handle QR code from file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd use a QR code reading library here
      // For demo purposes, we'll simulate QR code reading
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate QR code extraction
        const simulatedQrCode =
          "booking_" + Math.random().toString(36).substr(2, 9);
        handleQrCodeScan(simulatedQrCode);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle manual QR code input
  const handleManualInput = () => {
    const qrCode = prompt("Enter QR Code value:");
    if (qrCode && qrCode.trim()) {
      handleQrCodeScan(qrCode.trim());
    }
  };

  // Process scanned QR code
  const handleQrCodeScan = async (qrCode: string) => {
    setIsLoading(true);
    setQrCodeValue(qrCode);

    try {
      const result = await bookingApi.validateQR(qrCode);

      if (result.isValid && result.booking) {
        setScannedBooking(result.booking);
        setDialogOpen(true);
        showSuccess("QR Code validated successfully!");
      } else {
        showError(
          "Invalid QR Code. This booking may not exist or has already been processed."
        );
      }
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to validate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle booking actions
  const handleBookingAction = async (action: "complete") => {
    if (!scannedBooking) return;

    setIsLoading(true);
    try {
      await bookingApi.complete(scannedBooking.id);
      showSuccess("Booking marked as completed!");

      setDialogOpen(false);
      setScannedBooking(null);
      setQrCodeValue("");
    } catch (error: any) {
      showError(error.response?.data?.message || `Failed to ${action} booking`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Approved":
        return "success";
      case "Completed":
        return "info";
      case "Rejected":
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const canProcessBooking = (booking: Booking) => {
    return booking.status === "Approved";
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(ROUTES.OPERATOR.DASHBOARD)}
        >
          Back to Dashboard
        </Button>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            QR Code Scanner
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Scan booking QR codes to validate and process charging sessions
          </Typography>
        </Box>
      </Box>

      {/* Loading indicator */}
      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Scanner Options */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
          mb: 4,
        }}
      >
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <QrCodeScanner
              sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              Scan with Camera
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Use your device camera to scan QR codes
            </Typography>
            <Button
              variant="contained"
              onClick={handleScanFromCamera}
              disabled={isLoading}
              fullWidth
            >
              Open Camera Scanner
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Alternative Methods
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Upload QR code image or enter code manually
                </Typography>
              </Box>

              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                fullWidth
              >
                Upload QR Code Image
              </Button>

              <Button
                variant="outlined"
                onClick={handleManualInput}
                disabled={isLoading}
                fullWidth
              >
                Enter Code Manually
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Instructions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            How to Use QR Scanner
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Valid QR Code"
                secondary="QR codes from approved bookings can be processed for completion or no-show"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Schedule color="warning" />
              </ListItemIcon>
              <ListItemText
                primary="Pending Bookings"
                secondary="Pending bookings need approval before they can be processed"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Cancel color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Invalid Codes"
                secondary="Expired, cancelled, or already processed bookings will show as invalid"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        ref={fileInputRef}
        style={{ display: "none" }}
      />

      {/* Booking Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <QrCodeScanner />
            <Typography variant="h6">Booking Details</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {scannedBooking && (
            <Box>
              {/* Status Alert */}
              <Alert
                severity={getStatusColor(scannedBooking.status) as any}
                sx={{ mb: 3 }}
              >
                <Typography fontWeight="bold">
                  Status: {getBookingStatusDisplay(scannedBooking.status)}
                </Typography>
                {canProcessBooking(scannedBooking)
                  ? "This booking is ready to be processed"
                  : "This booking cannot be processed in its current status"}
              </Alert>

              {/* Booking Information */}
              <Box sx={{ display: "grid", gap: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Booking Information
                    </Typography>
                    <Box sx={{ display: "grid", gap: 1 }}>
                      <Typography variant="body2">
                        <strong>Booking ID:</strong> {scannedBooking.id}
                      </Typography>
                      <Typography variant="body2">
                        <strong>QR Code:</strong> {qrCodeValue}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Chip
                          label={getBookingStatusDisplay(scannedBooking.status)}
                          color={getStatusColor(scannedBooking.status) as any}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Customer Information
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Person fontSize="small" />
                      <Typography variant="body2">
                        {scannedBooking.evOwner?.name ||
                          scannedBooking.evOwnerNic}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      NIC: {scannedBooking.evOwnerNic}
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Session Details
                    </Typography>
                    <Box sx={{ display: "grid", gap: 1 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LocationOn fontSize="small" />
                        <Typography variant="body2">
                          {scannedBooking.chargingStation?.name ||
                            scannedBooking.chargingStationId}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <AccessTime fontSize="small" />
                        <Typography variant="body2">
                          {formatDateTime(scannedBooking.reservationDateTime)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {scannedBooking && canProcessBooking(scannedBooking) && (
            <Button
              onClick={() => handleBookingAction("complete")}
              color="success"
              variant="contained"
              disabled={isLoading}
            >
              Complete Session
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QRScannerPage;
