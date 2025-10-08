import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, STORAGE_KEYS, HTTP_STATUS } from "../utils/constants";
import { getLocalStorageItem, removeLocalStorageItem } from "../utils/helpers";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // First check for system user token
    let token = getLocalStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    
    // If no system user token, check for EV Owner token
    if (!token) {
      token = getLocalStorageItem<string>("evOwnerToken");
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      // Clear auth data for both system users and EV owners
      removeLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      removeLocalStorageItem(STORAGE_KEYS.USER_PROFILE);
      removeLocalStorageItem("evOwnerToken");
      removeLocalStorageItem("evOwnerData");

      // Determine which login page to redirect to based on current path
      const currentPath = window.location.pathname;
      let redirectPath = "/login";
      
      if (currentPath.includes("ev-owner")) {
        redirectPath = "/ev-owner-login";
      }

      // Only redirect if not already on a login page
      if (!currentPath.includes("login")) {
        window.location.href = redirectPath;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
