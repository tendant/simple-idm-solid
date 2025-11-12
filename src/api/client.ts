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
  UpdateUsernameRequest,
  UpdatePhoneRequest,
  UpdatePasswordRequest,
  ProfileUpdateResponse,
  Setup2FAResponse,
  Enable2FARequest,
  Validate2FARequest,
  TwoFAStatus,
  Send2FACodeRequest,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  VerificationStatusResponse,
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
    this.fetchFn = config.fetch || fetch.bind(globalThis);
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
    const response = await this.request<UserInfo>('/api/oauth2/userinfo', {
      method: 'GET',
    });
    return response;
  }

  // ============================================================================
  // Profile Management Methods
  // ============================================================================

  /**
   * Update username
   * Requires current password for verification
   */
  async updateUsername(data: UpdateUsernameRequest): Promise<ProfileUpdateResponse> {
    const response = await this.request<ProfileUpdateResponse>('/api/idm/profile/username', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Update phone number
   */
  async updatePhone(data: UpdatePhoneRequest): Promise<ProfileUpdateResponse> {
    const response = await this.request<ProfileUpdateResponse>('/api/idm/profile/phone', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Update password
   * Requires current password for verification
   */
  async updatePassword(data: UpdatePasswordRequest): Promise<ProfileUpdateResponse> {
    const response = await this.request<ProfileUpdateResponse>('/api/idm/profile/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  }

  // ============================================================================
  // Two-Factor Authentication Methods
  // ============================================================================

  /**
   * Get 2FA status for current user
   */
  async get2FAStatus(): Promise<TwoFAStatus> {
    const response = await this.request<TwoFAStatus>('/idm/2fa/status', {
      method: 'GET',
    });
    return response;
  }

  /**
   * Setup TOTP 2FA (generates QR code)
   * Returns secret and QR code for authenticator app
   */
  async setup2FATOTP(): Promise<Setup2FAResponse> {
    const response = await this.request<Setup2FAResponse>('/idm/2fa/totp/setup', {
      method: 'POST',
    });
    return response;
  }

  /**
   * Enable 2FA after setup
   * Requires verification code to confirm setup
   */
  async enable2FA(data: Enable2FARequest): Promise<ProfileUpdateResponse> {
    const response = await this.request<ProfileUpdateResponse>('/idm/2fa/enable', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Disable 2FA
   */
  async disable2FA(type: string): Promise<ProfileUpdateResponse> {
    const response = await this.request<ProfileUpdateResponse>(`/idm/2fa/${type}/disable`, {
      method: 'POST',
    });
    return response;
  }

  /**
   * Send 2FA code via SMS or email
   */
  async send2FACode(data: Send2FACodeRequest): Promise<ProfileUpdateResponse> {
    const response = await this.request<ProfileUpdateResponse>('/idm/2fa/send-code', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Validate 2FA code
   */
  async validate2FA(data: Validate2FARequest): Promise<ProfileUpdateResponse> {
    const response = await this.request<ProfileUpdateResponse>('/idm/2fa/validate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  // ============================================================================
  // Email Verification Methods
  // ============================================================================

  /**
   * Verify email with token (public endpoint)
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    const response = await this.request<VerifyEmailResponse>('/api/idm/email/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Resend verification email (requires authentication)
   */
  async resendVerificationEmail(data?: ResendVerificationRequest): Promise<ResendVerificationResponse> {
    const response = await this.request<ResendVerificationResponse>('/api/idm/email/resend', {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response;
  }

  /**
   * Get email verification status (requires authentication)
   */
  async getVerificationStatus(): Promise<VerificationStatusResponse> {
    const response = await this.request<VerificationStatusResponse>('/api/idm/email/status', {
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
