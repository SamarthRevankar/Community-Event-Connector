import { useState, useEffect } from 'react';
import { CATEGORIES, validateEvent } from '../../utils/eventValidation';
import { useNavigate } from 'react-router-dom';
import LocationPicker from './LocationPicker';

const EventForm = ({ initialData, onSubmit, isSubmitting, error }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: '',
    organizerName: '',
    location: {
      name: '',
      lat: '',
      lng: ''
    }
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      let formattedDate = '';
      if (initialData.date) {
        const d = new Date(initialData.date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        formattedDate = d.toISOString().slice(0, 16);
      }
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        date: formattedDate,
        category: initialData.category || '',
        organizerName: initialData.organizerName || '',
        location: {
          name: initialData.location?.name || '',
          lat: initialData.location?.lat || '',
          lng: initialData.location?.lng || ''
        }
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const handleLocationChange = (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData
    }));
    
    setValidationErrors(prev => {
      const newErrs = { ...prev };
      delete newErrs['location.name'];
      delete newErrs['location.lat'];
      delete newErrs['location.lng'];
      return newErrs;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateEvent(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    onSubmit(formData);
  };

  const displayErrors = { ...validationErrors, ...(error?.fields || {}) };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8">
      {error && !error.fields && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm font-medium text-red-800">{error.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full rounded-md border ${displayErrors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} px-4 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2`}
            placeholder="e.g., Summer Tech Meetup 2026"
            disabled={isSubmitting}
          />
          {displayErrors.title && <p className="mt-1 text-sm text-red-600">{displayErrors.title}</p>}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
            Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full rounded-md border ${displayErrors.date ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} px-4 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2`}
            disabled={isSubmitting}
          />
          {displayErrors.date && <p className="mt-1 text-sm text-red-600">{displayErrors.date}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full rounded-md border ${displayErrors.category ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} px-4 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 bg-white`}
            disabled={isSubmitting}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {displayErrors.category && <p className="mt-1 text-sm text-red-600">{displayErrors.category}</p>}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="organizerName" className="block text-sm font-medium text-slate-700 mb-1">
            Organizer Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="organizerName"
            name="organizerName"
            value={formData.organizerName}
            onChange={handleChange}
            className={`w-full rounded-md border ${displayErrors.organizerName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} px-4 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2`}
            placeholder="e.g., Jane Doe, Acme Corp"
            disabled={isSubmitting}
          />
          {displayErrors.organizerName && <p className="mt-1 text-sm text-red-600">{displayErrors.organizerName}</p>}
        </div>

        <div className="md:col-span-2 border-t border-slate-200 pt-6 mt-2">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <LocationPicker 
                initialLocation={formData.location}
                onLocationChange={handleLocationChange}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="location.name" className="block text-sm font-medium text-slate-700 mb-1">
                Venue Name / Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location.name"
                name="location.name"
                value={formData.location.name}
                onChange={handleChange}
                className={`w-full rounded-md border ${displayErrors['location.name'] ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} px-4 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2`}
                placeholder="e.g., Central Park"
                disabled={isSubmitting}
              />
              {displayErrors['location.name'] && <p className="mt-1 text-sm text-red-600">{displayErrors['location.name']}</p>}
            </div>
            
            <div>
              <label htmlFor="location.lat" className="block text-sm font-medium text-slate-700 mb-1">
                Latitude <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                id="location.lat"
                name="location.lat"
                value={formData.location.lat}
                onChange={handleChange}
                className={`w-full rounded-md border ${displayErrors['location.lat'] ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} px-4 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2`}
                placeholder="e.g., 40.7829"
                disabled={isSubmitting}
              />
              {displayErrors['location.lat'] && <p className="mt-1 text-sm text-red-600">{displayErrors['location.lat']}</p>}
            </div>

            <div>
              <label htmlFor="location.lng" className="block text-sm font-medium text-slate-700 mb-1">
                Longitude <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                id="location.lng"
                name="location.lng"
                value={formData.location.lng}
                onChange={handleChange}
                className={`w-full rounded-md border ${displayErrors['location.lng'] ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} px-4 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2`}
                placeholder="e.g., -73.9654"
                disabled={isSubmitting}
              />
              {displayErrors['location.lng'] && <p className="mt-1 text-sm text-red-600">{displayErrors['location.lng']}</p>}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className={`w-full rounded-md border ${displayErrors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} px-4 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2`}
            placeholder="Details about the event..."
            disabled={isSubmitting}
          ></textarea>
          {displayErrors.description && <p className="mt-1 text-sm text-red-600">{displayErrors.description}</p>}
        </div>

      </div>

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
