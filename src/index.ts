/**
 * simple-idm-solid - SolidJS authentication components for simple-idm
 * @module @tendant/simple-idm-solid
 */

// ============================================================================
// Styles (imported to ensure they're built)
// ============================================================================

import './styles/default.css';

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
// Types
// ============================================================================

export type {
  LoginRequest,
  LoginResponse,
  MagicLinkRequest,
  MagicLinkResponse,
  MagicLinkValidateResponse,
  PasswordlessSignupRequest,
  PasswordSignupRequest,
  SignupResponse,
  UserInfo,
  TokenRefreshResponse,
  ApiError,
  TwoFactorMethod,
} from './types/api';

export { ApiException } from './types/api';

export type { ThemeConfig, ThemeColors } from './types/theme';

// ============================================================================
// Utilities
// ============================================================================

export { cn } from './utils/cn';
