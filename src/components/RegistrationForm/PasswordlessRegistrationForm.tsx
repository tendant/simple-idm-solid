import { Component, Show, createSignal } from 'solid-js';
import { SimpleIdmClient } from '~/api/client';
import { useForm, validators } from '~/hooks/useForm';
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
      email: '',
      username: '',
      fullname: '',
      invitation_code: '',
    },
    validate: {
      email: [validators.required('Email is required'), validators.email()],
      ...(props.requireInvitationCode && {
        invitation_code: validators.required('Invitation code is required'),
      }),
    },
    onSubmit: async (values) => {
      try {
        setError(null);
        setSuccess(null);

        const data = {
          email: values.email,
          ...(values.username && { username: values.username }),
          ...(values.fullname && { fullname: values.fullname }),
          ...(values.invitation_code && { invitation_code: values.invitation_code }),
        };

        const response = await client.signupPasswordless(data);
        setSuccess(
          response.message ||
            'Account created successfully! Please check your email to complete registration.',
        );
        props.onSuccess?.(response);

        // Redirect after success
        if (props.redirectUrl) {
          setTimeout(() => {
            window.location.href = props.redirectUrl!;
          }, 2000);
        }

        // Reset form
        form.reset();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        setError(message);
        props.onError?.(message);
      }
    },
  });

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
                  value={form.values.email}
                  onInput={(e) => form.handleChange('email', e.currentTarget.value)}
                  onBlur={() => form.handleBlur('email')}
                  error={form.touched.email && !!form.errors.email}
                  helperText={form.touched.email ? form.errors.email : undefined}
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
                  value={form.values.username}
                  onInput={(e) => form.handleChange('username', e.currentTarget.value)}
                  onBlur={() => form.handleBlur('username')}
                  error={form.touched.username && !!form.errors.username}
                  helperText={form.touched.username ? form.errors.username : undefined}
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
                  value={form.values.fullname}
                  onInput={(e) => form.handleChange('fullname', e.currentTarget.value)}
                  onBlur={() => form.handleBlur('fullname')}
                  error={form.touched.fullname && !!form.errors.fullname}
                  helperText={form.touched.fullname ? form.errors.fullname : undefined}
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
                  value={form.values.invitation_code}
                  onInput={(e) =>
                    form.handleChange('invitation_code', e.currentTarget.value)
                  }
                  onBlur={() => form.handleBlur('invitation_code')}
                  error={form.touched.invitation_code && !!form.errors.invitation_code}
                  helperText={
                    form.touched.invitation_code ? form.errors.invitation_code : undefined
                  }
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
                {form.isSubmitting() ? 'Creating account...' : 'Create Account'}
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
