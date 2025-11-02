import { Component, JSX, splitProps } from 'solid-js';
import { cn } from '~/utils/cn';

export interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  children: JSX.Element;
  class?: string;
}

export const Alert: Component<AlertProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'variant', 'children']);

  const variant = () => local.variant || 'info';

  return (
    <div
      class={cn(
        'rounded-lg p-4 text-sm font-medium',
        variant() === 'success' && 'bg-green-50 text-green-800',
        variant() === 'error' && 'bg-red-50 text-red-800',
        variant() === 'warning' && 'bg-yellow-50 text-yellow-800',
        variant() === 'info' && 'bg-blue-50 text-blue-800',
        local.class,
      )}
      role="alert"
      {...rest}
    >
      {local.children}
    </div>
  );
};
