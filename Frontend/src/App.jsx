import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import InstallPrompt from './components/InstallPrompt';

// Lazy-load page components
const EventListPage   = lazy(() => import('./pages/EventListPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const EventCreatePage = lazy(() => import('./pages/EventCreatePage'));
const EventEditPage   = lazy(() => import('./pages/EventEditPage'));
const LoginPage       = lazy(() => import('./pages/LoginPage'));
const RegisterPage    = lazy(() => import('./pages/RegisterPage'));
const ProfilePage     = lazy(() => import('./pages/ProfilePage'));

const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <NavBar />
            <InstallPrompt />

            <main className="flex-1">
              <Suspense fallback={<PageSpinner />}>
                <Routes>
                  <Route path="/"                  element={<EventListPage />} />
                  <Route path="/events"             element={<EventListPage />} />
                  <Route path="/events/new"         element={<ProtectedRoute><EventCreatePage /></ProtectedRoute>} />
                  <Route path="/events/:id"         element={<EventDetailPage />} />
                  <Route path="/events/:id/edit"    element={<ProtectedRoute><EventEditPage /></ProtectedRoute>} />
                  <Route path="/login"              element={<LoginPage />} />
                  <Route path="/register"           element={<RegisterPage />} />
                  <Route path="/profile"            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                </Routes>
              </Suspense>
            </main>

            <footer className="bg-white border-t border-slate-200 mt-auto">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-slate-500">
                  &copy; {new Date().getFullYear()} Community Event Connector. Built with ❤️ for local communities.
                </p>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
