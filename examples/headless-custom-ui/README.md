# Headless Hooks - Custom UI Example

This example demonstrates how to use **headless hooks** from `@tendant/simple-idm-solid` to build completely custom authentication UIs without using the pre-styled components.

## What are Headless Hooks?

Headless hooks separate **business logic** from **presentation**:

- **Business Logic**: API calls, state management, validation (provided by hooks)
- **Presentation**: UI, styling, layout (you implement)

This gives you 100% control over the UI while reusing battle-tested authentication logic.

## Available Headless Hooks

### `useLogin`
Password-based login with 2FA and multi-user support

### `useMagicLink`
Passwordless authentication with cooldown timer

### `useRegistration`
User registration (password and passwordless modes)

## Running This Example

```bash
cd examples/headless-custom-ui
npm install
npm run dev
```

Make sure your simple-idm backend is running at `http://localhost:4000`

## Examples

### 1. Custom Login with Tailwind CSS

```tsx
import { useLogin } from '@tendant/simple-idm-solid';

function CustomLogin() {
  const login = useLogin({
    client: 'http://localhost:4000',
    onSuccess: () => window.location.href = '/dashboard',
  });

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 class="text-3xl font-bold text-gray-900 mb-6 text-center">
          Welcome Back
        </h1>

        {login.error() && (
          <div class="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {login.error()}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); login.submit(); }} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={login.username()}
              onInput={(e) => login.setUsername(e.currentTarget.value)}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={login.password()}
              onInput={(e) => login.setPassword(e.currentTarget.value)}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={!login.canSubmit() || login.isLoading()}
            class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {login.isLoading() ? (
              <span class="flex items-center justify-center gap-2">
                <span class="animate-spin">⏳</span> Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 2. Custom Registration with Password Strength

```tsx
import { useRegistration } from '@tendant/simple-idm-solid';
import { Show } from 'solid-js';

function CustomRegistration() {
  const reg = useRegistration({
    client: 'http://localhost:4000',
    mode: 'password',
    onSuccess: () => window.location.href = '/login',
  });

  return (
    <div class="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 class="text-2xl font-bold mb-6">Create Account</h2>

      <form onSubmit={(e) => { e.preventDefault(); reg.submit(); }} class="space-y-4">
        <input
          type="text"
          value={reg.username()}
          onInput={(e) => reg.setUsername(e.currentTarget.value)}
          placeholder="Username"
          class="w-full p-3 border rounded-lg"
        />

        <input
          type="email"
          value={reg.email()}
          onInput={(e) => reg.setEmail(e.currentTarget.value)}
          placeholder="Email"
          class="w-full p-3 border rounded-lg"
        />

        <div>
          <input
            type="password"
            value={reg.password()}
            onInput={(e) => reg.setPassword(e.currentTarget.value)}
            placeholder="Password"
            class="w-full p-3 border rounded-lg"
          />

          {/* Password Strength Indicator */}
          <Show when={reg.password()}>
            <div class="mt-2">
              <div class="flex justify-between items-center mb-1">
                <span class="text-xs text-gray-600">Strength:</span>
                <span class="text-xs font-semibold" classList={{
                  'text-red-600': reg.passwordStrength().level === 'weak',
                  'text-yellow-600': reg.passwordStrength().level === 'medium',
                  'text-green-600': reg.passwordStrength().level === 'strong',
                }}>
                  {reg.passwordStrength().text}
                </span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class={`h-full transition-all duration-300 ${reg.passwordStrength().color}`}
                  style={{ width: `${reg.passwordStrength().percentage}%` }}
                />
              </div>
            </div>
          </Show>
        </div>

        <input
          type="password"
          value={reg.confirmPassword()}
          onInput={(e) => reg.setConfirmPassword(e.currentTarget.value)}
          placeholder="Confirm Password"
          class="w-full p-3 border rounded-lg"
          classList={{
            'border-red-500': !reg.passwordsMatch() && reg.confirmPassword(),
          }}
        />

        <Show when={!reg.passwordsMatch() && reg.confirmPassword()}>
          <p class="text-sm text-red-600">Passwords do not match</p>
        </Show>

        <button
          type="submit"
          disabled={!reg.canSubmit() || reg.isLoading()}
          class="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {reg.isLoading() ? 'Creating account...' : 'Create Account'}
        </button>

        {reg.error() && (
          <p class="text-red-600 text-sm">{reg.error()}</p>
        )}
        {reg.success() && (
          <p class="text-green-600 text-sm">{reg.success()}</p>
        )}
      </form>
    </div>
  );
}
```

### 3. Custom Magic Link with Minimal UI

```tsx
import { useMagicLink } from '@tendant/simple-idm-solid';
import { Show } from 'solid-js';

function MinimalMagicLink() {
  const magic = useMagicLink({
    client: 'http://localhost:4000',
    cooldownSeconds: 60,
  });

  return (
    <div class="max-w-sm mx-auto mt-20">
      <h1 class="text-xl mb-4">🪄 Magic Link Login</h1>

      <Show
        when={!magic.success()}
        fallback={
          <div class="bg-green-50 border border-green-200 p-4 rounded">
            <p class="text-green-800">✓ Check your email!</p>
            <Show when={magic.canResend()}>
              <button
                onClick={() => magic.resend()}
                class="mt-2 text-sm text-blue-600 underline"
              >
                Resend
              </button>
            </Show>
          </div>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); magic.submit(); }}>
          <input
            type="email"
            value={magic.username()}
            onInput={(e) => magic.setUsername(e.currentTarget.value)}
            placeholder="your@email.com"
            class="w-full p-2 border rounded mb-2"
          />

          <button
            type="submit"
            disabled={!magic.canSubmit()}
            class="w-full bg-black text-white py-2 rounded disabled:bg-gray-400"
          >
            {magic.cooldown() > 0
              ? `Wait ${magic.cooldown()}s`
              : magic.isLoading()
                ? 'Sending...'
                : 'Send Magic Link'}
          </button>

          {magic.error() && (
            <p class="text-red-600 text-sm mt-2">{magic.error()}</p>
          )}
        </form>
      </Show>
    </div>
  );
}
```

## Benefits of Headless Hooks

### ✅ Full Control Over UI
Build any design without fighting against pre-styled components

### ✅ Framework Flexibility
Use with any CSS framework: Tailwind, UnoCSS, vanilla CSS, CSS-in-JS

### ✅ Smaller Bundle Size
Only import the logic you need, not the styled components

### ✅ Consistent Logic
Same business logic across all your custom UIs

### ✅ Better Testing
Test business logic independently from UI

## Comparison: Styled vs Headless

### Using Styled Components (Easy, Quick)
```tsx
import { LoginForm } from '@tendant/simple-idm-solid';

<LoginForm
  apiBaseUrl="http://localhost:4000"
  onSuccess={(response) => console.log('Logged in!')}
/>
```

✅ Ready to use
✅ Consistent design
❌ Limited customization

### Using Headless Hooks (Flexible, Custom)
```tsx
import { useLogin } from '@tendant/simple-idm-solid';

const login = useLogin({
  client: 'http://localhost:4000',
  onSuccess: (response) => console.log('Logged in!'),
});

// Build your own UI with complete control
<YourCustomLoginUI login={login} />
```

✅ 100% control over UI
✅ Any CSS framework
✅ Smaller bundle
❌ More code to write

## When to Use Headless?

Use headless hooks when you need:

- ✓ Completely custom design system
- ✓ Integration with existing UI components
- ✓ Minimal bundle size
- ✓ Multiple UI variants with same logic
- ✓ Non-standard form layouts

Use styled components when you need:

- ✓ Quick setup
- ✓ Standard authentication UI
- ✓ Consistent design out of the box

## API Reference

See the main [README](../../README.md) for complete API documentation of all headless hooks.

## Learn More

- [Headless Hooks Source](../../src/headless/)
- [Styled Components](../../src/components/)
- [Full API Documentation](../../README.md)
