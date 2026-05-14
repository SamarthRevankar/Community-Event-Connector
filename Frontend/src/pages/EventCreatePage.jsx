import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '../api/eventsApi';
import EventForm from '../components/events/EventForm';

const EventCreatePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await eventsApi.create(formData);
      navigate(`/events/${response.data._id}`);
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create New Event</h1>
        <p className="mt-2 text-sm text-slate-600">
          Fill out the details below to publish a new event to the community.
        </p>
      </div>
      <EventForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        error={error} 
      />
    </div>
  );
};

export default EventCreatePage;
