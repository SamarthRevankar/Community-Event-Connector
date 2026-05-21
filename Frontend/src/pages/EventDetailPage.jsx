import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventsApi } from '../api/eventsApi';
import LoadingSkeleton from '../components/feedback/LoadingSkeleton';
import EmptyState from '../components/feedback/EmptyState';
import DeleteEventDialog from '../components/events/DeleteEventDialog';
import RegistrationDialog from '../components/events/RegistrationDialog';
import { useSocket } from '../context/SocketContext';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [registrationSuccessMsg, setRegistrationSuccessMsg] = useState('');
  const socket = useSocket();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventsApi.get(id);
        setEvent(response.data || response);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // ── Real-time: live attendee count ───────────────────────
  useEffect(() => {
    if (!socket || !id) return;
    const handler = ({ eventId }) => {
      if (eventId === id) {
        setEvent((prev) =>
          prev ? { ...prev, attendeeCount: (prev.attendeeCount || 0) + 1 } : prev
        );
      }
    };
    socket.on('registrationAdded', handler);
    return () => socket.off('registrationAdded', handler);
  }, [socket, id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await eventsApi.delete(id);
      navigate('/events', { replace: true });
    } catch (err) {
      alert(err.message || 'Failed to delete event');
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleRegistrationSuccess = (registrationData) => {
    setEvent(prev => ({
      ...prev,
      attendeeCount: (prev.attendeeCount || 0) + 1
    }));
    setRegistrationSuccessMsg(`Successfully registered for ${event.title}!`);
    setTimeout(() => setRegistrationSuccessMsg(''), 5000);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton type="detail" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <EmptyState
          title="Event not found"
          message={error?.message || "The event you're looking for doesn't exist or has been removed."}
          actionLabel="Back to Events"
          onAction={() => navigate('/events')}
        />
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Link to="/events" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Events
        </Link>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to={`/events/${id}/edit`}
            className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>

      {registrationSuccessMsg && (
        <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200 flex items-start shadow-sm">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">{registrationSuccessMsg}</p>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl overflow-hidden">
        {/* Header Section */}
        <div className="px-6 py-8 sm:p-10 border-b border-slate-100 bg-slate-50">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {event.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                {event.title}
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Organized by {event.organizerName}
              </p>
            </div>
            
            {/* Quick Info Box */}
            <div className="w-full md:w-auto bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-4 flex-shrink-0">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-semibold text-slate-900">{formattedDate}</p>
                  <p className="text-sm text-slate-500">{formattedTime}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-slate-900">{event.location?.name}</p>
                  <p className="text-sm text-slate-500">
                    {event.location?.lat}, {event.location?.lng}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="font-medium text-slate-900">
                  <span className="text-2xl font-bold text-blue-600 mr-2">{event.attendeeCount || 0}</span>
                  Attending
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="px-6 py-8 sm:p-10 prose prose-slate max-w-none">
          <h2 className="text-xl font-bold text-slate-900 mb-4">About this event</h2>
          <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
            {event.description}
          </div>
        </div>
        
        {/* Registration CTA Section */}
        <div className="bg-blue-50 px-6 py-8 sm:px-10 text-center border-t border-blue-100">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Want to join this event?</h3>
          <p className="text-slate-600 mb-6 max-w-lg mx-auto">Register now to secure your spot and receive updates about any changes to the schedule or location.</p>
          <button
            onClick={() => setShowRegistrationDialog(true)}
            className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Register Now
          </button>
        </div>
      </div>

      <DeleteEventDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title={event.title}
      />
      
      <RegistrationDialog
        isOpen={showRegistrationDialog}
        onClose={() => setShowRegistrationDialog(false)}
        eventId={event._id}
        eventTitle={event.title}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
};

export default EventDetailPage;
