import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  LinearProgress,
  Autocomplete,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowBack, Save } from "@mui/icons-material";
import { useNotificationContext } from "../context/NotificationContext";
import { bookingApi, evOwnerApi, chargingStationApi } from "../api";
import { ROUTES } from "../utils/constants";
import type {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  EVOwner,
  ChargingStation,
  BookingStatus,
} from "../types";
import { getBookingStatusDisplay } from "../types";

const BookingFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useNotificationContext();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<CreateBookingRequest>({
    evOwnerNic: "",
    chargingStationId: "",
    reservationDateTime: "",
  });

  const [booking, setBooking] = useState<Booking | null>(null);
  const [evOwners, setEvOwners] = useState<EVOwner[]>([]);
  const [evOwnerSearchTerm, setEvOwnerSearchTerm] = useState("");
  const [searchingEvOwner, setSearchingEvOwner] = useState(false);
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>(
    []
  );
  const [selectedEvOwner, setSelectedEvOwner] = useState<EVOwner | null>(null);
  const [selectedStation, setSelectedStation] =
    useState<ChargingStation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(isEditMode);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      loadBooking();
    }
  }, [isEditMode, id]);

  const loadInitialData = async () => {
    try {
      // Only load charging stations - EV owners will be search-based
      const stationsData = await chargingStationApi.getAll();
      setChargingStations(stationsData.filter((station) => station.isActive));
    } catch (error) {
      showError("Failed to load form data");
    }
  };

  const searchEvOwner = async (nic: string) => {
    if (!nic.trim() || nic.length < 3) {
      setEvOwners([]);
      return;
    }

    setSearchingEvOwner(true);
    try {
      const evOwner = await evOwnerApi.getByNic(nic.trim());
      setEvOwners([evOwner]);
    } catch (error) {
      // If not found, clear the list
      setEvOwners([]);
    } finally {
      setSearchingEvOwner(false);
    }
  };

  const loadBooking = async () => {
    if (!id) return;

    setIsInitialLoading(true);
    try {
      const bookingData = await bookingApi.getById(id);
      setBooking(bookingData);

      // Set form data
      setFormData({
        evOwnerNic: bookingData.evOwnerNic,
        chargingStationId: bookingData.chargingStationId,
        reservationDateTime: bookingData.reservationDateTime.slice(0, 16), // Format for datetime-local input
      });

      // Load the specific EV owner for this booking
      try {
        const evOwner = await evOwnerApi.getByNic(bookingData.evOwnerNic);
        setSelectedEvOwner(evOwner);
        setEvOwners([evOwner]); // Add to search results
      } catch (error) {
        console.warn("Could not load EV owner details");
      }

      // Set selected station
      const station = chargingStations.find(
        (station) => station.id === bookingData.chargingStationId
      );
      if (station) setSelectedStation(station);
    } catch (error) {
      showError("Failed to load booking details");
      navigate(ROUTES.BACKOFFICE.BOOKINGS);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.evOwnerNic.trim()) {
      newErrors.evOwnerNic = "EV Owner is required";
    }

    if (!formData.chargingStationId.trim()) {
      newErrors.chargingStationId = "Charging Station is required";
    }

    if (!formData.reservationDateTime) {
      newErrors.reservationDateTime = "Reservation date and time is required";
    } else {
      const reservationDate = new Date(formData.reservationDateTime);
      const now = new Date();

      if (reservationDate <= now) {
        newErrors.reservationDateTime = "Reservation date must be in the future";
      }

      // Business Rule: Reservation date/time must be within 7 days from booking date
      const maxReservationDate = new Date();
      maxReservationDate.setDate(maxReservationDate.getDate() + 7);
      
      if (reservationDate > maxReservationDate) {
        newErrors.reservationDateTime = "Reservation date cannot be more than 7 days from now";
      }

      // Business Rule: For updates, must be at least 12 hours before reservation
      if (isEditMode && booking) {
        const twelveHoursFromNow = new Date();
        twelveHoursFromNow.setHours(twelveHoursFromNow.getHours() + 12);
        
        if (reservationDate < twelveHoursFromNow) {
          newErrors.reservationDateTime = "Reservations can only be updated at least 12 hours before the reservation time";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (isEditMode && id) {
        const updateData: UpdateBookingRequest = {
          reservationDateTime: formData.reservationDateTime,
        };
        await bookingApi.update(id, updateData);
        showSuccess("Booking updated successfully");
      } else {
        await bookingApi.create(formData);
        showSuccess("Booking created successfully");
      }

      navigate(ROUTES.BACKOFFICE.BOOKINGS);
    } catch (error: any) {
      console.error("[Booking Creation Error]", error);
      
      // Handle specific API errors
      if (error.response?.status === 403) {
        showError("Access denied: Only EV owners can create bookings. Admins can only view and manage existing bookings.");
      } else if (error.response?.status === 401) {
        showError("Authentication required: Please log in as an EV owner to create bookings.");
      } else {
        showError(
          error.response?.data?.message ||
            `Failed to ${isEditMode ? "update" : "create"} booking. ${error.response?.status === 403 ? "This feature is only available to EV owners." : ""}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.BACKOFFICE.BOOKINGS);
  };

  const handleEvOwnerChange = (evOwner: EVOwner | null) => {
    setSelectedEvOwner(evOwner);
    setFormData((prev) => ({
      ...prev,
      evOwnerNic: evOwner?.nic || "",
    }));
    if (errors.evOwnerNic) {
      setErrors((prev) => ({ ...prev, evOwnerNic: "" }));
    }
  };

  const handleStationChange = (station: ChargingStation | null) => {
    setSelectedStation(station);
    setFormData((prev) => ({
      ...prev,
      chargingStationId: station?.id || "",
    }));
    if (errors.chargingStationId) {
      setErrors((prev) => ({ ...prev, chargingStationId: "" }));
    }
  };

  const handleDateTimeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      reservationDateTime: value,
    }));
    if (errors.reservationDateTime) {
      setErrors((prev) => ({ ...prev, reservationDateTime: "" }));
    }
  };

  const handleStatusChange = async (newStatus: BookingStatus) => {
    if (!booking || !id) return;

    try {
      setIsLoading(true);
      switch (newStatus) {
        case "Approved":
          await bookingApi.approve(id);
          break;
        case "Rejected":
          await bookingApi.reject(id);
          break;
        case "Completed":
          await bookingApi.complete(id);
          break;
        case "Cancelled":
          await bookingApi.cancel(id);
          break;
        default:
          return;
      }

      showSuccess(`Booking ${newStatus.toLowerCase()} successfully`);
      await loadBooking(); // Reload to get updated data
    } catch (error: any) {
      showError(
        error.response?.data?.message ||
          `Failed to ${newStatus.toLowerCase()} booking`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <Box>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: "center" }}>
          Loading booking details...
        </Typography>
      </Box>
    );
  }

  // Get minimum datetime for input (current time + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <Box>
      {/* API Limitation Warning */}
      {!isEditMode && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Important:</strong> According to the API specification, only EV owners can create new bookings. 
            This form is for demonstration purposes. In production, booking creation should be available only to authenticated EV owners.
          </Typography>
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleCancel}
        >
          Back to Bookings
        </Button>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {isEditMode ? "Edit Booking" : "Create New Booking"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditMode
              ? `Update booking details for ${booking?.id}`
              : "Create a new EV charging station booking"}
          </Typography>
        </Box>
      </Box>

      {/* Current Status (Edit Mode Only) */}
      {isEditMode && booking && (
        <Alert
          severity={
            booking.status === "Pending"
              ? "warning"
              : booking.status === "Approved"
              ? "info"
              : booking.status === "Completed"
              ? "success"
              : "error"
          }
          sx={{ mb: 3 }}
        >
          Current Status: <strong>{getBookingStatusDisplay(booking.status)}</strong>
          {booking.status === "Pending" && " - Waiting for approval"}
          {booking.status === "Approved" && " - Ready for charging session"}
          {booking.status === "Completed" && " - Charging session completed"}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 3,
          }}
        >
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Booking Details
                </Typography>

                <Box sx={{ display: "grid", gap: 3 }}>
                  {/* EV Owner Selection */}
                  <Autocomplete
                    value={selectedEvOwner}
                    onChange={(_, newValue) => handleEvOwnerChange(newValue)}
                    inputValue={evOwnerSearchTerm}
                    onInputChange={(_, newInputValue) => {
                      setEvOwnerSearchTerm(newInputValue);
                      searchEvOwner(newInputValue);
                    }}
                    options={evOwners}
                    getOptionLabel={(option) =>
                      `${option.name} (${option.nic})`
                    }
                    disabled={isEditMode} // Can't change EV Owner in edit mode
                    loading={searchingEvOwner}
                    filterOptions={(x) => x} // Disable local filtering since we use API search
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="EV Owner"
                        placeholder="Type NIC to search..."
                        error={Boolean(errors.evOwnerNic)}
                        helperText={errors.evOwnerNic || "Enter at least 3 characters to search"}
                        required
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {option.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            NIC: {option.nic} | Phone: {option.phone}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    noOptionsText={
                      evOwnerSearchTerm.length < 3 
                        ? "Type at least 3 characters to search" 
                        : searchingEvOwner 
                        ? "Searching..." 
                        : "No EV owner found"
                    }
                  />

                  {/* Charging Station Selection */}
                  <Autocomplete
                    value={selectedStation}
                    onChange={(_, newValue) => handleStationChange(newValue)}
                    options={chargingStations}
                    getOptionLabel={(option) =>
                      `${option.name} - ${option.address}`
                    }
                    disabled={isEditMode} // Can't change station in edit mode
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Charging Station"
                        error={Boolean(errors.chargingStationId)}
                        helperText={errors.chargingStationId}
                        required
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {option.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.address} | Type: {option.stationType}
                          </Typography>
                        </Box>
                      </li>
                    )}
                  />

                  {/* Reservation Date & Time */}
                  <TextField
                    type="datetime-local"
                    label="Reservation Date & Time"
                    value={formData.reservationDateTime}
                    onChange={(e) => handleDateTimeChange(e.target.value)}
                    error={Boolean(errors.reservationDateTime)}
                    helperText={errors.reservationDateTime}
                    required
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: getMinDateTime(),
                    }}
                  />

                  {/* Status Management (Edit Mode Only) */}
                  {isEditMode && booking && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Status Management
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {booking.status === "Pending" && (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleStatusChange("Approved")}
                              disabled={isLoading}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => handleStatusChange("Rejected")}
                              disabled={isLoading}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {booking.status === "Approved" && (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleStatusChange("Completed")}
                              disabled={isLoading}
                            >
                              Mark Completed
                            </Button>
                          </>
                        )}
                        {(booking.status === "Pending" ||
                          booking.status === "Approved") && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleStatusChange("Cancelled")}
                            disabled={isLoading}
                          >
                            Cancel Booking
                          </Button>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box>
            {/* Selected EV Owner Info */}
            {selectedEvOwner && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    EV Owner Details
                  </Typography>
                  <Box sx={{ display: "grid", gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {selectedEvOwner.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>NIC:</strong> {selectedEvOwner.nic}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {selectedEvOwner.phone}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedEvOwner.email}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Selected Station Info */}
            {selectedStation && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Station Details
                  </Typography>
                  <Box sx={{ display: "grid", gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {selectedStation.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Type:</strong> {selectedStation.stationType}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Address:</strong> {selectedStation.address}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={isLoading}
                    fullWidth
                  >
                    {isLoading
                      ? isEditMode
                        ? "Updating..."
                        : "Creating..."
                      : isEditMode
                      ? "Update Booking"
                      : "Create Booking"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isLoading}
                    fullWidth
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </form>

      {/* Loading Overlay */}
      {isLoading && <LinearProgress sx={{ mt: 2 }} />}
    </Box>
  );
};

export default BookingFormPage;
