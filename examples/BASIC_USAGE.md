# Basic Usage Examples

Quick reference examples for common use cases.

## Table of Contents

- [Styled Components](#styled-components) - Ready-to-use components
- [Headless Hooks](#headless-hooks) - Custom UI with business logic
- [Direct API Client](#direct-api-client-usage) - Low-level API access

## Simple Login Form

```tsx
import { LoginForm } from '@tendant/simple-idm-solid';
import '@tendant/simple-idm-solid/styles';

function App() {
  return (
    <LoginForm
      apiBaseUrl="http://localhost:4000"
      onSuccess={(response) => {
        console.log('Logged in!', response);
        window.location.href = '/dashboard';
      }}
      onError={(error) => {
        console.error('Login failed:', error);
      }}
      showMagicLinkOption
      showRegistrationLink
    />
  );
}
```

## Magic Link Authentication

```tsx
import { MagicLinkForm, MagicLinkValidate } from '@tendant/simple-idm-solid';
import { useSearchParams } from '@solidjs/router';

// Request magic link
function MagicLinkPage() {
  return (
    <MagicLinkForm
      apiBaseUrl="http://localhost:4000"
      onSuccess={() => alert('Check your email!')}
    />
  );
}

// Validate magic link token
function ValidatePage() {
  const [params] = useSearchParams();

  return (
    <MagicLinkValidate
      apiBaseUrl="http://localhost:4000"
      token={params.token}
      onSuccess={(response) => {
        console.log('Logged in via magic link!', response);
        window.location.href = '/dashboard';
      }}
      autoValidate
    />
  );
}
```

## User Registration

```tsx
import {
  PasswordlessRegistrationForm,
  PasswordRegistrationForm
} from '@tendant/simple-idm-solid';

// Passwordless (magic link)
function RegisterPasswordless() {
  return (
    <PasswordlessRegistrationForm
      apiBaseUrl="http://localhost:4000"
      onSuccess={(response) => {
        console.log('Account created!', response);
        alert('Check your email to complete registration');
      }}
      requireInvitationCode={false}
    />
  );
}

// With password
function RegisterWithPassword() {
  return (
    <PasswordRegistrationForm
      apiBaseUrl="http://localhost:4000"
      onSuccess={(response) => {
        console.log('Account created!', response);
        window.location.href = '/login';
      }}
      requireInvitationCode={false}
    />
  );
}
```

## Profile Management

```tsx
import { ProfileSettingsForm } from '@tendant/simple-idm-solid';

function ProfilePage() {
  return (
    <ProfileSettingsForm
      apiBaseUrl="http://localhost:4000"
      onSuccess={(response, operation) => {
        console.log(`${operation} updated successfully!`, response);
      }}
      onError={(error, operation) => {
        console.error(`Failed to update ${operation}:`, error);
      }}
      defaultTab="username"
    />
  );
}
```

## Two-Factor Authentication Setup

```tsx
import { TwoFactorAuthSetup } from '@tendant/simple-idm-solid';

function TwoFactorPage() {
  return (
    <TwoFactorAuthSetup
      apiBaseUrl="http://localhost:4000"
      onSuccess={(response, operation) => {
        if (operation === 'enable') {
          console.log('2FA enabled successfully!');
        } else if (operation === 'disable') {
          console.log('2FA disabled successfully!');
        }
      }}
      autoLoadStatus={true}
    />
  );
}
```

## Email Verification

```tsx
import { EmailVerificationPage } from '@tendant/simple-idm-solid';
import { useSearchParams } from '@solidjs/router';

// Auto-verify from URL parameter
function VerifyEmailPage() {
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

// Manual token entry
function ManualVerifyPage() {
  return (
    <EmailVerificationPage
      apiBaseUrl="http://localhost:4000"
      autoVerify={false}
      loginUrl="/login"
    />
  );
}
```

## Password Reset

### Forgot Password Form

```tsx
import { ForgotPasswordForm } from '@tendant/simple-idm-solid';

function ForgotPasswordPage() {
  return (
    <ForgotPasswordForm
      apiBaseUrl="http://localhost:4000"
      method="email"
      onSuccess={(response) => {
        console.log('Password reset email sent!', response);
      }}
      loginUrl="/login"
    />
  );
}

// With username instead
function ForgotPasswordUsername() {
  return (
    <ForgotPasswordForm
      apiBaseUrl="http://localhost:4000"
      method="username"
      onSuccess={(response) => {
        console.log('Password reset email sent!', response);
      }}
      loginUrl="/login"
    />
  );
}

// Allow both email or username
function ForgotPasswordBoth() {
  return (
    <ForgotPasswordForm
      apiBaseUrl="http://localhost:4000"
      method="both"
      onSuccess={(response) => {
        console.log('Password reset email sent!', response);
      }}
      loginUrl="/login"
    />
  );
}
```

### Reset Password Form

```tsx
import { ResetPasswordForm } from '@tendant/simple-idm-solid';
import { useSearchParams } from '@solidjs/router';

// Auto-populate token from URL
function ResetPasswordPage() {
  const [params] = useSearchParams();

  return (
    <ResetPasswordForm
      apiBaseUrl="http://localhost:4000"
      token={params.token}
      autoLoadPolicy={true}
      onSuccess={(response) => {
        console.log('Password reset successfully!', response);
        window.location.href = '/login';
      }}
      loginUrl="/login"
    />
  );
}

// Manual token entry
function ManualResetPasswordPage() {
  return (
    <ResetPasswordForm
      apiBaseUrl="http://localhost:4000"
      showTokenInput={true}
      autoLoadPolicy={true}
      onSuccess={(response) => {
        console.log('Password reset successfully!', response);
        window.location.href = '/login';
      }}
      loginUrl="/login"
    />
  );
}
```

## Using the Auth Hook

```tsx
import { SimpleIdmClient, useAuth } from '@tendant/simple-idm-solid';
import { Show } from 'solid-js';

function App() {
  const client = new SimpleIdmClient({
    baseUrl: 'http://localhost:4000',
    onUnauthorized: () => window.location.href = '/login'
  });

  const auth = useAuth({
    client,
    checkAuthOnMount: true,
    onLoginSuccess: (user) => console.log('Welcome!', user),
    onLogoutSuccess: () => window.location.href = '/login',
  });

  return (
    <Show
      when={auth.isAuthenticated()}
      fallback={<LoginPage />}
    >
      <Dashboard
        user={auth.user()}
        onLogout={() => auth.logout()}
      />
    </Show>
  );
}
```

## Protected Routes

```tsx
import { Component, Show } from 'solid-js';
import { Navigate } from '@solidjs/router';

function ProtectedRoute(props) {
  const auth = useAuthContext();

  return (
    <Show when={auth.isAuthenticated()} fallback={<Navigate href="/login" />}>
      {props.children}
    </Show>
  );
}

// Usage
<Route path="/dashboard" component={() => (
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
)} />
```

## Headless Hooks

Headless hooks provide business logic without UI for building completely custom interfaces.

### Custom Login with useLogin

```tsx
import { useLogin } from '@tendant/simple-idm-solid';

function MyCustomLogin() {
  const login = useLogin({
    client: 'http://localhost:4000',
    onSuccess: (response) => {
      console.log('Logged in!', response);
      window.location.href = '/dashboard';
    },
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

### Custom Registration with useRegistration

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
      <input
        type="password"
        value={reg.password()}
        onInput={(e) => reg.setPassword(e.currentTarget.value)}
        placeholder="Password"
      />

      {/* Password Strength Indicator */}
      <Show when={reg.password()}>
        <div class="strength-bar">
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

      <button disabled={!reg.canSubmit()}>
        Register
      </button>
    </form>
  );
}
```

### Custom Magic Link with useMagicLink

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
      <Show
        when={!magic.success()}
        fallback={<p>Check your email!</p>}
      >
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

### Custom Profile Management with useProfile

```tsx
import { useProfile } from '@tendant/simple-idm-solid';
import { createSignal, Show } from 'solid-js';

function MyProfileManagement() {
  const profile = useProfile({
    client: 'http://localhost:4000',
    onSuccess: (response, operation) => {
      console.log(`${operation} updated!`, response);
    },
  });

  const [tab, setTab] = createSignal<'username' | 'phone' | 'password'>('username');

  return (
    <div>
      {/* Tab Navigation */}
      <div>
        <button onClick={() => setTab('username')}>Username</button>
        <button onClick={() => setTab('phone')}>Phone</button>
        <button onClick={() => setTab('password')}>Password</button>
      </div>

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
            placeholder="Current Password"
          />
          <button disabled={!profile.canSubmitUsername()}>
            Update Username
          </button>
        </form>
      </Show>

      {/* Update Phone */}
      <Show when={tab() === 'phone'}>
        <form onSubmit={(e) => { e.preventDefault(); profile.updatePhone(); }}>
          <input
            type="tel"
            value={profile.phone()}
            onInput={(e) => profile.setPhone(e.currentTarget.value)}
            placeholder="+1 555 123 4567"
          />
          <button disabled={!profile.canSubmitPhone()}>
            Update Phone
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
          <div>Strength: {profile.passwordStrength().text}</div>
          <input
            type="password"
            value={profile.confirmNewPassword()}
            onInput={(e) => profile.setConfirmNewPassword(e.currentTarget.value)}
            placeholder="Confirm Password"
          />
          <button disabled={!profile.canSubmitPassword()}>
            Update Password
          </button>
        </form>
      </Show>

      {profile.success() && <p class="success">{profile.success()}</p>}
      {profile.error() && <p class="error">{profile.error()}</p>}
    </div>
  );
}
```

### Custom 2FA Setup with use2FA

```tsx
import { use2FA } from '@tendant/simple-idm-solid';
import { Show } from 'solid-js';

function My2FASetup() {
  const twoFA = use2FA({
    client: 'http://localhost:4000',
    autoLoadStatus: true,
  });

  return (
    <div>
      <h2>Two-Factor Authentication</h2>

      {/* Current Status */}
      <div>
        <p>2FA Enabled: {twoFA.isEnabled() ? 'Yes' : 'No'}</p>
        <Show when={twoFA.enabledTypes().length > 0}>
          <p>Methods: {twoFA.enabledTypes().join(', ')}</p>
        </Show>
      </div>

      {/* Setup TOTP */}
      <Show when={!twoFA.isEnabled()}>
        <div>
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
              <button
                onClick={() => twoFA.enable()}
                disabled={!twoFA.canEnable()}
              >
                Enable 2FA
              </button>
            </div>
          </Show>
        </div>
      </Show>

      {/* Disable 2FA */}
      <Show when={twoFA.isEnabled()}>
        {twoFA.enabledTypes().map((type) => (
          <button onClick={() => twoFA.disable(type as any)}>
            Disable {type}
          </button>
        ))}
      </Show>

      {twoFA.success() && <p class="success">{twoFA.success()}</p>}
      {twoFA.error() && <p class="error">{twoFA.error()}</p>}
    </div>
  );
}
```

### Custom Email Verification with useEmailVerification

```tsx
import { useEmailVerification } from '@tendant/simple-idm-solid';
import { useSearchParams } from '@solidjs/router';
import { Show } from 'solid-js';

// Verify email from URL token
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
          <p class="error">{emailVerify.error()}</p>
          <button onClick={() => emailVerify.resend()}>
            Resend Verification Email
          </button>
        </div>
      </Show>
    </div>
  );
}

// Check verification status
function EmailStatusWidget() {
  const emailVerify = useEmailVerification({
    client: 'http://localhost:4000',
    autoLoadStatus: true,
  });

  return (
    <div>
      <Show when={emailVerify.isVerified()}>
        <p>✓ Email verified on {emailVerify.verifiedAt()}</p>
      </Show>

      <Show when={!emailVerify.isVerified()}>
        <div>
          <p>⚠ Email not verified</p>
          <button onClick={() => emailVerify.resend()}>
            Send Verification Email
          </button>
        </div>
      </Show>
    </div>
  );
}
```

### Custom Forgot Password with useForgotPassword

```tsx
import { useForgotPassword } from '@tendant/simple-idm-solid';
import { Show } from 'solid-js';

function MyForgotPassword() {
  const forgotPassword = useForgotPassword({
    client: 'http://localhost:4000',
    method: 'email',
    onSuccess: (response) => {
      console.log('Reset email sent!', response);
    },
  });

  return (
    <div class="my-custom-design">
      <h1>Forgot Password</h1>

      <Show when={forgotPassword.success()}>
        <div class="success-message">
          <p>{forgotPassword.success()}</p>
          <p>Check your email for a password reset link.</p>
        </div>
      </Show>

      <Show when={!forgotPassword.success()}>
        <form onSubmit={(e) => { e.preventDefault(); forgotPassword.submit(); }}>
          <label>
            {forgotPassword.method() === 'email' ? 'Email Address' : 'Username'}
          </label>
          <input
            type={forgotPassword.method() === 'email' ? 'email' : 'text'}
            value={forgotPassword.identifier()}
            onInput={(e) => forgotPassword.setIdentifier(e.currentTarget.value)}
            placeholder={forgotPassword.method() === 'email' ? 'you@example.com' : 'your-username'}
          />

          {forgotPassword.error() && (
            <p class="error">{forgotPassword.error()}</p>
          )}

          <button
            type="submit"
            disabled={!forgotPassword.canSubmit() || forgotPassword.isLoading()}
          >
            {forgotPassword.isLoading() ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </Show>

      <a href="/login">Back to Login</a>
    </div>
  );
}
```

### Custom Reset Password with useResetPassword

```tsx
import { useResetPassword } from '@tendant/simple-idm-solid';
import { useSearchParams } from '@solidjs/router';
import { Show } from 'solid-js';

function MyResetPassword() {
  const [params] = useSearchParams();

  const resetPassword = useResetPassword({
    client: 'http://localhost:4000',
    initialToken: params.token,
    autoLoadPolicy: true,
    onSuccess: (response) => {
      console.log('Password reset!', response);
      setTimeout(() => window.location.href = '/login', 2000);
    },
  });

  return (
    <div class="my-custom-design">
      <h1>Reset Your Password</h1>

      <Show when={resetPassword.success()}>
        <div class="success-message">
          <p>{resetPassword.success()}</p>
          <p>Redirecting to login...</p>
        </div>
      </Show>

      <Show when={!resetPassword.success()}>
        <form onSubmit={(e) => { e.preventDefault(); resetPassword.submit(); }}>
          {/* Token input if not in URL */}
          <Show when={!params.token}>
            <div>
              <label>Reset Token</label>
              <input
                type="text"
                value={resetPassword.token()}
                onInput={(e) => resetPassword.setToken(e.currentTarget.value)}
                placeholder="Paste token from email"
              />
            </div>
          </Show>

          {/* New password */}
          <div>
            <label>New Password</label>
            <input
              type="password"
              value={resetPassword.newPassword()}
              onInput={(e) => resetPassword.setNewPassword(e.currentTarget.value)}
              placeholder="Enter new password"
            />

            {/* Password strength indicator */}
            <Show when={resetPassword.newPassword().length > 0}>
              <div class="strength-indicator">
                <span class={resetPassword.passwordStrength().color}>
                  Strength: {resetPassword.passwordStrength().label}
                </span>
                <div class="progress-bar">
                  <div
                    class="progress"
                    style={{
                      width: `${resetPassword.passwordStrength().percentage}%`,
                      'background-color': resetPassword.passwordStrength().color,
                    }}
                  />
                </div>
              </div>
            </Show>

            {/* Password policy requirements */}
            <Show when={resetPassword.policy()}>
              <ul class="policy-requirements">
                <li>Min {resetPassword.policy()!.min_length} characters</li>
                <Show when={resetPassword.policy()!.require_uppercase}>
                  <li>Include uppercase letter</li>
                </Show>
                <Show when={resetPassword.policy()!.require_lowercase}>
                  <li>Include lowercase letter</li>
                </Show>
                <Show when={resetPassword.policy()!.require_digit}>
                  <li>Include number</li>
                </Show>
                <Show when={resetPassword.policy()!.require_special_char}>
                  <li>Include special character</li>
                </Show>
              </ul>
            </Show>
          </div>

          {/* Confirm password */}
          <div>
            <label>Confirm Password</label>
            <input
              type="password"
              value={resetPassword.confirmPassword()}
              onInput={(e) => resetPassword.setConfirmPassword(e.currentTarget.value)}
              placeholder="Confirm new password"
            />

            <Show when={resetPassword.confirmPassword().length > 0}>
              <p class={resetPassword.passwordsMatch() ? 'success' : 'error'}>
                {resetPassword.passwordsMatch() ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            </Show>
          </div>

          {resetPassword.error() && (
            <p class="error">{resetPassword.error()}</p>
          )}

          <button
            type="submit"
            disabled={!resetPassword.canSubmit() || resetPassword.isLoading()}
          >
            {resetPassword.isLoading() ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </Show>

      <a href="/login">Back to Login</a>
    </div>
  );
}
```

**Learn more:** See [examples/headless-custom-ui/](./headless-custom-ui/) for complete custom UI examples.

## Direct API Client Usage

```tsx
import { SimpleIdmClient } from '@tendant/simple-idm-solid';

const client = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  onUnauthorized: () => {
    console.log('Session expired');
    window.location.href = '/login';
  },
});

// Login
async function login(username: string, password: string) {
  try {
    const response = await client.login({ username, password });
    console.log('Logged in:', response);
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// Get current user
async function getCurrentUser() {
  try {
    const user = await client.getCurrentUser();
    console.log('Current user:', user);
    return user;
  } catch (error) {
    console.error('Not authenticated');
    return null;
  }
}

// Logout
async function logout() {
  await client.logout();
  window.location.href = '/login';
}

// Request magic link
async function requestMagicLink(email: string) {
  const response = await client.requestMagicLink({
    email,
    redirect_url: 'http://localhost:3000/magic-link/validate'
  });
  console.log('Magic link sent');
}

// Validate magic link
async function validateMagicLink(token: string) {
  const response = await client.validateMagicLink(token);
  console.log('Logged in via magic link:', response);
  return response;
}

// Register with password
async function register(username: string, email: string, password: string) {
  const response = await client.signupWithPassword({
    username,
    email,
    password,
  });
  console.log('Registered:', response);
  return response;
}

// Register passwordless
async function registerPasswordless(email: string) {
  const response = await client.signupPasswordless({
    email,
    redirect_url: 'http://localhost:3000/magic-link/validate'
  });
  console.log('Registration link sent');
  return response;
}
```

### API Prefix Configuration

Configure custom API endpoint prefixes for API gateway routing:

```tsx
import { SimpleIdmClient } from '@tendant/simple-idm-solid';

// Simple: Set one prefix for all endpoints (RECOMMENDED)
const client = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  basePrefix: '/api/v1/idm',
  // All endpoints automatically use /api/v1/idm/* pattern
});

// Default (v1) configuration - no prefix needed
const defaultClient = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  // Automatically uses /api/v1/idm/* for all endpoints
});

// Base prefix with selective overrides
const advancedClient = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  basePrefix: '/api/v1/idm',
  prefixes: {
    // Override just 2FA to route to different service
    twoFA: '/security-service/2fa',
  },
});

// Version-based configuration
const clientV2 = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  apiVersion: 'v2', // All endpoints use /api/v2/idm/*
});

// Custom prefix configuration (fully manual)
const customClient = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  prefixes: {
    auth: '/gateway/auth-service',
    signup: '/gateway/auth-service/signup',
    profile: '/gateway/user-service/profile',
    // Other prefixes use defaults
  },
});

// Legacy mode (for backward compatibility)
const legacyClient = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  useLegacyPrefixes: true,
  // Uses old prefix pattern including /idm/2fa (without /api prefix)
});

// API Gateway integration example
const gatewayClient = new SimpleIdmClient({
  baseUrl: 'https://api.example.com',
  basePrefix: '/gateway/idm',
  prefixes: {
    // Override specific route groups for microservices
    profile: '/user-service/profile',
    twoFA: '/security-service/2fa',
  },
});
```

## Custom Form with useForm Hook

```tsx
import { useForm, validators } from '@tendant/simple-idm-solid';

function CustomLoginForm() {
  const client = new SimpleIdmClient({ baseUrl: 'http://localhost:4000' });

  const form = useForm({
    initialValues: {
      username: '',
      password: ''
    },
    validate: {
      username: validators.required('Username is required'),
      password: [
        validators.required('Password is required'),
        validators.minLength(8, 'Password must be at least 8 characters'),
      ],
    },
    onSubmit: async (values) => {
      const response = await client.login(values);
      console.log('Success!', response);
      window.location.href = '/dashboard';
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <input
          name="username"
          value={form.values.username}
          onInput={(e) => form.setFieldValue('username', e.currentTarget.value)}
          onBlur={() => form.setFieldTouched('username', true)}
        />
        {form.errors.username && form.touched.username && (
          <div class="error">{form.errors.username}</div>
        )}
      </div>

      <div>
        <input
          type="password"
          name="password"
          value={form.values.password}
          onInput={(e) => form.setFieldValue('password', e.currentTarget.value)}
          onBlur={() => form.setFieldTouched('password', true)}
        />
        {form.errors.password && form.touched.password && (
          <div class="error">{form.errors.password}</div>
        )}
      </div>

      <button type="submit" disabled={form.isSubmitting()}>
        {form.isSubmitting() ? 'Logging in...' : 'Login'}
      </button>

      {form.submitError() && (
        <div class="error">{form.submitError()}</div>
      )}
    </form>
  );
}
```

## Customizing Styles

```tsx
// Option 1: CSS Variables
// In your global CSS:
:root {
  --idm-color-primary: #8B5CF6;
  --idm-color-error: #DC2626;
  --idm-color-success: #059669;
  --idm-radius: 0.75rem;
}

// Option 2: Tailwind Classes
<LoginForm
  apiBaseUrl="http://localhost:4000"
  class="shadow-2xl border-2 border-purple-500"
  onSuccess={handleSuccess}
/>

// Option 3: Use primitives to build custom UI
import { Input, Button, Card } from '@tendant/simple-idm-solid';

function CustomForm() {
  return (
    <Card>
      <Input
        label="Email"
        type="email"
        class="my-custom-input"
      />
      <Button
        variant="primary"
        class="w-full"
      >
        Submit
      </Button>
    </Card>
  );
}
```

## Complete App Template

```tsx
import { render } from 'solid-js/web';
import { Router, Route, Navigate } from '@solidjs/router';
import {
  LoginForm,
  SimpleIdmClient,
  useAuth
} from '@tendant/simple-idm-solid';
import '@tendant/simple-idm-solid/styles';
import { createContext, useContext, Show } from 'solid-js';

// Auth Context
const AuthContext = createContext();
const useAuthContext = () => useContext(AuthContext);

function AuthProvider(props) {
  const client = new SimpleIdmClient({
    baseUrl: 'http://localhost:4000',
    onUnauthorized: () => window.location.href = '/login',
  });

  const auth = useAuth({
    client,
    checkAuthOnMount: true,
  });

  return (
    <AuthContext.Provider value={auth}>
      {props.children}
    </AuthContext.Provider>
  );
}

// Protected Route
function ProtectedRoute(props) {
  const auth = useAuthContext();

  return (
    <Show when={auth.isAuthenticated()} fallback={<Navigate href="/login" />}>
      {props.children}
    </Show>
  );
}

// Pages
function LoginPage() {
  return (
    <div class="min-h-screen flex items-center justify-center">
      <LoginForm
        apiBaseUrl="http://localhost:4000"
        onSuccess={() => window.location.href = '/dashboard'}
        showMagicLinkOption
        showRegistrationLink
      />
    </div>
  );
}

function Dashboard() {
  const auth = useAuthContext();

  return (
    <div>
      <h1>Welcome, {auth.user()?.email}!</h1>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
}

// App
function App() {
  return (
    <AuthProvider>
      <Router>
        <Route path="/" component={() => <Navigate href="/login" />} />
        <Route path="/login" component={LoginPage} />
        <Route path="/dashboard" component={() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )} />
      </Router>
    </AuthProvider>
  );
}

render(() => <App />, document.getElementById('root'));
```
