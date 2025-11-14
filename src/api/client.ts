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
  PasswordResetInitRequest,
  PasswordResetInitResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordPolicyResponse,
} from '../types/api';
import { ApiException } from '../types/api';
import {
  type PrefixConfig,
  DEFAULT_V1_PREFIXES,
  LEGACY_PREFIXES,
  buildPrefixesFromBase,
  buildPrefixesFromVersion,
  mergePrefixes,
  validatePrefixes,
} from './config';

export interface ApiClientConfig {
  /**
   * Base URL of the simple-idm backend (e.g., http://localhost:4000)
   * If omitted or empty, uses relative URLs (assumes same origin)
   * @default '' (relative URLs)
   */
  baseUrl?: string;
  /** Custom fetch implementation (defaults to global fetch) */
  fetch?: typeof fetch;
  /** Callback when a 401 Unauthorized response is received */
  onUnauthorized?: () => void;
  /** Callback for general errors */
  onError?: (error: ApiError) => void;
  /**
   * Base prefix for all endpoints
   * Appends route segments to base path (e.g., '/api/v1/idm' + '/auth' = '/api/v1/idm/auth')
   * Simplest way to configure all routes with one prefix
   * @example '/api/v1/idm' → all routes use /api/v1/idm/* pattern
   */
  basePrefix?: string;
  /**
   * API version for endpoint prefixes (e.g., 'v1', 'v2')
   * When specified, prefixes will be `/api/${version}/idm/*`
   * Lower priority than basePrefix
   * @example 'v1' → '/api/v1/idm/auth', '/api/v1/idm/signup', etc.
   */
  apiVersion?: string;
  /**
   * Custom endpoint prefix configuration
   * Allows per-route-group prefix customization
   * Can be used to override specific routes when using basePrefix or apiVersion
   * @example { auth: '/custom/auth', signup: '/custom/signup' }
   */
  prefixes?: Partial<PrefixConfig>;
  /**
   * Use legacy prefix configuration (pre-v2.0.0)
   * Includes the inconsistent 2FA prefix `/idm/2fa/*`
   * @deprecated Use basePrefix, apiVersion, or custom prefixes instead
   */
  useLegacyPrefixes?: boolean;
}

export class SimpleIdmClient {
  private baseUrl: string;
  private fetchFn: typeof fetch;
  private onUnauthorized?: () => void;
  private onError?: (error: ApiError) => void;
  private prefixes: PrefixConfig;

  constructor(config: ApiClientConfig) {
    // Use relative URLs if baseUrl is not provided (same origin)
    this.baseUrl = config.baseUrl ? config.baseUrl.replace(/\/$/, '') : ''; // Remove trailing slash
    this.fetchFn = config.fetch || fetch.bind(globalThis);
    this.onUnauthorized = config.onUnauthorized;
    this.onError = config.onError;

    // Initialize endpoint prefixes based on configuration priority:
    // 1. basePrefix (highest priority for simplicity)
    // 2. apiVersion
    // 3. useLegacyPrefixes
    // 4. custom prefixes
    // 5. DEFAULT_V1_PREFIXES (default)
    this.prefixes = this.initializePrefixes(config);
  }

  /**
   * Initialize endpoint prefixes based on configuration
   */
  private initializePrefixes(config: ApiClientConfig): PrefixConfig {
    let basePrefixes: PrefixConfig;

    // Priority 1: Base prefix (simplest - one prefix for all routes)
    if (config.basePrefix) {
      basePrefixes = buildPrefixesFromBase(config.basePrefix);
    }
    // Priority 2: API version
    else if (config.apiVersion) {
      basePrefixes = buildPrefixesFromVersion(config.apiVersion);
    }
    // Priority 3: Legacy mode
    else if (config.useLegacyPrefixes) {
      basePrefixes = LEGACY_PREFIXES;
    }
    // Priority 4: Default to v1
    else {
      basePrefixes = DEFAULT_V1_PREFIXES;
    }

    // Merge custom prefixes if provided (allows overriding specific routes)
    if (config.prefixes) {
      basePrefixes = mergePrefixes(config.prefixes, basePrefixes);
    }

    // Validate final configuration
    validatePrefixes(basePrefixes);

    return basePrefixes;
  }

  // ============================================================================
  // Authentication Methods
  // ============================================================================

  /**
   * Login with username and password
   * Tokens are automatically stored in HTTP-only cookies by the server
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>(`${this.prefixes.auth}/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response;
  }

  /**
   * Request a magic link to be sent to the user's email
   */
  async requestMagicLink(request: MagicLinkRequest): Promise<MagicLinkResponse> {
    const response = await this.request<MagicLinkResponse>(`${this.prefixes.auth}/magic-link/email`, {
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
      `${this.prefixes.auth}/magic-link/validate?token=${encodeURIComponent(token)}`,
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
    const response = await this.request<TokenRefreshResponse>(`${this.prefixes.auth}/token/refresh`, {
      method: 'POST',
    });
    return response;
  }

  /**
   * Logout and clear authentication cookies
   */
  async logout(): Promise<void> {
    await this.request<void>(`${this.prefixes.auth}/logout`, {
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
    const response = await this.request<SignupResponse>(`${this.prefixes.signup}/passwordless`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Register a new user with a password
   */
  async signupWithPassword(data: PasswordSignupRequest): Promise<SignupResponse> {
    const response = await this.request<SignupResponse>(`${this.prefixes.signup}/register`, {
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
    const response = await this.request<UserInfo>(`${this.prefixes.oauth2}/userinfo`, {
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
    const response = await this.request<ProfileUpdateResponse>(`${this.prefixes.profile}/username`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Update phone number
   */
  async updatePhone(data: UpdatePhoneRequest): Promise<ProfileUpdateResponse> {
    const response = await this.request<ProfileUpdateResponse>(`${this.prefixes.profile}/phone`, {
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
    const response = await this.request<ProfileUpdateResponse>(`${this.prefixes.profile}/password`, {
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
    const response = await this.request<TwoFAStatus>(`${this.prefixes.twoFA}/status`, {
      method: 'GET',
    });
    return response;
  }

  /**
   * Setup TOTP 2FA (generates QR code)
   * Returns secret and QR code for authenticator app
   */
  async setup2FATOTP(): Promise<Setup2FAResponse> {
    const response = await this.request<Setup2FAResponse>(`${this.prefixes.twoFA}/totp/setup`, {
      method: 'POST',
    });
    return response;
  }

  /**
   * Enable 2FA after setup
   * Requires verification code to confirm setup
   */
  async enable2FA(data: Enable2FARequest): Promise<ProfileUpdateResponse> {
    const response = await this.request<ProfileUpdateResponse>(`${this.prefixes.twoFA}/enable`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Disable 2FA
   */
  async disable2FA(type: string): Promise<ProfileUpdateResponse> {
    const response = await this.request<ProfileUpdateResponse>(`${this.prefixes.twoFA}/${type}/disable`, {
      method: 'POST',
    });
    return response;
  }

  /**
   * Send 2FA code via SMS or email
   */
  async send2FACode(data: Send2FACodeRequest): Promise<ProfileUpdateResponse> {
    const response = await this.request<ProfileUpdateResponse>(`${this.prefixes.twoFA}/send-code`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Validate 2FA code
   */
  async validate2FA(data: Validate2FARequest): Promise<ProfileUpdateResponse> {
    const response = await this.request<ProfileUpdateResponse>(`${this.prefixes.twoFA}/validate`, {
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
    const response = await this.request<VerifyEmailResponse>(`${this.prefixes.email}/verify`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Resend verification email (requires authentication)
   */
  async resendVerificationEmail(data?: ResendVerificationRequest): Promise<ResendVerificationResponse> {
    const response = await this.request<ResendVerificationResponse>(`${this.prefixes.email}/resend`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return response;
  }

  /**
   * Get email verification status (requires authentication)
   */
  async getVerificationStatus(): Promise<VerificationStatusResponse> {
    const response = await this.request<VerificationStatusResponse>(`${this.prefixes.email}/status`, {
      method: 'GET',
    });
    return response;
  }

  // ============================================================================
  // Password Reset Methods
  // ============================================================================

  /**
   * Initiate password reset by email (public endpoint)
   * Sends a password reset token to the user's email
   */
  async initiatePasswordResetByEmail(email: string): Promise<PasswordResetInitResponse> {
    const data: PasswordResetInitRequest = { email };
    const response = await this.request<PasswordResetInitResponse>(
      `${this.prefixes.passwordReset}/initiate/email`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
    return response;
  }

  /**
   * Initiate password reset by username (public endpoint)
   * Sends a password reset token to the user's email associated with the username
   */
  async initiatePasswordResetByUsername(username: string): Promise<PasswordResetInitResponse> {
    const data: PasswordResetInitRequest = { username };
    const response = await this.request<PasswordResetInitResponse>(
      `${this.prefixes.passwordReset}/initiate/username`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
    return response;
  }

  /**
   * Reset password with token (public endpoint)
   * Completes the password reset using the token from email
   */
  async resetPassword(data: PasswordResetRequest): Promise<PasswordResetResponse> {
    const response = await this.request<PasswordResetResponse>(`${this.prefixes.passwordReset}/reset`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  /**
   * Get password policy requirements (public endpoint)
   * Returns the password policy configuration for validation
   */
  async getPasswordPolicy(): Promise<PasswordPolicyResponse> {
    const response = await this.request<PasswordPolicyResponse>(`${this.prefixes.passwordReset}/policy`, {
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
