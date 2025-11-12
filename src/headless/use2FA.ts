/**
 * use2FA - Headless two-factor authentication hook
 *
 * Provides 2FA setup, enable/disable, and validation logic without any UI.
 * Handles TOTP, SMS, and email-based 2FA flows.
 */

import { createSignal, createMemo, Accessor } from 'solid-js';
import { SimpleIdmClient } from '~/api/client';
import type {
  TwoFAStatus,
  Setup2FAResponse,
  ProfileUpdateResponse,
} from '~/types/api';

/**
 * 2FA method type
 */
export type TwoFAType = 'totp' | 'sms' | 'email';

/**
 * 2FA operation type
 */
export type TwoFAOperation =
  | 'status'
  | 'setup'
  | 'enable'
  | 'disable'
  | 'send_code'
  | 'validate';

/**
 * Configuration for the use2FA hook
 */
export interface Use2FAConfig {
  /**
   * API client instance or base URL string
   * - If string: Creates a new SimpleIdmClient with the URL
   * - If SimpleIdmClient: Uses the provided instance
   */
  client: SimpleIdmClient | string;

  /**
   * Callback invoked on successful 2FA operation
   */
  onSuccess?: (response: ProfileUpdateResponse | TwoFAStatus | Setup2FAResponse, operation: TwoFAOperation) => void;

  /**
   * Callback invoked when 2FA operation fails
   */
  onError?: (error: string, operation: TwoFAOperation) => void;

  /**
   * Automatically load 2FA status on mount
   * @default true
   */
  autoLoadStatus?: boolean;
}

/**
 * State and actions returned by use2FA
 */
export interface Use2FAReturn {
  // 2FA status
  /** Current 2FA status (enabled/disabled and types) */
  status: Accessor<TwoFAStatus | null>;
  /** Whether 2FA is currently enabled */
  isEnabled: Accessor<boolean>;
  /** List of enabled 2FA types */
  enabledTypes: Accessor<string[]>;

  // Setup state (TOTP)
  /** TOTP setup response (secret, QR code) */
  setupData: Accessor<Setup2FAResponse | null>;
  /** Base64 QR code image for TOTP setup */
  qrCode: Accessor<string | null>;
  /** TOTP secret for manual entry */
  secret: Accessor<string | null>;
  /** Backup codes from setup */
  backupCodes: Accessor<string[] | null>;

  // Form fields
  /** Current 2FA type being configured */
  type: Accessor<TwoFAType>;
  /** Set 2FA type */
  setType: (type: TwoFAType) => void;
  /** Verification code value */
  code: Accessor<string>;
  /** Update verification code */
  setCode: (value: string) => void;
  /** Delivery option for SMS/email (phone number or email address) */
  deliveryOption: Accessor<string>;
  /** Update delivery option */
  setDeliveryOption: (value: string) => void;

  // Operation state
  /** Whether an operation is in progress */
  isLoading: Accessor<boolean>;
  /** Error message if operation failed */
  error: Accessor<string | null>;
  /** Success message if operation succeeded */
  success: Accessor<string | null>;
  /** Current operation being performed */
  currentOperation: Accessor<TwoFAOperation | null>;

  // Actions
  /** Load current 2FA status */
  loadStatus: () => Promise<void>;
  /** Setup TOTP 2FA (generates QR code) */
  setupTOTP: () => Promise<void>;
  /** Enable 2FA after setup (requires verification code) */
  enable: () => Promise<void>;
  /** Disable 2FA for a specific type */
  disable: (type: TwoFAType) => Promise<void>;
  /** Send 2FA code via SMS or email */
  sendCode: () => Promise<void>;
  /** Validate 2FA code */
  validate: () => Promise<void>;
  /** Reset form fields to initial state */
  reset: () => void;
  /** Clear error message */
  clearError: () => void;
  /** Clear success message */
  clearSuccess: () => void;
  /** Clear setup data */
  clearSetupData: () => void;

  // Validation
  /** Whether enable form is valid and can be submitted */
  canEnable: Accessor<boolean>;
  /** Whether send code form is valid and can be submitted */
  canSendCode: Accessor<boolean>;
  /** Whether validate form is valid and can be submitted */
  canValidate: Accessor<boolean>;
}

/**
 * Headless hook for two-factor authentication management
 *
 * @example Setup TOTP 2FA
 * ```tsx
 * import { use2FA } from '@tendant/simple-idm-solid/headless';
 * import { Show } from 'solid-js';
 *
 * const My2FASetup = () => {
 *   const twoFA = use2FA({
 *     client: 'http://localhost:4000',
 *     onSuccess: (response, operation) => {
 *       console.log(`2FA ${operation} successful!`, response);
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       {/* Step 1: Setup TOTP */}
 *       <Show when={!twoFA.setupData()}>
 *         <button onClick={() => twoFA.setupTOTP()}>
 *           Setup Authenticator App
 *         </button>
 *       </Show>
 *
 *       {/* Step 2: Show QR Code */}
 *       <Show when={twoFA.qrCode()}>
 *         <img src={twoFA.qrCode()!} alt="TOTP QR Code" />
 *         <p>Secret: {twoFA.secret()}</p>
 *       </Show>
 *
 *       {/* Step 3: Verify and Enable */}
 *       <Show when={twoFA.setupData()}>
 *         <input
 *           value={twoFA.code()}
 *           onInput={(e) => twoFA.setCode(e.currentTarget.value)}
 *           placeholder="Enter code from app"
 *         />
 *         <button
 *           onClick={() => twoFA.enable()}
 *           disabled={!twoFA.canEnable()}
 *         >
 *           Enable 2FA
 *         </button>
 *       </Show>
 *     </div>
 *   );
 * };
 * ```
 *
 * @example SMS 2FA
 * ```tsx
 * const twoFA = use2FA({
 *   client: 'http://localhost:4000',
 * });
 *
 * // Set type to SMS
 * twoFA.setType('sms');
 * twoFA.setDeliveryOption('+1234567890');
 *
 * // Send code
 * await twoFA.sendCode();
 *
 * // Validate code
 * twoFA.setCode('123456');
 * await twoFA.validate();
 * ```
 *
 * @example Check status and disable
 * ```tsx
 * const twoFA = use2FA({
 *   client: 'http://localhost:4000',
 * });
 *
 * // Status is auto-loaded
 * if (twoFA.isEnabled()) {
 *   console.log('2FA enabled for:', twoFA.enabledTypes());
 *
 *   // Disable TOTP
 *   await twoFA.disable('totp');
 * }
 * ```
 */
export function use2FA(config: Use2FAConfig): Use2FAReturn {
  const autoLoadStatus = config.autoLoadStatus ?? true;

  // 2FA status
  const [status, setStatus] = createSignal<TwoFAStatus | null>(null);

  // Setup state
  const [setupData, setSetupData] = createSignal<Setup2FAResponse | null>(null);

  // Form fields
  const [type, setType] = createSignal<TwoFAType>('totp');
  const [code, setCode] = createSignal('');
  const [deliveryOption, setDeliveryOption] = createSignal('');

  // Operation state
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);
  const [currentOperation, setCurrentOperation] = createSignal<TwoFAOperation | null>(null);

  // Create or use provided API client
  const client =
    typeof config.client === 'string'
      ? new SimpleIdmClient({
          baseUrl: config.client,
          onError: (err) => {
            const operation = currentOperation();
            if (operation) {
              setError(err.message);
              config.onError?.(err.message, operation);
            }
          },
        })
      : config.client;

  // Derived state
  const isEnabled = createMemo(() => status()?.enabled ?? false);
  const enabledTypes = createMemo(() => status()?.types ?? []);
  const qrCode = createMemo(() => setupData()?.qr_code ?? null);
  const secret = createMemo(() => setupData()?.secret ?? null);
  const backupCodes = createMemo(() => setupData()?.backup_codes ?? null);

  // Validation
  const canEnable = createMemo(() => {
    if (isLoading()) return false;
    if (!code().trim()) return false;
    if (type() !== 'totp' && !deliveryOption().trim()) return false;
    return true;
  });

  const canSendCode = createMemo(() => {
    if (isLoading()) return false;
    if (type() === 'totp') return false; // TOTP doesn't need to send codes
    if (!deliveryOption().trim()) return false;
    return true;
  });

  const canValidate = createMemo(() => {
    if (isLoading()) return false;
    if (!code().trim()) return false;
    return true;
  });

  // Load 2FA status
  const loadStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentOperation('status');

      const statusResponse = await client.get2FAStatus();
      setStatus(statusResponse);
      config.onSuccess?.(statusResponse, 'status');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load 2FA status';
      setError(message);
      config.onError?.(message, 'status');
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  // Setup TOTP
  const setupTOTP = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setCurrentOperation('setup');

      const setupResponse = await client.setup2FATOTP();
      setSetupData(setupResponse);
      setType('totp');
      setSuccess('Scan the QR code with your authenticator app');
      config.onSuccess?.(setupResponse, 'setup');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to setup TOTP';
      setError(message);
      config.onError?.(message, 'setup');
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  // Enable 2FA
  const enable = async () => {
    if (!canEnable()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setCurrentOperation('enable');

      const enableResponse = await client.enable2FA({
        type: type(),
        code: code(),
        ...(deliveryOption() && { delivery_option: deliveryOption() }),
      });

      setSuccess(enableResponse.message || '2FA enabled successfully!');
      config.onSuccess?.(enableResponse, 'enable');

      // Reload status
      await loadStatus();

      // Reset form
      setCode('');
      setSetupData(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enable 2FA';
      setError(message);
      config.onError?.(message, 'enable');
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  // Disable 2FA
  const disable = async (twoFAType: TwoFAType) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setCurrentOperation('disable');

      const disableResponse = await client.disable2FA(twoFAType);
      setSuccess(disableResponse.message || '2FA disabled successfully!');
      config.onSuccess?.(disableResponse, 'disable');

      // Reload status
      await loadStatus();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disable 2FA';
      setError(message);
      config.onError?.(message, 'disable');
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  // Send 2FA code
  const sendCode = async () => {
    if (!canSendCode()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setCurrentOperation('send_code');

      const sendResponse = await client.send2FACode({
        type: type() as 'sms' | 'email',
        delivery_option: deliveryOption(),
      });

      setSuccess(sendResponse.message || 'Code sent successfully!');
      config.onSuccess?.(sendResponse, 'send_code');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send code';
      setError(message);
      config.onError?.(message, 'send_code');
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  // Validate 2FA code
  const validate = async () => {
    if (!canValidate()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setCurrentOperation('validate');

      const validateResponse = await client.validate2FA({
        type: type(),
        code: code(),
        ...(deliveryOption() && { delivery_option: deliveryOption() }),
      });

      setSuccess(validateResponse.message || 'Code validated successfully!');
      config.onSuccess?.(validateResponse, 'validate');

      // Reset code
      setCode('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid code';
      setError(message);
      config.onError?.(message, 'validate');
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  // Reset functions
  const reset = () => {
    setType('totp');
    setCode('');
    setDeliveryOption('');
    setSetupData(null);
    setError(null);
    setSuccess(null);
    setIsLoading(false);
    setCurrentOperation(null);
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);
  const clearSetupData = () => setSetupData(null);

  // Auto-load status on mount
  if (autoLoadStatus) {
    loadStatus();
  }

  return {
    // 2FA status
    status,
    isEnabled,
    enabledTypes,

    // Setup state
    setupData,
    qrCode,
    secret,
    backupCodes,

    // Form fields
    type,
    setType,
    code,
    setCode,
    deliveryOption,
    setDeliveryOption,

    // Operation state
    isLoading,
    error,
    success,
    currentOperation,

    // Actions
    loadStatus,
    setupTOTP,
    enable,
    disable,
    sendCode,
    validate,
    reset,
    clearError,
    clearSuccess,
    clearSetupData,

    // Validation
    canEnable,
    canSendCode,
    canValidate,
  };
}
