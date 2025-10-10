import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { Save, Cancel } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useNotificationContext } from "../context/NotificationContext";
import { evOwnerApi } from "../api";
import { ROUTES } from "../utils/constants";
import type { CreateEVOwnerRequest, UpdateEVOwnerRequest } from "../types";

const EVOwnerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { nic } = useParams<{ nic: string }>();
  const { showSuccess, showError } = useNotificationContext();
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!nic;

  const [formData, setFormData] = useState<CreateEVOwnerRequest>({
    nic: "",
    name: "",
    email: "",
    phone: "",
    isActive: true, // Default to active
    password: "",
  });

  // Store original data for edit mode
  const [originalData, setOriginalData] = useState<CreateEVOwnerRequest | null>(null);

  const [errors, setErrors] = useState<Partial<CreateEVOwnerRequest>>({});

  useEffect(() => {
    if (isEdit && nic) {
      loadEvOwner(nic);
    }
  }, [isEdit, nic]);

  const loadEvOwner = async (nic: string) => {
    setIsLoading(true);
    try {
      const evOwner = await evOwnerApi.getByNic(nic);
      const ownerData = {
        nic: evOwner.nic,
        name: evOwner.name,
        email: evOwner.email,
        phone: evOwner.phone,
        isActive: evOwner.isActive,
        password: "", // Password field for updates
      };
      setOriginalData(ownerData);
      // Keep form data empty for placeholders in edit mode
      setFormData({
        nic: "",
        name: "",
        email: "",
        phone: "",
        isActive: evOwner.isActive,
        password: "",
      });
    } catch (error) {
      showError("Failed to load EV owner details");
      navigate(ROUTES.ADMIN.EV_OWNERS);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateEVOwnerRequest> = {};

    // For edit mode, use original data as fallback for validation
    const nicValue = isEdit && originalData ? (formData.nic || originalData.nic) : formData.nic;
    const nameValue = isEdit && originalData ? (formData.name || originalData.name) : formData.name;
    const emailValue = isEdit && originalData ? (formData.email || originalData.email) : formData.email;
    const phoneValue = isEdit && originalData ? (formData.phone || originalData.phone) : formData.phone;

    if (!nicValue.trim()) {
      newErrors.nic = "NIC is required";
    } else if (!/^[0-9]{9}[vVxX]|[0-9]{12}$/.test(nicValue)) {
      newErrors.nic = "Invalid NIC format";
    }

    if (!nameValue.trim()) {
      newErrors.name = "Name is required";
    }

    if (!emailValue.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      newErrors.email = "Invalid email format";
    }

    if (!phoneValue.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (
      !/^[0-9]{10}$/.test(phoneValue.replace(/[^0-9]/g, ""))
    ) {
      newErrors.phone = "Invalid phone number format";
    }

    if (!isEdit && !formData.password?.trim()) {
      newErrors.password = "Password is required";
    } else if (!isEdit && formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateEVOwnerRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit && originalData) {
        // For edit mode, only send fields that have been changed
        const updateData: UpdateEVOwnerRequest = {};
        
        if (formData.name.trim() && formData.name.trim() !== originalData.name) {
          updateData.name = formData.name.trim();
        }
        if (formData.email.trim() && formData.email.trim() !== originalData.email) {
          updateData.email = formData.email.trim();
        }
        if (formData.phone.trim() && formData.phone.trim() !== originalData.phone) {
          updateData.phone = formData.phone.trim();
        }
        if (formData.isActive !== originalData.isActive) {
          updateData.isActive = formData.isActive;
        }
        
        // If no changes were made, use original data
        if (Object.keys(updateData).length === 0) {
          updateData.name = originalData.name;
          updateData.email = originalData.email;
          updateData.phone = originalData.phone;
          updateData.isActive = originalData.isActive;
        }
        
        console.log("Updating EV Owner with data:", updateData);
        await evOwnerApi.update(originalData.nic, updateData);
        showSuccess("EV Owner updated successfully");
      } else {
        await evOwnerApi.create(formData);
        showSuccess("EV Owner created successfully");
      }
      navigate(ROUTES.ADMIN.EV_OWNERS);
    } catch (error: any) {
      console.error("Error updating EV Owner:", error);
      showError(
        error.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} EV owner`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {isEdit ? "Edit EV Owner" : "Add New EV Owner"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isEdit
            ? "Update EV owner information"
            : "Register a new electric vehicle owner"}
        </Typography>
      </Box>

      {/* Form */}
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Basic Information
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 3,
                mb: 4,
              }}
            >
              <TextField
                label="NIC Number"
                value={formData.nic}
                placeholder={isEdit && originalData ? originalData.nic : "Enter NIC number"}
                onChange={(e) => handleInputChange("nic", e.target.value)}
                disabled={isEdit}
                error={!!errors.nic}
                helperText={errors.nic}
                fullWidth
                required
              />

              <TextField
                label="Name"
                value={formData.name}
                placeholder={isEdit && originalData ? originalData.name : "Enter full name"}
                onChange={(e) => handleInputChange("name", e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
                required
              />

              <TextField
                label="Email Address"
                type="email"
                value={formData.email}
                placeholder={isEdit && originalData ? originalData.email : "Enter email address"}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                required
              />

              <TextField
                label="Phone Number"
                value={formData.phone}
                placeholder={isEdit && originalData ? originalData.phone : "Enter phone number"}
                onChange={(e) =>
                  handleInputChange("phone", e.target.value)
                }
                error={!!errors.phone}
                helperText={errors.phone}
                fullWidth
                required
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 3,
                mb: 4,
              }}
            >
              {!isEdit && (
                <TextField
                  label="Password"
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  error={!!errors.password}
                  helperText={
                    errors.password || "Minimum 6 characters required"
                  }
                  fullWidth
                  required
                />
              )}
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                pt: 3,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate(ROUTES.ADMIN.EV_OWNERS)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : isEdit ? "Update" : "Create"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EVOwnerFormPage;
