/**
 * useLogin - Headless login hook
 *
 * Provides password-based login logic without any UI.
 * Handles credential validation, API calls, and response states.
 */

import { createSignal, Accessor } from 'solid-js';
import { SimpleIdmClient } from '~/api/client';
import type { LoginResponse } from '~/types/api';

/**
 * Configuration for the useLogin hook
 */
export interface UseLoginConfig {
  /**
   * API client instance or base URL string
   * - If string: Creates a new SimpleIdmClient with the URL
   * - If SimpleIdmClient: Uses the provided instance
   */
  client: SimpleIdmClient | string;

  /**
   * Callback invoked on successful login
   * Receives the full login response including tokens and user info
   */
  onSuccess?: (response: LoginResponse) => void;

  /**
   * Callback invoked when login fails
   * Receives the error message string
   */
  onError?: (error: string) => void;

  /**
   * Whether to automatically redirect after successful login
   * @default false
   */
  autoRedirect?: boolean;

  /**
   * URL to redirect to after successful login (requires autoRedirect: true)
   */
  redirectUrl?: string;

  /**
   * Delay in milliseconds before redirecting (requires autoRedirect: true)
   * @default 500
   */
  redirectDelay?: number;
}

/**
 * State and actions returned by useLogin
 */
export interface UseLoginReturn {
  // Form state
  /** Current username value */
  username: Accessor<string>;
  /** Update username */
  setUsername: (value: string) => void;
  /** Current password value */
  password: Accessor<string>;
  /** Update password */
  setPassword: (value: string) => void;

  // Operation state
  /** Whether login request is in progress */
  isLoading: Accessor<boolean>;
  /** Error message if login failed */
  error: Accessor<string | null>;
  /** Success message if login succeeded */
  success: Accessor<string | null>;
  /** Last login response (includes 2FA, multiple users, etc.) */
  response: Accessor<LoginResponse | null>;

  // Actions
  /** Submit login with current username/password */
  submit: () => Promise<void>;
  /** Reset form to initial state */
  reset: () => void;
  /** Clear error message */
  clearError: () => void;
  /** Clear success message */
  clearSuccess: () => void;

  // Validation
  /** Whether form is valid and can be submitted */
  canSubmit: Accessor<boolean>;
}

/**
 * Headless hook for password-based login
 *
 * @example
 * ```tsx
 * import { useLogin } from '@tendant/simple-idm-solid/headless';
 *
 * const MyLoginForm = () => {
 *   const login = useLogin({
 *     client: 'http://localhost:4000',
 *     onSuccess: (response) => {
 *       if (response.status === 'success') {
 *         console.log('Logged in!', response.user);
 *       } else if (response.status === '2fa_required') {
 *         // Handle 2FA flow
 *       }
 *     },
 *   });
 *
 *   return (
 *     <form onSubmit={(e) => { e.preventDefault(); login.submit(); }}>
 *       <input
 *         value={login.username()}
 *         onInput={(e) => login.setUsername(e.currentTarget.value)}
 *         placeholder="Username"
 *       />
 *       <input
 *         type="password"
 *         value={login.password()}
 *         onInput={(e) => login.setPassword(e.currentTarget.value)}
 *         placeholder="Password"
 *       />
 *       <button
 *         type="submit"
 *         disabled={!login.canSubmit() || login.isLoading()}
 *       >
 *         {login.isLoading() ? 'Signing in...' : 'Sign in'}
 *       </button>
 *       {login.error() && <div class="error">{login.error()}</div>}
 *       {login.success() && <div class="success">{login.success()}</div>}
 *     </form>
 *   );
 * };
 * ```
 */
export function useLogin(config: UseLoginConfig): UseLoginReturn {
  // Form state
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');

  // Operation state
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);
  const [response, setResponse] = createSignal<LoginResponse | null>(null);

  // Create or use provided API client
  const client =
    typeof config.client === 'string'
      ? new SimpleIdmClient({
          baseUrl: config.client,
          onError: (err) => {
            setError(err.message);
            config.onError?.(err.message);
          },
        })
      : config.client;

  // Validation
  const canSubmit = () => {
    return username().trim().length > 0 && password().trim().length > 0;
  };

  // Submit login
  const submit = async () => {
    if (!canSubmit() || isLoading()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setResponse(null);

      const loginResponse = await client.login({
        username: username(),
        password: password(),
      });

      setResponse(loginResponse);

      // Handle successful login
      if (loginResponse.status === 'success') {
        setSuccess('Login successful!');
        config.onSuccess?.(loginResponse);

        // Auto-redirect if configured
        if (config.autoRedirect && config.redirectUrl) {
          setTimeout(() => {
            window.location.href = config.redirectUrl!;
          }, config.redirectDelay ?? 500);
        }
      }
      // Handle 2FA required
      else if (loginResponse.status === '2fa_required') {
        config.onSuccess?.(loginResponse);
      }
      // Handle multiple users
      else if (loginResponse.status === 'multiple_users') {
        config.onSuccess?.(loginResponse);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      config.onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const reset = () => {
    setUsername('');
    setPassword('');
    setError(null);
    setSuccess(null);
    setResponse(null);
    setIsLoading(false);
  };

  // Clear messages
  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  return {
    // Form state
    username,
    setUsername,
    password,
    setPassword,

    // Operation state
    isLoading,
    error,
    success,
    response,

    // Actions
    submit,
    reset,
    clearError,
    clearSuccess,

    // Validation
    canSubmit,
  };
}
