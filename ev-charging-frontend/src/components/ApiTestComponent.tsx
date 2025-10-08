import React from "react";
import { Box, Typography, Button, Alert } from "@mui/material";
import { API_BASE_URL } from "../utils/constants";
import { authApi } from "../api";

export const ApiTestComponent: React.FC = () => {
  const [testResult, setTestResult] = React.useState<string>("");

  const testApiConnection = async () => {
    setTestResult("Testing API connection...");
    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("Environment VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
    
    try {
      // This should fail but we want to see the actual URL being called
      await authApi.login({ username: "test", password: "test" });
    } catch (error: any) {
      console.log("Test request error:", error);
      if (error.config?.url) {
        setTestResult(`Request was made to: ${error.config.url}`);
      } else {
        setTestResult(`Error: ${error.message}`);
      }
    }
  };

  return (
    <Box sx={{ p: 3, border: "1px solid #ccc", m: 2 }}>
      <Typography variant="h6">API Configuration Test</Typography>
      <Typography variant="body2">API_BASE_URL: {API_BASE_URL}</Typography>
      <Typography variant="body2">ENV VITE_API_BASE_URL: {import.meta.env.VITE_API_BASE_URL || "undefined"}</Typography>
      
      <Button onClick={testApiConnection} variant="outlined" sx={{ mt: 2 }}>
        Test API Connection
      </Button>
      
      {testResult && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {testResult}
        </Alert>
      )}
    </Box>
  );
};