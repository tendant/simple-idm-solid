import { Component, Show } from 'solid-js';
import { useResetPassword } from '~/headless/useResetPassword';
import { Input } from '~/primitives/Input';
import { Button } from '~/primitives/Button';
import { Label } from '~/primitives/Label';
import { Alert } from '~/primitives/Alert';
import type { PasswordResetResponse } from '~/types/api';
import type { ThemeConfig } from '~/types/theme';

export interface ResetPasswordFormProps {
  /**
   * Base URL of the simple-idm backend (e.g., http://localhost:4000)
   * If omitted, uses relative URLs (assumes same origin)
   * @default undefined (same origin)
   */
  apiBaseUrl?: string;
  /** Initial token from URL query parameter */
  token?: string;
  /** Show token input field (default: false if token provided, true otherwise) */
  showTokenInput?: boolean;
  /** Auto-load password policy on mount (default: true) */
  autoLoadPolicy?: boolean;
  /** Callback called on successful password reset */
  onSuccess?: (response: PasswordResetResponse) => void;
  /** Callback called on error */
  onError?: (error: string) => void;
  /** URL to navigate to login page (default: /login) */
  loginUrl?: string;
  /** Custom CSS class */
  class?: string;
  /** Theme configuration */
  theme?: ThemeConfig;
}

export const ResetPasswordForm: Component<ResetPasswordFormProps> = (props) => {
  const showTokenInput = props.showTokenInput ?? !props.token;
  const autoLoadPolicy = props.autoLoadPolicy ?? true;
  const loginUrl = props.loginUrl || '/login';

  // Use headless reset password hook for business logic
  const resetPassword = useResetPassword({
    client: props.apiBaseUrl,
    initialToken: props.token,
    autoLoadPolicy: autoLoadPolicy,
    onSuccess: (response) => {
      props.onSuccess?.(response);
    },
    onError: (error) => {
      props.onError?.(error);
    },
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    resetPassword.submit();
  };

  const getStrengthBarColor = () => {
    const strength = resetPassword.passwordStrength();
    switch (strength.level) {
      case 'strong':
        return 'bg-green-600';
      case 'good':
        return 'bg-blue-600';
      case 'fair':
        return 'bg-yellow-600';
      case 'weak':
        return 'bg-red-600';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-3xl font-extrabold text-gray-900">Reset Your Password</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Enter your new password below
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          {/* Success State */}
          <Show when={resetPassword.success()}>
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
              <h3 class="text-lg font-medium text-gray-900 mb-2">Password Reset Successful!</h3>
              <Alert variant="success" class="mb-6">
                {resetPassword.success()}
              </Alert>
              <p class="text-sm text-gray-600 mb-6">
                Your password has been successfully reset. You can now log in with your new
                password.
              </p>
              <div>
                <a
                  href={loginUrl}
                  class="inline-flex justify-center w-full px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Continue to Login
                </a>
              </div>
            </div>
          </Show>

          {/* Form */}
          <Show when={!resetPassword.success()}>
            {/* Error State */}
            <Show when={resetPassword.error()}>
              <div class="mb-6">
                <Alert variant="error">{resetPassword.error()}</Alert>
              </div>
            </Show>

            <form onSubmit={handleSubmit}>
              <div class="space-y-6">
                {/* Token Input (optional) */}
                <Show when={showTokenInput}>
                  <div>
                    <Label for="token" required>
                      Reset Token
                    </Label>
                    <div class="mt-1">
                      <Input
                        id="token"
                        name="token"
                        type="text"
                        required
                        value={resetPassword.token()}
                        onInput={(e) => resetPassword.setToken(e.currentTarget.value)}
                        placeholder="Paste your reset token here"
                        disabled={resetPassword.isLoading()}
                      />
                    </div>
                    <p class="mt-1 text-xs text-gray-500">
                      Enter the token from your password reset email
                    </p>
                  </div>
                </Show>

                {/* New Password */}
                <div>
                  <Label for="new-password" required>
                    New Password
                  </Label>
                  <div class="mt-1">
                    <Input
                      id="new-password"
                      name="new-password"
                      type="password"
                      autocomplete="new-password"
                      required
                      value={resetPassword.newPassword()}
                      onInput={(e) => resetPassword.setNewPassword(e.currentTarget.value)}
                      placeholder="Enter new password"
                      disabled={resetPassword.isLoading()}
                    />
                  </div>

                  {/* Password Strength Indicator */}
                  <Show when={resetPassword.newPassword().length > 0}>
                    <div class="mt-2">
                      <div class="flex items-center justify-between text-xs mb-1">
                        <span class="text-gray-600">Password strength:</span>
                        <span class={resetPassword.passwordStrength().color}>
                          {resetPassword.passwordStrength().label}
                        </span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          class={`h-2 rounded-full transition-all duration-300 ${getStrengthBarColor()}`}
                          style={{
                            width: `${resetPassword.passwordStrength().percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  </Show>

                  {/* Password Policy Requirements */}
                  <Show when={resetPassword.policy()}>
                    <div class="mt-2 text-xs text-gray-600">
                      <p class="font-medium">Password must:</p>
                      <ul class="mt-1 space-y-1 list-disc list-inside">
                        <li>Be at least {resetPassword.policy()!.min_length} characters long</li>
                        <Show when={resetPassword.policy()!.require_uppercase}>
                          <li>Include an uppercase letter</li>
                        </Show>
                        <Show when={resetPassword.policy()!.require_lowercase}>
                          <li>Include a lowercase letter</li>
                        </Show>
                        <Show when={resetPassword.policy()!.require_digit}>
                          <li>Include a number</li>
                        </Show>
                        <Show when={resetPassword.policy()!.require_special_char}>
                          <li>Include a special character</li>
                        </Show>
                      </ul>
                    </div>
                  </Show>
                </div>

                {/* Confirm Password */}
                <div>
                  <Label for="confirm-password" required>
                    Confirm New Password
                  </Label>
                  <div class="mt-1">
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      autocomplete="new-password"
                      required
                      value={resetPassword.confirmPassword()}
                      onInput={(e) => resetPassword.setConfirmPassword(e.currentTarget.value)}
                      placeholder="Confirm new password"
                      disabled={resetPassword.isLoading()}
                    />
                  </div>
                  <Show
                    when={
                      resetPassword.confirmPassword().length > 0 &&
                      !resetPassword.passwordsMatch()
                    }
                  >
                    <p class="mt-1 text-xs text-red-600">Passwords do not match</p>
                  </Show>
                  <Show
                    when={
                      resetPassword.confirmPassword().length > 0 && resetPassword.passwordsMatch()
                    }
                  >
                    <p class="mt-1 text-xs text-green-600">Passwords match</p>
                  </Show>
                </div>
              </div>

              {/* Submit Button */}
              <div class="mt-8">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={resetPassword.isLoading()}
                  disabled={!resetPassword.canSubmit() || resetPassword.isLoading()}
                >
                  {resetPassword.isLoading() ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </div>
            </form>

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
          </Show>
        </div>

        {/* Additional Help Text */}
        <Show when={!resetPassword.success()}>
          <div class="mt-6 text-center">
            <p class="text-xs text-gray-500">
              Reset tokens expire after 24 hours and can only be used once.
            </p>
          </div>
        </Show>
      </div>
    </div>
  );
};
