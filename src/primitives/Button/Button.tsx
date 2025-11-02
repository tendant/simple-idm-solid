import { Component, JSX, splitProps, Show } from 'solid-js';
import { cn } from '~/utils/cn';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'class',
    'variant',
    'size',
    'loading',
    'fullWidth',
    'disabled',
    'children',
  ]);

  const variant = () => local.variant || 'primary';
  const size = () => local.size || 'md';

  return (
    <button
      class={cn(
        'inline-flex justify-center items-center gap-2',
        'border rounded-lg shadow-sm font-medium',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Variant styles
        variant() === 'primary' &&
          'text-white bg-blue-600 border-transparent hover:bg-blue-700 focus:ring-blue-500',
        variant() === 'secondary' &&
          'text-gray-700 bg-gray-100 border-transparent hover:bg-gray-200 focus:ring-gray-500',
        variant() === 'outline' &&
          'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
        // Size styles
        size() === 'sm' && 'px-3 py-1.5 text-sm',
        size() === 'md' && 'px-4 py-2 text-sm',
        size() === 'lg' && 'px-6 py-3 text-base',
        // Full width
        local.fullWidth && 'w-full',
        local.class,
      )}
      disabled={local.disabled || local.loading}
      {...rest}
    >
      <Show when={local.loading}>
        <svg
          class="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </Show>
      {local.children}
    </button>
  );
};
