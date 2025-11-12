import { Component, Show } from 'solid-js';
import { useRegistration } from '~/headless/useRegistration';
import { Input } from '~/primitives/Input';
import { Button } from '~/primitives/Button';
import { Label } from '~/primitives/Label';
import { Alert } from '~/primitives/Alert';
import type { SignupResponse } from '~/types/api';
import type { ThemeConfig } from '~/types/theme';

export interface PasswordlessRegistrationFormProps {
  /** Base URL of the simple-idm backend (e.g., http://localhost:4000) */
  apiBaseUrl: string;
  /** Callback called on successful registration */
  onSuccess?: (response: SignupResponse) => void;
  /** Callback called on error */
  onError?: (error: string) => void;
  /** Require invitation code for registration */
  requireInvitationCode?: boolean;
  /** Show link to login page */
  showLoginLink?: boolean;
  /** Redirect URL after registration */
  redirectUrl?: string;
  /** Custom CSS class */
  class?: string;
  /** Theme configuration */
  theme?: ThemeConfig;
}

export const PasswordlessRegistrationForm: Component<PasswordlessRegistrationFormProps> = (
  props,
) => {
  // Use headless registration hook for business logic
  const registration = useRegistration({
    client: props.apiBaseUrl,
    mode: 'passwordless',
    onSuccess: props.onSuccess,
    onError: props.onError,
    requireInvitationCode: props.requireInvitationCode,
    autoRedirect: !!props.redirectUrl,
    redirectUrl: props.redirectUrl,
    redirectDelay: 2000,
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    registration.submit();
  };

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          No password required
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <Show when={registration.error()}>
            <Alert variant="error" class="mb-6">
              {registration.error()}
            </Alert>
          </Show>

          <Show when={registration.success()}>
            <Alert variant="success" class="mb-6">
              {registration.success()}
            </Alert>
          </Show>

          <form onSubmit={handleSubmit} class="space-y-6">
            {/* Email Field */}
            <div>
              <Label for="email" required>
                Email
              </Label>
              <div class="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  value={registration.email()}
                  onInput={(e) => registration.setEmail(e.currentTarget.value)}
                />
              </div>
            </div>

            {/* Username Field (Optional) */}
            <div>
              <Label for="username">Username (Optional)</Label>
              <div class="mt-1">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autocomplete="username"
                  value={registration.username()}
                  onInput={(e) => registration.setUsername(e.currentTarget.value)}
                />
              </div>
            </div>

            {/* Full Name Field (Optional) */}
            <div>
              <Label for="fullname">Full Name (Optional)</Label>
              <div class="mt-1">
                <Input
                  id="fullname"
                  name="fullname"
                  type="text"
                  autocomplete="name"
                  value={registration.fullname()}
                  onInput={(e) => registration.setFullname(e.currentTarget.value)}
                />
              </div>
            </div>

            {/* Invitation Code Field */}
            <div>
              <Label for="invitation_code" required={props.requireInvitationCode}>
                Invitation Code {!props.requireInvitationCode && '(Optional)'}
              </Label>
              <div class="mt-1">
                <Input
                  id="invitation_code"
                  name="invitation_code"
                  type="text"
                  value={registration.invitationCode()}
                  onInput={(e) => registration.setInvitationCode(e.currentTarget.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={registration.isLoading()}
                disabled={!registration.canSubmit() || registration.isLoading()}
              >
                {registration.isLoading() ? 'Creating account...' : 'Create Account'}
              </Button>
            </div>

            {/* Login Link */}
            <Show when={props.showLoginLink}>
              <div class="text-center text-sm">
                <a href="/login" class="text-blue-600 hover:text-blue-500">
                  Already have an account? Sign in
                </a>
              </div>
            </Show>
          </form>
        </div>
      </div>
    </div>
  );
};
