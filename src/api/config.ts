/**
 * API Prefix Configuration
 *
 * Provides preset configurations for different API versions and deployment scenarios.
 * Supports per-route-group prefix customization for flexible API gateway routing.
 */

/**
 * Prefix configuration for all API route groups
 */
export interface PrefixConfig {
  /** Authentication endpoints (login, logout, magic link, token refresh) */
  auth: string;
  /** User registration endpoints (passwordless, password-based) */
  signup: string;
  /** Profile management endpoints (username, phone, password updates) */
  profile: string;
  /** Two-factor authentication endpoints (setup, enable, disable, validate) */
  twoFA: string;
  /** Email verification endpoints (verify, resend, status) */
  email: string;
  /** Password reset endpoints (initiate, reset, policy) */
  passwordReset: string;
  /** OAuth2 standard endpoints (userinfo) */
  oauth2: string;
}

/**
 * Default prefixes for API v1 (recommended)
 *
 * Uses consistent `/api/v1/idm/*` pattern for all IDM endpoints
 * and `/api/v1/oauth2/*` for OAuth2 standard endpoints.
 */
export const DEFAULT_V1_PREFIXES: PrefixConfig = {
  auth: '/api/v1/idm/auth',
  signup: '/api/v1/idm/signup',
  profile: '/api/v1/idm/profile',
  twoFA: '/api/v1/idm/2fa',
  email: '/api/v1/idm/email',
  passwordReset: '/api/v1/idm/password-reset',
  oauth2: '/api/v1/oauth2',
};

/**
 * Legacy prefixes (pre-v2.0.0)
 *
 * Includes the inconsistent 2FA prefix `/idm/2fa/*` instead of `/api/idm/2fa/*`.
 * Use only for backward compatibility with older simple-idm backends.
 *
 * @deprecated Use DEFAULT_V1_PREFIXES or build with apiVersion: 'v1' instead
 */
export const LEGACY_PREFIXES: PrefixConfig = {
  auth: '/api/idm/auth',
  signup: '/api/idm/signup',
  profile: '/api/idm/profile',
  twoFA: '/idm/2fa', // Inconsistent - missing /api prefix
  email: '/api/idm/email',
  passwordReset: '/api/idm/password-reset',
  oauth2: '/api/oauth2',
};

/**
 * Build prefix configuration from a base path
 *
 * Appends route segments to the base path for each route group.
 * This provides a simple way to configure all endpoints with one prefix.
 *
 * @param basePath - Base path for all endpoints (e.g., '/api/v1/idm')
 * @returns Prefix configuration with base path + route segments
 *
 * @example
 * buildPrefixesFromBase('/api/v1/idm')
 * // Returns:
 * // {
 * //   auth: '/api/v1/idm/auth',
 * //   signup: '/api/v1/idm/signup',
 * //   profile: '/api/v1/idm/profile',
 * //   twoFA: '/api/v1/idm/2fa',
 * //   email: '/api/v1/idm/email',
 * //   passwordReset: '/api/v1/idm/password-reset',
 * //   oauth2: '/api/v1/idm/oauth2',
 * // }
 */
export function buildPrefixesFromBase(basePath: string): PrefixConfig {
  // Remove trailing slash if present
  const base = basePath.replace(/\/$/, '');

  return {
    auth: `${base}/auth`,
    signup: `${base}/signup`,
    profile: `${base}/profile`,
    twoFA: `${base}/2fa`,
    email: `${base}/email`,
    passwordReset: `${base}/password-reset`,
    oauth2: `${base}/oauth2`,
  };
}

/**
 * Build prefix configuration from API version
 *
 * @param version - API version (e.g., 'v1', 'v2')
 * @returns Prefix configuration for the specified version
 */
export function buildPrefixesFromVersion(version: string): PrefixConfig {
  const base = `/api/${version}/idm`;
  const oauth2Base = `/api/${version}/oauth2`;

  return {
    auth: `${base}/auth`,
    signup: `${base}/signup`,
    profile: `${base}/profile`,
    twoFA: `${base}/2fa`,
    email: `${base}/email`,
    passwordReset: `${base}/password-reset`,
    oauth2: oauth2Base,
  };
}

/**
 * Merge partial prefix configuration with defaults
 *
 * Allows overriding specific prefixes while using defaults for others.
 *
 * @param partial - Partial prefix configuration
 * @param defaults - Default prefix configuration to use as base
 * @returns Complete prefix configuration
 */
export function mergePrefixes(
  partial: Partial<PrefixConfig>,
  defaults: PrefixConfig,
): PrefixConfig {
  return {
    auth: partial.auth ?? defaults.auth,
    signup: partial.signup ?? defaults.signup,
    profile: partial.profile ?? defaults.profile,
    twoFA: partial.twoFA ?? defaults.twoFA,
    email: partial.email ?? defaults.email,
    passwordReset: partial.passwordReset ?? defaults.passwordReset,
    oauth2: partial.oauth2 ?? defaults.oauth2,
  };
}

/**
 * Validate prefix configuration
 *
 * Ensures all prefixes are defined and start with `/`
 *
 * @param prefixes - Prefix configuration to validate
 * @throws Error if configuration is invalid
 */
export function validatePrefixes(prefixes: PrefixConfig): void {
  const keys: (keyof PrefixConfig)[] = [
    'auth',
    'signup',
    'profile',
    'twoFA',
    'email',
    'passwordReset',
    'oauth2',
  ];

  for (const key of keys) {
    const prefix = prefixes[key];

    if (!prefix) {
      throw new Error(`Prefix configuration missing: ${key}`);
    }

    if (!prefix.startsWith('/')) {
      throw new Error(`Prefix must start with '/': ${key} = ${prefix}`);
    }
  }
}
