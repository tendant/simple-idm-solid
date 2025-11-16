/**
 * useProfile - Headless profile management hook
 *
 * Provides profile update logic (username, phone, password) without any UI.
 * Handles form validation and profile update API calls.
 */

import { createSignal, createMemo, Accessor } from 'solid-js';
import { SimpleIdmClient } from '~/api/client';
import type { ProfileUpdateResponse } from '~/types/api';

/**
 * Profile update operation type
 */
export type ProfileOperation = 'username' | 'phone' | 'password';

/**
 * Configuration for the useProfile hook
 */
export interface UseProfileConfig {
  /**
   * API client instance or base URL string
   * - If string: Creates a new SimpleIdmClient with the URL
   * - If SimpleIdmClient: Uses the provided instance
   */
  client?: SimpleIdmClient | string;

  /**
   * Callback invoked on successful profile update
   */
  onSuccess?: (response: ProfileUpdateResponse, operation: ProfileOperation) => void;

  /**
   * Callback invoked when profile update fails
   */
  onError?: (error: string, operation: ProfileOperation) => void;

  /**
   * Minimum password length requirement
   * @default 8
   */
  minPasswordLength?: number;
}

/**
 * Password strength calculation result
 */
export interface PasswordStrengthResult {
  /** Strength percentage (0-100) */
  percentage: number;
  /** Strength level */
  level: 'weak' | 'medium' | 'strong';
  /** Color suggestion for UI (bg-red-500, bg-yellow-500, bg-green-500) */
  color: string;
  /** Text label for strength */
  text: string;
}

/**
 * State and actions returned by useProfile
 */
export interface UseProfileReturn {
  // Username update fields
  /** Current username value */
  username: Accessor<string>;
  /** Update username */
  setUsername: (value: string) => void;
  /** Current password for username verification */
  usernameCurrentPassword: Accessor<string>;
  /** Update current password for username */
  setUsernameCurrentPassword: (value: string) => void;

  // Phone update fields
  /** Current phone value */
  phone: Accessor<string>;
  /** Update phone */
  setPhone: (value: string) => void;

  // Password update fields
  /** Current password for password change */
  currentPassword: Accessor<string>;
  /** Update current password */
  setCurrentPassword: (value: string) => void;
  /** New password value */
  newPassword: Accessor<string>;
  /** Update new password */
  setNewPassword: (value: string) => void;
  /** Confirm new password value */
  confirmNewPassword: Accessor<string>;
  /** Update confirm new password */
  setConfirmNewPassword: (value: string) => void;

  // Operation state
  /** Whether a profile update request is in progress */
  isLoading: Accessor<boolean>;
  /** Error message if update failed */
  error: Accessor<string | null>;
  /** Success message if update succeeded */
  success: Accessor<string | null>;
  /** Last profile update response */
  response: Accessor<ProfileUpdateResponse | null>;
  /** Current operation being performed */
  currentOperation: Accessor<ProfileOperation | null>;

  // Password validation
  /** New password strength calculation */
  passwordStrength: Accessor<PasswordStrengthResult>;
  /** Whether new passwords match */
  passwordsMatch: Accessor<boolean>;

  // Actions
  /** Submit username update */
  updateUsername: () => Promise<void>;
  /** Submit phone update */
  updatePhone: () => Promise<void>;
  /** Submit password update */
  updatePassword: () => Promise<void>;
  /** Reset all form fields to initial state */
  reset: () => void;
  /** Reset username form fields */
  resetUsername: () => void;
  /** Reset phone form fields */
  resetPhone: () => void;
  /** Reset password form fields */
  resetPassword: () => void;
  /** Clear error message */
  clearError: () => void;
  /** Clear success message */
  clearSuccess: () => void;

  // Validation
  /** Whether username form is valid and can be submitted */
  canSubmitUsername: Accessor<boolean>;
  /** Whether phone form is valid and can be submitted */
  canSubmitPhone: Accessor<boolean>;
  /** Whether password form is valid and can be submitted */
  canSubmitPassword: Accessor<boolean>;
}

/**
 * Headless hook for profile management
 *
 * @example Update username
 * ```tsx
 * import { useProfile } from '@tendant/simple-idm-solid/headless';
 *
 * const MyProfileForm = () => {
 *   const profile = useProfile({
 *     client: 'http://localhost:4000',
 *     onSuccess: (response, operation) => {
 *       console.log(`${operation} updated!`, response);
 *     },
 *   });
 *
 *   return (
 *     <form onSubmit={(e) => { e.preventDefault(); profile.updateUsername(); }}>
 *       <input
 *         value={profile.username()}
 *         onInput={(e) => profile.setUsername(e.currentTarget.value)}
 *         placeholder="New Username"
 *       />
 *       <input
 *         type="password"
 *         value={profile.usernameCurrentPassword()}
 *         onInput={(e) => profile.setUsernameCurrentPassword(e.currentTarget.value)}
 *         placeholder="Current Password"
 *       />
 *       <button disabled={!profile.canSubmitUsername()}>
 *         Update Username
 *       </button>
 *     </form>
 *   );
 * };
 * ```
 *
 * @example Update password
 * ```tsx
 * const profile = useProfile({
 *   client: 'http://localhost:4000',
 * });
 *
 * return (
 *   <form onSubmit={(e) => { e.preventDefault(); profile.updatePassword(); }}>
 *     <input
 *       type="password"
 *       value={profile.currentPassword()}
 *       onInput={(e) => profile.setCurrentPassword(e.currentTarget.value)}
 *       placeholder="Current Password"
 *     />
 *     <input
 *       type="password"
 *       value={profile.newPassword()}
 *       onInput={(e) => profile.setNewPassword(e.currentTarget.value)}
 *       placeholder="New Password"
 *     />
 *     <div>Strength: {profile.passwordStrength().text}</div>
 *     <input
 *       type="password"
 *       value={profile.confirmNewPassword()}
 *       onInput={(e) => profile.setConfirmNewPassword(e.currentTarget.value)}
 *       placeholder="Confirm New Password"
 *     />
 *     {!profile.passwordsMatch() && <p>Passwords don't match</p>}
 *     <button disabled={!profile.canSubmitPassword()}>
 *       Update Password
 *     </button>
 *   </form>
 * );
 * ```
 */
export function useProfile(config: UseProfileConfig): UseProfileReturn {
  const minPasswordLength = config.minPasswordLength ?? 8;

  // Username update state
  const [username, setUsername] = createSignal('');
  const [usernameCurrentPassword, setUsernameCurrentPassword] = createSignal('');

  // Phone update state
  const [phone, setPhone] = createSignal('');

  // Password update state
  const [currentPassword, setCurrentPassword] = createSignal('');
  const [newPassword, setNewPassword] = createSignal('');
  const [confirmNewPassword, setConfirmNewPassword] = createSignal('');

  // Operation state
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);
  const [response, setResponse] = createSignal<ProfileUpdateResponse | null>(null);
  const [currentOperation, setCurrentOperation] = createSignal<ProfileOperation | null>(null);

  // Create or use provided API client
  const client =
    config.client instanceof SimpleIdmClient
      ? config.client
      : new SimpleIdmClient({
          baseUrl: config.client || '', // Empty string = same origin
          onError: (err) => {
            const operation = currentOperation();
            if (operation) {
              setError(err.message);
              config.onError?.(err.message, operation);
            }
          },
        });

  // Password strength calculation
  const passwordStrength = createMemo((): PasswordStrengthResult => {
    const pwd = newPassword();
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

    let level: 'weak' | 'medium' | 'strong';
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
    const newPwd = newPassword();
    const confirm = confirmNewPassword();
    if (!newPwd || !confirm) return true; // Don't show mismatch until both are filled
    return newPwd === confirm;
  });

  // Form validation
  const canSubmitUsername = createMemo(() => {
    if (isLoading()) return false;
    if (!username().trim()) return false;
    if (!usernameCurrentPassword().trim()) return false;
    return true;
  });

  const canSubmitPhone = createMemo(() => {
    if (isLoading()) return false;
    if (!phone().trim()) return false;
    return true;
  });

  const canSubmitPassword = createMemo(() => {
    if (isLoading()) return false;
    if (!currentPassword().trim()) return false;
    if (!newPassword().trim() || newPassword().length < minPasswordLength) return false;
    if (!passwordsMatch()) return false;
    return true;
  });

  // Update username
  const updateUsername = async () => {
    if (!canSubmitUsername()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setResponse(null);
      setCurrentOperation('username');

      const updateResponse = await client.updateUsername({
        username: username(),
        current_password: usernameCurrentPassword(),
      });

      setResponse(updateResponse);
      setSuccess(updateResponse.message || 'Username updated successfully!');
      config.onSuccess?.(updateResponse, 'username');

      // Reset username form fields
      resetUsername();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Username update failed';
      setError(message);
      config.onError?.(message, 'username');
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  // Update phone
  const updatePhone = async () => {
    if (!canSubmitPhone()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setResponse(null);
      setCurrentOperation('phone');

      const updateResponse = await client.updatePhone({
        phone: phone(),
      });

      setResponse(updateResponse);
      setSuccess(updateResponse.message || 'Phone updated successfully!');
      config.onSuccess?.(updateResponse, 'phone');

      // Reset phone form fields
      resetPhone();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Phone update failed';
      setError(message);
      config.onError?.(message, 'phone');
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  // Update password
  const updatePassword = async () => {
    if (!canSubmitPassword()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setResponse(null);
      setCurrentOperation('password');

      const updateResponse = await client.updatePassword({
        current_password: currentPassword(),
        new_password: newPassword(),
      });

      setResponse(updateResponse);
      setSuccess(updateResponse.message || 'Password updated successfully!');
      config.onSuccess?.(updateResponse, 'password');

      // Reset password form fields
      resetPassword();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password update failed';
      setError(message);
      config.onError?.(message, 'password');
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  // Reset functions
  const resetUsername = () => {
    setUsername('');
    setUsernameCurrentPassword('');
  };

  const resetPhone = () => {
    setPhone('');
  };

  const resetPassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const reset = () => {
    resetUsername();
    resetPhone();
    resetPassword();
    setError(null);
    setSuccess(null);
    setResponse(null);
    setIsLoading(false);
    setCurrentOperation(null);
  };

  // Clear messages
  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  return {
    // Username update fields
    username,
    setUsername,
    usernameCurrentPassword,
    setUsernameCurrentPassword,

    // Phone update fields
    phone,
    setPhone,

    // Password update fields
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,

    // Operation state
    isLoading,
    error,
    success,
    response,
    currentOperation,

    // Password validation
    passwordStrength,
    passwordsMatch,

    // Actions
    updateUsername,
    updatePhone,
    updatePassword,
    reset,
    resetUsername,
    resetPhone,
    resetPassword,
    clearError,
    clearSuccess,

    // Validation
    canSubmitUsername,
    canSubmitPhone,
    canSubmitPassword,
  };
}
