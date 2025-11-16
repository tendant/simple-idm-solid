/**
 * useForgotPassword - Headless hook for password reset initiation
 *
 * This hook manages the "forgot password" flow where users request a password reset link.
 * It provides business logic for requesting password reset tokens via email or username.
 *
 * Features:
 * - Request password reset by email or username
 * - Loading and error state management
 * - Success feedback with customizable callbacks
 * - Configurable input method (email, username, or both)
 *
 * @example
 * ```tsx
 * const forgotPassword = useForgotPassword({
 *   client: 'http://localhost:4000',
 *   method: 'email',
 *   onSuccess: (response) => {
 *     console.log('Password reset email sent!');
 *   },
 * });
 *
 * return (
 *   <form onSubmit={(e) => { e.preventDefault(); forgotPassword.submit(); }}>
 *     <input
 *       type="email"
 *       value={forgotPassword.identifier()}
 *       onInput={(e) => forgotPassword.setIdentifier(e.currentTarget.value)}
 *     />
 *     <button
 *       type="submit"
 *       disabled={!forgotPassword.canSubmit() || forgotPassword.isLoading()}
 *     >
 *       Send Reset Link
 *     </button>
 *     {forgotPassword.error() && <div>{forgotPassword.error()}</div>}
 *     {forgotPassword.success() && <div>{forgotPassword.success()}</div>}
 *   </form>
 * );
 * ```
 */

import { createSignal, createMemo } from 'solid-js';
import { SimpleIdmClient } from '~/api/client';
import type { PasswordResetInitResponse } from '~/types/api';

// ============================================================================
// Types
// ============================================================================

export type ForgotPasswordMethod = 'email' | 'username' | 'both';

export interface UseForgotPasswordConfig {
  /**
   * SimpleIdmClient instance or base URL string
   * If a string is provided, a new client will be created
   */
  client?: SimpleIdmClient | string;

  /**
   * Method for password reset: 'email', 'username', or 'both'
   * - 'email': Only allow email input
   * - 'username': Only allow username input
   * - 'both': Allow both (user must specify which)
   * @default 'email'
   */
  method?: ForgotPasswordMethod;

  /**
   * Callback function called on successful password reset initiation
   * @param response - The API response
   */
  onSuccess?: (response: PasswordResetInitResponse) => void;

  /**
   * Callback function called on error
   * @param error - The error message
   */
  onError?: (error: string) => void;
}

export interface UseForgotPasswordReturn {
  // State
  /** The email or username identifier */
  identifier: () => string;
  /** Set the identifier */
  setIdentifier: (value: string) => void;
  /** Loading state */
  isLoading: () => boolean;
  /** Error message */
  error: () => string | null;
  /** Success message */
  success: () => string | null;
  /** Last response from the API */
  response: () => PasswordResetInitResponse | null;

  // Actions
  /** Submit the password reset request */
  submit: () => Promise<void>;
  /** Reset the form state */
  reset: () => void;
  /** Check if the form can be submitted */
  canSubmit: () => boolean;

  // Configuration
  /** The configured method */
  method: () => ForgotPasswordMethod;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useForgotPassword(config: UseForgotPasswordConfig): UseForgotPasswordReturn {
  // Create or use existing client
  const client =
    config.client instanceof SimpleIdmClient
      ? config.client
      : new SimpleIdmClient({ baseUrl: config.client || '' }); // Empty = same origin

  const method = config.method || 'email';

  // State
  const [identifier, setIdentifier] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);
  const [response, setResponse] = createSignal<PasswordResetInitResponse | null>(null);

  // Computed
  const canSubmit = createMemo(() => {
    const id = identifier().trim();
    if (!id) return false;

    // Basic validation based on method
    if (method === 'email') {
      // Simple email validation
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id);
    }

    // For username or both, just check it's not empty
    return id.length > 0;
  });

  // Actions
  const submit = async () => {
    const id = identifier().trim();

    if (!canSubmit()) {
      setError('Please enter a valid identifier');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setResponse(null);

    try {
      let result: PasswordResetInitResponse;

      // Determine which API method to use
      if (method === 'email') {
        result = await client.initiatePasswordResetByEmail(id);
      } else if (method === 'username') {
        result = await client.initiatePasswordResetByUsername(id);
      } else {
        // For 'both', try to detect if it's an email or username
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id);
        result = isEmail
          ? await client.initiatePasswordResetByEmail(id)
          : await client.initiatePasswordResetByUsername(id);
      }

      setResponse(result);
      setSuccess(result.message || 'Password reset email sent successfully');
      config.onSuccess?.(result);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to initiate password reset';
      setError(errorMessage);
      config.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIdentifier('');
    setError(null);
    setSuccess(null);
    setResponse(null);
    setIsLoading(false);
  };

  return {
    // State
    identifier,
    setIdentifier,
    isLoading,
    error,
    success,
    response,

    // Actions
    submit,
    reset,
    canSubmit,

    // Configuration
    method: () => method,
  };
}
