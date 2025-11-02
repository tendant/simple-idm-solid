import { Component, Show, createSignal } from 'solid-js';
import { SimpleIdmClient } from '~/api/client';
import { useForm, validators } from '~/hooks/useForm';
import { Input } from '~/primitives/Input';
import { Button } from '~/primitives/Button';
import { Label } from '~/primitives/Label';
import { Alert } from '~/primitives/Alert';
import type { LoginResponse } from '~/types/api';
import type { ThemeConfig } from '~/types/theme';

export interface LoginFormProps {
  /** Base URL of the simple-idm backend (e.g., http://localhost:4000) */
  apiBaseUrl: string;
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
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);

  const client = new SimpleIdmClient({
    baseUrl: props.apiBaseUrl,
    onError: (err) => {
      setError(err.message);
      props.onError?.(err.message);
    },
  });

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: validators.required('Username is required'),
      password: validators.required('Password is required'),
    },
    onSubmit: async (values) => {
      try {
        setError(null);
        setSuccess(null);

        const response = await client.login(values);

        // Handle successful login
        if (response.status === 'success') {
          setSuccess('Login successful!');
          props.onSuccess?.(response);

          // Redirect if specified
          if (props.redirectUrl) {
            setTimeout(() => {
              window.location.href = props.redirectUrl!;
            }, 500);
          }
        }
        // Note: 2FA and multiple users scenarios should be handled by parent
        else if (response.status === '2fa_required') {
          props.onSuccess?.(response);
        } else if (response.status === 'multiple_users') {
          props.onSuccess?.(response);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        props.onError?.(message);
      }
    },
  });

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <Show when={error()}>
            <Alert variant="error" class="mb-6">
              {error()}
            </Alert>
          </Show>

          <Show when={success()}>
            <Alert variant="success" class="mb-6">
              {success()}
            </Alert>
          </Show>

          <form onSubmit={form.handleSubmit} class="space-y-6">
            {/* Username Field */}
            <div>
              <Label for="username" required>
                Username
              </Label>
              <div class="mt-1">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autocomplete="username"
                  required
                  value={form.values.username}
                  onInput={(e) => form.handleChange('username', e.currentTarget.value)}
                  onBlur={() => form.handleBlur('username')}
                  error={form.touched.username && !!form.errors.username}
                  helperText={form.touched.username ? form.errors.username : undefined}
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
                  value={form.values.password}
                  onInput={(e) => form.handleChange('password', e.currentTarget.value)}
                  onBlur={() => form.handleBlur('password')}
                  error={form.touched.password && !!form.errors.password}
                  helperText={form.touched.password ? form.errors.password : undefined}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={form.isSubmitting()}
                disabled={form.isSubmitting()}
              >
                {form.isSubmitting() ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>

            {/* Links */}
            <Show when={props.showMagicLinkOption || props.showRegistrationLink}>
              <div class="text-center text-sm space-y-2">
                <Show when={props.showMagicLinkOption}>
                  <div>
                    <a
                      href="/magic-link-login"
                      class="text-blue-600 hover:text-blue-500"
                    >
                      Login with magic link
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
