/**
 * API Configuration Validator
 * 
 * This utility helps validate that your API configuration is correctly set up
 * and that the backend is accessible.
 */

import { validateApiConfig, checkApiHealth } from './api/utils';

/**
 * Validates the API configuration
 */
export const validateConfiguration = () => {
  console.log('🔧 Validating API Configuration...');
  
  // Check environment variable
  const isConfigValid = validateApiConfig();
  if (!isConfigValid) {
    console.error('❌ API configuration is invalid');
    return false;
  }
  
  console.log('✅ API configuration is valid');
  return true;
};

/**
 * Tests basic connectivity to the API
 */
export const testConnectivity = async () => {
  console.log('🌐 Testing API connectivity...');
  
  try {
    const isHealthy = await checkApiHealth();
    if (isHealthy) {
      console.log('✅ API is accessible');
      return true;
    } else {
      console.warn('⚠️ API health check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to connect to API:', error);
    return false;
  }
};

/**
 * Comprehensive API setup validation
 */
export const validateApiSetup = async () => {
  console.log('🚀 Starting API Setup Validation...');
  console.log('==================================');
  
  // Step 1: Validate configuration
  const configValid = validateConfiguration();
  
  // Step 2: Test connectivity (optional, depends on backend health endpoint)
  let connectivityValid = true;
  try {
    connectivityValid = await testConnectivity();
  } catch (error) {
    console.warn('⚠️ Connectivity test skipped (health endpoint may not exist)');
  }
  
  // Step 3: Summary
  console.log('==================================');
  if (configValid && connectivityValid) {
    console.log('🎉 API setup validation completed successfully!');
    console.log('Your frontend is ready to communicate with the Azure backend.');
  } else {
    console.error('❌ API setup validation failed');
    console.log('Please check your configuration and try again.');
  }
  
  return configValid && connectivityValid;
};

// Auto-run validation in development mode
if (import.meta.env.DEV) {
  validateApiSetup();
}