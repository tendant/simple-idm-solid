import { Component, Show } from 'solid-js';
import { useMagicLink } from '~/headless/useMagicLink';
import { Input } from '~/primitives/Input';
import { Button } from '~/primitives/Button';
import { Label } from '~/primitives/Label';
import { Alert } from '~/primitives/Alert';
import type { ThemeConfig } from '~/types/theme';

export interface MagicLinkFormProps {
  /**
   * Base URL of the simple-idm backend (e.g., http://localhost:4000)
   * If omitted, uses relative URLs (assumes same origin)
   * @default undefined (same origin)
   */
  apiBaseUrl?: string;
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
  // Use headless magic link hook for business logic
  const magicLink = useMagicLink({
    client: props.apiBaseUrl,
    onSuccess: props.onSuccess,
    onError: props.onError,
    cooldownSeconds: 60,
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    magicLink.submit();
  };

  return (
    <div class="w-full">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-extrabold text-gray-900">
          Magic Link Login
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          We'll email you a link to sign in
        </p>
      </div>

      <div class="w-full">
        <div class="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <Show when={magicLink.error()}>
            <Alert variant="error" class="mb-6">
              {magicLink.error()}
            </Alert>
          </Show>

          <Show when={magicLink.success()}>
            <Alert variant="success" class="mb-6">
              <div>
                <p class="font-medium">{magicLink.success()}</p>
                <p class="mt-2 text-sm">
                  Check your email. The link expires in 1 hour.
                </p>
              </div>
            </Alert>
          </Show>

          <form onSubmit={handleSubmit} class="space-y-6">
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
                  value={magicLink.username()}
                  onInput={(e) => magicLink.setUsername(e.currentTarget.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={magicLink.isLoading()}
                disabled={!magicLink.canSubmit() || magicLink.isLoading()}
              >
                {magicLink.isLoading()
                  ? 'Sending...'
                  : magicLink.cooldown() > 0
                    ? `Resend in ${magicLink.cooldown()}s`
                    : 'Send Magic Link'}
              </Button>
            </div>

            {/* Resend Button (after success) */}
            <Show when={magicLink.success() && magicLink.canResend()}>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => magicLink.resend()}
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
