# simple-idm-solid

> SolidJS authentication components for [simple-idm](https://github.com/tendant/simple-idm)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Overview

**simple-idm-solid** is an open-source SolidJS UI component library providing ready-to-use authentication UIs — login, registration, password reset, and MFA — designed for seamless integration with [simple-idm](https://github.com/tendant/simple-idm), a Go-based identity management and OIDC provider.

This project enables developers to easily embed identity workflows into any SolidJS, SolidStart, or Astro application without rebuilding authentication flows.

## Two Ways to Use

### 🎨 Styled Components (Quick Start)
Pre-built, styled components ready to drop into your app:

```tsx
import { LoginForm } from '@tendant/simple-idm-solid';

<LoginForm apiBaseUrl="http://localhost:4000" onSuccess={...} />
```

### 🎯 Headless Hooks (Custom UI)
Business logic without UI for complete design control:

```tsx
import { useLogin } from '@tendant/simple-idm-solid';

const login = useLogin({ client: 'http://localhost:4000' });
// Build your own UI with 100% control
```

**→ See [Migration Guide](./MIGRATION_GUIDE.md) to choose the right approach**

## Features

- 🔐 **Complete Auth Components**: Login, Magic Link, Registration (passwordless & password)
- 🔑 **Password Reset**: Forgot password and reset password flows with token validation
- 👤 **Profile Management**: Update username, phone, and password with validation
- 🔒 **Two-Factor Authentication**: TOTP, SMS, and email 2FA setup and management
- ✉️ **Email Verification**: Token validation and verification status tracking
- 🎯 **Headless Hooks**: Business logic without UI for custom designs
- 🎨 **Styled Components**: Ready-to-use with Tailwind CSS
- 📦 **Lightweight**: <50KB gzipped
- 🔒 **Secure**: Built for HTTP-only cookie authentication
- ♿ **Accessible**: WCAG AA compliant styled components
- 📘 **TypeScript**: Full type safety
- 🧪 **Testable**: Easy to test with mocked APIs
- 🚀 **Zero Config**: Works with simple-idm out of the box

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Styled Components](#styled-components)
- [Headless Hooks](#headless-hooks)
- [API Client](#api-client)
- [Hooks](#hooks)
- [Examples](#examples)
- [Migration Guide](#migration-guide)
- [Customization](#customization)

## Installation

```bash
npm install @tendant/simple-idm-solid
# or
pnpm add @tendant/simple-idm-solid
# or
yarn add @tendant/simple-idm-solid
```

## Quick Start

### 1. Import Styles

Import the default styles in your app entry point:

```tsx
// App.tsx or index.tsx
import '@tendant/simple-idm-solid/styles';
```

### 2. Use Components

```tsx
import { LoginForm } from '@tendant/simple-idm-solid';

function LoginPage() {
  return (
    <LoginForm
      apiBaseUrl="http://localhost:4000"
      onSuccess={(response) => {
        console.log('Login successful!', response);
        window.location.href = '/dashboard';
      }}
      showMagicLinkOption
      showRegistrationLink
    />
  );
}
```

## Styled Components

Pre-built, styled components ready to use.

### LoginForm

Username/password login form with HTTP-only cookie authentication.

```tsx
import { LoginForm } from '@tendant/simple-idm-solid';

<LoginForm
  apiBaseUrl="http://localhost:4000"
  onSuccess={(response) => {
    // Handle successful login
    window.location.href = '/dashboard';
  }}
  onError={(error) => {
    console.error('Login failed:', error);
  }}
  redirectUrl="/dashboard"
  showMagicLinkOption
  showRegistrationLink
/>
```

**Props:**
- `apiBaseUrl` (required): Base URL of simple-idm backend
- `onSuccess?: (response: LoginResponse) => void`: Success callback
- `onError?: (error: string) => void`: Error callback
- `redirectUrl?: string`: Auto-redirect after login
- `showMagicLinkOption?: boolean`: Show magic link login option
- `showRegistrationLink?: boolean`: Show registration link

### MagicLinkForm

Request a magic link for passwordless authentication.

```tsx
import { MagicLinkForm } from '@tendant/simple-idm-solid';

<MagicLinkForm
  apiBaseUrl="http://localhost:4000"
  onSuccess={() => {
    console.log('Magic link sent!');
  }}
  showPasswordLoginLink
/>
```

**Props:**
- `apiBaseUrl` (required): Base URL of simple-idm backend
- `onSuccess?: () => void`: Success callback (link sent)
- `onError?: (error: string) => void`: Error callback
- `showPasswordLoginLink?: boolean`: Show back to password login link

### MagicLinkValidate

Validate a magic link token (from email).

```tsx
import { MagicLinkValidate } from '@tendant/simple-idm-solid';
import { useSearchParams } from '@solidjs/router';

function MagicLinkValidatePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.token as string;

  return (
    <MagicLinkValidate
      apiBaseUrl="http://localhost:4000"
      token={token}
      onSuccess={(response) => {
        console.log('Logged in!', response);
      }}
      redirectUrl="/dashboard"
      autoValidate // Automatically validate on mount
    />
  );
}
```

**Props:**
- `apiBaseUrl` (required): Base URL of simple-idm backend
- `token` (required): Magic link token from URL
- `onSuccess?: (response: MagicLinkValidateResponse) => void`: Success callback
- `onError?: (error: string) => void`: Error callback
- `autoValidate?: boolean`: Auto-validate on mount (default: true)
- `redirectUrl?: string`: Auto-redirect after validation

### PasswordlessRegistrationForm

Register without a password (uses magic link).

```tsx
import { PasswordlessRegistrationForm } from '@tendant/simple-idm-solid';

<PasswordlessRegistrationForm
  apiBaseUrl="http://localhost:4000"
  onSuccess={(response) => {
    console.log('Account created!', response);
  }}
  requireInvitationCode={false}
  showLoginLink
/>
```

**Props:**
- `apiBaseUrl` (required): Base URL of simple-idm backend
- `onSuccess?: (response: SignupResponse) => void`: Success callback
- `onError?: (error: string) => void`: Error callback
- `requireInvitationCode?: boolean`: Require invitation code
- `showLoginLink?: boolean`: Show login link
- `redirectUrl?: string`: Auto-redirect after registration

### PasswordRegistrationForm

Register with username and password.

```tsx
import { PasswordRegistrationForm } from '@tendant/simple-idm-solid';

<PasswordRegistrationForm
  apiBaseUrl="http://localhost:4000"
  onSuccess={(response) => {
    console.log('Account created!', response);
    window.location.href = '/login';
  }}
  requireInvitationCode={false}
  showLoginLink
/>
```

**Props:**
- `apiBaseUrl` (required): Base URL of simple-idm backend
- `onSuccess?: (response: SignupResponse) => void`: Success callback
- `onError?: (error: string) => void`: Error callback
- `requireInvitationCode?: boolean`: Require invitation code
- `showLoginLink?: boolean`: Show login link
- `redirectUrl?: string`: Auto-redirect after registration

### ProfileSettingsForm

Manage user profile with tabbed interface for username, phone, and password updates.

```tsx
import { ProfileSettingsForm } from '@tendant/simple-idm-solid';

<ProfileSettingsForm
  apiBaseUrl="http://localhost:4000"
  onSuccess={(response, operation) => {
    console.log(`${operation} updated!`, response);
  }}
  defaultTab="username"
  showPhoneTab={true}
/>
```

**Props:**
- `apiBaseUrl` (required): Base URL of simple-idm backend
- `onSuccess?: (response, operation) => void`: Success callback with operation type
- `onError?: (error, operation) => void`: Error callback with operation type
- `defaultTab?: 'username' | 'phone' | 'password'`: Initial active tab
- `showPhoneTab?: boolean`: Show phone tab (default: true)

**Features:**
- ✓ Tabbed interface for Username / Phone / Password
- ✓ Password strength indicator
- ✓ Validation for each form
- ✓ Success/error feedback per operation

### TwoFactorAuthSetup

Complete 2FA setup wizard with QR code display and status management.

```tsx
import { TwoFactorAuthSetup } from '@tendant/simple-idm-solid';

<TwoFactorAuthSetup
  apiBaseUrl="http://localhost:4000"
  onSuccess={(response, operation) => {
    console.log(`2FA ${operation} successful!`, response);
  }}
  autoLoadStatus={true}
/>
```

**Props:**
- `apiBaseUrl` (required): Base URL of simple-idm backend
- `onSuccess?: (response, operation) => void`: Success callback with operation type
- `onError?: (error, operation) => void`: Error callback with operation type
- `autoLoadStatus?: boolean`: Auto-load 2FA status on mount (default: true)

**Features:**
- ✓ Multi-step wizard (Status → Setup → Verify)
- ✓ QR code display for TOTP
- ✓ Backup codes display
- ✓ Enable/disable toggle
- ✓ Status badge showing current state

### EmailVerificationPage

Email verification page with auto-verification from URL token.

```tsx
import { EmailVerificationPage } from '@tendant/simple-idm-solid';
import { useSearchParams } from '@solidjs/router';

function VerifyEmail() {
  const [params] = useSearchParams();

  return (
    <EmailVerificationPage
      apiBaseUrl="http://localhost:4000"
      token={params.token}
      autoVerify={true}
      onSuccess={(response) => {
        console.log('Email verified!', response);
      }}
      loginUrl="/login"
    />
  );
}
```

**Props:**
- `apiBaseUrl` (required): Base URL of simple-idm backend
- `token?: string`: Verification token from URL query parameter
- `autoVerify?: boolean`: Auto-verify on mount if token provided (default: true)
- `onSuccess?: (response) => void`: Success callback
- `onError?: (error) => void`: Error callback
- `loginUrl?: string`: URL to login page (default: /login)

**Features:**
- ✓ Auto-verification from URL token
- ✓ Loading/success/error states with icons
- ✓ Resend email button
- ✓ Manual token entry fallback

### ForgotPasswordForm

Request a password reset link via email or username.

```tsx
import { ForgotPasswordForm } from '@tendant/simple-idm-solid';

<ForgotPasswordForm
  apiBaseUrl="http://localhost:4000"
  method="email"
  onSuccess={(response) => {
    console.log('Password reset email sent!', response);
  }}
  loginUrl="/login"
/>
```

**Props:**
- `apiBaseUrl` (required): Base URL of simple-idm backend
- `method?: 'email' | 'username' | 'both'`: Input method (default: 'email')
- `onSuccess?: (response) => void`: Success callback
- `onError?: (error) => void`: Error callback
- `loginUrl?: string`: URL to login page (default: /login)

**Features:**
- ✓ Email or username input validation
- ✓ Success message with instructions
- ✓ Error handling with retry
- ✓ Back to login link

### ResetPasswordForm

Reset password using token from email with strength validation.

```tsx
import { ResetPasswordForm } from '@tendant/simple-idm-solid';
import { useSearchParams } from '@solidjs/router';

function ResetPassword() {
  const [params] = useSearchParams();

  return (
    <ResetPasswordForm
      apiBaseUrl="http://localhost:4000"
      token={params.token}
      autoLoadPolicy={true}
      onSuccess={(response) => {
        console.log('Password reset!', response);
        window.location.href = '/login';
      }}
      loginUrl="/login"
    />
  );
}
```

**Props:**
- `apiBaseUrl` (required): Base URL of simple-idm backend
- `token?: string`: Reset token from URL query parameter
- `showTokenInput?: boolean`: Show token input field (default: false if token provided)
- `autoLoadPolicy?: boolean`: Auto-load password policy (default: true)
- `onSuccess?: (response) => void`: Success callback
- `onError?: (error) => void`: Error callback
- `loginUrl?: string`: URL to login page (default: /login)

**Features:**
- ✓ Password strength indicator
- ✓ Password policy validation from backend
- ✓ Confirmation matching
- ✓ Success state with redirect to login
- ✓ Manual token entry fallback

## Headless Hooks

Headless hooks provide business logic without UI, giving you 100% control over the presentation layer.

**Why use headless hooks?**
- ✅ Complete UI customization
- ✅ Works with any CSS framework (Tailwind, UnoCSS, vanilla CSS)
- ✅ Smaller bundle size (logic only)
- ✅ Better testability
- ✅ Reuse logic across different UIs

### useLogin

Password-based login hook with 2FA and multi-user support.

```tsx
import { useLogin } from '@tendant/simple-idm-solid';

function MyCustomLogin() {
  const login = useLogin({
    client: 'http://localhost:4000',
    onSuccess: (response) => {
      console.log('Logged in!', response);
      window.location.href = '/dashboard';
    },
    autoRedirect: true,
    redirectUrl: '/dashboard',
  });

  return (
    <div class="my-custom-design">
      <input
        value={login.username()}
        onInput={(e) => login.setUsername(e.currentTarget.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={login.password()}
        onInput={(e) => login.setPassword(e.currentTarget.value)}
        placeholder="Password"
      />
      <button
        onClick={() => login.submit()}
        disabled={!login.canSubmit() || login.isLoading()}
      >
        {login.isLoading() ? 'Signing in...' : 'Sign In'}
      </button>
      {login.error() && <div class="error">{login.error()}</div>}
    </div>
  );
}
```

**Config:**
- `client`: SimpleIdmClient instance or base URL string
- `onSuccess?: (response: LoginResponse) => void`: Success callback
- `onError?: (error: string) => void`: Error callback
- `autoRedirect?: boolean`: Auto-redirect after login
- `redirectUrl?: string`: URL to redirect to
- `redirectDelay?: number`: Delay before redirect (ms)

**Returns:**
- `username()`, `setUsername(value: string)`: Username state
- `password()`, `setPassword(value: string)`: Password state
- `isLoading()`: Whether login is in progress
- `error()`: Error message if login failed
- `success()`: Success message if login succeeded
- `response()`: Full login response (includes 2FA, multiple users)
- `submit()`: Submit login
- `reset()`: Reset form state
- `canSubmit()`: Whether form can be submitted

### useMagicLink

Passwordless authentication hook with cooldown timer.

```tsx
import { useMagicLink } from '@tendant/simple-idm-solid';
import { Show } from 'solid-js';

function MyCustomMagicLink() {
  const magic = useMagicLink({
    client: 'http://localhost:4000',
    cooldownSeconds: 60,
  });

  return (
    <div>
      <Show when={!magic.success()} fallback={<p>Check your email!</p>}>
        <input
          type="email"
          value={magic.username()}
          onInput={(e) => magic.setUsername(e.currentTarget.value)}
          placeholder="Email"
        />
        <button
          onClick={() => magic.submit()}
          disabled={!magic.canSubmit()}
        >
          {magic.cooldown() > 0
            ? `Wait ${magic.cooldown()}s`
            : 'Send Magic Link'}
        </button>
      </Show>

      {magic.error() && <p class="error">{magic.error()}</p>}

      <Show when={magic.success() && magic.canResend()}>
        <button onClick={() => magic.resend()}>Resend</button>
      </Show>
    </div>
  );
}
```

**Config:**
- `client`: SimpleIdmClient instance or base URL string
- `onSuccess?: (response: MagicLinkResponse) => void`: Success callback
- `onError?: (error: string) => void`: Error callback
- `cooldownSeconds?: number`: Cooldown duration (default: 60)

**Returns:**
- `username()`, `setUsername(value: string)`: Email/username state
- `isLoading()`: Whether request is in progress
- `error()`, `success()`: Error/success messages
- `response()`: Full API response
- `cooldown()`: Seconds remaining before resend allowed
- `submit()`: Send magic link
- `resend()`: Resend magic link (after cooldown)
- `reset()`: Reset form state
- `canSubmit()`, `canResend()`: Validation helpers

### useRegistration

User registration hook supporting both password and passwordless modes.

```tsx
import { useRegistration } from '@tendant/simple-idm-solid';
import { Show } from 'solid-js';

function MyCustomRegistration() {
  const reg = useRegistration({
    client: 'http://localhost:4000',
    mode: 'password', // or 'passwordless'
    onSuccess: () => window.location.href = '/login',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); reg.submit(); }}>
      <input
        value={reg.username()}
        onInput={(e) => reg.setUsername(e.currentTarget.value)}
        placeholder="Username"
      />
      <input
        type="email"
        value={reg.email()}
        onInput={(e) => reg.setEmail(e.currentTarget.value)}
        placeholder="Email"
      />

      {/* Password mode only */}
      <Show when={reg.mode === 'password'}>
        <input
          type="password"
          value={reg.password()}
          onInput={(e) => reg.setPassword(e.currentTarget.value)}
          placeholder="Password"
        />

        {/* Password Strength */}
        <Show when={reg.password()}>
          <div class="strength-indicator">
            <div
              class={reg.passwordStrength().color}
              style={{ width: `${reg.passwordStrength().percentage}%` }}
            />
            <span>{reg.passwordStrength().text}</span>
          </div>
        </Show>

        <input
          type="password"
          value={reg.confirmPassword()}
          onInput={(e) => reg.setConfirmPassword(e.currentTarget.value)}
          placeholder="Confirm Password"
        />

        <Show when={!reg.passwordsMatch() && reg.confirmPassword()}>
          <p class="error">Passwords do not match</p>
        </Show>
      </Show>

      <button disabled={!reg.canSubmit()}>Register</button>
    </form>
  );
}
```

**Config:**
- `client`: SimpleIdmClient instance or base URL string
- `mode?: 'password' | 'passwordless'`: Registration mode (default: 'password')
- `onSuccess?: (response: SignupResponse) => void`: Success callback
- `onError?: (error: string) => void`: Error callback
- `requireInvitationCode?: boolean`: Whether invitation code is required
- `autoRedirect?: boolean`: Auto-redirect after registration
- `redirectUrl?: string`: URL to redirect to

**Returns:**
- `username()`, `setUsername(value)`: Username state
- `email()`, `setEmail(value)`: Email state
- `password()`, `setPassword(value)`: Password state
- `confirmPassword()`, `setConfirmPassword(value)`: Confirm password state
- `fullname()`, `setFullname(value)`: Full name state
- `invitationCode()`, `setInvitationCode(value)`: Invitation code state
- `isLoading()`: Whether registration is in progress
- `error()`, `success()`: Error/success messages
- `passwordStrength()`: Password strength calculation
  - `percentage: number`: Strength 0-100
  - `level: 'weak' | 'medium' | 'strong'`
  - `color: string`: CSS class for color
  - `text: string`: Display text
- `passwordsMatch()`: Whether passwords match
- `submit()`: Submit registration
- `reset()`: Reset form state
- `canSubmit()`: Whether form can be submitted

### useProfile

Profile management hook for updating username, phone, and password.

```tsx
import { useProfile } from '@tendant/simple-idm-solid';
import { Show, createSignal } from 'solid-js';

function MyProfileSettings() {
  const profile = useProfile({
    client: 'http://localhost:4000',
    onSuccess: (response, operation) => {
      console.log(`${operation} updated!`, response);
    },
  });

  const [tab, setTab] = createSignal<'username' | 'phone' | 'password'>('username');

  return (
    <div>
      {/* Update Username */}
      <Show when={tab() === 'username'}>
        <form onSubmit={(e) => { e.preventDefault(); profile.updateUsername(); }}>
          <input
            value={profile.username()}
            onInput={(e) => profile.setUsername(e.currentTarget.value)}
            placeholder="New Username"
          />
          <input
            type="password"
            value={profile.usernameCurrentPassword()}
            onInput={(e) => profile.setUsernameCurrentPassword(e.currentTarget.value)}
            placeholder="Current Password (required)"
          />
          <button disabled={!profile.canSubmitUsername()}>
            Update Username
          </button>
        </form>
      </Show>

      {/* Update Password */}
      <Show when={tab() === 'password'}>
        <form onSubmit={(e) => { e.preventDefault(); profile.updatePassword(); }}>
          <input
            type="password"
            value={profile.currentPassword()}
            onInput={(e) => profile.setCurrentPassword(e.currentTarget.value)}
            placeholder="Current Password"
          />
          <input
            type="password"
            value={profile.newPassword()}
            onInput={(e) => profile.setNewPassword(e.currentTarget.value)}
            placeholder="New Password"
          />
          {/* Password Strength */}
          <Show when={profile.newPassword()}>
            <div>Strength: {profile.passwordStrength().text}</div>
          </Show>
          <input
            type="password"
            value={profile.confirmNewPassword()}
            onInput={(e) => profile.setConfirmNewPassword(e.currentTarget.value)}
            placeholder="Confirm New Password"
          />
          <button disabled={!profile.canSubmitPassword()}>
            Update Password
          </button>
        </form>
      </Show>
    </div>
  );
}
```

**Config:**
- `client`: SimpleIdmClient instance or base URL string
- `onSuccess?: (response, operation) => void`: Success callback
- `onError?: (error, operation) => void`: Error callback
- `minPasswordLength?: number`: Minimum password length (default: 8)

**Returns:**
- `username()`, `setUsername(value)`: New username state
- `usernameCurrentPassword()`, `setUsernameCurrentPassword(value)`: Current password for username update
- `phone()`, `setPhone(value)`: Phone number state
- `currentPassword()`, `setCurrentPassword(value)`: Current password for password update
- `newPassword()`, `setNewPassword(value)`: New password state
- `confirmNewPassword()`, `setConfirmNewPassword(value)`: Confirm new password state
- `isLoading()`: Whether update is in progress
- `error()`, `success()`: Error/success messages
- `currentOperation()`: Current operation ('username', 'phone', or 'password')
- `passwordStrength()`: New password strength calculation
- `passwordsMatch()`: Whether new passwords match
- `updateUsername()`, `updatePhone()`, `updatePassword()`: Submit updates
- `canSubmitUsername()`, `canSubmitPhone()`, `canSubmitPassword()`: Validation helpers

### use2FA

Two-factor authentication setup and management hook supporting TOTP, SMS, and email.

```tsx
import { use2FA } from '@tendant/simple-idm-solid';
import { Show } from 'solid-js';

function My2FASetup() {
  const twoFA = use2FA({
    client: 'http://localhost:4000',
    autoLoadStatus: true,
    onSuccess: (response, operation) => {
      console.log(`2FA ${operation} successful!`, response);
    },
  });

  return (
    <div>
      {/* Current Status */}
      <p>2FA Enabled: {twoFA.isEnabled() ? 'Yes' : 'No'}</p>

      {/* Setup TOTP */}
      <Show when={!twoFA.isEnabled()}>
        <button onClick={() => twoFA.setupTOTP()}>
          Setup Authenticator App
        </button>

        <Show when={twoFA.qrCode()}>
          <div>
            <img src={twoFA.qrCode()!} alt="QR Code" />
            <p>Secret: {twoFA.secret()}</p>

            <input
              value={twoFA.code()}
              onInput={(e) => twoFA.setCode(e.currentTarget.value)}
              placeholder="Enter code from app"
            />
            <button onClick={() => twoFA.enable()} disabled={!twoFA.canEnable()}>
              Enable 2FA
            </button>
          </div>
        </Show>
      </Show>

      {/* Disable 2FA */}
      <Show when={twoFA.isEnabled()}>
        {twoFA.enabledTypes().map((type) => (
          <button onClick={() => twoFA.disable(type as any)}>
            Disable {type}
          </button>
        ))}
      </Show>
    </div>
  );
}
```

**Config:**
- `client`: SimpleIdmClient instance or base URL string
- `onSuccess?: (response, operation) => void`: Success callback
- `onError?: (error, operation) => void`: Error callback
- `autoLoadStatus?: boolean`: Auto-load status on mount (default: true)

**Returns:**
- `status()`: Current 2FA status
- `isEnabled()`: Whether 2FA is enabled
- `enabledTypes()`: Array of enabled 2FA types
- `setupData()`: TOTP setup response
- `qrCode()`: Base64 QR code for TOTP
- `secret()`: TOTP secret for manual entry
- `backupCodes()`: Backup codes from setup
- `type()`, `setType(type)`: Current 2FA type ('totp', 'sms', 'email')
- `code()`, `setCode(value)`: Verification code state
- `deliveryOption()`, `setDeliveryOption(value)`: Phone/email for SMS/email 2FA
- `isLoading()`: Whether operation is in progress
- `error()`, `success()`: Error/success messages
- `loadStatus()`: Load current 2FA status
- `setupTOTP()`: Setup TOTP 2FA (generates QR code)
- `enable()`: Enable 2FA after setup
- `disable(type)`: Disable specific 2FA type
- `sendCode()`: Send 2FA code via SMS/email
- `validate()`: Validate 2FA code
- `canEnable()`, `canSendCode()`, `canValidate()`: Validation helpers

### useEmailVerification

Email verification hook for token validation, resending emails, and checking status.

```tsx
import { useEmailVerification } from '@tendant/simple-idm-solid';
import { useSearchParams } from '@solidjs/router';
import { Show } from 'solid-js';

// Auto-verify from URL token
function EmailVerifyPage() {
  const [params] = useSearchParams();

  const emailVerify = useEmailVerification({
    client: 'http://localhost:4000',
    initialToken: params.token,
    autoVerify: true,
  });

  return (
    <div>
      <Show when={emailVerify.isLoading()}>
        <p>Verifying your email...</p>
      </Show>

      <Show when={emailVerify.success()}>
        <div>
          <h2>Email Verified!</h2>
          <p>{emailVerify.success()}</p>
          <a href="/login">Continue to Login</a>
        </div>
      </Show>

      <Show when={emailVerify.error()}>
        <div>
          <p>{emailVerify.error()}</p>
          <button onClick={() => emailVerify.resend()}>
            Resend Verification Email
          </button>
        </div>
      </Show>
    </div>
  );
}

// Check status widget
function EmailStatusWidget() {
  const emailVerify = useEmailVerification({
    client: 'http://localhost:4000',
    autoLoadStatus: true,
  });

  return (
    <div>
      <Show when={emailVerify.isVerified()}>
        <p>✓ Email verified</p>
      </Show>
      <Show when={!emailVerify.isVerified()}>
        <button onClick={() => emailVerify.resend()}>
          Send Verification Email
        </button>
      </Show>
    </div>
  );
}
```

**Config:**
- `client`: SimpleIdmClient instance or base URL string
- `onSuccess?: (response, operation) => void`: Success callback
- `onError?: (error, operation) => void`: Error callback
- `initialToken?: string`: Initial verification token
- `autoVerify?: boolean`: Auto-verify on mount if initialToken provided
- `autoLoadStatus?: boolean`: Auto-load verification status on mount

**Returns:**
- `token()`, `setToken(value)`: Verification token state
- `status()`: Verification status response
- `isVerified()`: Whether email is verified
- `verifiedAt()`: When email was verified (ISO 8601 string)
- `isLoading()`: Whether operation is in progress
- `error()`, `success()`: Error/success messages
- `verifyResponse()`: Last verification response
- `verify()`: Verify email with current token
- `resend()`: Resend verification email (requires auth)
- `loadStatus()`: Load verification status (requires auth)
- `canVerify()`: Whether verify form is valid

### useForgotPassword

Password reset request hook for initiating password reset via email or username.

```tsx
import { useForgotPassword } from '@tendant/simple-idm-solid';
import { Show } from 'solid-js';

function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword({
    client: 'http://localhost:4000',
    method: 'email', // or 'username' or 'both'
    onSuccess: (response) => {
      console.log('Reset email sent!', response);
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); forgotPassword.submit(); }}>
      <input
        type={forgotPassword.method() === 'email' ? 'email' : 'text'}
        value={forgotPassword.identifier()}
        onInput={(e) => forgotPassword.setIdentifier(e.currentTarget.value)}
        placeholder={forgotPassword.method() === 'email' ? 'your@email.com' : 'username'}
      />

      <button
        type="submit"
        disabled={!forgotPassword.canSubmit() || forgotPassword.isLoading()}
      >
        {forgotPassword.isLoading() ? 'Sending...' : 'Send Reset Link'}
      </button>

      <Show when={forgotPassword.error()}>
        <p class="error">{forgotPassword.error()}</p>
      </Show>

      <Show when={forgotPassword.success()}>
        <p class="success">{forgotPassword.success()}</p>
      </Show>
    </form>
  );
}
```

**Config:**
- `client`: SimpleIdmClient instance or base URL string
- `method?: 'email' | 'username' | 'both'`: Input method (default: 'email')
- `onSuccess?: (response) => void`: Success callback
- `onError?: (error) => void`: Error callback

**Returns:**
- `identifier()`, `setIdentifier(value)`: Email/username input state
- `isLoading()`: Whether request is in progress
- `error()`, `success()`: Error/success messages
- `response()`: Last API response
- `submit()`: Submit password reset request
- `reset()`: Reset form state
- `canSubmit()`: Whether form is valid
- `method()`: Configured input method

### useResetPassword

Password reset completion hook with token validation and password strength checking.

```tsx
import { useResetPassword } from '@tendant/simple-idm-solid';
import { useSearchParams } from '@solidjs/router';
import { Show } from 'solid-js';

function ResetPasswordPage() {
  const [params] = useSearchParams();

  const resetPassword = useResetPassword({
    client: 'http://localhost:4000',
    initialToken: params.token,
    autoLoadPolicy: true,
    onSuccess: (response) => {
      console.log('Password reset!', response);
      window.location.href = '/login';
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); resetPassword.submit(); }}>
      <Show when={!params.token}>
        <input
          type="text"
          value={resetPassword.token()}
          onInput={(e) => resetPassword.setToken(e.currentTarget.value)}
          placeholder="Reset token"
        />
      </Show>

      <input
        type="password"
        value={resetPassword.newPassword()}
        onInput={(e) => resetPassword.setNewPassword(e.currentTarget.value)}
        placeholder="New password"
      />

      {/* Password Strength Indicator */}
      <Show when={resetPassword.newPassword().length > 0}>
        <div class="strength-indicator">
          <span class={resetPassword.passwordStrength().color}>
            {resetPassword.passwordStrength().label}
          </span>
          <div class="progress-bar">
            <div style={{ width: `${resetPassword.passwordStrength().percentage}%` }} />
          </div>
        </div>
      </Show>

      <input
        type="password"
        value={resetPassword.confirmPassword()}
        onInput={(e) => resetPassword.setConfirmPassword(e.currentTarget.value)}
        placeholder="Confirm password"
      />

      <Show when={!resetPassword.passwordsMatch() && resetPassword.confirmPassword()}>
        <p class="error">Passwords do not match</p>
      </Show>

      <button
        type="submit"
        disabled={!resetPassword.canSubmit() || resetPassword.isLoading()}
      >
        {resetPassword.isLoading() ? 'Resetting...' : 'Reset Password'}
      </button>

      <Show when={resetPassword.error()}>
        <p class="error">{resetPassword.error()}</p>
      </Show>

      <Show when={resetPassword.success()}>
        <p class="success">{resetPassword.success()}</p>
      </Show>
    </form>
  );
}
```

**Config:**
- `client`: SimpleIdmClient instance or base URL string
- `initialToken?: string`: Initial reset token from URL
- `autoLoadPolicy?: boolean`: Auto-load password policy (default: true)
- `minPasswordLength?: number`: Minimum password length (default: 8, overridden by policy)
- `onSuccess?: (response) => void`: Success callback
- `onError?: (error) => void`: Error callback

**Returns:**
- `token()`, `setToken(value)`: Reset token state
- `newPassword()`, `setNewPassword(value)`: New password state
- `confirmPassword()`, `setConfirmPassword(value)`: Confirmation state
- `isLoading()`: Whether operation is in progress
- `error()`, `success()`: Error/success messages
- `response()`: Last API response
- `policy()`: Password policy from backend
- `passwordStrength()`: Password strength analysis (level, label, percentage, color)
- `passwordsMatch()`: Whether passwords match
- `meetsPolicy()`: Whether password meets policy requirements
- `submit()`: Submit password reset
- `reset()`: Reset form state
- `canSubmit()`: Whether form is valid
- `loadPolicy()`: Load password policy from API

**Learn more:**
- [Headless Hooks Source Code](./src/headless/)
- [Custom UI Examples](./examples/headless-custom-ui/)
- [Migration Guide: Styled → Headless](./MIGRATION_GUIDE.md)

## API Client

Use the `SimpleIdmClient` directly for custom implementations:

```tsx
import { SimpleIdmClient } from '@tendant/simple-idm-solid';

const client = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  onUnauthorized: () => {
    // Handle 401 errors (e.g., redirect to login)
    window.location.href = '/login';
  },
});

// Login
const response = await client.login({
  username: 'user@example.com',
  password: 'password',
});

// Get current user
const user = await client.getCurrentUser();

// Logout
await client.logout();
```

### API Prefix Configuration

The `SimpleIdmClient` supports configurable endpoint prefixes for flexible API gateway routing and versioning.

#### Simple Configuration with Base Prefix (Recommended)

Set one prefix for all endpoints - the simplest way to configure:

```tsx
const client = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  basePrefix: '/api/v1/idm',
  // All endpoints automatically use /api/v1/idm/* pattern:
  // auth:          /api/v1/idm/auth
  // signup:        /api/v1/idm/signup
  // profile:       /api/v1/idm/profile
  // twoFA:         /api/v1/idm/2fa
  // email:         /api/v1/idm/email
  // passwordReset: /api/v1/idm/password-reset
  // oauth2:        /api/v1/idm/oauth2
});
```

**With selective overrides:**

```tsx
const client = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  basePrefix: '/api/v1/idm',
  prefixes: {
    // Override just 2FA to route to a different service
    twoFA: '/security-service/2fa',
  },
});
```

#### Default Configuration (v1)

By default (without any configuration), all endpoints use the v1 prefix pattern:

```tsx
const client = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  // Defaults to v1 prefixes:
  // auth:          /api/v1/idm/auth
  // signup:        /api/v1/idm/signup
  // profile:       /api/v1/idm/profile
  // twoFA:         /api/v1/idm/2fa
  // email:         /api/v1/idm/email
  // passwordReset: /api/v1/idm/password-reset
  // oauth2:        /api/v1/oauth2
});
```

#### Version-Based Configuration

Specify an API version for automatic prefix generation:

```tsx
const client = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  apiVersion: 'v2', // All endpoints will use /api/v2/idm/*
});
```

#### Custom Prefix Configuration

Override specific prefixes for per-route-group customization:

```tsx
const client = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  prefixes: {
    auth: '/custom/auth',
    signup: '/custom/signup',
    // Other prefixes use defaults
  },
});
```

#### Legacy Mode

For backward compatibility with pre-v2.0.0 simple-idm backends:

```tsx
const client = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  useLegacyPrefixes: true,
  // Uses legacy prefixes including:
  // twoFA: /idm/2fa (inconsistent - missing /api prefix)
});
```

**Note:** Legacy mode includes the inconsistent 2FA prefix `/idm/2fa/*` instead of `/api/idm/2fa/*`. Use `apiVersion: 'v1'` or custom prefixes for new deployments.

#### Configuration Priority

When multiple options are specified, priority is:

1. **basePrefix** (highest - simplest configuration)
2. **apiVersion**
3. **useLegacyPrefixes**
4. **prefixes** (partial overrides - merges with above)
5. **DEFAULT_V1_PREFIXES** (default)

```tsx
const client = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  basePrefix: '/api/v1/idm', // This takes precedence
  prefixes: {
    auth: '/custom/auth', // This overrides just the auth route
  },
});
// Result: auth = /custom/auth, others = /api/v1/idm/*
```

#### API Gateway Integration

Configure prefixes to match your API gateway routing rules:

```tsx
// Simple: All routes through one gateway path
const client = new SimpleIdmClient({
  baseUrl: 'https://api.example.com',
  basePrefix: '/gateway/idm',
  // All routes: /gateway/idm/auth, /gateway/idm/signup, etc.
});

// Advanced: Route different features to different services
const client = new SimpleIdmClient({
  baseUrl: 'https://api.example.com',
  basePrefix: '/gateway/idm',
  prefixes: {
    // Override specific routes to different backend services
    profile: '/user-service/profile',
    twoFA: '/security-service/2fa',
  },
});

// Kong/nginx Gateway example with version
const client = new SimpleIdmClient({
  baseUrl: 'https://api.example.com',
  apiVersion: 'v1',
  // Uses consistent /api/v1/idm/* pattern for all routes
});
```

## Hooks

### useAuth

Manage authentication state:

```tsx
import { useAuth, SimpleIdmClient } from '@tendant/simple-idm-solid';

function App() {
  const client = new SimpleIdmClient({ baseUrl: 'http://localhost:4000' });

  const auth = useAuth({
    client,
    checkAuthOnMount: true,
    onLoginSuccess: (user) => {
      console.log('Welcome!', user);
    },
  });

  return (
    <Show when={auth.isAuthenticated()} fallback={<LoginPage />}>
      <Dashboard user={auth.user()} onLogout={auth.logout} />
    </Show>
  );
}
```

### useForm

Form state management with validation:

```tsx
import { useForm, validators } from '@tendant/simple-idm-solid';

const form = useForm({
  initialValues: { username: '', password: '' },
  validate: {
    username: validators.required('Username is required'),
    password: [
      validators.required('Password is required'),
      validators.minLength(8),
    ],
  },
  onSubmit: async (values) => {
    await client.login(values);
  },
});
```

## Customization

### Tailwind Classes

All components accept a `class` prop for custom styling:

```tsx
<LoginForm
  apiBaseUrl="http://localhost:4000"
  class="my-custom-class"
/>
```

### CSS Variables

Override theme colors:

```css
:root {
  --idm-color-primary: #3B82F6;
  --idm-color-error: #EF4444;
  --idm-color-success: #10B981;
  --idm-radius: 0.5rem;
}
```

## Important: Cookie-Based Authentication

**simple-idm** uses **HTTP-only cookies** for JWT token storage (not localStorage).

This means:
- ✅ Tokens are automatically sent with requests
- ✅ More secure (XSS protection)
- ✅ No manual token management needed
- ❌ Requires CORS configuration for cross-origin requests

### CORS Configuration

If your frontend and backend are on different origins, ensure CORS allows credentials:

```go
// In simple-idm backend
r.Use(cors.Handler(cors.Options{
  AllowedOrigins:   []string{"http://localhost:3000"},
  AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
  AllowedHeaders:   []string{"Accept", "Content-Type"},
  AllowCredentials: true,  // CRITICAL for cookies
}))
```

## Requirements

- **Backend**: [simple-idm](https://github.com/tendant/simple-idm) running (default: http://localhost:4000)
- **SolidJS**: ^1.8.0
- **Tailwind CSS**: ^4.0.0 (with @tailwindcss/vite)

## Migration Guide

Choosing between styled components and headless hooks? See the comprehensive [Migration Guide](./MIGRATION_GUIDE.md) for:

- ✅ When to use styled vs headless
- ✅ Step-by-step migration examples
- ✅ Props mapping reference
- ✅ Common patterns
- ✅ FAQ

## Examples

See the [examples directory](./examples/) for complete working examples:

### Quick Reference
- **[Basic Usage](./examples/BASIC_USAGE.md)** - Quick code snippets for styled components and headless hooks

### Complete Applications
- **[SolidJS Basic App](./examples/solidjs-basic/)** - Full app with routing, auth context, and all styled components
- **[Custom UI with Headless Hooks](./examples/headless-custom-ui/)** - Building custom UIs with headless hooks and Tailwind
- **[Testing with Mocked API](./examples/testing-with-mocks/)** - Unit and integration testing guide

### Running Examples

```bash
# Styled components example
cd examples/solidjs-basic
npm install && npm run dev
# Visit http://localhost:3000
```

## Development

```bash
# Clone repository
git clone https://github.com/tendant/simple-idm-solid.git
cd simple-idm-solid

# Install dependencies
npm install

# Build library
npm run build

# Type check
npm run typecheck
```

## License

MIT © Lei Wang

## Links

- [simple-idm Backend](https://github.com/tendant/simple-idm)
- [Documentation](./IMPLEMENTATION_PLAN.md)
- [Issues](https://github.com/tendant/simple-idm-solid/issues)

---

**Built with [Claude Code](https://claude.ai/code) via [Happy](https://happy.engineering)**
