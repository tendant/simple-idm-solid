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
  /** Multiple users when status is 'multiple_users' - uses IdmUser format from login API */
  users?: IdmUser[];
}

export interface TwoFactorMethod {
  type: string;
  delivery_options?: string[];
  display_name?: string;
}

// ============================================================================
// Profile Types
// ============================================================================

export interface UpdateUsernameRequest {
  username: string;
  current_password: string;
}

export interface UpdatePhoneRequest {
  phone: string;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ProfileUpdateResponse {
  message: string;
  success: boolean;
}

// ============================================================================
// 2FA Types
// ============================================================================

export interface Setup2FAResponse {
  secret: string;
  qr_code: string; // Base64 encoded QR code image
  backup_codes?: string[];
}

export interface Enable2FARequest {
  type: 'totp' | 'sms' | 'email';
  code: string; // Verification code
}

export interface Validate2FARequest {
  type: 'totp' | 'sms' | 'email';
  code: string;
  delivery_option?: string; // For SMS/email
}

export interface TwoFAStatus {
  enabled: boolean;
  types: string[];
}

export interface Send2FACodeRequest {
  type: 'sms' | 'email';
  delivery_option: string; // Phone number or email
}

// ============================================================================
// Email Verification Types
// ============================================================================

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  verified_at: string;
}

export interface ResendVerificationRequest {
  user_id?: string; // Optional for admin override
}

export interface ResendVerificationResponse {
  message: string;
}

export interface VerificationStatusResponse {
  email_verified: boolean;
  verified_at?: string;
}

// ============================================================================
// Magic Link Types
// ============================================================================

export interface MagicLinkRequest {
  /** Username or email to send magic link to */
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

/**
 * UserInfo follows standard OIDC claims
 * Returned from /oauth2/userinfo endpoint
 * https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
 */
export interface UserInfo {
  sub: string;                    // Subject - unique user identifier
  preferred_username?: string;     // Preferred username
  email?: string;                  // Email address
  email_verified?: boolean;        // Email verification status
  name?: string;                   // Full name
  given_name?: string;             // First name
  family_name?: string;            // Last name
  picture?: string;                // Profile picture URL
  groups?: string[];               // User groups/roles
  updated_at?: number;             // Last update timestamp
}

/**
 * Simple IDM User format
 * Returned from login and other custom IDM endpoints
 * This is NOT OIDC standard - it's simple-idm specific
 */
export interface IdmUser {
  id: string;                      // User ID
  email: string;                   // Email address
  name: string;                    // Display name
  role: string;                    // Primary role (deprecated)
  roles: string[];                 // User roles
}

// ============================================================================
// Token Types
// ============================================================================

export interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
}

// ============================================================================
// Password Reset Types
// ============================================================================

export interface PasswordResetInitRequest {
  username?: string;
  email?: string;
}

export interface PasswordResetInitResponse {
  message: string;
}

export interface PasswordResetRequest {
  token: string;
  new_password: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface PasswordPolicyResponse {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_digit: boolean;
  require_special_char: boolean;
  disallow_common_pwds: boolean;
  max_repeated_chars: number;
  history_check_count: number;
  expiration_days: number;
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
