import { Component, Show } from 'solid-js';
import { useForgotPassword } from '~/headless/useForgotPassword';
import { Input } from '~/primitives/Input';
import { Button } from '~/primitives/Button';
import { Label } from '~/primitives/Label';
import { Alert } from '~/primitives/Alert';
import type { PasswordResetInitResponse } from '~/types/api';
import type { ThemeConfig } from '~/types/theme';

export interface ForgotPasswordFormProps {
  /** Base URL of the simple-idm backend (e.g., http://localhost:4000) */
  apiBaseUrl: string;
  /** Method for password reset: 'email', 'username', or 'both' (default: 'email') */
  method?: 'email' | 'username' | 'both';
  /** Callback called on successful password reset initiation */
  onSuccess?: (response: PasswordResetInitResponse) => void;
  /** Callback called on error */
  onError?: (error: string) => void;
  /** URL to navigate back to login page (default: /login) */
  loginUrl?: string;
  /** Custom CSS class */
  class?: string;
  /** Theme configuration */
  theme?: ThemeConfig;
}

export const ForgotPasswordForm: Component<ForgotPasswordFormProps> = (props) => {
  const method = props.method || 'email';
  const loginUrl = props.loginUrl || '/login';

  // Use headless forgot password hook for business logic
  const forgotPassword = useForgotPassword({
    client: props.apiBaseUrl,
    method: method,
    onSuccess: (response) => {
      props.onSuccess?.(response);
    },
    onError: (error) => {
      props.onError?.(error);
    },
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    forgotPassword.submit();
  };

  const getInputLabel = () => {
    switch (method) {
      case 'email':
        return 'Email Address';
      case 'username':
        return 'Username';
      case 'both':
        return 'Email or Username';
      default:
        return 'Email Address';
    }
  };

  const getInputType = () => {
    return method === 'email' ? 'email' : 'text';
  };

  const getInputPlaceholder = () => {
    switch (method) {
      case 'email':
        return 'you@example.com';
      case 'username':
        return 'your-username';
      case 'both':
        return 'Email or username';
      default:
        return 'you@example.com';
    }
  };

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-3xl font-extrabold text-gray-900">Forgot Your Password?</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Enter your {method === 'email' ? 'email address' : method === 'username' ? 'username' : 'email or username'} and we'll send you a password reset link
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          {/* Success State */}
          <Show when={forgotPassword.success()}>
            <div class="mb-6">
              <Alert variant="success">{forgotPassword.success()}</Alert>
              <p class="mt-4 text-sm text-gray-600 text-center">
                Check your email for a password reset link. The link will expire in 24 hours.
              </p>
            </div>
          </Show>

          {/* Error State */}
          <Show when={forgotPassword.error()}>
            <div class="mb-6">
              <Alert variant="error">{forgotPassword.error()}</Alert>
            </div>
          </Show>

          {/* Form */}
          <Show when={!forgotPassword.success()}>
            <form onSubmit={handleSubmit} class="space-y-6">
              <div>
                <Label for="identifier" required>
                  {getInputLabel()}
                </Label>
                <div class="mt-1">
                  <Input
                    id="identifier"
                    name="identifier"
                    type={getInputType()}
                    autocomplete={method === 'email' ? 'email' : 'username'}
                    required
                    value={forgotPassword.identifier()}
                    onInput={(e) => forgotPassword.setIdentifier(e.currentTarget.value)}
                    placeholder={getInputPlaceholder()}
                    disabled={forgotPassword.isLoading()}
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={forgotPassword.isLoading()}
                  disabled={!forgotPassword.canSubmit() || forgotPassword.isLoading()}
                >
                  {forgotPassword.isLoading() ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>
          </Show>

          {/* Back to Login Link */}
          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div class="mt-6 text-center">
              <a
                href={loginUrl}
                class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Back to Login
              </a>
            </div>
          </div>
        </div>

        {/* Additional Help Text */}
        <Show when={!forgotPassword.success()}>
          <div class="mt-6 text-center">
            <p class="text-xs text-gray-500">
              If you don't receive an email within a few minutes, check your spam folder or try
              again.
            </p>
          </div>
        </Show>
      </div>
    </div>
  );
};
