# Headless Components

This directory contains **headless hooks** - unstyled, logic-only composables that manage authentication state and behavior without rendering any UI.

## What is a Headless Component?

A headless component (or headless hook in SolidJS) separates the **business logic** from the **presentation layer**:

- **Headless Hook**: Manages state, side effects, and API calls - returns data and functions
- **Styled Component**: Uses the headless hook and renders UI with specific styling

## Why Headless?

### Benefits

1. **Reusability**: Use the same logic with completely different UIs
2. **Testability**: Test business logic independently from UI
3. **Flexibility**: Build custom UIs without duplicating logic
4. **Consistency**: Same behavior across different styled implementations

### Example

```tsx
// ❌ Coupled: Logic + UI together (current approach)
const LoginForm = () => {
  const [username, setUsername] = createSignal('');
  const [error, setError] = createSignal(null);

  const handleSubmit = async () => {
    // API call logic...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={username()} onChange={...} />
      {/* UI rendering */}
    </form>
  );
};

// ✅ Decoupled: Headless hook (logic only)
const useLogin = (config) => {
  const [username, setUsername] = createSignal('');
  const [error, setError] = createSignal(null);

  const handleSubmit = async () => {
    // API call logic...
  };

  return { username, setUsername, error, handleSubmit, ... };
};

// ✅ Styled component (UI only)
const LoginForm = () => {
  const login = useLogin({ ... });

  return (
    <form onSubmit={login.handleSubmit}>
      <input value={login.username()} onChange={login.setUsername} />
      {/* Custom UI rendering */}
    </form>
  );
};
```

## Hooks in this Directory

### `useLogin`
Manages password-based login flow:
- Credential validation
- Login API call
- 2FA handling
- Multiple user selection

### `useMagicLink`
Manages magic link authentication:
- Magic link request
- Cooldown timer
- Resend functionality

### `useRegistration`
Manages user registration:
- Form validation
- Password strength calculation
- Registration API call
- Invitation code handling

## Usage

```tsx
import { useLogin } from '@tendant/simple-idm-solid/headless';

const MyCustomLoginUI = () => {
  const login = useLogin({
    client: 'http://localhost:4000',
    onSuccess: (response) => {
      console.log('Logged in!', response);
    },
  });

  return (
    <div class="my-custom-design">
      <input
        value={login.username()}
        onInput={(e) => login.setUsername(e.currentTarget.value)}
      />
      <input
        type="password"
        value={login.password()}
        onInput={(e) => login.setPassword(e.currentTarget.value)}
      />
      <button
        onClick={login.submit}
        disabled={login.isLoading()}
      >
        {login.isLoading() ? 'Loading...' : 'Sign In'}
      </button>
      {login.error() && <div class="error">{login.error()}</div>}
    </div>
  );
};
```

## Design Principles

1. **No UI**: Headless hooks return only state and functions, never JSX
2. **Composable**: Hooks can be combined and composed
3. **Type-Safe**: Full TypeScript support with exported types
4. **Framework-Agnostic Logic**: Business logic should be portable (API calls, validation)
5. **Solid-Specific State**: Use SolidJS primitives (signals, stores) for reactivity

## Migration Path

Existing styled components will be refactored to use these headless hooks internally, ensuring consistent behavior across all UI variants while maintaining backward compatibility.
