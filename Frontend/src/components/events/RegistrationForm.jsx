import React, { useState } from 'react';
import { eventsApi } from '../../api/eventsApi';

const RegistrationForm = ({ eventId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    attendeeName: '',
    attendeeEmail: '',
    dietaryRestrictions: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setValidationErrors({});

    try {
      const response = await eventsApi.register(eventId, formData);
      onSuccess(response.registration);
    } catch (err) {
      if (err.fields) {
        setValidationErrors(err.fields);
      }
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && !Object.keys(validationErrors).length && (
        <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="attendeeName" className="block text-sm font-medium text-slate-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="attendeeName"
          name="attendeeName"
          value={formData.attendeeName}
          onChange={handleChange}
          className={`w-full rounded-md border ${validationErrors.attendeeName ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'} px-3 py-2 shadow-sm focus:outline-none focus:ring-2`}
          placeholder="Jane Doe"
          disabled={isSubmitting}
          required
        />
        {validationErrors.attendeeName && <p className="mt-1 text-xs text-red-600">{validationErrors.attendeeName}</p>}
      </div>

      <div>
        <label htmlFor="attendeeEmail" className="block text-sm font-medium text-slate-700 mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="attendeeEmail"
          name="attendeeEmail"
          value={formData.attendeeEmail}
          onChange={handleChange}
          className={`w-full rounded-md border ${validationErrors.attendeeEmail ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'} px-3 py-2 shadow-sm focus:outline-none focus:ring-2`}
          placeholder="jane@example.com"
          disabled={isSubmitting}
          required
        />
        {validationErrors.attendeeEmail && <p className="mt-1 text-xs text-red-600">{validationErrors.attendeeEmail}</p>}
      </div>

      <div>
        <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-slate-700 mb-1">
          Dietary Restrictions (Optional)
        </label>
        <input
          type="text"
          id="dietaryRestrictions"
          name="dietaryRestrictions"
          value={formData.dietaryRestrictions}
          onChange={handleChange}
          className={`w-full rounded-md border ${validationErrors.dietaryRestrictions ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'} px-3 py-2 shadow-sm focus:outline-none focus:ring-2`}
          placeholder="Vegetarian, Gluten-free, etc."
          disabled={isSubmitting}
        />
        {validationErrors.dietaryRestrictions && <p className="mt-1 text-xs text-red-600">{validationErrors.dietaryRestrictions}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registering...' : 'Confirm Registration'}
        </button>
      </div>
    </form>
  );
};

export default RegistrationForm;
