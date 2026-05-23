import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { eventsApi } from '../api/eventsApi';
import EventCard from '../components/events/EventCard';
import LoadingSkeleton from '../components/feedback/LoadingSkeleton';
import EmptyState from '../components/feedback/EmptyState';
import SearchBar from '../components/events/SearchBar';
import FilterPanel from '../components/events/FilterPanel';
import FilterChips from '../components/events/FilterChips';
import MapView from '../components/events/MapView';
import Tooltip from '../components/Tooltip';
import { useSocket } from '../context/SocketContext';

const EventListPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('list');
  const [userLocation, setUserLocation] = useState(null);
  const [liveToast, setLiveToast] = useState(null);
  const socket = useSocket();

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = Object.fromEntries(searchParams.entries());
      const response = await eventsApi.list(params);
      setEvents(response.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ── Real-time socket listeners ───────────────────────────
  useEffect(() => {
    if (!socket) return;

    const showToast = (msg) => {
      setLiveToast(msg);
      setTimeout(() => setLiveToast(null), 3500);
    };

    const handleEventCreated = (newEvent) => {
      setEvents((prev) => {
        if (prev.find((e) => e._id === newEvent._id)) return prev;
        return [{ ...newEvent, attendeeCount: 0 }, ...prev];
      });
      showToast('🎉 A new event was just posted!');
    };

    const handleEventUpdated = (updatedEvent) => {
      setEvents((prev) =>
        prev.map((e) =>
          e._id === updatedEvent._id ? { ...e, ...updatedEvent } : e
        )
      );
    };

    const handleEventDeleted = (deletedId) => {
      setEvents((prev) => prev.filter((e) => e._id !== deletedId));
    };

    const handleRegistrationAdded = ({ eventId }) => {
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId ? { ...e, attendeeCount: (e.attendeeCount || 0) + 1 } : e
        )
      );
    };

    socket.on('eventCreated', handleEventCreated);
    socket.on('eventUpdated', handleEventUpdated);
    socket.on('eventDeleted', handleEventDeleted);
    socket.on('registrationAdded', handleRegistrationAdded);

    return () => {
      socket.off('eventCreated', handleEventCreated);
      socket.off('eventUpdated', handleEventUpdated);
      socket.off('eventDeleted', handleEventDeleted);
      socket.off('registrationAdded', handleRegistrationAdded);
    };
  }, [socket]);

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setViewMode('map');
        },
        () => alert('Could not get your location.')
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

      {/* Live toast notification */}
      {liveToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-full shadow-xl text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            {liveToast}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Upcoming Events</h1>
          <p className="mt-2 text-sm text-slate-600">Discover what's happening in your community.</p>
        </div>
        <div className="flex-grow md:max-w-md w-full">
          <SearchBar />
        </div>
        <div className="flex items-center gap-2">
          <Tooltip text="Use your location to find nearby events" position="bottom">
            <button
              onClick={handleGetLocation}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
            >
              📍 Near Me
            </button>
          </Tooltip>
          <Tooltip text="Post a new community event" position="bottom">
            <Link
              to="/events/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap transition-colors"
            >
              + Create Event
            </Link>
          </Tooltip>
        </div>
      </div>

      <div className="mb-4">
        <FilterPanel />
        <FilterChips />
      </div>

      <div className="flex justify-end mb-4 border-b border-slate-200 pb-4">
        <div className="flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg border transition-colors ${viewMode === 'list' ? 'bg-blue-50 text-blue-700 border-blue-200 z-10' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              List View
            </div>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-b border-r transition-colors ${viewMode === 'map' ? 'bg-blue-50 text-blue-700 border-blue-200 z-10' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              Map View
            </div>
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : error ? (
        <EmptyState
          title="Error loading events"
          message={error.message || "We couldn't load the events at this time."}
          actionLabel="Try Again"
          onAction={fetchEvents}
        />
      ) : events.length === 0 ? (
        <EmptyState
          title="No events found"
          message={searchParams.toString() ? "No events match your current filters." : "No upcoming events yet. Be the first to create one!"}
          actionLabel={searchParams.toString() ? "Clear Filters" : "Create Event"}
          onAction={() => {
            if (searchParams.toString()) window.location.search = '';
            else window.location.href = '/events/new';
          }}
        />
      ) : viewMode === 'map' ? (
        <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 animate-fade-in">
          <MapView events={events} userLocation={userLocation} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <div
              key={event._id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventListPage;
