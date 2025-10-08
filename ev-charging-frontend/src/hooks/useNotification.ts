import { useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  autoHideDuration?: number;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((
    message: string,
    type: NotificationType = 'info',
    autoHideDuration: number = 6000
  ) => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      message,
      type,
      autoHideDuration,
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove notification after duration
    if (autoHideDuration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, autoHideDuration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message: string, autoHideDuration?: number) => {
    return showNotification(message, 'success', autoHideDuration);
  }, [showNotification]);

  const showError = useCallback((message: string, autoHideDuration?: number) => {
    return showNotification(message, 'error', autoHideDuration);
  }, [showNotification]);

  const showWarning = useCallback((message: string, autoHideDuration?: number) => {
    return showNotification(message, 'warning', autoHideDuration);
  }, [showNotification]);

  const showInfo = useCallback((message: string, autoHideDuration?: number) => {
    return showNotification(message, 'info', autoHideDuration);
  }, [showNotification]);

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};