/**
 * Shared types for headless hooks
 */

import type { Accessor } from 'solid-js';
import type { SimpleIdmClient } from '~/api/client';

/**
 * Base configuration for all headless hooks
 */
export interface HeadlessBaseConfig {
  /** API client instance or base URL */
  client: SimpleIdmClient | string;
  /** Callback called on error */
  onError?: (error: string) => void;
}

/**
 * Base state returned by all headless hooks
 */
export interface HeadlessBaseState {
  /** Whether an operation is in progress */
  isLoading: Accessor<boolean>;
  /** Error message if operation failed */
  error: Accessor<string | null>;
  /** Success message if operation succeeded */
  success: Accessor<string | null>;
  /** Clear error state */
  clearError: () => void;
  /** Clear success state */
  clearSuccess: () => void;
}
