import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import { SocketProvider } from './context/SocketContext';

// Lazy-load page components for smaller initial bundle
const EventListPage = lazy(() => import('./pages/EventListPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const EventCreatePage = lazy(() => import('./pages/EventCreatePage'));
const EventEditPage = lazy(() => import('./pages/EventEditPage'));

const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
  </div>
);

const App = () => {
  return (
    <SocketProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <NavBar />

          <main className="flex-1">
            <Suspense fallback={<PageSpinner />}>
              <Routes>
                <Route path="/" element={<EventListPage />} />
                <Route path="/events" element={<EventListPage />} />
                <Route path="/events/new" element={<EventCreatePage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/events/:id/edit" element={<EventEditPage />} />
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
  );
};

export default App;
