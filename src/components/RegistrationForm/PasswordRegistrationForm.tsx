import { Component, Show } from 'solid-js';
import { useRegistration } from '~/headless/useRegistration';
import { Input } from '~/primitives/Input';
import { Button } from '~/primitives/Button';
import { Label } from '~/primitives/Label';
import { Alert } from '~/primitives/Alert';
import type { SignupResponse } from '~/types/api';
import type { ThemeConfig } from '~/types/theme';

export interface PasswordRegistrationFormProps {
  /**
   * Base URL of the simple-idm backend (e.g., http://localhost:4000)
   * If omitted, uses relative URLs (assumes same origin)
   * @default undefined (same origin)
   */
  apiBaseUrl?: string;
  /** Callback called on successful registration */
  onSuccess?: (response: SignupResponse) => void;
  /** Callback called on error */
  onError?: (error: string) => void;
  /** Require invitation code for registration */
  requireInvitationCode?: boolean;
  /** Show invitation code field (default: false) */
  showInvitationCode?: boolean;
  /** Show link to login page */
  showLoginLink?: boolean;
  /** Redirect URL after registration */
  redirectUrl?: string;
  /** Custom CSS class */
  class?: string;
  /** Theme configuration */
  theme?: ThemeConfig;
  /** Make password optional (allows passwordless registration with just email) */
  optionalPassword?: boolean;
  /** Show username field (default: false, hidden unless explicitly set to true) */
  showUsername?: boolean;
  /** Show confirm password field (default: false, hidden unless explicitly set to true) */
  showConfirmPassword?: boolean;
}

export const PasswordRegistrationForm: Component<PasswordRegistrationFormProps> = (props) => {
  // Determine if password is truly optional (either via optionalPassword prop or when confirm is hidden)
  const isPasswordOptional = () => props.optionalPassword || props.showConfirmPassword === false;

  // Use headless registration hook for business logic
  const registration = useRegistration({
    client: props.apiBaseUrl,
    mode: props.optionalPassword ? 'passwordless' : 'password',
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
    <div class="w-full">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p class="mt-2 text-sm text-gray-600">
          {props.optionalPassword ? 'Sign up with your email' : 'Sign up with a password'}
        </p>
      </div>

      <div class="w-full">
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

          <form onSubmit={handleSubmit}>
            <div class="space-y-6">
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

              {/* Username Field (Conditionally shown) */}
              <Show when={props.showUsername === true}>
                <div>
                  <Label for="username" required={!props.optionalPassword}>
                    Username {props.optionalPassword && '(Optional)'}
                  </Label>
                  <div class="mt-1">
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      autocomplete="username"
                      required={!props.optionalPassword}
                      value={registration.username()}
                      onInput={(e) => registration.setUsername(e.currentTarget.value)}
                    />
                  </div>
                </div>
              </Show>

              {/* Password Field (shown when not in passwordless mode) */}
              <Show when={!props.optionalPassword}>
                <div>
                  <Label for="password" required={!isPasswordOptional()}>
                    Password {isPasswordOptional() && '(Optional)'}
                  </Label>
                  <div class="mt-1">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autocomplete="new-password"
                      required={!isPasswordOptional()}
                      value={registration.password()}
                      onInput={(e) => registration.setPassword(e.currentTarget.value)}
                    />
                  </div>
                  {/* Password Strength Indicator */}
                  <Show when={registration.password()}>
                    <div class="mt-2">
                      <div class="flex items-center gap-2">
                        <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            class={`h-full transition-all duration-300 ${registration.passwordStrength().color}`}
                            style={{ width: `${registration.passwordStrength().percentage}%` }}
                          />
                        </div>
                        <span class="text-xs text-gray-600 min-w-[60px]">
                          {registration.passwordStrength().text}
                        </span>
                      </div>
                    </div>
                  </Show>
                </div>
              </Show>

              {/* Confirm Password Field (Conditionally shown) */}
              <Show when={props.showConfirmPassword === true && !props.optionalPassword}>
                <div>
                  <Label for="confirmPassword" required>
                    Confirm Password
                  </Label>
                  <div class="mt-1">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autocomplete="new-password"
                      required
                      value={registration.confirmPassword()}
                      onInput={(e) => registration.setConfirmPassword(e.currentTarget.value)}
                      error={!registration.passwordsMatch()}
                      helperText={
                        !registration.passwordsMatch() ? 'Passwords do not match' : undefined
                      }
                    />
                  </div>
                </div>
              </Show>

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
              <Show when={props.showInvitationCode === true}>
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
              </Show>
            </div>

            {/* Submit Button */}
            <div class="mt-8">
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
