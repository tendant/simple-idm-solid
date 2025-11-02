/**
 * API types for simple-idm integration
 * Based on quick IDM backend endpoints
 */

// ============================================================================
// Login Types
// ============================================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: 'success' | '2fa_required' | 'multiple_users';
  user_uuid?: string;
  username?: string;
  email?: string;
  /** Note: Token also set in HTTP-only cookie */
  access_token?: string;
  /** Note: Token also set in HTTP-only cookie */
  refresh_token?: string;
  /** Temporary token for multi-step flows (2FA, user selection) */
  temp_token?: string;
  message?: string;
  /** Available 2FA methods when status is '2fa_required' */
  two_factor_methods?: TwoFactorMethod[];
  /** Multiple users when status is 'multiple_users' */
  users?: UserInfo[];
}

export interface TwoFactorMethod {
  type: string;
  delivery_options?: string[];
  display_name?: string;
}

// ============================================================================
// Magic Link Types
// ============================================================================

export interface MagicLinkRequest {
  /** Can be username or email */
  username: string;
}

export interface MagicLinkResponse {
  message: string;
}

export interface MagicLinkValidateResponse {
  status: 'success';
  user_uuid: string;
  username: string;
  email?: string;
  access_token: string;
  refresh_token: string;
}

// ============================================================================
// Signup Types
// ============================================================================

export interface PasswordlessSignupRequest {
  email: string;
  username?: string;
  fullname?: string;
  invitation_code?: string;
}

export interface PasswordSignupRequest {
  username: string;
  email: string;
  password: string;
  fullname?: string;
  invitation_code?: string;
}

export interface SignupResponse {
  user_id: string;
  message: string;
}

// ============================================================================
// User Types
// ============================================================================

export interface UserInfo {
  user_uuid: string;
  username: string;
  email?: string;
  fullname?: string;
  first_name?: string;
  last_name?: string;
  roles?: string[];
  created_at?: string;
  last_modified_at?: string;
}

// ============================================================================
// Token Types
// ============================================================================

export interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  message: string;
  status?: number;
  error?: string;
}

export class ApiException extends Error {
  constructor(
    public status: number,
    public data: ApiError,
  ) {
    super(data.message || 'API request failed');
    this.name = 'ApiException';
  }
}
