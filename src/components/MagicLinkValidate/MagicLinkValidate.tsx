import { Component, Show, createSignal, onMount } from 'solid-js';
import { SimpleIdmClient } from '~/api/client';
import { Alert } from '~/primitives/Alert';
import { Button } from '~/primitives/Button';
import type { MagicLinkValidateResponse } from '~/types/api';
import type { ThemeConfig } from '~/types/theme';

export interface MagicLinkValidateProps {
  /** Base URL of the simple-idm backend (e.g., http://localhost:4000) */
  apiBaseUrl: string;
  /** Magic link token from URL parameter */
  token: string;
  /** Callback called on successful validation */
  onSuccess?: (response: MagicLinkValidateResponse) => void;
  /** Callback called on error */
  onError?: (error: string) => void;
  /** Auto-validate on mount (default: true) */
  autoValidate?: boolean;
  /** Redirect URL after successful validation */
  redirectUrl?: string;
  /** Custom CSS class */
  class?: string;
  /** Theme configuration */
  theme?: ThemeConfig;
}

export const MagicLinkValidate: Component<MagicLinkValidateProps> = (props) => {
  const [isValidating, setIsValidating] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal(false);
  const [userInfo, setUserInfo] = createSignal<MagicLinkValidateResponse | null>(null);

  const client = new SimpleIdmClient({
    baseUrl: props.apiBaseUrl,
    onError: (err) => {
      setError(err.message);
      props.onError?.(err.message);
    },
  });

  const validate = async () => {
    if (!props.token) {
      setError('No magic link token provided');
      return;
    }

    try {
      setIsValidating(true);
      setError(null);

      const response = await client.validateMagicLink(props.token);
      setUserInfo(response);
      setSuccess(true);
      props.onSuccess?.(response);

      // Redirect if specified
      if (props.redirectUrl) {
        setTimeout(() => {
          window.location.href = props.redirectUrl!;
        }, 1500);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Invalid or expired magic link. Please request a new one.';
      setError(message);
      props.onError?.(message);
    } finally {
      setIsValidating(false);
    }
  };

  onMount(() => {
    if (props.autoValidate !== false) {
      validate();
    }
  });

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-3xl font-extrabold text-gray-900">
          Magic Link Validation
        </h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          {/* Loading State */}
          <Show when={isValidating()}>
            <div class="text-center">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              <p class="mt-4 text-gray-600">Validating your magic link...</p>
            </div>
          </Show>

          {/* Error State */}
          <Show when={!isValidating() && error()}>
            <div class="space-y-4">
              <Alert variant="error">
                <div>
                  <p class="font-medium">{error()}</p>
                  <p class="mt-2 text-sm">
                    The magic link may have expired or already been used.
                  </p>
                </div>
              </Alert>
              <div class="flex gap-3">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => (window.location.href = '/magic-link')}
                >
                  Request New Link
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => (window.location.href = '/login')}
                >
                  Back to Login
                </Button>
              </div>
            </div>
          </Show>

          {/* Success State */}
          <Show when={!isValidating() && success() && userInfo()}>
            <div class="space-y-4">
              <Alert variant="success">
                <div>
                  <p class="font-medium">Successfully logged in!</p>
                  <p class="mt-2 text-sm">
                    Welcome back, {userInfo()?.username}!
                    <Show when={props.redirectUrl}>
                      {' '}
                      Redirecting you now...
                    </Show>
                  </p>
                </div>
              </Alert>

              <Show when={!props.redirectUrl}>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => (window.location.href = '/')}
                >
                  Go to Dashboard
                </Button>
              </Show>
            </div>
          </Show>

          {/* Manual Validation (if autoValidate is false) */}
          <Show when={!props.autoValidate && !isValidating() && !success() && !error()}>
            <div class="space-y-4 text-center">
              <p class="text-gray-600">Click the button below to validate your magic link.</p>
              <Button variant="primary" fullWidth onClick={validate}>
                Validate Link
              </Button>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};
