import { SimpleIdmClient } from '~/api/client';
import type { LoginResponse, ApiError } from '~/types/api';

/**
 * Creates a mock SimpleIdmClient for testing
 */
export function createMockClient(overrides?: Partial<SimpleIdmClient>): SimpleIdmClient {
  const mockClient = {
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    getCurrentUser: vi.fn(),
    updateProfile: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerificationEmail: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    verify2FA: vi.fn(),
    enable2FA: vi.fn(),
    disable2FA: vi.fn(),
    generate2FASecret: vi.fn(),
    signup: vi.fn(),
    getUserDevices: vi.fn(),
    removeDevice: vi.fn(),
    getLoginSessions: vi.fn(),
    revokeSession: vi.fn(),
    revokeAllSessions: vi.fn(),
    authenticateWithProvider: vi.fn(),
    handleProviderCallback: vi.fn(),
    ...overrides,
  } as unknown as SimpleIdmClient;

  return mockClient;
}

/**
 * Mock successful login response
 */
export function mockLoginSuccess(user = { id: '1', username: 'testuser', email: 'test@example.com' }): LoginResponse {
  return {
    status: 'success',
    message: 'Login successful',
    user,
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
  };
}

/**
 * Mock 2FA required response
 */
export function mock2FARequired(tempToken = 'mock-temp-token'): LoginResponse {
  return {
    status: '2fa_required',
    message: '2FA verification required',
    temp_token: tempToken,
  };
}

/**
 * Mock multiple users response
 */
export function mockMultipleUsers(users = [
  { id: '1', username: 'user1', email: 'user1@example.com' },
  { id: '2', username: 'user2', email: 'user2@example.com' },
]): LoginResponse {
  return {
    status: 'multiple_users',
    message: 'Multiple users found',
    users,
    temp_token: 'mock-temp-token',
  };
}

/**
 * Mock API error
 */
export function mockApiError(message = 'Invalid credentials', status = 401): ApiError {
  return {
    message,
    status,
    code: 'UNAUTHORIZED',
  };
}

/**
 * Wait for next tick (useful for async operations)
 */
export function waitForNextTick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 1000,
  interval = 50
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}
