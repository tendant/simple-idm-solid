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
  /** Login endpoints (login, logout, token refresh) */
  login: string;
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
  /** Magic link endpoints (request, validate) */
  magicLinks: string;
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
  login: '/api/v1/idm/login',
  signup: '/api/v1/idm/signup',
  profile: '/api/v1/idm/profile',
  twoFA: '/api/v1/idm/2fa',
  email: '/api/v1/idm/email',
  passwordReset: '/api/v1/idm/password-reset',
  magicLinks: '/api/v1/idm/magic-links',
  oauth2: '/api/v1/idm/oauth2',
};

/**
 * Default prefixes for API v2
 *
 * Uses clean handlers without code generation.
 * Pattern: `/api/v2/auth` for auth routes (login/logout/refresh appended),
 *         `/api/v2/signup` for signup (full path, no suffix),
 *         `/api/v2/*` for other endpoints.
 */
export const DEFAULT_V2_PREFIXES: PrefixConfig = {
  login: '/api/v2/auth',
  signup: '/api/v2/signup',  // Full path - handler mounted directly here
  profile: '/api/v2/profile',
  twoFA: '/api/v2/2fa',
  email: '/api/v2/email',
  passwordReset: '/api/v2/passwords',
  magicLinks: '/api/v2/auth/magic-link',  // Magic links are under auth prefix
  oauth2: '/api/v2/oauth2',
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
  login: '/api/idm/auth',
  signup: '/api/idm/signup',
  profile: '/api/idm/profile',
  twoFA: '/idm/2fa', // Inconsistent - missing /api prefix
  email: '/api/idm/email',
  passwordReset: '/api/idm/password-reset',
  magicLinks: '/api/idm/magic-links',
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
 * //   login: '/api/v1/idm/login',
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
    login: `${base}/login`,
    signup: `${base}/signup`,
    profile: `${base}/profile`,
    twoFA: `${base}/2fa`,
    email: `${base}/email`,
    passwordReset: `${base}/password-reset`,
    magicLinks: `${base}/magic-links`,
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
  const oauth2Base = `/api/${version}/idm/oauth2`;

  return {
    login: `${base}/login`,
    signup: `${base}/signup`,
    profile: `${base}/profile`,
    twoFA: `${base}/2fa`,
    email: `${base}/email`,
    passwordReset: `${base}/password-reset`,
    magicLinks: `${base}/magic-links`,
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
    login: partial.login ?? defaults.login,
    signup: partial.signup ?? defaults.signup,
    profile: partial.profile ?? defaults.profile,
    twoFA: partial.twoFA ?? defaults.twoFA,
    email: partial.email ?? defaults.email,
    passwordReset: partial.passwordReset ?? defaults.passwordReset,
    magicLinks: partial.magicLinks ?? defaults.magicLinks,
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
    'login',
    'signup',
    'profile',
    'twoFA',
    'email',
    'passwordReset',
    'magicLinks',
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
