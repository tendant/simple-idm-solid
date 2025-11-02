import { Component, JSX, splitProps } from 'solid-js';
import { cn } from '~/utils/cn';

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
}

export const Input: Component<InputProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'error', 'helperText']);

  return (
    <div class="w-full">
      <input
        class={cn(
          'appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm',
          'placeholder-gray-400 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
          local.error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
          local.class,
        )}
        aria-invalid={local.error}
        aria-describedby={local.helperText ? `${rest.id}-helper` : undefined}
        {...rest}
      />
      {local.helperText && (
        <p
          id={`${rest.id}-helper`}
          class={cn(
            'mt-1 text-sm',
            local.error ? 'text-red-600' : 'text-gray-500',
          )}
        >
          {local.helperText}
        </p>
      )}
    </div>
  );
};
