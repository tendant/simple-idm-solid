import { Component, Show } from 'solid-js';
import { useLogin } from '~/headless/useLogin';
import { Input } from '~/primitives/Input';
import { Button } from '~/primitives/Button';
import { Label } from '~/primitives/Label';
import { Alert } from '~/primitives/Alert';
import type { LoginResponse } from '~/types/api';
import type { ThemeConfig } from '~/types/theme';

export interface LoginFormProps {
  /**
   * Base URL of the simple-idm backend (e.g., http://localhost:4000)
   * If omitted, uses relative URLs (assumes same origin)
   * @default undefined (same origin)
   */
  apiBaseUrl?: string;
  /** Callback called on successful login */
  onSuccess?: (response: LoginResponse) => void;
  /** Callback called on error */
  onError?: (error: string) => void;
  /** Redirect URL after login (optional) */
  redirectUrl?: string;
  /** Show link to magic link login */
  showMagicLinkOption?: boolean;
  /** Show link to registration */
  showRegistrationLink?: boolean;
  /** Custom CSS class */
  class?: string;
  /** Theme configuration */
  theme?: ThemeConfig;
}

export const LoginForm: Component<LoginFormProps> = (props) => {
  // Use headless login hook for business logic
  const login = useLogin({
    client: props.apiBaseUrl,
    onSuccess: props.onSuccess,
    onError: props.onError,
    autoRedirect: !!props.redirectUrl,
    redirectUrl: props.redirectUrl,
    redirectDelay: 500,
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    login.submit();
  };

  return (
    <div class="w-full">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div class="w-full">
        <div class="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <Show when={login.error()}>
            <Alert variant="error" class="mb-6">
              {login.error()}
            </Alert>
          </Show>

          <Show when={login.success()}>
            <Alert variant="success" class="mb-6">
              {login.success()}
            </Alert>
          </Show>

          <form onSubmit={handleSubmit}>
            <div class="space-y-6">
              {/* Username/Email Field */}
              <div>
                <Label for="username" required>
                  Email or Username
                </Label>
                <div class="mt-1">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autocomplete="username email"
                    required
                    placeholder="your@email.com or username"
                    value={login.username()}
                    onInput={(e) => login.setUsername(e.currentTarget.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <Label for="password" required>
                  Password
                </Label>
                <div class="mt-1">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    required
                    value={login.password()}
                    onInput={(e) => login.setPassword(e.currentTarget.value)}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div class="mt-8">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={login.isLoading()}
                disabled={!login.canSubmit() || login.isLoading()}
              >
                {login.isLoading() ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>

            {/* Links */}
            <Show when={props.showMagicLinkOption || props.showRegistrationLink}>
              <div class="text-center text-sm space-y-2">
                <Show when={props.showMagicLinkOption}>
                  <div>
                    <a
                      href="/magic-link"
                      class="text-blue-600 hover:text-blue-500"
                    >
                      Use magic link instead
                    </a>
                  </div>
                </Show>
                <Show when={props.showRegistrationLink}>
                  <div>
                    <a
                      href="/register"
                      class="text-blue-600 hover:text-blue-500"
                    >
                      Don't have an account? Sign up
                    </a>
                  </div>
                </Show>
              </div>
            </Show>
          </form>
        </div>
      </div>
    </div>
  );
};
