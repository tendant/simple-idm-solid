import { Component, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuthContext } from '../components/AuthProvider';

const DashboardPage: Component = () => {
  const auth = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.logout();
    navigate('/login');
  };

  return (
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div class="flex items-center">
              <button
                onClick={handleLogout}
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">
              Welcome to your Dashboard!
            </h2>

            <Show when={auth.user()}>
              <div class="space-y-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    User Information
                  </h3>
                  <div class="bg-gray-50 rounded p-4">
                    <pre class="text-sm text-gray-700 overflow-auto">
                      {JSON.stringify(auth.user(), null, 2)}
                    </pre>
                  </div>
                </div>

                <div class="mt-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    Authentication Status
                  </h3>
                  <ul class="list-disc list-inside text-gray-700 space-y-2">
                    <li>Authenticated: {auth.isAuthenticated() ? '✅ Yes' : '❌ No'}</li>
                    <li>Loading: {auth.loading() ? '⏳ Yes' : '✅ No'}</li>
                  </ul>
                </div>

                <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p class="text-sm text-blue-800">
                    🎉 You are successfully logged in! This is a protected page that
                    requires authentication. Try logging out and accessing this page
                    directly - you'll be redirected to the login page.
                  </p>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
