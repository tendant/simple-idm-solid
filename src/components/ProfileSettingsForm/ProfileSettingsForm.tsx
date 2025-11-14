import { Component, Show, createSignal } from 'solid-js';
import { useProfile } from '~/headless/useProfile';
import type { ProfileOperation } from '~/headless/useProfile';
import { Input } from '~/primitives/Input';
import { Button } from '~/primitives/Button';
import { Label } from '~/primitives/Label';
import { Alert } from '~/primitives/Alert';
import type { ProfileUpdateResponse } from '~/types/api';
import type { ThemeConfig } from '~/types/theme';

export interface ProfileSettingsFormProps {
  /**
   * Base URL of the simple-idm backend (e.g., http://localhost:4000)
   * If omitted, uses relative URLs (assumes same origin)
   * @default undefined (same origin)
   */
  apiBaseUrl?: string;
  /** Callback called on successful profile update */
  onSuccess?: (response: ProfileUpdateResponse, operation: ProfileOperation) => void;
  /** Callback called on error */
  onError?: (error: string, operation: ProfileOperation) => void;
  /** Default active tab */
  defaultTab?: 'username' | 'phone' | 'password';
  /** Show phone tab (default: true) */
  showPhoneTab?: boolean;
  /** Custom CSS class */
  class?: string;
  /** Theme configuration */
  theme?: ThemeConfig;
}

export const ProfileSettingsForm: Component<ProfileSettingsFormProps> = (props) => {
  const showPhoneTab = props.showPhoneTab ?? true;
  const [activeTab, setActiveTab] = createSignal<'username' | 'phone' | 'password'>(
    props.defaultTab || 'username',
  );

  // Use headless profile hook for business logic
  const profile = useProfile({
    client: props.apiBaseUrl,
    onSuccess: props.onSuccess,
    onError: props.onError,
  });

  const handleUsernameSubmit = (e: Event) => {
    e.preventDefault();
    profile.updateUsername();
  };

  const handlePhoneSubmit = (e: Event) => {
    e.preventDefault();
    profile.updatePhone();
  };

  const handlePasswordSubmit = (e: Event) => {
    e.preventDefault();
    profile.updatePassword();
  };

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-3xl font-extrabold text-gray-900">Profile Settings</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Update your account information
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          {/* Tab Navigation */}
          <div class="border-b border-gray-200 mb-6">
            <nav class="flex -mb-px space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab('username')}
                class={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab() === 'username'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Username
              </button>
              <Show when={showPhoneTab}>
                <button
                  type="button"
                  onClick={() => setActiveTab('phone')}
                  class={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab() === 'phone'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Phone
                </button>
              </Show>
              <button
                type="button"
                onClick={() => setActiveTab('password')}
                class={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab() === 'password'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Password
              </button>
            </nav>
          </div>

          {/* Global Alerts */}
          <Show when={profile.success()}>
            <Alert variant="success" class="mb-6">
              {profile.success()}
            </Alert>
          </Show>

          <Show when={profile.error()}>
            <Alert variant="error" class="mb-6">
              {profile.error()}
            </Alert>
          </Show>

          {/* Username Tab */}
          <Show when={activeTab() === 'username'}>
            <form onSubmit={handleUsernameSubmit} class="space-y-6">
              <div>
                <Label for="new-username" required>
                  New Username
                </Label>
                <div class="mt-1">
                  <Input
                    id="new-username"
                    name="username"
                    type="text"
                    autocomplete="username"
                    required
                    value={profile.username()}
                    onInput={(e) => profile.setUsername(e.currentTarget.value)}
                    placeholder="Enter new username"
                  />
                </div>
              </div>

              <div>
                <Label for="username-password" required>
                  Current Password
                </Label>
                <div class="mt-1">
                  <Input
                    id="username-password"
                    name="current-password"
                    type="password"
                    autocomplete="current-password"
                    required
                    value={profile.usernameCurrentPassword()}
                    onInput={(e) => profile.setUsernameCurrentPassword(e.currentTarget.value)}
                    placeholder="Verify with your current password"
                  />
                  <p class="mt-2 text-sm text-gray-500">
                    Required for verification
                  </p>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={profile.isLoading() && profile.currentOperation() === 'username'}
                  disabled={
                    !profile.canSubmitUsername() ||
                    (profile.isLoading() && profile.currentOperation() === 'username')
                  }
                >
                  {profile.isLoading() && profile.currentOperation() === 'username'
                    ? 'Updating...'
                    : 'Update Username'}
                </Button>
              </div>
            </form>
          </Show>

          {/* Phone Tab */}
          <Show when={activeTab() === 'phone' && showPhoneTab}>
            <form onSubmit={handlePhoneSubmit} class="space-y-6">
              <div>
                <Label for="phone" required>
                  Phone Number
                </Label>
                <div class="mt-1">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autocomplete="tel"
                    required
                    value={profile.phone()}
                    onInput={(e) => profile.setPhone(e.currentTarget.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                  <p class="mt-2 text-sm text-gray-500">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={profile.isLoading() && profile.currentOperation() === 'phone'}
                  disabled={
                    !profile.canSubmitPhone() ||
                    (profile.isLoading() && profile.currentOperation() === 'phone')
                  }
                >
                  {profile.isLoading() && profile.currentOperation() === 'phone'
                    ? 'Updating...'
                    : 'Update Phone'}
                </Button>
              </div>
            </form>
          </Show>

          {/* Password Tab */}
          <Show when={activeTab() === 'password'}>
            <form onSubmit={handlePasswordSubmit} class="space-y-6">
              <div>
                <Label for="current-password" required>
                  Current Password
                </Label>
                <div class="mt-1">
                  <Input
                    id="current-password"
                    name="current-password"
                    type="password"
                    autocomplete="current-password"
                    required
                    value={profile.currentPassword()}
                    onInput={(e) => profile.setCurrentPassword(e.currentTarget.value)}
                    placeholder="Enter current password"
                  />
                </div>
              </div>

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
                    value={profile.newPassword()}
                    onInput={(e) => profile.setNewPassword(e.currentTarget.value)}
                    placeholder="Enter new password"
                  />
                </div>
                {/* Password Strength Indicator */}
                <Show when={profile.newPassword()}>
                  <div class="mt-2">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          class={`h-full transition-all duration-300 ${profile.passwordStrength().color}`}
                          style={{ width: `${profile.passwordStrength().percentage}%` }}
                        />
                      </div>
                      <span class="text-xs text-gray-600 min-w-[60px]">
                        {profile.passwordStrength().text}
                      </span>
                    </div>
                  </div>
                </Show>
              </div>

              <div>
                <Label for="confirm-new-password" required>
                  Confirm New Password
                </Label>
                <div class="mt-1">
                  <Input
                    id="confirm-new-password"
                    name="confirm-new-password"
                    type="password"
                    autocomplete="new-password"
                    required
                    value={profile.confirmNewPassword()}
                    onInput={(e) => profile.setConfirmNewPassword(e.currentTarget.value)}
                    placeholder="Confirm new password"
                    error={!profile.passwordsMatch() && !!profile.confirmNewPassword()}
                    helperText={
                      !profile.passwordsMatch() && profile.confirmNewPassword()
                        ? 'Passwords do not match'
                        : undefined
                    }
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={profile.isLoading() && profile.currentOperation() === 'password'}
                  disabled={
                    !profile.canSubmitPassword() ||
                    (profile.isLoading() && profile.currentOperation() === 'password')
                  }
                >
                  {profile.isLoading() && profile.currentOperation() === 'password'
                    ? 'Updating...'
                    : 'Update Password'}
                </Button>
              </div>
            </form>
          </Show>
        </div>
      </div>
    </div>
  );
};
