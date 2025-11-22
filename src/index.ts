/**
 * simple-idm-solid - SolidJS authentication components for simple-idm
 * @module @tendant/simple-idm-solid
 */

// ============================================================================
// Components
// ============================================================================

export { LoginForm } from './components/LoginForm';
export type { LoginFormProps } from './components/LoginForm';

export { MagicLinkForm } from './components/MagicLinkForm';
export type { MagicLinkFormProps } from './components/MagicLinkForm';

export { MagicLinkValidate } from './components/MagicLinkValidate';
export type { MagicLinkValidateProps } from './components/MagicLinkValidate';

export {
  PasswordlessRegistrationForm,
  PasswordRegistrationForm,
} from './components/RegistrationForm';
export type {
  PasswordlessRegistrationFormProps,
  PasswordRegistrationFormProps,
} from './components/RegistrationForm';

export { ProfileSettingsForm } from './components/ProfileSettingsForm';
export type { ProfileSettingsFormProps } from './components/ProfileSettingsForm';

export { TwoFactorAuthSetup } from './components/TwoFactorAuthSetup';
export type { TwoFactorAuthSetupProps } from './components/TwoFactorAuthSetup';

export { EmailVerificationPage } from './components/EmailVerificationPage';
export type { EmailVerificationPageProps } from './components/EmailVerificationPage';

export { ForgotPasswordForm } from './components/ForgotPasswordForm';
export type { ForgotPasswordFormProps } from './components/ForgotPasswordForm';

export { ResetPasswordForm } from './components/ResetPasswordForm';
export type { ResetPasswordFormProps } from './components/ResetPasswordForm';

export { ProtectedRoute, ProtectedRouteWithLoading } from './components/ProtectedRoute';
export type { ProtectedRouteProps } from './components/ProtectedRoute';

// ============================================================================
// Primitives (optional export for customization)
// ============================================================================

export { Input } from './primitives/Input';
export type { InputProps } from './primitives/Input';

export { Button } from './primitives/Button';
export type { ButtonProps } from './primitives/Button';

export { Alert } from './primitives/Alert';
export type { AlertProps } from './primitives/Alert';

export { Card, CardHeader, CardBody, CardFooter } from './primitives/Card';
export type {
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
} from './primitives/Card';

export { Label } from './primitives/Label';
export type { LabelProps } from './primitives/Label';

// ============================================================================
// API Client
// ============================================================================

export { SimpleIdmClient } from './api/client';
export type { ApiClientConfig } from './api/client';

// API Configuration
export {
  DEFAULT_V1_PREFIXES,
  DEFAULT_V2_PREFIXES,
  LEGACY_PREFIXES,
  buildPrefixesFromBase,
  buildPrefixesFromVersion,
  type PrefixConfig,
} from './api/config';

// ============================================================================
// Hooks
// ============================================================================

export { useAuth } from './hooks/useAuth';
export type { UseAuthOptions, UseAuthReturn } from './hooks/useAuth';

export { useForm, validators } from './hooks/useForm';
export type {
  UseFormOptions,
  UseFormReturn,
  ValidationRule,
  ValidationSchema,
} from './hooks/useForm';

// ============================================================================
// Headless Hooks (Business logic without UI)
// ============================================================================

export {
  useLogin,
  useMagicLink,
  useRegistration,
  useProfile,
  use2FA,
  useEmailVerification,
  useForgotPassword,
  useResetPassword,
} from './headless';

export type {
  UseLoginConfig,
  UseLoginReturn,
  UseMagicLinkConfig,
  UseMagicLinkReturn,
  UseRegistrationConfig,
  UseRegistrationReturn,
  PasswordStrength,
  PasswordStrengthResult,
  UseProfileConfig,
  UseProfileReturn,
  ProfileOperation,
  Use2FAConfig,
  Use2FAReturn,
  TwoFAType,
  TwoFAOperation,
  UseEmailVerificationConfig,
  UseEmailVerificationReturn,
  EmailVerificationOperation,
  UseForgotPasswordConfig,
  UseForgotPasswordReturn,
  ForgotPasswordMethod,
  UseResetPasswordConfig,
  UseResetPasswordReturn,
  HeadlessBaseConfig,
  HeadlessBaseState,
} from './headless';

// ============================================================================
// Types
// ============================================================================

export type {
  LoginRequest,
  LoginResponse,
  MagicLinkRequest,
  MagicLinkResponse,
  MagicLinkValidateResponse,
  SignupRequest,
  SignupResponse,
  UserInfo,
  IdmUser,
  TokenRefreshResponse,
  ApiError,
  TwoFactorMethod,
  UpdateUsernameRequest,
  UpdatePhoneRequest,
  UpdatePasswordRequest,
  ProfileUpdateResponse,
  Setup2FAResponse,
  Enable2FARequest,
  Validate2FARequest,
  TwoFAStatus,
  Send2FACodeRequest,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  VerificationStatusResponse,
  PasswordResetInitRequest,
  PasswordResetInitResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordPolicyResponse,
} from './types/api';

export { ApiException } from './types/api';

export type { ThemeConfig, ThemeColors } from './types/theme';

// ============================================================================
// Utilities
// ============================================================================

export { cn } from './utils/cn';
