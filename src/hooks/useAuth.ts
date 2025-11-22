/**
 * useAuth hook - Authentication state management
 *
 * Note: JWT tokens are stored in HTTP-only cookies, so this hook
 * focuses on user state and authentication status, not token management.
 */
import { createSignal, onMount } from 'solid-js';
import { SimpleIdmClient } from '../api/client';
import type { LoginRequest, UserInfo } from '../types/api';

export interface UseAuthOptions {
  client: SimpleIdmClient;
  onLoginSuccess?: (user: UserInfo) => void;
  onLogoutSuccess?: () => void;
  checkAuthOnMount?: boolean;
}

export interface UseAuthReturn {
  user: () => UserInfo | null;
  isAuthenticated: () => boolean;
  isLoading: () => boolean;
  error: () => string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(options: UseAuthOptions): UseAuthReturn {
  const [user, setUser] = createSignal<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Check authentication status on mount
  onMount(async () => {
    if (options.checkAuthOnMount !== false) {
      await refreshUser();
    }
  });

  // Refresh user info (check if authenticated)
  const refreshUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userInfo = await options.client.getCurrentUser();
      setUser(userInfo);
      setIsAuthenticated(true);
    } catch (err) {
      // Not authenticated or error - this is OK
      setUser(null);
      setIsAuthenticated(false);
      // Don't set error for 401 (not authenticated is expected)
      if (err && typeof err === 'object' && 'status' in err && err.status !== 401) {
        setError(err instanceof Error ? err.message : 'Failed to check authentication');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Login with username and password
  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await options.client.login(credentials);

      // Handle successful login
      if (response.status === 'success') {
        // Get full user info from OIDC userinfo endpoint
        const userInfo = await options.client.getCurrentUser();
        setUser(userInfo);
        setIsAuthenticated(true);
        options.onLoginSuccess?.(userInfo);
      } else if (response.status === '2fa_required') {
        // 2FA required - caller should handle this
        throw new Error('2FA_REQUIRED');
      } else if (response.status === 'user_selection_required') {
        // User selection required - caller should handle this
        throw new Error('USER_SELECTION_REQUIRED');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await options.client.logout();
      setUser(null);
      setIsAuthenticated(false);
      options.onLogoutSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    clearError,
  };
}
