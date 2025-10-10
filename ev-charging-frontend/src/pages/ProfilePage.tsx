import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Alert,
  LinearProgress,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Person,
  AdminPanelSettings,
  Engineering,
  Edit,
  Security,
  Refresh,
  Save,
  Cancel,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNotificationContext } from "../context/NotificationContext";
import { authApi } from "../api";

const ProfilePage: React.FC = () => {
  const { state } = useAuth();
  const { showSuccess, showError } = useNotificationContext();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(state.user);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: state.user?.fullName || "",
    email: state.user?.email || "",
    username: state.user?.username || "",
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Backoffice":
        return <AdminPanelSettings sx={{ fontSize: 40 }} />;
      case "StationOperator":
        return <Engineering sx={{ fontSize: 40 }} />;
      default:
        return <Person sx={{ fontSize: 40 }} />;
    }
  };

  const getRoleColor = (
    role: string
  ): "primary" | "secondary" | "success" | "error" | "warning" | "info" => {
    switch (role) {
      case "Backoffice":
        return "primary";
      case "StationOperator":
        return "info";
      default:
        return "secondary";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "Backoffice":
        return "Full administrative access to the system including user management, station management, and booking oversight.";
      case "StationOperator":
        return "Operational access to manage charging stations, process bookings, and handle day-to-day operations.";
      default:
        return "System user with limited access.";
    }
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    try {
      // Try to get updated profile from API
      const updatedProfile = await authApi.getProfile();
      console.log("✅ Profile refreshed successfully:", updatedProfile);
      setProfileData(updatedProfile);
      setEditForm({
        fullName: updatedProfile?.fullName || "",
        email: updatedProfile?.email || "",
        username: updatedProfile?.username || "",
      });
      showSuccess("Profile refreshed successfully");
    } catch (error: any) {
      console.error("❌ Error refreshing profile:", error);
      // If API fails, fall back to the current auth state data
      if (state.user) {
        setProfileData(state.user);
        setEditForm({
          fullName: state.user?.fullName || "",
          email: state.user?.email || "",
          username: state.user?.username || "",
        });
        showSuccess("Profile data refreshed from local state");
      } else {
        showError("Failed to refresh profile. Please try logging in again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditForm({
      fullName: profileData?.fullName || "",
      email: profileData?.email || "",
      username: profileData?.username || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Note: Backend doesn't actually support profile updates for system users
      // This is a UI simulation - in reality would need backend support

      // For now, we'll just update the local state since the backend doesn't support profile updates
      const updatedProfile = {
        ...profileData!,
        fullName: editForm.fullName,
        email: editForm.email,
        username: editForm.username,
      };

      setProfileData(updatedProfile);
      setEditDialogOpen(false);

      // In a real implementation, you would:
      // 1. Call authApi.updateProfile(updatedProfile)
      // 2. Update the auth context with the new user data
      // 3. Store the updated profile in localStorage

      showSuccess(
        "Profile updated successfully! (Note: Changes are local only - backend API doesn't support profile updates)"
      );
    } catch (error: any) {
      console.error("Error updating profile:", error);
      showError("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditForm({
      fullName: profileData?.fullName || "",
      email: profileData?.email || "",
      username: profileData?.username || "",
    });
  };

  const getInitials = (name?: string, username?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("");
    }
    return username?.charAt(0).toUpperCase() || "U";
  };

  return (
    <Box>
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
          >
            My Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your account information
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={refreshProfile}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>

      {isLoading && <LinearProgress sx={{ mb: 4 }} />}

      {/* Profile Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Profile Header */}
          <Box
            sx={{ display: "flex", alignItems: "flex-start", gap: 3, mb: 4 }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: `${getRoleColor(profileData?.role || "")}.main`,
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            >
              {getInitials(profileData?.fullName, profileData?.username)}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {profileData?.fullName ||
                  profileData?.username ||
                  "System User"}
              </Typography>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                {getRoleIcon(profileData?.role || "")}
                <Chip
                  label={profileData?.role || "Unknown Role"}
                  color={getRoleColor(profileData?.role || "")}
                  size="medium"
                />
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                @{profileData?.username}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {getRoleDescription(profileData?.role || "")}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Account Details */}
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Account Details
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 3,
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                User ID
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {profileData?.id || "Not available"}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Username
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {profileData?.username || "Not available"}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Role
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {profileData?.role || "Not available"}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Full Name
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {profileData?.fullName || "Not set"}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Email
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {profileData?.email || "Not set"}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Action Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          gap: 3,
        }}
      >
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Edit color="action" />
              <Typography variant="h6">Profile Updates</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Edit your profile information (changes are stored locally only).
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<Edit />}
              onClick={handleEditProfile}
              disabled={isLoading}
            >
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Security color="action" />
              <Typography variant="h6">Security Settings</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Password changes must be handled by your administrator.
            </Typography>
            <Button
              variant="outlined"
              disabled
              fullWidth
              startIcon={<Security />}
            >
              Change Password (Not Available)
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Username"
              fullWidth
              value={editForm.username}
              onChange={(e) =>
                setEditForm({ ...editForm, username: e.target.value })
              }
              disabled // Username typically shouldn't be editable
              helperText="Username cannot be changed"
            />
            <TextField
              label="Full Name"
              fullWidth
              value={editForm.fullName}
              onChange={(e) =>
                setEditForm({ ...editForm, fullName: e.target.value })
              }
              placeholder="Enter your full name"
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              placeholder="Enter your email address"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            startIcon={<Save />}
            disabled={isLoading}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
