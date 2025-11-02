import { Component, Show, createSignal } from 'solid-js';
import { SimpleIdmClient } from '~/api/client';
import { useForm, validators } from '~/hooks/useForm';
import { Input } from '~/primitives/Input';
import { Button } from '~/primitives/Button';
import { Label } from '~/primitives/Label';
import { Alert } from '~/primitives/Alert';
import type { ThemeConfig } from '~/types/theme';

export interface MagicLinkFormProps {
  /** Base URL of the simple-idm backend (e.g., http://localhost:4000) */
  apiBaseUrl: string;
  /** Callback called after magic link is sent successfully */
  onSuccess?: () => void;
  /** Callback called on error */
  onError?: (error: string) => void;
  /** Show link back to password login */
  showPasswordLoginLink?: boolean;
  /** Custom CSS class */
  class?: string;
  /** Theme configuration */
  theme?: ThemeConfig;
}

export const MagicLinkForm: Component<MagicLinkFormProps> = (props) => {
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);
  const [cooldown, setCooldown] = createSignal(0);

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
    },
    validate: {
      username: validators.required('Email or username is required'),
    },
    onSubmit: async (values) => {
      try {
        setError(null);
        setSuccess(null);

        const response = await client.requestMagicLink(values);
        setSuccess(response.message || 'Magic link sent! Please check your email.');
        props.onSuccess?.();

        // Set cooldown timer (60 seconds)
        setCooldown(60);
        const interval = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send magic link';
        setError(message);
        props.onError?.(message);
      }
    },
  });

  const handleResend = async () => {
    if (cooldown() > 0) return;
    await form.handleSubmit(new Event('submit'));
  };

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-3xl font-extrabold text-gray-900">
          Magic Link Login
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Enter your email or username to receive a login link
        </p>
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
              <div>
                <p class="font-medium">{success()}</p>
                <p class="mt-2 text-sm">
                  The link will expire in 1 hour. If you don't receive the email, check
                  your spam folder or try again.
                </p>
              </div>
            </Alert>
          </Show>

          <form onSubmit={form.handleSubmit} class="space-y-6">
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
                  value={form.values.username}
                  onInput={(e) => form.handleChange('username', e.currentTarget.value)}
                  onBlur={() => form.handleBlur('username')}
                  error={form.touched.username && !!form.errors.username}
                  helperText={form.touched.username ? form.errors.username : undefined}
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
                disabled={form.isSubmitting() || cooldown() > 0}
              >
                {form.isSubmitting()
                  ? 'Sending...'
                  : cooldown() > 0
                    ? `Resend in ${cooldown()}s`
                    : 'Send Magic Link'}
              </Button>
            </div>

            {/* Resend Button (after success) */}
            <Show when={success() && cooldown() === 0}>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={handleResend}
                >
                  Resend Magic Link
                </Button>
              </div>
            </Show>

            {/* Links */}
            <Show when={props.showPasswordLoginLink}>
              <div class="text-center text-sm">
                <a href="/login" class="text-blue-600 hover:text-blue-500">
                  Back to password login
                </a>
              </div>
            </Show>
          </form>
        </div>
      </div>
    </div>
  );
};
