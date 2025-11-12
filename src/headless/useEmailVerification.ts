/**
 * useEmailVerification - Headless email verification hook
 *
 * Provides email verification logic without any UI.
 * Handles verification token validation, resending verification emails, and checking status.
 */

import { createSignal, Accessor } from 'solid-js';
import { SimpleIdmClient } from '~/api/client';
import type {
  VerifyEmailResponse,
  ResendVerificationResponse,
  VerificationStatusResponse,
} from '~/types/api';

/**
 * Email verification operation type
 */
export type EmailVerificationOperation = 'verify' | 'resend' | 'status';

/**
 * Configuration for the useEmailVerification hook
 */
export interface UseEmailVerificationConfig {
  /**
   * API client instance or base URL string
   * - If string: Creates a new SimpleIdmClient with the URL
   * - If SimpleIdmClient: Uses the provided instance
   */
  client: SimpleIdmClient | string;

  /**
   * Callback invoked on successful verification operation
   */
  onSuccess?: (response: VerifyEmailResponse | ResendVerificationResponse | VerificationStatusResponse, operation: EmailVerificationOperation) => void;

  /**
   * Callback invoked when verification operation fails
   */
  onError?: (error: string, operation: EmailVerificationOperation) => void;

  /**
   * Initial token value (useful for auto-verification from URL params)
   */
  initialToken?: string;

  /**
   * Automatically verify email on mount if initialToken is provided
   * @default false
   */
  autoVerify?: boolean;

  /**
   * Automatically load verification status on mount
   * @default false
   */
  autoLoadStatus?: boolean;
}

/**
 * State and actions returned by useEmailVerification
 */
export interface UseEmailVerificationReturn {
  // Verification token
  /** Current token value */
  token: Accessor<string>;
  /** Update token */
  setToken: (value: string) => void;

  // Verification status
  /** Verification status response */
  status: Accessor<VerificationStatusResponse | null>;
  /** Whether email is verified */
  isVerified: Accessor<boolean>;
  /** When email was verified (ISO 8601 string) */
  verifiedAt: Accessor<string | null>;

  // Operation state
  /** Whether an operation is in progress */
  isLoading: Accessor<boolean>;
  /** Error message if operation failed */
  error: Accessor<string | null>;
  /** Success message if operation succeeded */
  success: Accessor<string | null>;
  /** Last verification response */
  verifyResponse: Accessor<VerifyEmailResponse | null>;
  /** Current operation being performed */
  currentOperation: Accessor<EmailVerificationOperation | null>;

  // Actions
  /** Verify email with current token */
  verify: () => Promise<void>;
  /** Resend verification email (requires authentication) */
  resend: () => Promise<void>;
  /** Load verification status (requires authentication) */
  loadStatus: () => Promise<void>;
  /** Reset form fields to initial state */
  reset: () => void;
  /** Clear error message */
  clearError: () => void;
  /** Clear success message */
  clearSuccess: () => void;

  // Validation
  /** Whether verify form is valid and can be submitted */
  canVerify: Accessor<boolean>;
}

/**
 * Headless hook for email verification
 *
 * @example Verify email from URL token
 * ```tsx
 * import { useEmailVerification } from '@tendant/simple-idm-solid/headless';
 * import { useSearchParams } from '@solidjs/router';
 * import { Show } from 'solid-js';
 *
 * const EmailVerifyPage = () => {
 *   const [params] = useSearchParams();
 *
 *   const emailVerify = useEmailVerification({
 *     client: 'http://localhost:4000',
 *     initialToken: params.token,
 *     autoVerify: true,
 *     onSuccess: (response, operation) => {
 *       if (operation === 'verify') {
 *         console.log('Email verified!', response);
 *       }
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       <Show when={emailVerify.isLoading()}>
 *         <p>Verifying your email...</p>
 *       </Show>
 *
 *       <Show when={emailVerify.success()}>
 *         <p>✓ {emailVerify.success()}</p>
 *       </Show>
 *
 *       <Show when={emailVerify.error()}>
 *         <p>✗ {emailVerify.error()}</p>
 *       </Show>
 *     </div>
 *   );
 * };
 * ```
 *
 * @example Manual verification
 * ```tsx
 * const emailVerify = useEmailVerification({
 *   client: 'http://localhost:4000',
 * });
 *
 * return (
 *   <form onSubmit={(e) => { e.preventDefault(); emailVerify.verify(); }}>
 *     <input
 *       value={emailVerify.token()}
 *       onInput={(e) => emailVerify.setToken(e.currentTarget.value)}
 *       placeholder="Verification Token"
 *     />
 *     <button disabled={!emailVerify.canVerify()}>
 *       Verify Email
 *     </button>
 *   </form>
 * );
 * ```
 *
 * @example Resend verification email
 * ```tsx
 * const emailVerify = useEmailVerification({
 *   client: 'http://localhost:4000',
 * });
 *
 * return (
 *   <button
 *     onClick={() => emailVerify.resend()}
 *     disabled={emailVerify.isLoading()}
 *   >
 *     Resend Verification Email
 *   </button>
 * );
 * ```
 *
 * @example Check verification status
 * ```tsx
 * const emailVerify = useEmailVerification({
 *   client: 'http://localhost:4000',
 *   autoLoadStatus: true,
 * });
 *
 * return (
 *   <div>
 *     {emailVerify.isVerified() ? (
 *       <p>✓ Email verified on {emailVerify.verifiedAt()}</p>
 *     ) : (
 *       <button onClick={() => emailVerify.resend()}>
 *         Send Verification Email
 *       </button>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useEmailVerification(
  config: UseEmailVerificationConfig,
): UseEmailVerificationReturn {
  // Form fields
  const [token, setToken] = createSignal(config.initialToken || '');

  // Status
  const [status, setStatus] = createSignal<VerificationStatusResponse | null>(null);

  // Operation state
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);
  const [verifyResponse, setVerifyResponse] = createSignal<VerifyEmailResponse | null>(null);
  const [currentOperation, setCurrentOperation] = createSignal<EmailVerificationOperation | null>(null);

  // Create or use provided API client
  const client =
    typeof config.client === 'string'
      ? new SimpleIdmClient({
          baseUrl: config.client,
          onError: (err) => {
            const operation = currentOperation();
            if (operation) {
              setError(err.message);
              config.onError?.(err.message, operation);
            }
          },
        })
      : config.client;

  // Derived state
  const isVerified = () => status()?.email_verified ?? false;
  const verifiedAt = () => status()?.verified_at ?? null;

  // Validation
  const canVerify = () => {
    if (isLoading()) return false;
    if (!token().trim()) return false;
    return true;
  };

  // Verify email
  const verify = async () => {
    if (!canVerify()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setCurrentOperation('verify');

      const verificationResponse = await client.verifyEmail({
        token: token(),
      });

      setVerifyResponse(verificationResponse);
      setSuccess(verificationResponse.message || 'Email verified successfully!');
      config.onSuccess?.(verificationResponse, 'verify');

      // Update status if we have it
      if (status()) {
        setStatus({
          email_verified: true,
          verified_at: verificationResponse.verified_at,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Email verification failed';
      setError(message);
      config.onError?.(message, 'verify');
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  // Resend verification email
  const resend = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setCurrentOperation('resend');

      const resendResponse = await client.resendVerificationEmail();
      setSuccess(resendResponse.message || 'Verification email sent successfully!');
      config.onSuccess?.(resendResponse, 'resend');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send verification email';
      setError(message);
      config.onError?.(message, 'resend');
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  // Load verification status
  const loadStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentOperation('status');

      const statusResponse = await client.getVerificationStatus();
      setStatus(statusResponse);
      config.onSuccess?.(statusResponse, 'status');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load verification status';
      setError(message);
      config.onError?.(message, 'status');
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  // Reset form
  const reset = () => {
    setToken('');
    setStatus(null);
    setError(null);
    setSuccess(null);
    setVerifyResponse(null);
    setIsLoading(false);
    setCurrentOperation(null);
  };

  // Clear messages
  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  // Auto-verify if configured
  if (config.autoVerify && config.initialToken) {
    verify();
  }

  // Auto-load status if configured
  if (config.autoLoadStatus) {
    loadStatus();
  }

  return {
    // Verification token
    token,
    setToken,

    // Verification status
    status,
    isVerified,
    verifiedAt,

    // Operation state
    isLoading,
    error,
    success,
    verifyResponse,
    currentOperation,

    // Actions
    verify,
    resend,
    loadStatus,
    reset,
    clearError,
    clearSuccess,

    // Validation
    canVerify,
  };
}
