import { Component, ParentComponent, Show } from 'solid-js';
import { Navigate } from '@solidjs/router';
import type { UseAuthReturn } from '../hooks/useAuth';

export interface ProtectedRouteProps {
  /**
   * Auth context from useAuth hook
   */
  auth: UseAuthReturn;

  /**
   * Optional custom login path (defaults to '/login')
   */
  loginPath?: string;

  /**
   * Optional custom loading component
   */
  loadingComponent?: Component;

  /**
   * Optional custom unauthorized component (shown instead of redirect)
   */
  unauthorizedComponent?: Component;
}

/**
 * Loading component shown while checking authentication
 */
const DefaultLoadingComponent: Component = () => {
  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p class="text-gray-600">Checking authentication...</p>
      </div>
    </div>
  );
};

/**
 * ProtectedRoute component that ensures user is authenticated before rendering children
 *
 * @example
 * ```tsx
 * import { ProtectedRoute, useAuth } from '@tendant/simple-idm-solid';
 *
 * function MyProtectedPage() {
 *   const auth = useAuth({ client: idmClient });
 *
 *   return (
 *     <ProtectedRoute auth={auth}>
 *       <div>Protected content</div>
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 *
 * @example With custom login path
 * ```tsx
 * <ProtectedRoute auth={auth} loginPath="/signin">
 *   <div>Protected content</div>
 * </ProtectedRoute>
 * ```
 *
 * @example With redirect parameter
 * ```tsx
 * // Redirects to /signin?redirect=/dashboard after auth check fails
 * <ProtectedRoute auth={auth} loginPath="/signin">
 *   <Dashboard />
 * </ProtectedRoute>
 * ```
 */
export const ProtectedRoute: ParentComponent<ProtectedRouteProps> = (props) => {
  const loginPath = props.loginPath || '/login';

  // If not authenticated, redirect to login
  return (
    <Show
      when={props.auth.isAuthenticated()}
      fallback={
        props.unauthorizedComponent ? (
          <>{props.unauthorizedComponent({})}</>
        ) : (
          <Navigate
            href={`${loginPath}?redirect=${encodeURIComponent(
              window.location.pathname + window.location.search
            )}`}
          />
        )
      }
    >
      {props.children}
    </Show>
  );
};

/**
 * ProtectedRoute with loading state
 * Shows loading spinner while auth state is being determined
 *
 * @example
 * ```tsx
 * import { ProtectedRouteWithLoading, useAuth } from '@tendant/simple-idm-solid';
 *
 * function MyProtectedPage() {
 *   const auth = useAuth({ client: idmClient });
 *
 *   return (
 *     <ProtectedRouteWithLoading auth={auth}>
 *       <div>Protected content</div>
 *     </ProtectedRouteWithLoading>
 *   );
 * }
 * ```
 *
 * @example With custom loading component
 * ```tsx
 * <ProtectedRouteWithLoading
 *   auth={auth}
 *   loadingComponent={() => <div>Loading...</div>}
 * >
 *   <div>Protected content</div>
 * </ProtectedRouteWithLoading>
 * ```
 */
export const ProtectedRouteWithLoading: ParentComponent<ProtectedRouteProps> = (props) => {
  const loginPath = props.loginPath || '/login';
  const LoadingComponent = props.loadingComponent || DefaultLoadingComponent;

  // Show loading state while checking authentication
  return (
    <Show
      when={!props.auth.isLoading()}
      fallback={<LoadingComponent />}
    >
      <Show
        when={props.auth.isAuthenticated()}
        fallback={
          props.unauthorizedComponent ? (
            <>{props.unauthorizedComponent({})}</>
          ) : (
            <Navigate
              href={`${loginPath}?redirect=${encodeURIComponent(
                window.location.pathname + window.location.search
              )}`}
            />
          )
        }
      >
        {props.children}
      </Show>
    </Show>
  );
};
