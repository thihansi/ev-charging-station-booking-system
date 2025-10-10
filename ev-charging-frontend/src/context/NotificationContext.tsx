import React, { createContext, useContext } from "react";
import { Snackbar, Alert } from "@mui/material";
import type { AlertColor } from "@mui/material";
import { useNotification } from "../hooks/useNotification";
import type { NotificationType } from "../hooks/useNotification";

interface NotificationContextType {
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const {
    notifications,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  } = useNotification();

  const handleClose = (id: string) => {
    removeNotification(id);
  };

  const getAlertSeverity = (type: NotificationType): AlertColor => {
    const severityMap: Record<NotificationType, AlertColor> = {
      success: "success",
      error: "error",
      warning: "warning",
      info: "info",
    };
    return severityMap[type];
  };

  return (
    <NotificationContext.Provider
      value={{
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}

      {/* Render all notifications */}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.autoHideDuration}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          sx={{
            mt: index * 8, // Stack notifications vertically
          }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={getAlertSeverity(notification.type)}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
};
