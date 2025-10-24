import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  QrCodeScanner,
  CameraAlt,
  FlashOn,
  FlashOff,
  CheckCircle,
  Cancel,
  Person,
  LocationOn,
  ElectricCar,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNotificationContext } from "../context/NotificationContext";
import { bookingApi } from "../api";
import type { Booking, BookingStatus } from "../types";

interface ScannedBooking extends Booking {
  isValid: boolean;
  validationMessage: string;
}

const QRScanner: React.FC = () => {
  const { state } = useAuth();
  const { showError, showSuccess } = useNotificationContext();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scannedBooking, setScannedBooking] = useState<ScannedBooking | null>(
    null
  );
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    checkCameraAvailability();
    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");
      setHasCamera(cameras.length > 0);
    } catch (error) {
      console.error("Error checking camera availability:", error);
      setHasCamera(false);
    }
  };

  const startScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);

        // Start QR code detection
        startQRDetection();
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      showError("Failed to access camera. Please check your permissions.");
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const startQRDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    const scanInterval = setInterval(() => {
      if (!isScanning || !video.videoWidth || !video.videoHeight) {
        clearInterval(scanInterval);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        // In a real implementation, you would use a QR code library like qr-scanner
        // For this demo, we'll simulate QR detection
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const detectedCode = simulateQRDetection(imageData);

        if (detectedCode) {
          clearInterval(scanInterval);
          handleQRCodeDetected(detectedCode);
        }
      } catch (error) {
        console.error("Error detecting QR code:", error);
      }
    }, 100); // Check for QR codes every 100ms
  };

  // Simulate QR code detection for demo purposes
  const simulateQRDetection = (_imageData: ImageData): string | null => {
    // In a real implementation, this would use a QR code detection library
    // For demo, we'll randomly detect a QR code after some time
    if (Math.random() < 0.01) {
      // 1% chance per scan
      return "BOOKING_ID_12345"; // Simulated booking ID
    }
    return null;
  };

  const handleQRCodeDetected = async (qrCode: string) => {
    setIsProcessing(true);
    stopScanning();

    try {
      // Extract booking ID from QR code
      const bookingId = extractBookingIdFromQR(qrCode);

      if (!bookingId) {
        showError("Invalid QR code format");
        return;
      }

      await validateBooking(qrCode);
    } catch (error) {
      console.error("Error processing QR code:", error);
      showError("Failed to process QR code");
    } finally {
      setIsProcessing(false);
    }
  };

  const extractBookingIdFromQR = (qrCode: string): string | null => {
    // Extract booking ID from QR code data
    // This could be a simple booking ID or encoded data
    if (qrCode.startsWith("BOOKING_")) {
      return qrCode.replace("BOOKING_", "");
    }

    try {
      // Try to parse as JSON
      const parsed = JSON.parse(qrCode);
      return parsed.bookingId || parsed.id;
    } catch {
      // Return as-is if not JSON
      return qrCode;
    }
  };

  const extractBookingId = (qrCode: string): string => {
    // Handle different QR code formats
    if (qrCode.startsWith("BOOKING_")) {
      return qrCode;
    }

    try {
      // Try to parse as JSON
      const parsed = JSON.parse(qrCode);
      return parsed.bookingId || parsed.id || qrCode;
    } catch {
      // Return as-is if not JSON
      return qrCode;
    }
  };

  const validateBooking = async (qrCodeData: string) => {
    try {
      console.log("🔍 Validating QR code:", qrCodeData);

      // Use the validate-qr endpoint
      const validationResult = await bookingApi.validateQR(qrCodeData);
      console.log("✅ Validation result:", validationResult);

      if (validationResult.valid && validationResult.booking) {
        const scannedBookingData: ScannedBooking = {
          ...validationResult.booking,
          isValid: true,
          validationMessage:
            validationResult.message ||
            "Booking is valid and ready for charging.",
        };

        setScannedBooking(scannedBookingData);
        setDetailsDialogOpen(true);
        showSuccess("Valid booking detected!");
      } else {
        // If validation fails, try to get booking details for display
        try {
          const bookingId = extractBookingId(qrCodeData);
          const booking = await bookingApi.getById(bookingId);

          const scannedBookingData: ScannedBooking = {
            ...booking,
            isValid: false,
            validationMessage:
              validationResult.message || "Invalid booking code.",
          };

          setScannedBooking(scannedBookingData);
          setDetailsDialogOpen(true);
        } catch {
          // If we can't get booking details, show generic error
          setScannedBooking({
            id: "unknown",
            evOwnerNic: "Unknown",
            chargingStationId: "Unknown",
            reservationDateTime: new Date().toISOString(),
            status: "Unknown" as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isValid: false,
            validationMessage: validationResult.message || "Invalid QR code.",
          });
          setDetailsDialogOpen(true);
        }

        showError(validationResult.message || "Invalid booking code.");
      }
    } catch (error: any) {
      console.error("❌ QR validation error:", error);
      if (error.response?.status === 404) {
        showError("Booking not found. Please check the QR code.");
      } else {
        showError("Failed to validate booking. Please try again.");
      }
    }
  };

  const handleManualEntry = async () => {
    if (!manualCode.trim()) {
      showError("Please enter a booking ID or QR code data");
      return;
    }

    setIsProcessing(true);
    try {
      const trimmedCode = manualCode.trim();
      await validateBooking(trimmedCode);
    } catch (error) {
      showError("Failed to validate booking");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFlash = async () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && videoTrack.getCapabilities()) {
        try {
          // Try to enable torch/flash (may not be supported on all devices)
          await videoTrack.applyConstraints({
            advanced: [{ torch: !flashEnabled } as any],
          });
          setFlashEnabled(!flashEnabled);
        } catch (error) {
          console.error("Flash not supported:", error);
          showError("Flash not supported on this device");
        }
      }
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Pending":
        return "warning";
      case "Rejected":
        return "error";
      case "Completed":
        return "info";
      default:
        return "default";
    }
  };

  if (!state.isAuthenticated || state.user?.role !== "StationOperator") {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access denied. This page is only accessible to Station Operators.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          QR Code Scanner
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Scan booking QR codes to validate charging sessions
        </Typography>
      </Box>

      {/* Camera Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ textAlign: "center" }}>
            {!hasCamera ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No camera detected. Please use manual entry below.
              </Alert>
            ) : !isScanning ? (
              <Box>
                <QrCodeScanner
                  sx={{ fontSize: 80, color: "primary.main", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  Ready to Scan
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Position the QR code within the camera frame
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CameraAlt />}
                  onClick={startScanning}
                >
                  Start Camera
                </Button>
              </Box>
            ) : (
              <Box>
                <Box sx={{ position: "relative", mb: 2 }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                      width: "100%",
                      maxWidth: "400px",
                      borderRadius: "8px",
                      backgroundColor: "#000",
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }} />

                  {isProcessing && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        borderRadius: "8px",
                      }}
                    >
                      <CircularProgress color="primary" />
                    </Box>
                  )}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <Tooltip
                    title={flashEnabled ? "Turn Off Flash" : "Turn On Flash"}
                  >
                    <IconButton onClick={toggleFlash} color="primary">
                      {flashEnabled ? <FlashOff /> : <FlashOn />}
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="outlined"
                    onClick={stopScanning}
                    startIcon={<Cancel />}
                  >
                    Stop Camera
                  </Button>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Point your camera at a booking QR code
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Manual Entry Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Manual Entry
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter booking ID or QR code data manually if camera is not available
          </Typography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
            <Box sx={{ flexGrow: 1 }}>
              <label htmlFor="manual-code-input">
                Booking ID or QR Code Data
              </label>
              <input
                id="manual-code-input"
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter booking ID or scan data..."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "16px",
                  marginTop: "8px",
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleManualEntry();
                  }
                }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={handleManualEntry}
              disabled={isProcessing || !manualCode.trim()}
              sx={{ mb: 0 }}
            >
              {isProcessing ? <CircularProgress size={20} /> : "Validate"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Paper sx={{ p: 3, backgroundColor: "grey.50" }}>
        <Typography variant="h6" gutterBottom>
          How to Use QR Scanner
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "center" }}>
              <QrCodeScanner
                sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
              />
              <Typography variant="subtitle2" gutterBottom>
                1. Scan QR Code
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use the camera or enter booking details manually
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "center" }}>
              <CheckCircle
                sx={{ fontSize: 40, color: "success.main", mb: 1 }}
              />
              <Typography variant="subtitle2" gutterBottom>
                2. Validate Booking
              </Typography>
              <Typography variant="body2" color="text.secondary">
                System checks booking status and timing
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "center" }}>
              <ElectricCar sx={{ fontSize: 40, color: "info.main", mb: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                3. Authorize Charging
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Valid bookings can proceed with charging
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Booking Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6">Booking Validation Result</Typography>
            <Chip
              label={scannedBooking?.isValid ? "Valid" : "Invalid"}
              color={scannedBooking?.isValid ? "success" : "error"}
              icon={scannedBooking?.isValid ? <CheckCircle /> : <Cancel />}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {scannedBooking && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Alert
                  severity={scannedBooking.isValid ? "success" : "error"}
                  sx={{ mb: 3 }}
                >
                  {scannedBooking.validationMessage}
                </Alert>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Booking Information
                </Typography>
                <Box sx={{ p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>ID:</strong> {scannedBooking.id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong>{" "}
                    <Chip
                      label={scannedBooking.status}
                      color={getStatusColor(scannedBooking.status) as any}
                      size="small"
                    />
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong>{" "}
                    {new Date(
                      scannedBooking.reservationDateTime
                    ).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  EV Owner
                </Typography>
                <Box sx={{ p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Person sx={{ fontSize: 16 }} />
                    <Typography variant="body2">
                      <strong>
                        {scannedBooking.evOwner?.name || "Unknown"}
                      </strong>
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    <strong>NIC:</strong> {scannedBooking.evOwnerNic}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Charging Station
                </Typography>
                <Box sx={{ p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <LocationOn sx={{ fontSize: 16 }} />
                    <Typography variant="body2">
                      <strong>
                        {scannedBooking.chargingStation?.name ||
                          "Unknown Station"}
                      </strong>
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {scannedBooking.chargingStation?.address ||
                      "Address not available"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {scannedBooking?.isValid && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => {
                showSuccess("Charging session authorized!");
                setDetailsDialogOpen(false);
              }}
            >
              Authorize Charging
            </Button>
          )}
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QRScanner;
