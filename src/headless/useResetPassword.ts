/**
 * useResetPassword - Headless hook for password reset completion
 *
 * This hook manages the password reset flow where users reset their password using a token.
 * It provides business logic for validating tokens, entering new passwords, and password strength checking.
 *
 * Features:
 * - Reset password with token from email
 * - Password strength validation
 * - Password confirmation matching
 * - Auto-fetch password policy for validation
 * - Loading and error state management
 * - Token validation feedback
 *
 * @example
 * ```tsx
 * const resetPassword = useResetPassword({
 *   client: 'http://localhost:4000',
 *   initialToken: tokenFromUrl,
 *   onSuccess: (response) => {
 *     navigate('/login');
 *   },
 * });
 *
 * return (
 *   <form onSubmit={(e) => { e.preventDefault(); resetPassword.submit(); }}>
 *     <input
 *       type="text"
 *       value={resetPassword.token()}
 *       onInput={(e) => resetPassword.setToken(e.currentTarget.value)}
 *       placeholder="Reset token"
 *     />
 *     <input
 *       type="password"
 *       value={resetPassword.newPassword()}
 *       onInput={(e) => resetPassword.setNewPassword(e.currentTarget.value)}
 *       placeholder="New password"
 *     />
 *     <input
 *       type="password"
 *       value={resetPassword.confirmPassword()}
 *       onInput={(e) => resetPassword.setConfirmPassword(e.currentTarget.value)}
 *       placeholder="Confirm password"
 *     />
 *     <div>Strength: {resetPassword.passwordStrength().label}</div>
 *     <button
 *       type="submit"
 *       disabled={!resetPassword.canSubmit() || resetPassword.isLoading()}
 *     >
 *       Reset Password
 *     </button>
 *   </form>
 * );
 * ```
 */

import { createSignal, createMemo, onMount } from 'solid-js';
import { SimpleIdmClient } from '~/api/client';
import type { PasswordResetResponse, PasswordPolicyResponse } from '~/types/api';

// ============================================================================
// Types
// ============================================================================

export interface PasswordStrengthResult {
  /** Strength level: 'weak', 'fair', 'good', 'strong' */
  level: 'weak' | 'fair' | 'good' | 'strong';
  /** User-friendly label */
  label: string;
  /** Percentage (0-100) */
  percentage: number;
  /** Color class for UI */
  color: string;
}

export interface UseResetPasswordConfig {
  /**
   * SimpleIdmClient instance or base URL string
   * If a string is provided, a new client will be created
   */
  client?: SimpleIdmClient | string;

  /**
   * Initial token from URL query parameter
   */
  initialToken?: string;

  /**
   * Auto-load password policy on mount
   * @default true
   */
  autoLoadPolicy?: boolean;

  /**
   * Minimum password length for strength validation
   * Will be overridden by policy if loaded
   * @default 8
   */
  minPasswordLength?: number;

  /**
   * Callback function called on successful password reset
   * @param response - The API response
   */
  onSuccess?: (response: PasswordResetResponse) => void;

  /**
   * Callback function called on error
   * @param error - The error message
   */
  onError?: (error: string) => void;
}

export interface UseResetPasswordReturn {
  // State
  /** The reset token */
  token: () => string;
  /** Set the token */
  setToken: (value: string) => void;
  /** New password */
  newPassword: () => string;
  /** Set new password */
  setNewPassword: (value: string) => void;
  /** Confirm password */
  confirmPassword: () => string;
  /** Set confirm password */
  setConfirmPassword: (value: string) => void;
  /** Loading state */
  isLoading: () => boolean;
  /** Error message */
  error: () => string | null;
  /** Success message */
  success: () => string | null;
  /** Last response from the API */
  response: () => PasswordResetResponse | null;
  /** Password policy */
  policy: () => PasswordPolicyResponse | null;

  // Computed
  /** Password strength analysis */
  passwordStrength: () => PasswordStrengthResult;
  /** Check if passwords match */
  passwordsMatch: () => boolean;
  /** Check if password meets policy requirements */
  meetsPolicy: () => boolean;

  // Actions
  /** Submit the password reset */
  submit: () => Promise<void>;
  /** Reset the form state */
  reset: () => void;
  /** Check if the form can be submitted */
  canSubmit: () => boolean;
  /** Load password policy from API */
  loadPolicy: () => Promise<void>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate password strength
 */
function calculatePasswordStrength(
  password: string,
  minLength: number = 8,
): PasswordStrengthResult {
  if (!password) {
    return {
      level: 'weak',
      label: 'Too short',
      percentage: 0,
      color: 'text-gray-400',
    };
  }

  let score = 0;
  const checks = {
    length: password.length >= minLength,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  // Length check (most important)
  if (checks.length) score += 40;
  else if (password.length >= minLength - 2) score += 20;

  // Character variety checks
  if (checks.uppercase) score += 15;
  if (checks.lowercase) score += 15;
  if (checks.digit) score += 15;
  if (checks.special) score += 15;

  // Determine strength level
  if (score >= 90) {
    return {
      level: 'strong',
      label: 'Strong',
      percentage: 100,
      color: 'text-green-600',
    };
  } else if (score >= 70) {
    return {
      level: 'good',
      label: 'Good',
      percentage: 75,
      color: 'text-blue-600',
    };
  } else if (score >= 40) {
    return {
      level: 'fair',
      label: 'Fair',
      percentage: 50,
      color: 'text-yellow-600',
    };
  } else {
    return {
      level: 'weak',
      label: 'Weak',
      percentage: 25,
      color: 'text-red-600',
    };
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useResetPassword(config: UseResetPasswordConfig): UseResetPasswordReturn {
  // Create or use existing client
  const client =
    config.client instanceof SimpleIdmClient
      ? config.client
      : new SimpleIdmClient({ baseUrl: config.client || '' }); // Empty = same origin

  const autoLoadPolicy = config.autoLoadPolicy ?? true;
  const minLength = config.minPasswordLength || 8;

  // State
  const [token, setToken] = createSignal(config.initialToken || '');
  const [newPassword, setNewPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);
  const [response, setResponse] = createSignal<PasswordResetResponse | null>(null);
  const [policy, setPolicy] = createSignal<PasswordPolicyResponse | null>(null);

  // Computed
  const passwordStrength = createMemo(() => {
    const policyMinLength = policy()?.min_length || minLength;
    return calculatePasswordStrength(newPassword(), policyMinLength);
  });

  const passwordsMatch = createMemo(() => {
    const pwd = newPassword();
    const confirm = confirmPassword();
    if (!pwd || !confirm) return false;
    return pwd === confirm;
  });

  const meetsPolicy = createMemo(() => {
    const pwd = newPassword();
    const pol = policy();

    if (!pol) {
      // If no policy loaded, use basic validation
      return pwd.length >= minLength;
    }

    // Check against policy requirements
    const checks = {
      length: pwd.length >= pol.min_length,
      uppercase: !pol.require_uppercase || /[A-Z]/.test(pwd),
      lowercase: !pol.require_lowercase || /[a-z]/.test(pwd),
      digit: !pol.require_digit || /\d/.test(pwd),
      special: !pol.require_special_char || /[^A-Za-z0-9]/.test(pwd),
    };

    return Object.values(checks).every((check) => check);
  });

  const canSubmit = createMemo(() => {
    return (
      token().trim().length > 0 &&
      newPassword().length > 0 &&
      passwordsMatch() &&
      meetsPolicy()
    );
  });

  // Actions
  const loadPolicy = async () => {
    try {
      const policyData = await client.getPasswordPolicy();
      setPolicy(policyData);
    } catch (err) {
      // Policy loading is optional, so we just log the error
      console.warn('Failed to load password policy:', err);
    }
  };

  const submit = async () => {
    if (!canSubmit()) {
      if (!passwordsMatch()) {
        setError('Passwords do not match');
      } else if (!meetsPolicy()) {
        setError('Password does not meet policy requirements');
      } else {
        setError('Please fill in all required fields');
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setResponse(null);

    try {
      const result = await client.resetPassword({
        token: token().trim(),
        new_password: newPassword(),
      });

      setResponse(result);
      setSuccess(result.message || 'Password reset successfully');
      config.onSuccess?.(result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
      config.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setToken(config.initialToken || '');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
    setResponse(null);
    setIsLoading(false);
  };

  // Auto-load policy on mount
  onMount(() => {
    if (autoLoadPolicy) {
      loadPolicy();
    }
  });

  return {
    // State
    token,
    setToken,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    error,
    success,
    response,
    policy,

    // Computed
    passwordStrength,
    passwordsMatch,
    meetsPolicy,

    // Actions
    submit,
    reset,
    canSubmit,
    loadPolicy,
  };
}
