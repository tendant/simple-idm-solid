import { Component, JSX } from 'solid-js';

interface LayoutProps {
  children: JSX.Element;
  title?: string;
}

export const Layout: Component<LayoutProps> = (props) => {
  return (
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">
            {props.title || 'Simple IDM Demo'}
          </h1>
        </div>
        {props.children}
      </div>
    </div>
  );
};
