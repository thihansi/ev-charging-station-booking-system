import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Person,
  AdminPanelSettings,
  Engineering,
  Edit,
  Security,
  Refresh,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNotificationContext } from "../context/NotificationContext";
import { authApi } from "../api";

interface ProfileData {
  username: string;
  fullName: string;
  email: string;
  role: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const { state } = useAuth();
  const { showError } = useNotificationContext();

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: state.user?.username || "",
    fullName: state.user?.fullName || "",
    email: state.user?.email || "",
    role: state.user?.role || "",
  });

  // Password change state
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Loading states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Handle profile data changes
  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle password data changes
  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setIsUpdating(true);
      
      // Note: Backend User entity only has username, passwordHash, and role
      // fullName and email are not supported for system users
      // Only username update would be supported if backend implements it
      
      showError("Profile updates are not currently supported for system users. Only password changes are available.");
      setIsEditing(false);
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setProfileData({
      username: state.user?.username || "",
      fullName: state.user?.fullName || "",
      email: state.user?.email || "",
      role: state.user?.role || "",
    });
    setIsEditing(false);
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsChangingPassword(true);
      
      // Note: Backend doesn't have a change password endpoint for system users
      // This functionality is not currently supported by the backend API
      
      showError("Password change is not currently supported for system users. Please contact your administrator.");
      
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Get role display info
  const getRoleInfo = (role: string) => {
    switch (role) {
      case USER_ROLES.BACKOFFICE:
        return {
          label: "Backoffice Admin",
          color: "primary" as const,
          icon: <AdminPanelSettings />,
        };
      case USER_ROLES.STATION_OPERATOR:
        return {
          label: "Station Operator",
          color: "secondary" as const,
          icon: <Engineering />,
        };
      default:
        return {
          label: role,
          color: "default" as const,
          icon: <Person />,
        };
    }
  };

  const roleInfo = getRoleInfo(profileData.role);

  if (!state.user) {
    return (
      <Box p={3}>
        <Alert severity="error">User information not available</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>

      {/* Profile Information Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.main",
                fontSize: "2rem",
                mr: 3,
              }}
            >
              {profileData.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="h5" gutterBottom>
                {profileData.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                System User Account
              </Typography>
              <Chip
                icon={roleInfo.icon}
                label={roleInfo.label}
                color={roleInfo.color}
                size="small"
              />
            </Box>
            <Box>
              {!isEditing ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  disabled={true}
                  title="Profile editing is not currently supported for system users"
                >
                  Edit Profile
                </Button>
              ) : (
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Information Alert */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Profile editing and password changes for system users are currently not supported by the backend API. 
              System user accounts only contain username and role information. 
              For any profile changes, please contact your system administrator.
            </Typography>
          </Alert>

          <Box display="flex" flexWrap="wrap" gap={3}>
            <Box flex="1" minWidth="300px">
              <TextField
                fullWidth
                label="Username"
                value={profileData.username}
                onChange={(e) =>
                  handleProfileChange("username", e.target.value)
                }
                disabled={true}
                variant="filled"
                helperText="Username cannot be changed"
              />
            </Box>
            <Box flex="1" minWidth="300px">
              <TextField
                fullWidth
                label="Role"
                value={profileData.role}
                disabled={true}
                variant="filled"
                helperText="Role is assigned by administrators"
              />
            </Box>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={3} mt={3}>
            <Box flex="1" minWidth="300px">
              <TextField
                fullWidth
                label="Account Type"
                value="System User"
                disabled={true}
                variant="filled"
                helperText="Additional profile fields not available for system users"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Security Settings Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Manage your account security and password settings.
          </Typography>

          <Button
            variant="outlined"
            onClick={() => setPasswordDialog(true)}
            sx={{ mt: 2 }}
            disabled={true}
            title="Password changes are not currently supported for system users"
          >
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialog}
        onClose={() => setPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords.current ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) =>
                handlePasswordChange("currentPassword", e.target.value)
              }
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                      edge="end"
                    >
                      {showPasswords.current ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showPasswords.new ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) =>
                handlePasswordChange("newPassword", e.target.value)
              }
              margin="normal"
              helperText="Password must be at least 6 characters long"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                      }
                      edge="end"
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPasswords.confirm ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                handlePasswordChange("confirmPassword", e.target.value)
              }
              margin="normal"
              error={
                passwordData.confirmPassword.length > 0 &&
                passwordData.newPassword !== passwordData.confirmPassword
              }
              helperText={
                passwordData.confirmPassword.length > 0 &&
                passwordData.newPassword !== passwordData.confirmPassword
                  ? "Passwords do not match"
                  : ""
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                      edge="end"
                    >
                      {showPasswords.confirm ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPasswordDialog(false)}
            disabled={isChangingPassword}
          >
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={
              isChangingPassword ||
              !passwordData.currentPassword ||
              !passwordData.newPassword ||
              !passwordData.confirmPassword ||
              passwordData.newPassword !== passwordData.confirmPassword
            }
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
