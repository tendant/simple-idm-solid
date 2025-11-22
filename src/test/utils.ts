import { SimpleIdmClient } from '~/api/client';
import type { ApiClientConfig } from '~/api/client';
import type { LoginResponse, ApiError } from '~/types/api';
import { ApiException } from '~/types/api';

/**
 * Creates a mock SimpleIdmClient for testing
 */
export function createMockClient(configOverrides?: Partial<ApiClientConfig>): SimpleIdmClient {
  const config: ApiClientConfig = {
    baseUrl: 'http://localhost:4000',
    basePrefix: '/api/v1/idm',
    ...configOverrides,
  };

  const client = new SimpleIdmClient(config);

  // Mock all the methods that exist on the actual client
  vi.spyOn(client, 'login');
  vi.spyOn(client, 'logout');
  vi.spyOn(client, 'refreshToken');
  vi.spyOn(client, 'getCurrentUser');
  vi.spyOn(client, 'updateUsername');
  vi.spyOn(client, 'updatePhone');
  vi.spyOn(client, 'updatePassword');
  vi.spyOn(client, 'verifyEmail');
  vi.spyOn(client, 'resendVerificationEmail');
  vi.spyOn(client, 'getVerificationStatus');
  vi.spyOn(client, 'initiatePasswordResetByEmail');
  vi.spyOn(client, 'initiatePasswordResetByUsername');
  vi.spyOn(client, 'resetPassword');
  vi.spyOn(client, 'getPasswordPolicy');
  vi.spyOn(client, 'requestMagicLink');
  vi.spyOn(client, 'validateMagicLink');
  vi.spyOn(client, 'signup');

  return client;
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
    status: 'user_selection_required',
    message: 'Multiple users found',
    users,
    temp_token: 'mock-temp-token',
  };
}

/**
 * Mock API error
 */
export function mockApiError(message = 'Invalid credentials', status = 401): ApiException {
  return new ApiException(status, {
    message,
    status,
    code: 'UNAUTHORIZED',
  });
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
