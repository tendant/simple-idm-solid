import { Component, Show, createSignal } from 'solid-js';
import { use2FA } from '~/headless/use2FA';
import type { TwoFAOperation } from '~/headless/use2FA';
import { Input } from '~/primitives/Input';
import { Button } from '~/primitives/Button';
import { Label } from '~/primitives/Label';
import { Alert } from '~/primitives/Alert';
import type { ProfileUpdateResponse, Setup2FAResponse } from '~/types/api';
import type { ThemeConfig } from '~/types/theme';

export interface TwoFactorAuthSetupProps {
  /**
   * Base URL of the simple-idm backend (e.g., http://localhost:4000)
   * If omitted, uses relative URLs (assumes same origin)
   * @default undefined (same origin)
   */
  apiBaseUrl?: string;
  /** Callback called on successful 2FA operation */
  onSuccess?: (
    response: ProfileUpdateResponse | Setup2FAResponse,
    operation: TwoFAOperation,
  ) => void;
  /** Callback called on error */
  onError?: (error: string, operation: TwoFAOperation) => void;
  /** Auto-load 2FA status on mount (default: true) */
  autoLoadStatus?: boolean;
  /** Custom CSS class */
  class?: string;
  /** Theme configuration */
  theme?: ThemeConfig;
}

export const TwoFactorAuthSetup: Component<TwoFactorAuthSetupProps> = (props) => {
  const [setupStep, setSetupStep] = createSignal<'select' | 'qr' | 'verify'>('select');

  // Use headless 2FA hook for business logic
  const twoFA = use2FA({
    client: props.apiBaseUrl,
    autoLoadStatus: props.autoLoadStatus ?? true,
    onSuccess: (response, operation) => {
      props.onSuccess?.(response as any, operation);
      // Reset setup flow after successful enable
      if (operation === 'enable') {
        setSetupStep('select');
        twoFA.clearSetupData();
      }
    },
    onError: props.onError,
  });

  const handleSetupTOTP = async () => {
    await twoFA.setupTOTP();
    if (!twoFA.error()) {
      setSetupStep('qr');
    }
  };

  const handleEnableSubmit = async (e: Event) => {
    e.preventDefault();
    await twoFA.enable();
  };

  const handleCancelSetup = () => {
    setSetupStep('select');
    twoFA.clearSetupData();
    twoFA.setCode('');
  };

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-3xl font-extrabold text-gray-900">
          Two-Factor Authentication
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Add an extra layer of security to your account
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          {/* Global Alerts */}
          <Show when={twoFA.success()}>
            <Alert variant="success" class="mb-6">
              {twoFA.success()}
            </Alert>
          </Show>

          <Show when={twoFA.error()}>
            <Alert variant="error" class="mb-6">
              {twoFA.error()}
            </Alert>
          </Show>

          {/* Current Status */}
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">2FA Status</p>
                <p class="text-sm text-gray-500">
                  {twoFA.isEnabled() ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div>
                <span
                  class={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    twoFA.isEnabled()
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {twoFA.isEnabled() ? '✓ Active' : '○ Inactive'}
                </span>
              </div>
            </div>
            <Show when={twoFA.enabledTypes().length > 0}>
              <div class="mt-2">
                <p class="text-xs text-gray-500">Active methods:</p>
                <div class="mt-1 flex gap-2">
                  {twoFA.enabledTypes().map((type) => (
                    <span class="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      {type.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </Show>
          </div>

          {/* Setup Flow (when 2FA is not enabled) */}
          <Show when={!twoFA.isEnabled()}>
            {/* Step 1: Select Method */}
            <Show when={setupStep() === 'select'}>
              <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Setup 2FA</h3>

                <button
                  type="button"
                  onClick={handleSetupTOTP}
                  disabled={twoFA.isLoading()}
                  class="w-full flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div class="flex-shrink-0 text-3xl">📱</div>
                  <div class="ml-4 flex-1 text-left">
                    <p class="text-sm font-medium text-gray-900">Authenticator App</p>
                    <p class="text-xs text-gray-500">
                      Use Google Authenticator, Authy, or similar
                    </p>
                  </div>
                  <div class="ml-4">
                    <svg
                      class="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>

                <div class="relative">
                  <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300" />
                  </div>
                  <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-white text-gray-500">Coming soon</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled
                  class="w-full flex items-center p-4 border-2 border-gray-200 rounded-lg opacity-50 cursor-not-allowed"
                >
                  <div class="flex-shrink-0 text-3xl">📧</div>
                  <div class="ml-4 flex-1 text-left">
                    <p class="text-sm font-medium text-gray-900">Email Code</p>
                    <p class="text-xs text-gray-500">Receive codes via email</p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled
                  class="w-full flex items-center p-4 border-2 border-gray-200 rounded-lg opacity-50 cursor-not-allowed"
                >
                  <div class="flex-shrink-0 text-3xl">💬</div>
                  <div class="ml-4 flex-1 text-left">
                    <p class="text-sm font-medium text-gray-900">SMS Code</p>
                    <p class="text-xs text-gray-500">Receive codes via text message</p>
                  </div>
                </button>
              </div>
            </Show>

            {/* Step 2: Scan QR Code */}
            <Show when={setupStep() === 'qr' && twoFA.qrCode()}>
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Scan QR Code</h3>
                  <p class="text-sm text-gray-600">
                    Open your authenticator app and scan this QR code
                  </p>
                </div>

                <div class="flex justify-center p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img
                    src={twoFA.qrCode()!}
                    alt="TOTP QR Code"
                    class="w-48 h-48"
                  />
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-xs font-medium text-gray-700 mb-2">
                    Can't scan? Enter this key manually:
                  </p>
                  <code class="block p-2 bg-white border border-gray-300 rounded text-sm font-mono break-all">
                    {twoFA.secret()}
                  </code>
                </div>

                <Show when={twoFA.backupCodes() && twoFA.backupCodes()!.length > 0}>
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p class="text-sm font-medium text-yellow-900 mb-2">
                      ⚠️ Save your backup codes
                    </p>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                      {twoFA.backupCodes()!.map((code) => (
                        <code class="block p-2 bg-white rounded text-xs font-mono text-center">
                          {code}
                        </code>
                      ))}
                    </div>
                    <p class="text-xs text-yellow-700">
                      Store these codes safely. You can use them to access your account if you lose
                      your authenticator device.
                    </p>
                  </div>
                </Show>

                <div class="flex gap-3">
                  <Button
                    type="button"
                    variant="primary"
                    fullWidth
                    onClick={() => setSetupStep('verify')}
                  >
                    Next: Verify Code
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleCancelSetup}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Show>

            {/* Step 3: Verify Code */}
            <Show when={setupStep() === 'verify'}>
              <form onSubmit={handleEnableSubmit} class="space-y-6">
                <div>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Enter Verification Code</h3>
                  <p class="text-sm text-gray-600">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div>
                  <Label for="verification-code" required>
                    Verification Code
                  </Label>
                  <div class="mt-1">
                    <Input
                      id="verification-code"
                      name="code"
                      type="text"
                      inputmode="numeric"
                      pattern="[0-9]{6}"
                      maxlength={6}
                      required
                      value={twoFA.code()}
                      onInput={(e) => twoFA.setCode(e.currentTarget.value)}
                      placeholder="000000"
                      class="text-center text-2xl tracking-widest font-mono"
                    />
                  </div>
                </div>

                <div class="flex gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={twoFA.isLoading()}
                    disabled={!twoFA.canEnable() || twoFA.isLoading()}
                  >
                    {twoFA.isLoading() ? 'Verifying...' : 'Enable 2FA'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setSetupStep('qr')}>
                    Back
                  </Button>
                </div>
              </form>
            </Show>
          </Show>

          {/* Manage Enabled 2FA */}
          <Show when={twoFA.isEnabled()}>
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900">Manage 2FA</h3>
              <p class="text-sm text-gray-600">
                Two-factor authentication is currently enabled. You can disable it below.
              </p>

              <div class="space-y-3">
                {twoFA.enabledTypes().map((type) => (
                  <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div class="flex items-center">
                      <div class="text-2xl mr-3">
                        {type === 'totp' ? '📱' : type === 'email' ? '📧' : '💬'}
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{type.toUpperCase()}</p>
                        <p class="text-xs text-gray-500">
                          {type === 'totp'
                            ? 'Authenticator app'
                            : type === 'email'
                              ? 'Email code'
                              : 'SMS code'}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => twoFA.disable(type as any)}
                      loading={twoFA.isLoading() && twoFA.currentOperation() === 'disable'}
                      disabled={twoFA.isLoading()}
                    >
                      Disable
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};
