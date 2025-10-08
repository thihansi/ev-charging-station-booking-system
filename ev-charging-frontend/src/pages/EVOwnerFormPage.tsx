import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import {
  Save,
  Cancel,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotificationContext } from '../context/NotificationContext';
import { evOwnerApi } from '../api';
import { ROUTES } from '../utils/constants';
import type { CreateEVOwnerRequest } from '../types';

const EVOwnerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useNotificationContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(!!id);

  const [formData, setFormData] = useState<CreateEVOwnerRequest>({
    nic: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<CreateEVOwnerRequest>>({});

  useEffect(() => {
    if (isEdit && id) {
      loadEvOwner(id);
    }
  }, [isEdit, id]);

  const loadEvOwner = async (nic: string) => {
    setIsLoading(true);
    try {
      const evOwner = await evOwnerApi.getByNic(nic);
      setFormData({
        nic: evOwner.nic,
        fullName: evOwner.fullName,
        email: evOwner.email,
        phoneNumber: evOwner.phoneNumber,
        address: evOwner.address,
        password: '', // Password field for updates
      });
    } catch (error) {
      showError('Failed to load EV owner details');
      navigate(ROUTES.BACKOFFICE.EV_OWNERS);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateEVOwnerRequest> = {};

    if (!formData.nic.trim()) {
      newErrors.nic = 'NIC is required';
    } else if (!/^[0-9]{9}[vVxX]|[0-9]{12}$/.test(formData.nic)) {
      newErrors.nic = 'Invalid NIC format';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber.replace(/[^0-9]/g, ''))) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!isEdit && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!isEdit && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateEVOwnerRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
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
      if (isEdit) {
        await evOwnerApi.update(formData.nic, formData);
        showSuccess('EV Owner updated successfully');
      } else {
        await evOwnerApi.create(formData);
        showSuccess('EV Owner created successfully');
      }
      navigate(ROUTES.BACKOFFICE.EV_OWNERS);
    } catch (error: any) {
      showError(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} EV owner`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {isEdit ? 'Edit EV Owner' : 'Add New EV Owner'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isEdit ? 'Update EV owner information' : 'Register a new electric vehicle owner'}
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
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 3,
                mb: 4,
              }}
            >
              <TextField
                label="NIC Number"
                value={formData.nic}
                onChange={(e) => handleInputChange('nic', e.target.value)}
                disabled={isEdit}
                error={!!errors.nic}
                helperText={errors.nic}
                fullWidth
                required
              />

              <TextField
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                error={!!errors.fullName}
                helperText={errors.fullName}
                fullWidth
                required
              />

              <TextField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                required
              />

              <TextField
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                fullWidth
                required
              />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 3,
                mb: 4,
              }}
            >
              <TextField
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                error={!!errors.address}
                helperText={errors.address}
                multiline
                rows={3}
                fullWidth
                required
              />

              {!isEdit && (
                <TextField
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password || 'Minimum 6 characters required'}
                  fullWidth
                  required
                />
              )}
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                pt: 3,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate(ROUTES.BACKOFFICE.EV_OWNERS)}
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
                {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EVOwnerFormPage;