# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-11-15

### Added

#### Components
- **LoginForm**: Password-based authentication with username/password
- **MagicLinkForm**: Request magic link via email or username
- **MagicLinkValidate**: Validate and process magic link tokens
- **PasswordlessRegistrationForm**: Registration without password
- **PasswordRegistrationForm**: Registration with password and strength validation
- **ForgotPasswordForm**: Initiate password reset flow
- **ResetPasswordForm**: Reset password with token validation
- **TwoFactorAuthSetup**: TOTP/SMS/Email 2FA setup and management
- **ProfileSettingsForm**: Update username, phone, and password
- **EmailVerificationPage**: Email verification with token validation

#### Headless Hooks
- **useLogin**: Password-based login logic
- **useMagicLink**: Magic link request and cooldown management
- **useRegistration**: User registration (passwordless and password modes)
- **useProfile**: Profile management (username, phone, password)
- **use2FA**: Two-factor authentication setup and validation
- **useEmailVerification**: Email verification and resend logic
- **useForgotPassword**: Password reset initiation
- **useResetPassword**: Password reset completion with policy validation

#### API & Infrastructure
- **SimpleIdmClient**: Full-featured API client with HTTP-only cookie support
- **TypeScript**: Complete type definitions for all APIs and components
- **Tailwind CSS**: Styled components with modern design
- **Testing**: Vitest infrastructure with useLogin test suite
- **Accessibility**: WCAG AA compliant styled components
- **Password Validation**: Real-time strength checking and policy enforcement
- **Error Handling**: Comprehensive error states and user feedback

#### Developer Experience
- **Same-Origin Support**: Optional baseUrl for simplified deployment
- **Tree-Shaking**: Optimized bundle with preserve modules
- **Sourcemaps**: Full debugging support
- **Documentation**: Comprehensive README with examples
- **Migration Guide**: Guidance for choosing headless vs styled approach
- **Type Safety**: Full TypeScript support with strict mode

### Features

- 🔐 Complete authentication flows (login, magic link, registration)
- 🔑 Password reset with token validation and policy enforcement
- 👤 Profile management with real-time validation
- 🔒 Two-factor authentication (TOTP, SMS, Email)
- ✉️ Email verification flows
- 🎯 Headless hooks for custom UI development
- 🎨 Ready-to-use styled components with Tailwind CSS
- 📦 Lightweight bundle (<50KB gzipped)
- 🔒 HTTP-only cookie authentication (secure by default)
- ♿ Accessibility support (WCAG AA)
- 📘 Full TypeScript support
- 🧪 Testable architecture with mock support
- 🚀 Zero configuration for simple-idm backend

### Technical Details

- **Build System**: Vite with library mode
- **Module Format**: ESM with tree-shaking support
- **Peer Dependencies**: solid-js ^1.8.0
- **Dependencies**: @solidjs/router, clsx, tailwind-merge
- **License**: MIT

[0.1.0]: https://github.com/tendant/simple-idm-solid/releases/tag/v0.1.0
