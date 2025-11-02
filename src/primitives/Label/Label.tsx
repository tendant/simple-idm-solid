import { Component, JSX, splitProps, Show } from 'solid-js';
import { cn } from '~/utils/cn';

export interface LabelProps extends JSX.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: Component<LabelProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'required', 'children']);

  return (
    <label
      class={cn('block text-sm font-medium text-gray-700', local.class)}
      {...rest}
    >
      {local.children}
      <Show when={local.required}>
        <span class="text-red-500 ml-1" aria-label="required">
          *
        </span>
      </Show>
    </label>
  );
};
