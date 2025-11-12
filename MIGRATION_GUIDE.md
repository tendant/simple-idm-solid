# Migration Guide: Styled Components vs Headless Hooks

This guide helps you choose between styled components and headless hooks, and shows how to migrate between them.

## Table of Contents

- [Overview](#overview)
- [When to Use What](#when-to-use-what)
- [Migration: Styled → Headless](#migration-styled--headless)
- [Migration: Headless → Styled](#migration-headless--styled)
- [Mixing Both Approaches](#mixing-both-approaches)
- [Common Patterns](#common-patterns)

## Overview

### Styled Components (High-Level API)

Pre-built components with complete UI and business logic:

```tsx
import { LoginForm } from '@tendant/simple-idm-solid';

<LoginForm
  apiBaseUrl="http://localhost:4000"
  onSuccess={(response) => navigate('/dashboard')}
/>
```

**✅ Pros:**
- Quick setup (one import, done)
- Consistent design out of the box
- Less code to write
- Good for prototypes and standard UIs

**❌ Cons:**
- Limited customization
- Larger bundle size (includes UI)
- Hard to match existing design systems

### Headless Hooks (Low-Level API)

Business logic only, you provide the UI:

```tsx
import { useLogin } from '@tendant/simple-idm-solid';

const login = useLogin({
  client: 'http://localhost:4000',
  onSuccess: (response) => navigate('/dashboard'),
});

// Build your own UI with complete control
```

**✅ Pros:**
- 100% UI control
- Smaller bundle (logic only)
- Works with any CSS framework
- Easy to match design systems
- Better testability

**❌ Cons:**
- More code to write
- Need to handle UI yourself
- Responsible for accessibility

## When to Use What

### Use Styled Components When...

✅ You need authentication UI quickly
✅ You're prototyping
✅ You don't have a custom design system
✅ You want consistent, tested UI
✅ You're okay with the default design

### Use Headless Hooks When...

✅ You have a custom design system
✅ You need pixel-perfect control
✅ You're using a specific CSS framework (Tailwind, UnoCSS, etc.)
✅ You want minimal bundle size
✅ You need multiple UI variations with same logic
✅ You're building a component library

## Migration: Styled → Headless

### Example: LoginForm to useLogin

**Before (Styled):**
```tsx
import { LoginForm } from '@tendant/simple-idm-solid';

function LoginPage() {
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
      redirectUrl="/dashboard"
    />
  );
}
```

**After (Headless):**
```tsx
import { useLogin } from '@tendant/simple-idm-solid';
import { Show } from 'solid-js';

function LoginPage() {
  // Extract business logic to headless hook
  const login = useLogin({
    client: 'http://localhost:4000',
    onSuccess: (response) => {
      console.log('Logged in!', response);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
    autoRedirect: true,
    redirectUrl: '/dashboard',
  });

  // Build custom UI
  return (
    <div class="login-page">
      <h1>Sign In</h1>

      {/* Error Display */}
      <Show when={login.error()}>
        <div class="error-alert">{login.error()}</div>
      </Show>

      {/* Success Display */}
      <Show when={login.success()}>
        <div class="success-alert">{login.success()}</div>
      </Show>

      {/* Login Form */}
      <form onSubmit={(e) => { e.preventDefault(); login.submit(); }}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={login.username()}
            onInput={(e) => login.setUsername(e.currentTarget.value)}
            placeholder="Enter username"
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={login.password()}
            onInput={(e) => login.setPassword(e.currentTarget.value)}
            placeholder="Enter password"
          />
        </div>

        <button
          type="submit"
          disabled={!login.canSubmit() || login.isLoading()}
        >
          {login.isLoading() ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Links (previously showMagicLinkOption, showRegistrationLink) */}
      <div class="links">
        <a href="/magic-link">Login with magic link</a>
        <a href="/register">Don't have an account? Sign up</a>
      </div>
    </div>
  );
}
```

### Example: PasswordRegistrationForm to useRegistration

**Before (Styled):**
```tsx
import { PasswordRegistrationForm } from '@tendant/simple-idm-solid';

<PasswordRegistrationForm
  apiBaseUrl="http://localhost:4000"
  onSuccess={(response) => navigate('/login')}
  requireInvitationCode={false}
  showLoginLink
/>
```

**After (Headless):**
```tsx
import { useRegistration } from '@tendant/simple-idm-solid';
import { Show } from 'solid-js';

function RegistrationPage() {
  const reg = useRegistration({
    client: 'http://localhost:4000',
    mode: 'password',
    onSuccess: (response) => navigate('/login'),
    requireInvitationCode: false,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); reg.submit(); }}>
      <input
        type="text"
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

      <div>
        <input
          type="password"
          value={reg.password()}
          onInput={(e) => reg.setPassword(e.currentTarget.value)}
          placeholder="Password"
        />

        {/* Password Strength (built into hook) */}
        <Show when={reg.password()}>
          <div class="strength-indicator">
            <div
              class={`bar ${reg.passwordStrength().color}`}
              style={{ width: `${reg.passwordStrength().percentage}%` }}
            />
            <span>{reg.passwordStrength().text}</span>
          </div>
        </Show>
      </div>

      <input
        type="password"
        value={reg.confirmPassword()}
        onInput={(e) => reg.setConfirmPassword(e.currentTarget.value)}
        placeholder="Confirm Password"
        class:error={!reg.passwordsMatch() && reg.confirmPassword()}
      />

      <Show when={!reg.passwordsMatch() && reg.confirmPassword()}>
        <p class="error">Passwords do not match</p>
      </Show>

      <button disabled={!reg.canSubmit()}>
        Create Account
      </button>

      {/* showLoginLink */}
      <a href="/login">Already have an account? Sign in</a>
    </form>
  );
}
```

### Example: MagicLinkForm to useMagicLink

**Before (Styled):**
```tsx
import { MagicLinkForm } from '@tendant/simple-idm-solid';

<MagicLinkForm
  apiBaseUrl="http://localhost:4000"
  onSuccess={() => console.log('Check your email!')}
  showPasswordLoginLink
/>
```

**After (Headless):**
```tsx
import { useMagicLink } from '@tendant/simple-idm-solid';
import { Show } from 'solid-js';

function MagicLinkPage() {
  const magic = useMagicLink({
    client: 'http://localhost:4000',
    onSuccess: () => console.log('Check your email!'),
    cooldownSeconds: 60,
  });

  return (
    <div>
      <Show
        when={!magic.success()}
        fallback={
          <div>
            <p>Magic link sent! Check your email.</p>
            <Show when={magic.canResend()}>
              <button onClick={() => magic.resend()}>Resend</button>
            </Show>
          </div>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); magic.submit(); }}>
          <input
            type="email"
            value={magic.username()}
            onInput={(e) => magic.setUsername(e.currentTarget.value)}
            placeholder="Email or username"
          />

          <button
            type="submit"
            disabled={!magic.canSubmit()}
          >
            {magic.cooldown() > 0
              ? `Resend in ${magic.cooldown()}s`
              : magic.isLoading()
                ? 'Sending...'
                : 'Send Magic Link'}
          </button>
        </form>
      </Show>

      {magic.error() && <p class="error">{magic.error()}</p>}

      {/* showPasswordLoginLink */}
      <a href="/login">Back to password login</a>
    </div>
  );
}
```

## Migration: Headless → Styled

Sometimes you want to go from headless back to styled (e.g., for rapid prototyping).

**Before (Headless):**
```tsx
import { useLogin } from '@tendant/simple-idm-solid';

const login = useLogin({ client: 'http://localhost:4000' });

// 50+ lines of custom UI...
```

**After (Styled):**
```tsx
import { LoginForm } from '@tendant/simple-idm-solid';

<LoginForm
  apiBaseUrl="http://localhost:4000"
  onSuccess={login.onSuccess}
  onError={login.onError}
/>
```

Much simpler! But you lose the custom UI.

## Mixing Both Approaches

You can use both styled components and headless hooks in the same app:

```tsx
// Login: Use styled component (standard UI is fine)
import { LoginForm } from '@tendant/simple-idm-solid';

function LoginPage() {
  return <LoginForm apiBaseUrl="..." />;
}

// Registration: Use headless (need custom multi-step wizard)
import { useRegistration } from '@tendant/simple-idm-solid';

function RegistrationWizard() {
  const reg = useRegistration({ client: '...' });

  return (
    <MultiStepWizard>
      <Step1 registration={reg} />
      <Step2 registration={reg} />
      <Step3 registration={reg} />
    </MultiStepWizard>
  );
}
```

## Common Patterns

### Pattern 1: Wrapper Component

Create your own styled wrapper around a headless hook:

```tsx
// MyLoginForm.tsx - Your custom styled wrapper
import { useLogin, type UseLoginConfig } from '@tendant/simple-idm-solid';
import { Show } from 'solid-js';

interface MyLoginFormProps extends UseLoginConfig {
  theme?: 'light' | 'dark';
}

export function MyLoginForm(props: MyLoginFormProps) {
  const login = useLogin(props);

  return (
    <div class={`my-login ${props.theme || 'light'}`}>
      {/* Your custom UI using login hook */}
      <input
        value={login.username()}
        onInput={(e) => login.setUsername(e.currentTarget.value)}
      />
      {/* ... */}
    </div>
  );
}

// Usage: Just like a styled component!
<MyLoginForm
  client="http://localhost:4000"
  onSuccess={handleSuccess}
  theme="dark"
/>
```

### Pattern 2: Feature-Specific Customization

Use styled components by default, headless for special cases:

```tsx
// Standard login page - use styled
<LoginForm apiBaseUrl="..." />

// Admin login with custom branding - use headless
const adminLogin = useLogin({ client: '...' });
<AdminBrandedLoginUI login={adminLogin} />

// Mobile app login with native UI - use headless
const mobileLogin = useLogin({ client: '...' });
<NativeLoginScreen login={mobileLogin} />
```

### Pattern 3: Gradual Migration

Migrate one component at a time:

**Week 1:** Login stays styled, Registration becomes headless
```tsx
<LoginForm apiBaseUrl="..." /> {/* Styled */}
<CustomRegistration /> {/* Headless */}
```

**Week 2:** Both become headless
```tsx
<CustomLogin /> {/* Headless */}
<CustomRegistration /> {/* Headless */}
```

## Props Mapping Reference

### LoginForm → useLogin

| LoginForm Prop | useLogin Equivalent |
|---|---|
| `apiBaseUrl` | `client` |
| `onSuccess` | `onSuccess` |
| `onError` | `onError` |
| `redirectUrl` | `redirectUrl` + `autoRedirect: true` |
| `showMagicLinkOption` | Render link manually |
| `showRegistrationLink` | Render link manually |
| `class` | N/A (you control all styling) |

### PasswordRegistrationForm → useRegistration

| PasswordRegistrationForm Prop | useRegistration Equivalent |
|---|---|
| `apiBaseUrl` | `client` |
| `onSuccess` | `onSuccess` |
| `onError` | `onError` |
| `requireInvitationCode` | `requireInvitationCode` |
| `redirectUrl` | `redirectUrl` + `autoRedirect: true` |
| `showLoginLink` | Render link manually |

### MagicLinkForm → useMagicLink

| MagicLinkForm Prop | useMagicLink Equivalent |
|---|---|
| `apiBaseUrl` | `client` |
| `onSuccess` | `onSuccess` |
| `onError` | `onError` |
| `showPasswordLoginLink` | Render link manually |

## Questions?

**Q: Can I use headless hooks with the styled components' CSS?**
A: No, styled components have their own scoped styles. You'll need to copy or recreate the styles.

**Q: Will I lose functionality going headless?**
A: No! The headless hooks have ALL the same business logic. You just need to provide the UI.

**Q: Can I customize styled components?**
A: Limited. You can pass `class` prop for some styling, but major changes require headless.

**Q: Which approach is recommended?**
A: Start with styled components. Switch to headless when you need custom UI.

**Q: Can I mix styled and headless in the same component?**
A: Not recommended. Choose one approach per component for clarity.

## Learn More

- [Headless Hooks API Reference](./src/headless/README.md)
- [Styled Components](./src/components/)
- [Examples](./examples/)
- [Testing Guide](./examples/testing-with-mocks/README.md)
