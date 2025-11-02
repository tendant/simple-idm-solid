/**
 * Simple IDM API Client
 *
 * IMPORTANT: This client works with HTTP-only cookies for JWT token storage.
 * All requests include `credentials: 'include'` to automatically send cookies.
 * No manual token management is required.
 */

import type {
  LoginRequest,
  LoginResponse,
  MagicLinkRequest,
  MagicLinkResponse,
  MagicLinkValidateResponse,
  PasswordlessSignupRequest,
  PasswordSignupRequest,
  SignupResponse,
  UserInfo,
  TokenRefreshResponse,
  ApiError,
} from '../types/api';
import { ApiException } from '../types/api';

export interface ApiClientConfig {
  /** Base URL of the simple-idm backend (e.g., http://localhost:4000) */
  baseUrl: string;
  /** Custom fetch implementation (defaults to global fetch) */
  fetch?: typeof fetch;
  /** Callback when a 401 Unauthorized response is received */
  onUnauthorized?: () => void;
  /** Callback for general errors */
  onError?: (error: ApiError) => void;
}

export class SimpleIdmClient {
  private baseUrl: string;
  private fetchFn: typeof fetch;
  private onUnauthorized?: () => void;
  private onError?: (error: ApiError) => void;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.fetchFn = config.fetch || fetch;
    this.onUnauthorized = config.onUnauthorized;
    this.onError = config.onError;
  }

  // ============================================================================
  // Authentication Methods
  // ============================================================================

  /**
   * Login with username and password
   * Tokens are automatically stored in HTTP-only cookies by the server
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/idm/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response;
  }

  /**
   * Request a magic link to be sent to the user's email
   */
  async requestMagicLink(request: MagicLinkRequest): Promise<MagicLinkResponse> {
    const response = await this.request<MagicLinkResponse>('/api/idm/auth/magic-link/email', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response;
  }

  /**
   * Validate a magic link token
   * Tokens are automatically stored in HTTP-only cookies by the server
   */
  async validateMagicLink(token: string): Promise<MagicLinkValidateResponse> {
    const response = await this.request<MagicLinkValidateResponse>(
      `/api/idm/auth/magic-link/validate?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
      },
    );
    return response;
  }

  /**
   * Refresh the access token using the refresh token from cookies
   * New tokens are automatically stored in HTTP-only cookies by the server
   */
  async refreshToken(): Promise<TokenRefreshResponse> {
    const response = await this.request<TokenRefreshResponse>('/api/idm/auth/token/refresh', {
      method: 'POST',
    });
    return response;
  }

  /**
   * Logout and clear authentication cookies
   */
  async logout(): Promise<void> {
    await this.request<void>('/api/idm/auth/logout', {
      method: 'POST',
    });
  }

  // ============================================================================
  // Registration Methods
  // ============================================================================

  /**
   * Register a new user without a password (passwordless)
   */
  async signupPasswordless(data: PasswordlessSignupRequest): Promise<SignupResponse> {
    const response = await this.request<SignupResponse>('/api/idm/signup/passwordless', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Register a new user with a password
   */
  async signupWithPassword(data: PasswordSignupRequest): Promise<SignupResponse> {
    const response = await this.request<SignupResponse>('/api/idm/signup/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  // ============================================================================
  // User Methods
  // ============================================================================

  /**
   * Get current authenticated user information
   * Requires valid access token in HTTP-only cookie
   */
  async getCurrentUser(): Promise<UserInfo> {
    const response = await this.request<UserInfo>('/me', {
      method: 'GET',
    });
    return response;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Make an HTTP request to the API
   * CRITICAL: Always includes credentials to send HTTP-only cookies
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await this.fetchFn(url, {
        ...options,
        credentials: 'include', // CRITICAL: Include cookies in requests
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.onUnauthorized?.();
        const errorData = await this.parseErrorResponse(response);
        throw new ApiException(response.status, errorData);
      }

      // Handle other error status codes
      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        this.onError?.(errorData);
        throw new ApiException(response.status, errorData);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      // Parse JSON response
      const data = await response.json();
      return data as T;
    } catch (error) {
      // Re-throw ApiException as-is
      if (error instanceof ApiException) {
        throw error;
      }

      // Handle network errors or other exceptions
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 0,
      };
      this.onError?.(apiError);
      throw new ApiException(0, apiError);
    }
  }

  /**
   * Parse error response from the API
   */
  private async parseErrorResponse(response: Response): Promise<ApiError> {
    try {
      const data = await response.json();
      return {
        message: data.message || data.error || 'Request failed',
        status: response.status,
        error: data.error,
      };
    } catch {
      return {
        message: response.statusText || 'Request failed',
        status: response.status,
      };
    }
  }
}
