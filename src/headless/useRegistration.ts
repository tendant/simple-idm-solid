/**
 * useRegistration - Headless registration hook
 *
 * Provides user registration logic (password and passwordless) without any UI.
 * Handles form validation, password strength, and registration API calls.
 */

import { createSignal, createMemo, Accessor } from 'solid-js';
import { SimpleIdmClient } from '~/api/client';
import type { SignupResponse } from '~/types/api';

/**
 * Registration mode
 */
export type RegistrationMode = 'password' | 'passwordless';

/**
 * Password strength level
 */
export type PasswordStrength = 'weak' | 'medium' | 'strong';

/**
 * Configuration for the useRegistration hook
 */
export interface UseRegistrationConfig {
  /**
   * API client instance or base URL string
   * - If string: Creates a new SimpleIdmClient with the URL
   * - If SimpleIdmClient: Uses the provided instance
   */
  client?: SimpleIdmClient | string;

  /**
   * Registration mode: password or passwordless
   * @default 'password'
   */
  mode?: RegistrationMode;

  /**
   * Callback invoked on successful registration
   */
  onSuccess?: (response: SignupResponse) => void;

  /**
   * Callback invoked when registration fails
   */
  onError?: (error: string) => void;

  /**
   * Whether invitation code is required
   * @default false
   */
  requireInvitationCode?: boolean;

  /**
   * Whether to automatically redirect after successful registration
   * @default false
   */
  autoRedirect?: boolean;

  /**
   * URL to redirect to after successful registration (requires autoRedirect: true)
   */
  redirectUrl?: string;

  /**
   * Delay in milliseconds before redirecting (requires autoRedirect: true)
   * @default 2000
   */
  redirectDelay?: number;
}

/**
 * Password strength calculation result
 */
export interface PasswordStrengthResult {
  /** Strength percentage (0-100) */
  percentage: number;
  /** Strength level */
  level: PasswordStrength;
  /** Color suggestion for UI (bg-red-500, bg-yellow-500, bg-green-500) */
  color: string;
  /** Text label for strength */
  text: string;
}

/**
 * State and actions returned by useRegistration
 */
export interface UseRegistrationReturn {
  // Form state
  /** Current username value */
  username: Accessor<string>;
  /** Update username */
  setUsername: (value: string) => void;
  /** Current email value */
  email: Accessor<string>;
  /** Update email */
  setEmail: (value: string) => void;
  /** Current password value (only in password mode) */
  password: Accessor<string>;
  /** Update password */
  setPassword: (value: string) => void;
  /** Current confirm password value (only in password mode) */
  confirmPassword: Accessor<string>;
  /** Update confirm password */
  setConfirmPassword: (value: string) => void;
  /** Current full name value (optional) */
  fullname: Accessor<string>;
  /** Update full name */
  setFullname: (value: string) => void;
  /** Current invitation code value */
  invitationCode: Accessor<string>;
  /** Update invitation code */
  setInvitationCode: (value: string) => void;

  // Operation state
  /** Whether registration request is in progress */
  isLoading: Accessor<boolean>;
  /** Error message if registration failed */
  error: Accessor<string | null>;
  /** Success message if registration succeeded */
  success: Accessor<string | null>;
  /** Last registration response */
  response: Accessor<SignupResponse | null>;

  // Password validation (only relevant in password mode)
  /** Password strength calculation */
  passwordStrength: Accessor<PasswordStrengthResult>;
  /** Whether passwords match */
  passwordsMatch: Accessor<boolean>;

  // Actions
  /** Submit registration with current form values */
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
 * Headless hook for user registration
 *
 * @example Password registration
 * ```tsx
 * import { useRegistration } from '@tendant/simple-idm-solid/headless';
 *
 * const MyRegistrationForm = () => {
 *   const reg = useRegistration({
 *     client: 'http://localhost:4000',
 *     mode: 'password',
 *     onSuccess: () => {
 *       console.log('Account created!');
 *     },
 *   });
 *
 *   return (
 *     <form onSubmit={(e) => { e.preventDefault(); reg.submit(); }}>
 *       <input
 *         value={reg.username()}
 *         onInput={(e) => reg.setUsername(e.currentTarget.value)}
 *       />
 *       <input
 *         type="password"
 *         value={reg.password()}
 *         onInput={(e) => reg.setPassword(e.currentTarget.value)}
 *       />
 *       <div>Strength: {reg.passwordStrength().text}</div>
 *       <button disabled={!reg.canSubmit()}>Register</button>
 *     </form>
 *   );
 * };
 * ```
 *
 * @example Passwordless registration
 * ```tsx
 * const reg = useRegistration({
 *   client: 'http://localhost:4000',
 *   mode: 'passwordless',
 * });
 * ```
 */
export function useRegistration(
  config: UseRegistrationConfig,
): UseRegistrationReturn {
  const mode = config.mode ?? 'password';

  // Form state
  const [username, setUsername] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [fullname, setFullname] = createSignal('');
  const [invitationCode, setInvitationCode] = createSignal('');

  // Operation state
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);
  const [response, setResponse] = createSignal<SignupResponse | null>(null);

  // Create or use provided API client
  const client =
    config.client instanceof SimpleIdmClient
      ? config.client
      : new SimpleIdmClient({
          baseUrl: config.client || '', // Empty string = same origin
          onError: (err) => {
            setError(err.message);
            config.onError?.(err.message);
          },
        });

  // Password strength calculation
  const passwordStrength = createMemo((): PasswordStrengthResult => {
    const pwd = password();
    if (!pwd) {
      return {
        percentage: 0,
        level: 'weak',
        color: 'bg-red-500',
        text: 'Weak',
      };
    }

    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/\d/.test(pwd)) strength += 12.5;
    if (/[^a-zA-Z\d]/.test(pwd)) strength += 12.5;

    const percentage = Math.min(100, strength);

    let level: PasswordStrength;
    let color: string;
    let text: string;

    if (percentage < 33) {
      level = 'weak';
      color = 'bg-red-500';
      text = 'Weak';
    } else if (percentage < 66) {
      level = 'medium';
      color = 'bg-yellow-500';
      text = 'Medium';
    } else {
      level = 'strong';
      color = 'bg-green-500';
      text = 'Strong';
    }

    return { percentage, level, color, text };
  });

  // Password match validation
  const passwordsMatch = createMemo(() => {
    const pwd = password();
    const confirm = confirmPassword();
    if (!pwd || !confirm) return true; // Don't show mismatch until both are filled
    return pwd === confirm;
  });

  // Form validation
  const canSubmit = createMemo(() => {
    // Common validations
    if (isLoading()) return false;
    if (!email().trim() || !email().includes('@')) return false;
    if (config.requireInvitationCode && !invitationCode().trim()) return false;

    // Mode-specific validations
    if (mode === 'password') {
      // In password mode, require username and password
      if (!username().trim()) return false;
      if (!password().trim() || password().length < 8) return false;
      if (!passwordsMatch()) return false;
    } else if (mode === 'passwordless') {
      // In passwordless mode, if password is provided, validate it
      const hasPassword = password().trim().length > 0;
      if (hasPassword) {
        // If password is provided, must be valid and match
        if (password().length < 8) return false;
        if (!passwordsMatch()) return false;
        // Also require username if password is provided
        if (!username().trim()) return false;
      }
    }

    return true;
  });

  // Submit registration
  const submit = async () => {
    if (!canSubmit()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setResponse(null);

      let registrationResponse: SignupResponse;

      // Dynamically choose endpoint based on whether password is provided
      const hasPassword = password().trim().length > 0;

      if (mode === 'password' || hasPassword) {
        // Password-based registration
        const data = {
          username: username(),
          email: email(),
          password: password(),
          ...(fullname() && { fullname: fullname() }),
          ...(invitationCode() && { invitation_code: invitationCode() }),
        };

        registrationResponse = await client.signupWithPassword(data);
      } else {
        // Passwordless registration
        const data = {
          email: email(),
          ...(username() && { username: username() }),
          ...(fullname() && { fullname: fullname() }),
          ...(invitationCode() && { invitation_code: invitationCode() }),
        };

        registrationResponse = await client.signupPasswordless(data);
      }

      setResponse(registrationResponse);
      setSuccess(
        registrationResponse.message ||
          (mode === 'passwordless'
            ? 'Account created successfully! Please check your email to complete registration.'
            : 'Account created successfully! You can now log in.'),
      );
      config.onSuccess?.(registrationResponse);

      // Auto-redirect if configured
      if (config.autoRedirect && config.redirectUrl) {
        setTimeout(() => {
          window.location.href = config.redirectUrl!;
        }, config.redirectDelay ?? 2000);
      }

      // Reset form
      reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      config.onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const reset = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullname('');
    setInvitationCode('');
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
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullname,
    setFullname,
    invitationCode,
    setInvitationCode,

    // Operation state
    isLoading,
    error,
    success,
    response,

    // Password validation
    passwordStrength,
    passwordsMatch,

    // Actions
    submit,
    reset,
    clearError,
    clearSuccess,

    // Validation
    canSubmit,
  };
}
