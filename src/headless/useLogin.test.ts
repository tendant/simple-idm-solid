import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@solidjs/testing-library';
import { useLogin } from './useLogin';
import {
  createMockClient,
  mockLoginSuccess,
  mock2FARequired,
  mockMultipleUsers,
  mockApiError,
  waitFor,
} from '~/test/utils';

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty form fields', () => {
      const mockClient = createMockClient();
      const { result } = renderHook(() => useLogin({ client: mockClient }));

      expect(result.username()).toBe('');
      expect(result.password()).toBe('');
    });

    it('should initialize with no loading state', () => {
      const mockClient = createMockClient();
      const { result } = renderHook(() => useLogin({ client: mockClient }));

      expect(result.isLoading()).toBe(false);
    });

    it('should initialize with no error or success messages', () => {
      const mockClient = createMockClient();
      const { result } = renderHook(() => useLogin({ client: mockClient }));

      expect(result.error()).toBe(null);
      expect(result.success()).toBe(null);
      expect(result.response()).toBe(null);
    });

    it('should initialize with canSubmit as false', () => {
      const mockClient = createMockClient();
      const { result } = renderHook(() => useLogin({ client: mockClient }));

      expect(result.canSubmit()).toBe(false);
    });
  });

  describe('Form State Management', () => {
    it('should update username', () => {
      const mockClient = createMockClient();
      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');

      expect(result.username()).toBe('testuser');
    });

    it('should update password', () => {
      const mockClient = createMockClient();
      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setPassword('password123');

      expect(result.password()).toBe('password123');
    });

    it('should update both username and password independently', () => {
      const mockClient = createMockClient();
      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('password123');

      expect(result.username()).toBe('testuser');
      expect(result.password()).toBe('password123');
    });
  });

  describe('Validation', () => {
    it('should not allow submit with empty username', () => {
      const mockClient = createMockClient();
      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setPassword('password123');

      expect(result.canSubmit()).toBe(false);
    });

    it('should not allow submit with empty password', () => {
      const mockClient = createMockClient();
      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');

      expect(result.canSubmit()).toBe(false);
    });

    it('should not allow submit with whitespace-only username', () => {
      const mockClient = createMockClient();
      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('   ');
      result.setPassword('password123');

      expect(result.canSubmit()).toBe(false);
    });

    it('should not allow submit with whitespace-only password', () => {
      const mockClient = createMockClient();
      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('   ');

      expect(result.canSubmit()).toBe(false);
    });

    it('should allow submit with valid username and password', () => {
      const mockClient = createMockClient();
      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('password123');

      expect(result.canSubmit()).toBe(true);
    });
  });

  describe('Successful Login', () => {
    it('should call client.login with credentials', async () => {
      const mockClient = createMockClient();
      const loginResponse = mockLoginSuccess();
      mockClient.login = vi.fn().mockResolvedValue(loginResponse);

      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('password123');

      await result.submit();

      expect(mockClient.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });

    it('should set loading state during login', async () => {
      const mockClient = createMockClient();
      const loginResponse = mockLoginSuccess();
      mockClient.login = vi.fn().mockResolvedValue(loginResponse);

      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('password123');

      const submitPromise = result.submit();
      expect(result.isLoading()).toBe(true);

      await submitPromise;
      expect(result.isLoading()).toBe(false);
    });

    it('should set success message on successful login', async () => {
      const mockClient = createMockClient();
      const loginResponse = mockLoginSuccess();
      mockClient.login = vi.fn().mockResolvedValue(loginResponse);

      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('password123');

      await result.submit();

      expect(result.success()).toBe('Login successful!');
      expect(result.error()).toBe(null);
      expect(result.response()).toEqual(loginResponse);
    });

    it('should call onSuccess callback', async () => {
      const mockClient = createMockClient();
      const loginResponse = mockLoginSuccess();
      mockClient.login = vi.fn().mockResolvedValue(loginResponse);
      const onSuccess = vi.fn();

      const { result } = renderHook(() =>
        useLogin({ client: mockClient, onSuccess })
      );

      result.setUsername('testuser');
      result.setPassword('password123');

      await result.submit();

      expect(onSuccess).toHaveBeenCalledWith(loginResponse);
    });

    it('should not submit if form is invalid', async () => {
      const mockClient = createMockClient();
      mockClient.login = vi.fn();

      const { result } = renderHook(() => useLogin({ client: mockClient }));

      await result.submit();

      expect(mockClient.login).not.toHaveBeenCalled();
    });

    it('should not submit if already loading', async () => {
      const mockClient = createMockClient();
      const loginResponse = mockLoginSuccess();
      // Delay the response to keep loading state
      mockClient.login = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(loginResponse), 100))
      );

      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('password123');

      const firstSubmit = result.submit();
      const secondSubmit = result.submit(); // Returns undefined (early return)

      // Advance timers to resolve the delayed promise
      await vi.runAllTimersAsync();

      // Don't await secondSubmit - it returns undefined immediately

      // Should only be called once, not twice
      expect(mockClient.login).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should set error message on login failure', async () => {
      const mockClient = createMockClient();
      const error = mockApiError('Invalid credentials');
      mockClient.login = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('wrongpassword');

      await result.submit();

      expect(result.error()).toBe('Invalid credentials');
      expect(result.success()).toBe(null);
      expect(result.isLoading()).toBe(false);
    });

    it('should call onError callback on failure', async () => {
      const mockClient = createMockClient();
      const error = mockApiError('Invalid credentials');
      mockClient.login = vi.fn().mockRejectedValue(error);
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useLogin({ client: mockClient, onError })
      );

      result.setUsername('testuser');
      result.setPassword('wrongpassword');

      await result.submit();

      expect(onError).toHaveBeenCalledWith('Invalid credentials');
    });

    it('should handle generic Error objects', async () => {
      const mockClient = createMockClient();
      mockClient.login = vi.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('password123');

      await result.submit();

      expect(result.error()).toBe('Network error');
    });

    it('should handle non-Error objects', async () => {
      const mockClient = createMockClient();
      mockClient.login = vi.fn().mockRejectedValue('Unknown error');

      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('password123');

      await result.submit();

      expect(result.error()).toBe('Login failed');
    });
  });

  describe('2FA Flow', () => {
    it('should handle 2FA required response', async () => {
      const mockClient = createMockClient();
      const twoFAResponse = mock2FARequired();
      mockClient.login = vi.fn().mockResolvedValue(twoFAResponse);

      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('password123');

      await result.submit();

      expect(result.response()).toEqual(twoFAResponse);
      expect(result.response()?.status).toBe('2fa_required');
    });

    it('should call onSuccess for 2FA required', async () => {
      const mockClient = createMockClient();
      const twoFAResponse = mock2FARequired();
      mockClient.login = vi.fn().mockResolvedValue(twoFAResponse);
      const onSuccess = vi.fn();

      const { result } = renderHook(() =>
        useLogin({ client: mockClient, onSuccess })
      );

      result.setUsername('testuser');
      result.setPassword('password123');

      await result.submit();

      expect(onSuccess).toHaveBeenCalledWith(twoFAResponse);
    });
  });

  describe('Multiple Users Flow', () => {
    it('should handle multiple users response', async () => {
      const mockClient = createMockClient();
      const multipleUsersResponse = mockMultipleUsers();
      mockClient.login = vi.fn().mockResolvedValue(multipleUsersResponse);

      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('shared@example.com');
      result.setPassword('password123');

      await result.submit();

      expect(result.response()).toEqual(multipleUsersResponse);
      expect(result.response()?.status).toBe('user_selection_required');
    });

    it('should call onSuccess for multiple users', async () => {
      const mockClient = createMockClient();
      const multipleUsersResponse = mockMultipleUsers();
      mockClient.login = vi.fn().mockResolvedValue(multipleUsersResponse);
      const onSuccess = vi.fn();

      const { result } = renderHook(() =>
        useLogin({ client: mockClient, onSuccess })
      );

      result.setUsername('shared@example.com');
      result.setPassword('password123');

      await result.submit();

      expect(onSuccess).toHaveBeenCalledWith(multipleUsersResponse);
    });
  });

  describe('Auto-redirect', () => {
    it('should redirect after successful login when autoRedirect is true', async () => {
      const mockClient = createMockClient();
      const loginResponse = mockLoginSuccess();
      mockClient.login = vi.fn().mockResolvedValue(loginResponse);

      const originalLocation = window.location.href;
      delete (window as any).location;
      window.location = { href: originalLocation } as Location;

      const { result } = renderHook(() =>
        useLogin({
          client: mockClient,
          autoRedirect: true,
          redirectUrl: '/dashboard',
          redirectDelay: 100,
        })
      );

      result.setUsername('testuser');
      result.setPassword('password123');

      await result.submit();

      expect(window.location.href).toBe(originalLocation);

      vi.advanceTimersByTime(100);

      expect(window.location.href).toBe('/dashboard');
    });

    it('should use default redirect delay of 500ms', async () => {
      const mockClient = createMockClient();
      const loginResponse = mockLoginSuccess();
      mockClient.login = vi.fn().mockResolvedValue(loginResponse);

      const originalLocation = window.location.href;
      delete (window as any).location;
      window.location = { href: originalLocation } as Location;

      const { result } = renderHook(() =>
        useLogin({
          client: mockClient,
          autoRedirect: true,
          redirectUrl: '/dashboard',
        })
      );

      result.setUsername('testuser');
      result.setPassword('password123');

      await result.submit();

      vi.advanceTimersByTime(400);
      expect(window.location.href).toBe(originalLocation);

      vi.advanceTimersByTime(100);
      expect(window.location.href).toBe('/dashboard');
    });

    it('should not redirect if autoRedirect is false', async () => {
      const mockClient = createMockClient();
      const loginResponse = mockLoginSuccess();
      mockClient.login = vi.fn().mockResolvedValue(loginResponse);

      const originalLocation = window.location.href;
      delete (window as any).location;
      window.location = { href: originalLocation } as Location;

      const { result } = renderHook(() =>
        useLogin({
          client: mockClient,
          autoRedirect: false,
          redirectUrl: '/dashboard',
        })
      );

      result.setUsername('testuser');
      result.setPassword('password123');

      await result.submit();

      vi.advanceTimersByTime(1000);

      expect(window.location.href).toBe(originalLocation);
    });
  });

  describe('Reset and Clear', () => {
    it('should reset all form fields and state', async () => {
      const mockClient = createMockClient();
      const loginResponse = mockLoginSuccess();
      mockClient.login = vi.fn().mockResolvedValue(loginResponse);

      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('password123');
      await result.submit();

      expect(result.success()).toBe('Login successful!');

      result.reset();

      expect(result.username()).toBe('');
      expect(result.password()).toBe('');
      expect(result.error()).toBe(null);
      expect(result.success()).toBe(null);
      expect(result.response()).toBe(null);
      expect(result.isLoading()).toBe(false);
    });

    it('should clear error message', async () => {
      const mockClient = createMockClient();
      const error = mockApiError('Invalid credentials');
      mockClient.login = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('wrongpassword');
      await result.submit();

      expect(result.error()).toBe('Invalid credentials');

      result.clearError();

      expect(result.error()).toBe(null);
    });

    it('should clear success message', async () => {
      const mockClient = createMockClient();
      const loginResponse = mockLoginSuccess();
      mockClient.login = vi.fn().mockResolvedValue(loginResponse);

      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('password123');
      await result.submit();

      expect(result.success()).toBe('Login successful!');

      result.clearSuccess();

      expect(result.success()).toBe(null);
    });
  });

  describe('Client Initialization', () => {
    it('should create client from string URL', () => {
      const { result } = renderHook(() =>
        useLogin({ client: 'http://localhost:4000' })
      );

      // Should not throw and should initialize properly
      expect(result.username()).toBe('');
      expect(result.canSubmit()).toBe(false);
    });

    it('should use provided client instance', () => {
      const mockClient = createMockClient();
      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('password123');

      // Should use the provided client
      expect(result.canSubmit()).toBe(true);
    });
  });

  describe('State Clearing on Submit', () => {
    it('should clear previous error before new submit', async () => {
      const mockClient = createMockClient();
      const error = mockApiError('Invalid credentials');
      const success = mockLoginSuccess();

      mockClient.login = vi.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(success);

      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('wrongpassword');
      await result.submit();

      expect(result.error()).toBe('Invalid credentials');

      result.setPassword('correctpassword');
      await result.submit();

      expect(result.error()).toBe(null);
      expect(result.success()).toBe('Login successful!');
    });

    it('should clear previous success before new submit', async () => {
      const mockClient = createMockClient();
      const success = mockLoginSuccess();
      const error = mockApiError('Invalid credentials');

      mockClient.login = vi.fn()
        .mockResolvedValueOnce(success)
        .mockRejectedValueOnce(error);

      const { result } = renderHook(() => useLogin({ client: mockClient }));

      result.setUsername('testuser');
      result.setPassword('password123');
      await result.submit();

      expect(result.success()).toBe('Login successful!');

      result.setPassword('wrongpassword');
      await result.submit();

      expect(result.success()).toBe(null);
      expect(result.error()).toBe('Invalid credentials');
    });
  });
});
