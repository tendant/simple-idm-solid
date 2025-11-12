# Testing with Mocked API

This example demonstrates how to test authentication logic using mocked API responses.

## Overview

Testing authentication flows is critical but can be challenging:
- ❌ Don't rely on a live backend for tests
- ✅ Mock API responses for predictable tests
- ✅ Test business logic independently
- ✅ Test error handling and edge cases

## Testing Approaches

### 1. Testing Headless Hooks (Recommended)

Headless hooks are easier to test because they separate logic from UI:

```tsx
import { renderHook, waitFor } from '@solidjs/testing-library';
import { useLogin } from '@tendant/simple-idm-solid';
import { MockSimpleIdmClient } from './mocks/MockClient';

describe('useLogin', () => {
  it('should login successfully with valid credentials', async () => {
    const mockClient = new MockSimpleIdmClient();
    mockClient.mockLoginSuccess({
      status: 'success',
      access_token: 'mock-token',
      user: { id: '123', email: 'test@example.com' },
    });

    const { result } = renderHook(() => useLogin({
      client: mockClient,
      onSuccess: vi.fn(),
    }));

    // Set credentials
    result.setUsername('testuser');
    result.setPassword('password123');

    // Submit login
    await result.submit();

    // Verify success
    await waitFor(() => {
      expect(result.isLoading()).toBe(false);
      expect(result.success()).toBeTruthy();
      expect(result.error()).toBeNull();
    });
  });

  it('should handle login errors', async () => {
    const mockClient = new MockSimpleIdmClient();
    mockClient.mockLoginError('Invalid credentials');

    const { result } = renderHook(() => useLogin({
      client: mockClient,
    }));

    result.setUsername('testuser');
    result.setPassword('wrongpassword');

    await result.submit();

    await waitFor(() => {
      expect(result.isLoading()).toBe(false);
      expect(result.error()).toBe('Invalid credentials');
      expect(result.success()).toBeNull();
    });
  });

  it('should handle 2FA requirement', async () => {
    const mockClient = new MockSimpleIdmClient();
    mockClient.mockLoginSuccess({
      status: '2fa_required',
      login_id: 'login-123',
      methods: ['totp', 'sms'],
    });

    const onSuccess = vi.fn();

    const { result } = renderHook(() => useLogin({
      client: mockClient,
      onSuccess,
    }));

    result.setUsername('testuser');
    result.setPassword('password123');

    await result.submit();

    await waitFor(() => {
      expect(result.response()?.status).toBe('2fa_required');
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ status: '2fa_required' })
      );
    });
  });

  it('should prevent submission with invalid credentials', () => {
    const { result } = renderHook(() => useLogin({
      client: new MockSimpleIdmClient(),
    }));

    // Empty credentials
    expect(result.canSubmit()).toBe(false);

    // Username only
    result.setUsername('testuser');
    expect(result.canSubmit()).toBe(false);

    // Both credentials
    result.setPassword('password123');
    expect(result.canSubmit()).toBe(true);
  });
});
```

### 2. Testing with Mock Client

Create a mock client that implements the SimpleIdmClient interface:

```tsx
// mocks/MockClient.ts
import type { LoginResponse, SignupResponse, MagicLinkResponse } from '@tendant/simple-idm-solid';

export class MockSimpleIdmClient {
  private loginResponse: LoginResponse | null = null;
  private loginError: string | null = null;

  mockLoginSuccess(response: LoginResponse) {
    this.loginResponse = response;
    this.loginError = null;
  }

  mockLoginError(error: string) {
    this.loginError = error;
    this.loginResponse = null;
  }

  async login(credentials: { username: string; password: string }): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    if (this.loginError) {
      throw new Error(this.loginError);
    }

    if (this.loginResponse) {
      return this.loginResponse;
    }

    // Default successful response
    return {
      status: 'success',
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: '123',
        email: credentials.username,
        username: credentials.username,
      },
    };
  }

  async requestMagicLink(data: { username: string }): Promise<MagicLinkResponse> {
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      message: 'Magic link sent',
    };
  }

  async signupWithPassword(data: any): Promise<SignupResponse> {
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      message: 'Account created successfully',
      user: {
        id: '123',
        email: data.email,
        username: data.username,
      },
    };
  }

  async getCurrentUser() {
    return {
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
    };
  }

  async logout() {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

### 3. Testing Password Strength

```tsx
import { renderHook } from '@solidjs/testing-library';
import { useRegistration } from '@tendant/simple-idm-solid';
import { MockSimpleIdmClient } from './mocks/MockClient';

describe('Password Strength', () => {
  it('should calculate weak password strength', () => {
    const { result } = renderHook(() => useRegistration({
      client: new MockSimpleIdmClient(),
      mode: 'password',
    }));

    result.setPassword('abc');

    const strength = result.passwordStrength();
    expect(strength.level).toBe('weak');
    expect(strength.percentage).toBeLessThan(33);
    expect(strength.color).toBe('bg-red-500');
  });

  it('should calculate medium password strength', () => {
    const { result } = renderHook(() => useRegistration({
      client: new MockSimpleIdmClient(),
      mode: 'password',
    }));

    result.setPassword('Password1');

    const strength = result.passwordStrength();
    expect(strength.level).toBe('medium');
    expect(strength.percentage).toBeGreaterThanOrEqual(33);
    expect(strength.percentage).toBeLessThan(66);
  });

  it('should calculate strong password strength', () => {
    const { result } = renderHook(() => useRegistration({
      client: new MockSimpleIdmClient(),
      mode: 'password',
    }));

    result.setPassword('P@ssw0rd123!');

    const strength = result.passwordStrength();
    expect(strength.level).toBe('strong');
    expect(strength.percentage).toBeGreaterThanOrEqual(66);
    expect(strength.color).toBe('bg-green-500');
  });

  it('should validate password matching', () => {
    const { result } = renderHook(() => useRegistration({
      client: new MockSimpleIdmClient(),
      mode: 'password',
    }));

    result.setPassword('Password123');
    result.setConfirmPassword('Password123');

    expect(result.passwordsMatch()).toBe(true);

    result.setConfirmPassword('DifferentPassword');

    expect(result.passwordsMatch()).toBe(false);
  });
});
```

### 4. Testing Magic Link with Cooldown

```tsx
import { renderHook, waitFor } from '@solidjs/testing-library';
import { useMagicLink } from '@tendant/simple-idm-solid';
import { MockSimpleIdmClient } from './mocks/MockClient';

describe('useMagicLink', () => {
  it('should send magic link and start cooldown', async () => {
    const { result } = renderHook(() => useMagicLink({
      client: new MockSimpleIdmClient(),
      cooldownSeconds: 2, // Short cooldown for testing
    }));

    result.setUsername('test@example.com');

    // Should be able to submit
    expect(result.canSubmit()).toBe(true);
    expect(result.cooldown()).toBe(0);

    await result.submit();

    // Should have cooldown after submission
    await waitFor(() => {
      expect(result.cooldown()).toBe(2);
      expect(result.canSubmit()).toBe(false);
      expect(result.success()).toBeTruthy();
    });

    // Wait for cooldown to expire
    await waitFor(() => {
      expect(result.cooldown()).toBe(0);
      expect(result.canResend()).toBe(true);
    }, { timeout: 3000 });
  });

  it('should allow resend after cooldown', async () => {
    const { result } = renderHook(() => useMagicLink({
      client: new MockSimpleIdmClient(),
      cooldownSeconds: 1,
    }));

    result.setUsername('test@example.com');

    // First submission
    await result.submit();

    await waitFor(() => {
      expect(result.canResend()).toBe(false);
    });

    // Wait for cooldown
    await waitFor(() => {
      expect(result.canResend()).toBe(true);
    }, { timeout: 1500 });

    // Should be able to resend
    await result.resend();

    await waitFor(() => {
      expect(result.success()).toBeTruthy();
    });
  });
});
```

### 5. Integration Testing with Components

```tsx
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { LoginForm } from '@tendant/simple-idm-solid';
import { MockSimpleIdmClient } from './mocks/MockClient';

describe('LoginForm Component', () => {
  it('should render login form', () => {
    const mockClient = new MockSimpleIdmClient();

    render(() => <LoginForm apiBaseUrl={mockClient as any} />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    const mockClient = new MockSimpleIdmClient();
    const onSuccess = vi.fn();

    mockClient.mockLoginSuccess({
      status: 'success',
      access_token: 'token',
      user: { id: '1', email: 'test@test.com', username: 'test' },
    });

    render(() => (
      <LoginForm
        apiBaseUrl={mockClient as any}
        onSuccess={onSuccess}
      />
    ));

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.input(usernameInput, { target: { value: 'testuser' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should display error message on failed login', async () => {
    const mockClient = new MockSimpleIdmClient();

    mockClient.mockLoginError('Invalid credentials');

    render(() => <LoginForm apiBaseUrl={mockClient as any} />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.input(usernameInput, { target: { value: 'testuser' } });
    fireEvent.input(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

## Test Setup

### Install Testing Dependencies

```bash
npm install --save-dev \
  vitest \
  @solidjs/testing-library \
  @testing-library/user-event \
  jsdom
```

### Configure Vitest

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

### Setup File

```ts
// vitest.setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@solidjs/testing-library';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- login.test.tsx
```

## Best Practices

### ✅ Do

- Test business logic using headless hooks
- Mock API responses for predictable tests
- Test error handling and edge cases
- Use TypeScript for type safety in tests
- Test form validation logic
- Test state changes (loading, success, error)

### ❌ Don't

- Don't rely on live backend for tests
- Don't test implementation details
- Don't skip error cases
- Don't forget to cleanup after tests
- Don't hardcode delays (use waitFor)

## Example Test Suite Structure

```
tests/
├── unit/
│   ├── hooks/
│   │   ├── useLogin.test.tsx
│   │   ├── useMagicLink.test.tsx
│   │   └── useRegistration.test.tsx
│   └── utils/
│       └── validation.test.ts
├── integration/
│   ├── LoginForm.test.tsx
│   ├── MagicLinkForm.test.tsx
│   └── RegistrationForm.test.tsx
└── mocks/
    ├── MockClient.ts
    └── fixtures.ts
```

## Learn More

- [SolidJS Testing Library](https://github.com/solidjs/solid-testing-library)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
