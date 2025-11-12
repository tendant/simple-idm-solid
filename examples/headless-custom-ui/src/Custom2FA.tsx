/**
 * Custom 2FA Setup Example
 *
 * Demonstrates how to use the use2FA headless hook to build
 * a completely custom two-factor authentication setup UI.
 */

import { use2FA } from '@tendant/simple-idm-solid';
import { Show, createSignal } from 'solid-js';
import './custom-2fa.css';

export function Custom2FA() {
  const twoFA = use2FA({
    client: 'http://localhost:4000',
    onSuccess: (response, operation) => {
      console.log(`2FA ${operation} successful!`, response);
    },
    onError: (error, operation) => {
      console.error(`2FA ${operation} failed:`, error);
    },
    autoLoadStatus: true,
  });

  const [setupStep, setSetupStep] = createSignal<'select' | 'qr' | 'verify'>('select');

  const handleSetupTOTP = async () => {
    await twoFA.setupTOTP();
    setSetupStep('qr');
  };

  const handleEnableWithCode = async () => {
    await twoFA.enable();
    if (twoFA.success()) {
      setSetupStep('select');
      twoFA.clearSetupData();
    }
  };

  return (
    <div class="custom-2fa">
      <div class="2fa-header">
        <h2>Two-Factor Authentication</h2>
        <p>Add an extra layer of security to your account</p>
      </div>

      {/* Global Messages */}
      <Show when={twoFA.success()}>
        <div class="alert success">
          <span class="icon">✓</span>
          {twoFA.success()}
          <button class="close" onClick={() => twoFA.clearSuccess()}>×</button>
        </div>
      </Show>

      <Show when={twoFA.error()}>
        <div class="alert error">
          <span class="icon">✗</span>
          {twoFA.error()}
          <button class="close" onClick={() => twoFA.clearError()}>×</button>
        </div>
      </Show>

      {/* Current Status */}
      <div class="status-card">
        <h3>Current Status</h3>
        <div class="status-row">
          <span class="label">2FA Enabled:</span>
          <span class={`badge ${twoFA.isEnabled() ? 'success' : 'warning'}`}>
            {twoFA.isEnabled() ? 'Yes' : 'No'}
          </span>
        </div>
        <Show when={twoFA.enabledTypes().length > 0}>
          <div class="status-row">
            <span class="label">Active Methods:</span>
            <div class="methods">
              {twoFA.enabledTypes().map((type) => (
                <span class="method-badge">{type.toUpperCase()}</span>
              ))}
            </div>
          </div>
        </Show>
      </div>

      {/* Setup Flow */}
      <Show when={!twoFA.isEnabled()}>
        <div class="setup-section">
          <h3>Setup Two-Factor Authentication</h3>

          {/* Step 1: Select Method */}
          <Show when={setupStep() === 'select'}>
            <div class="method-selection">
              <div class="method-card">
                <div class="method-icon">📱</div>
                <h4>Authenticator App</h4>
                <p>Use an authenticator app like Google Authenticator or Authy</p>
                <button
                  class="btn btn-primary"
                  onClick={handleSetupTOTP}
                  disabled={twoFA.isLoading()}
                >
                  {twoFA.isLoading() ? 'Setting up...' : 'Setup TOTP'}
                </button>
              </div>

              <div class="method-card">
                <div class="method-icon">📧</div>
                <h4>Email Code</h4>
                <p>Receive verification codes via email</p>
                <button class="btn btn-secondary" disabled>
                  Coming Soon
                </button>
              </div>

              <div class="method-card">
                <div class="method-icon">💬</div>
                <h4>SMS Code</h4>
                <p>Receive verification codes via text message</p>
                <button class="btn btn-secondary" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </Show>

          {/* Step 2: Scan QR Code */}
          <Show when={setupStep() === 'qr' && twoFA.qrCode()}>
            <div class="qr-step">
              <h4>Scan QR Code</h4>
              <p>Use your authenticator app to scan this QR code:</p>

              <div class="qr-code-container">
                <img src={twoFA.qrCode()!} alt="TOTP QR Code" class="qr-code" />
              </div>

              <div class="secret-key">
                <p class="label">Or enter this key manually:</p>
                <code class="secret">{twoFA.secret()}</code>
              </div>

              <Show when={twoFA.backupCodes()}>
                <div class="backup-codes">
                  <p class="label">Save these backup codes:</p>
                  <div class="codes">
                    {twoFA.backupCodes()!.map((code) => (
                      <code class="code">{code}</code>
                    ))}
                  </div>
                  <p class="warning">
                    ⚠️ Keep these codes safe. You can use them to access your account if you lose
                    your authenticator device.
                  </p>
                </div>
              </Show>

              <button
                class="btn btn-primary"
                onClick={() => setSetupStep('verify')}
              >
                Next: Verify Code
              </button>

              <button
                class="btn btn-link"
                onClick={() => {
                  setSetupStep('select');
                  twoFA.clearSetupData();
                }}
              >
                Cancel
              </button>
            </div>
          </Show>

          {/* Step 3: Verify Code */}
          <Show when={setupStep() === 'verify'}>
            <div class="verify-step">
              <h4>Enter Verification Code</h4>
              <p>Enter the 6-digit code from your authenticator app:</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEnableWithCode();
                }}
              >
                <div class="form-group">
                  <input
                    type="text"
                    value={twoFA.code()}
                    onInput={(e) => twoFA.setCode(e.currentTarget.value)}
                    placeholder="000000"
                    maxLength={6}
                    class="code-input"
                    autofocus
                  />
                </div>

                <div class="button-group">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    disabled={!twoFA.canEnable() || twoFA.isLoading()}
                  >
                    {twoFA.isLoading() ? 'Verifying...' : 'Enable 2FA'}
                  </button>

                  <button
                    type="button"
                    class="btn btn-link"
                    onClick={() => setSetupStep('qr')}
                  >
                    Back
                  </button>
                </div>
              </form>
            </div>
          </Show>
        </div>
      </Show>

      {/* Disable 2FA */}
      <Show when={twoFA.isEnabled()}>
        <div class="disable-section">
          <h3>Manage 2FA</h3>
          <p>Disable two-factor authentication if you no longer need it.</p>

          <div class="enabled-methods">
            {twoFA.enabledTypes().map((type) => (
              <div class="method-row">
                <span class="method-name">{type.toUpperCase()}</span>
                <button
                  class="btn btn-danger"
                  onClick={() => twoFA.disable(type as any)}
                  disabled={twoFA.isLoading()}
                >
                  {twoFA.isLoading() ? 'Disabling...' : 'Disable'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </Show>
    </div>
  );
}
