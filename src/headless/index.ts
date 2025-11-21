/**
 * Headless Hooks - Business logic without UI
 *
 * These hooks provide unstyled authentication logic that can be used
 * to build custom UIs or integrate with any styling framework.
 *
 * @module @tendant/simple-idm-solid/headless
 */

// Re-export types
export type {
  HeadlessBaseConfig,
  HeadlessBaseState,
} from './types';

// Login hook
export { useLogin } from './useLogin';
export type { UseLoginConfig, UseLoginReturn } from './useLogin';

// Magic Link hook
export { useMagicLink } from './useMagicLink';
export type { UseMagicLinkConfig, UseMagicLinkReturn } from './useMagicLink';

// Registration hook
export { useRegistration } from './useRegistration';
export type {
  UseRegistrationConfig,
  UseRegistrationReturn,
  PasswordStrength,
  PasswordStrengthResult,
} from './useRegistration';

// Profile hook
export { useProfile } from './useProfile';
export type {
  UseProfileConfig,
  UseProfileReturn,
  ProfileOperation,
  PasswordStrengthResult as ProfilePasswordStrengthResult,
} from './useProfile';

// Two-Factor Authentication hook
export { use2FA } from './use2FA';
export type {
  Use2FAConfig,
  Use2FAReturn,
  TwoFAType,
  TwoFAOperation,
} from './use2FA';

// Email Verification hook
export { useEmailVerification } from './useEmailVerification';
export type {
  UseEmailVerificationConfig,
  UseEmailVerificationReturn,
  EmailVerificationOperation,
} from './useEmailVerification';

// Forgot Password hook
export { useForgotPassword } from './useForgotPassword';
export type {
  UseForgotPasswordConfig,
  UseForgotPasswordReturn,
  ForgotPasswordMethod,
} from './useForgotPassword';

// Reset Password hook
export { useResetPassword } from './useResetPassword';
export type {
  UseResetPasswordConfig,
  UseResetPasswordReturn,
  PasswordStrengthResult as ResetPasswordStrengthResult,
} from './useResetPassword';
