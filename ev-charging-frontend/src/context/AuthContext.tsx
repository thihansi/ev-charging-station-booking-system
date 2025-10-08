import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import type { User, LoginRequest, UserRole } from "../types";
import { authApi } from "../api";
import { STORAGE_KEYS, USER_ROLES } from "../utils/constants";
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
} from "../utils/helpers";

// Auth State Interface
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Auth Actions
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; token: string } }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean };

// Auth Context Interface
interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasRole: (role: UserRole) => boolean;
  isBackoffice: boolean;
  isOperator: boolean;
}

// Initial State
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload,
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getLocalStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN);
        const user = getLocalStorageItem<User>(STORAGE_KEYS.USER_PROFILE);

        if (token && user) {
          // Verify token is still valid by fetching profile
          try {
            const currentUser = await authApi.getProfile();
            dispatch({
              type: "AUTH_SUCCESS",
              payload: { user: currentUser, token },
            });
          } catch (error: any) {
            // Token is invalid or backend is not available, clear storage
            console.warn(
              "Failed to verify token, clearing auth data:",
              error.message
            );
            removeLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN);
            removeLocalStorageItem(STORAGE_KEYS.USER_PROFILE);
            dispatch({ type: "AUTH_LOGOUT" });
          }
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error: any) {
        console.warn("Auth initialization failed:", error.message);
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      try {
        dispatch({ type: "AUTH_START" });

        // Call login API
        const loginResponse = await authApi.login(credentials);

        // Store token temporarily
        setLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN, loginResponse.token);

        // Fetch user profile
        const user = await authApi.getProfile();

        // Store user profile
        setLocalStorageItem(STORAGE_KEYS.USER_PROFILE, user);

        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user, token: loginResponse.token },
        });
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Login failed";
        dispatch({ type: "AUTH_FAILURE", payload: errorMessage });

        // Clear any stored data on login failure
        removeLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN);
        removeLocalStorageItem(STORAGE_KEYS.USER_PROFILE);

        throw error;
      }
    },
    []
  );

  // Logout function
  const logout = useCallback((): void => {
    // Clear localStorage
    removeLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN);
    removeLocalStorageItem(STORAGE_KEYS.USER_PROFILE);

    // Update state
    dispatch({ type: "AUTH_LOGOUT" });
  }, []);

  // Clear error function
  const clearError = useCallback((): void => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // Role checking functions
  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return state.user?.role === role;
    },
    [state.user?.role]
  );

  const isBackoffice = useMemo(() => hasRole(USER_ROLES.BACKOFFICE), [hasRole]);
  const isOperator = useMemo(
    () => hasRole(USER_ROLES.STATION_OPERATOR),
    [hasRole]
  );

  const value: AuthContextType = useMemo(
    () => ({
      state,
      login,
      logout,
      clearError,
      hasRole,
      isBackoffice,
      isOperator,
    }),
    [state, login, logout, clearError, hasRole, isBackoffice, isOperator]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
