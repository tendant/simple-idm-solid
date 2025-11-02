import { Component, JSX, splitProps } from 'solid-js';
import { cn } from '~/utils/cn';

export interface CardProps {
  children: JSX.Element;
  class?: string;
}

export const Card: Component<CardProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children']);

  return (
    <div
      class={cn(
        'bg-white rounded-lg shadow-lg border border-gray-200',
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  );
};

export interface CardHeaderProps {
  children: JSX.Element;
  class?: string;
}

export const CardHeader: Component<CardHeaderProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children']);

  return (
    <div
      class={cn('px-6 py-4 border-b border-gray-200', local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
};

export interface CardBodyProps {
  children: JSX.Element;
  class?: string;
}

export const CardBody: Component<CardBodyProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children']);

  return (
    <div class={cn('px-6 py-4', local.class)} {...rest}>
      {local.children}
    </div>
  );
};

export interface CardFooterProps {
  children: JSX.Element;
  class?: string;
}

export const CardFooter: Component<CardFooterProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children']);

  return (
    <div
      class={cn('px-6 py-4 border-t border-gray-200 bg-gray-50', local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
};
