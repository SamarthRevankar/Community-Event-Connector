import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsApi } from '../api/eventsApi';
import EventForm from '../components/events/EventForm';
import LoadingSkeleton from '../components/feedback/LoadingSkeleton';
import EmptyState from '../components/feedback/EmptyState';
import DeleteEventDialog from '../components/events/DeleteEventDialog';

const EventEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventsApi.get(id);
        setInitialData(response.data);
      } catch (err) {
        setFetchError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await eventsApi.update(id, formData);
      navigate(`/events/${id}`);
    } catch (err) {
      setSubmitError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton type="form" />
      </div>
    );
  }

  if (fetchError || !initialData) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <EmptyState 
          title="Event not found" 
          message={fetchError?.message || "The event you are trying to edit doesn't exist or has been removed."}
          actionLabel="Back to Events"
          onAction={() => navigate('/events')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Event</h1>
          <p className="mt-2 text-sm text-slate-600">
            Update the details for {initialData.title}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowDeleteDialog(true)}
          className="inline-flex justify-center items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete Event
        </button>
      </div>
      <EventForm 
        initialData={initialData}
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        error={submitError} 
      />
      <DeleteEventDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title={initialData.title}
      />
    </div>
  );
};

export default EventEditPage;
