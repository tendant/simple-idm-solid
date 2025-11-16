/**
 * useMagicLink - Headless magic link hook
 *
 * Provides passwordless magic link login logic without any UI.
 * Handles magic link requests, cooldown timer, and resend functionality.
 */

import { createSignal, onCleanup, Accessor } from 'solid-js';
import { SimpleIdmClient } from '~/api/client';
import type { MagicLinkResponse } from '~/types/api';

/**
 * Configuration for the useMagicLink hook
 */
export interface UseMagicLinkConfig {
  /**
   * API client instance or base URL string
   * - If string: Creates a new SimpleIdmClient with the URL
   * - If SimpleIdmClient: Uses the provided instance
   */
  client?: SimpleIdmClient | string;

  /**
   * Callback invoked after magic link is sent successfully
   */
  onSuccess?: (response: MagicLinkResponse) => void;

  /**
   * Callback invoked when request fails
   * Receives the error message string
   */
  onError?: (error: string) => void;

  /**
   * Cooldown duration in seconds before allowing resend
   * @default 60
   */
  cooldownSeconds?: number;
}

/**
 * State and actions returned by useMagicLink
 */
export interface UseMagicLinkReturn {
  // Form state
  /** Current username/email value */
  username: Accessor<string>;
  /** Update username/email */
  setUsername: (value: string) => void;

  // Operation state
  /** Whether magic link request is in progress */
  isLoading: Accessor<boolean>;
  /** Error message if request failed */
  error: Accessor<string | null>;
  /** Success message if magic link was sent */
  success: Accessor<string | null>;
  /** Last magic link response */
  response: Accessor<MagicLinkResponse | null>;
  /** Cooldown seconds remaining before resend is allowed */
  cooldown: Accessor<number>;

  // Actions
  /** Request magic link with current username */
  submit: () => Promise<void>;
  /** Resend magic link (same as submit, respects cooldown) */
  resend: () => Promise<void>;
  /** Reset form to initial state */
  reset: () => void;
  /** Clear error message */
  clearError: () => void;
  /** Clear success message */
  clearSuccess: () => void;

  // Validation
  /** Whether form is valid and can be submitted */
  canSubmit: Accessor<boolean>;
  /** Whether resend is allowed (no cooldown) */
  canResend: Accessor<boolean>;
}

/**
 * Headless hook for magic link (passwordless) login
 *
 * @example
 * ```tsx
 * import { useMagicLink } from '@tendant/simple-idm-solid/headless';
 *
 * const MyMagicLinkForm = () => {
 *   const magicLink = useMagicLink({
 *     client: 'http://localhost:4000',
 *     onSuccess: () => {
 *       console.log('Magic link sent! Check your email.');
 *     },
 *     cooldownSeconds: 60,
 *   });
 *
 *   return (
 *     <form onSubmit={(e) => { e.preventDefault(); magicLink.submit(); }}>
 *       <input
 *         value={magicLink.username()}
 *         onInput={(e) => magicLink.setUsername(e.currentTarget.value)}
 *         placeholder="Email or username"
 *       />
 *       <button
 *         type="submit"
 *         disabled={!magicLink.canSubmit() || magicLink.isLoading()}
 *       >
 *         {magicLink.isLoading()
 *           ? 'Sending...'
 *           : magicLink.cooldown() > 0
 *             ? `Resend in ${magicLink.cooldown()}s`
 *             : 'Send Magic Link'}
 *       </button>
 *       {magicLink.success() && magicLink.canResend() && (
 *         <button onClick={magicLink.resend}>Resend</button>
 *       )}
 *       {magicLink.error() && <div class="error">{magicLink.error()}</div>}
 *       {magicLink.success() && <div class="success">{magicLink.success()}</div>}
 *     </form>
 *   );
 * };
 * ```
 */
export function useMagicLink(config: UseMagicLinkConfig): UseMagicLinkReturn {
  // Form state
  const [username, setUsername] = createSignal('');

  // Operation state
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);
  const [response, setResponse] = createSignal<MagicLinkResponse | null>(null);
  const [cooldown, setCooldown] = createSignal(0);

  // Cooldown interval reference
  let cooldownInterval: number | undefined;

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

  // Cleanup interval on unmount
  onCleanup(() => {
    if (cooldownInterval !== undefined) {
      clearInterval(cooldownInterval);
    }
  });

  // Start cooldown timer
  const startCooldown = () => {
    const cooldownDuration = config.cooldownSeconds ?? 60;
    setCooldown(cooldownDuration);

    if (cooldownInterval !== undefined) {
      clearInterval(cooldownInterval);
    }

    cooldownInterval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownInterval !== undefined) {
            clearInterval(cooldownInterval);
            cooldownInterval = undefined;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000) as unknown as number;
  };

  // Validation
  const canSubmit = () => {
    return username().trim().length > 0 && !isLoading() && cooldown() === 0;
  };

  const canResend = () => {
    return cooldown() === 0 && !isLoading();
  };

  // Submit magic link request
  const submit = async () => {
    if (!canSubmit()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setResponse(null);

      const magicLinkResponse = await client.requestMagicLink({
        username: username(),
      });

      setResponse(magicLinkResponse);
      setSuccess(
        magicLinkResponse.message || 'Magic link sent! Please check your email.',
      );
      config.onSuccess?.(magicLinkResponse);

      // Start cooldown timer
      startCooldown();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to send magic link';
      setError(message);
      config.onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend (same as submit)
  const resend = async () => {
    await submit();
  };

  // Reset form
  const reset = () => {
    setUsername('');
    setError(null);
    setSuccess(null);
    setResponse(null);
    setIsLoading(false);
    setCooldown(0);
    if (cooldownInterval !== undefined) {
      clearInterval(cooldownInterval);
      cooldownInterval = undefined;
    }
  };

  // Clear messages
  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  return {
    // Form state
    username,
    setUsername,

    // Operation state
    isLoading,
    error,
    success,
    response,
    cooldown,

    // Actions
    submit,
    resend,
    reset,
    clearError,
    clearSuccess,

    // Validation
    canSubmit,
    canResend,
  };
}
