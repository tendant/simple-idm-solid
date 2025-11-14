import { Component, Show, onMount } from 'solid-js';
import { useEmailVerification } from '~/headless/useEmailVerification';
import { Input } from '~/primitives/Input';
import { Button } from '~/primitives/Button';
import { Label } from '~/primitives/Label';
import { Alert } from '~/primitives/Alert';
import type { VerifyEmailResponse } from '~/types/api';
import type { ThemeConfig } from '~/types/theme';

export interface EmailVerificationPageProps {
  /**
   * Base URL of the simple-idm backend (e.g., http://localhost:4000)
   * If omitted, uses relative URLs (assumes same origin)
   * @default undefined (same origin)
   */
  apiBaseUrl?: string;
  /** Verification token from URL query parameter */
  token?: string;
  /** Auto-verify on mount if token is provided (default: true) */
  autoVerify?: boolean;
  /** Callback called on successful email verification */
  onSuccess?: (response: VerifyEmailResponse) => void;
  /** Callback called on error */
  onError?: (error: string) => void;
  /** URL to redirect to login page (default: /login) */
  loginUrl?: string;
  /** Custom CSS class */
  class?: string;
  /** Theme configuration */
  theme?: ThemeConfig;
}

export const EmailVerificationPage: Component<EmailVerificationPageProps> = (props) => {
  const autoVerify = props.autoVerify ?? true;
  const loginUrl = props.loginUrl ?? '/login';

  // Use headless email verification hook for business logic
  const emailVerify = useEmailVerification({
    client: props.apiBaseUrl,
    initialToken: props.token,
    autoVerify: autoVerify && !!props.token,
    onSuccess: (response, operation) => {
      if (operation === 'verify' && props.onSuccess) {
        props.onSuccess(response as VerifyEmailResponse);
      }
    },
    onError: (error, operation) => {
      if (operation === 'verify' && props.onError) {
        props.onError(error);
      }
    },
  });

  const handleManualVerify = (e: Event) => {
    e.preventDefault();
    emailVerify.verify();
  };

  const handleResend = () => {
    emailVerify.resend();
  };

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-3xl font-extrabold text-gray-900">Email Verification</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Verify your email address to continue
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          {/* Loading State */}
          <Show when={emailVerify.isLoading()}>
            <div class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
              <p class="mt-4 text-sm text-gray-600">Verifying your email address...</p>
            </div>
          </Show>

          {/* Success State */}
          <Show when={emailVerify.success() && !emailVerify.isLoading()}>
            <div class="text-center py-8">
              <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg
                  class="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Email Verified!</h3>
              <p class="text-sm text-gray-600 mb-6">{emailVerify.success()}</p>
              <Show when={emailVerify.verifyResponse()?.verified_at}>
                <p class="text-xs text-gray-500 mb-6">
                  Verified at:{' '}
                  {new Date(emailVerify.verifyResponse()!.verified_at).toLocaleString()}
                </p>
              </Show>
              <div class="space-y-3">
                <a
                  href={loginUrl}
                  class="inline-flex justify-center w-full px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Continue to Login
                </a>
              </div>
            </div>
          </Show>

          {/* Error State */}
          <Show when={emailVerify.error() && !emailVerify.isLoading()}>
            <div class="text-center py-8">
              <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg
                  class="h-10 w-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Verification Failed</h3>
              <Alert variant="error" class="mb-6">
                {emailVerify.error()}
              </Alert>

              <div class="space-y-3">
                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  onClick={handleResend}
                  loading={emailVerify.isLoading()}
                  disabled={emailVerify.isLoading()}
                >
                  {emailVerify.isLoading() ? 'Sending...' : 'Resend Verification Email'}
                </Button>
                <a
                  href={loginUrl}
                  class="inline-flex justify-center w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Login
                </a>
              </div>
            </div>
          </Show>

          {/* Manual Verification Form (no token provided) */}
          <Show when={!props.token && !emailVerify.isLoading() && !emailVerify.success()}>
            <div>
              <Alert variant="info" class="mb-6">
                Please enter the verification token from your email
              </Alert>

              <form onSubmit={handleManualVerify} class="space-y-6">
                <div>
                  <Label for="token" required>
                    Verification Token
                  </Label>
                  <div class="mt-1">
                    <Input
                      id="token"
                      name="token"
                      type="text"
                      required
                      value={emailVerify.token()}
                      onInput={(e) => emailVerify.setToken(e.currentTarget.value)}
                      placeholder="Paste your verification token here"
                    />
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={emailVerify.isLoading()}
                    disabled={!emailVerify.canVerify() || emailVerify.isLoading()}
                  >
                    {emailVerify.isLoading() ? 'Verifying...' : 'Verify Email'}
                  </Button>
                </div>

                <div class="text-center">
                  <p class="text-sm text-gray-600 mb-2">Didn't receive the email?</p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={emailVerify.isLoading()}
                    class="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resend verification email
                  </button>
                </div>
              </form>

              <Show when={emailVerify.success() && !emailVerify.verifyResponse()}>
                <Alert variant="success" class="mt-6">
                  {emailVerify.success()}
                </Alert>
              </Show>

              <div class="mt-6 text-center">
                <a href={loginUrl} class="text-sm text-gray-600 hover:text-gray-500">
                  Back to login
                </a>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};
