import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api/events`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to normalize error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Normalizer returns safe user-facing messages
    let normalizedError = {
      message: 'An unexpected network error occurred.',
      fields: {},
      raw: error,
    };

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      if (status === 422 && data.errors) {
        normalizedError.message = 'Please correct the highlighted fields.';
        data.errors.forEach(err => {
          normalizedError.fields[err.field] = err.message;
        });
      } else if (data && data.message) {
        normalizedError.message = data.message;
      } else {
        normalizedError.message = `Server error: ${status}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      normalizedError.message = 'Unable to reach the server. Please check your connection.';
    }

    return Promise.reject(normalizedError);
  }
);

export const eventsApi = {
  list: async (params = {}) => {
    // Expected params: search, category, startDate, endDate
    return await api.get('/', { params });
  },

  get: async (id) => {
    return await api.get(`/${id}`);
  },

  create: async (eventData) => {
    return await api.post('/', eventData);
  },

  update: async (id, eventData) => {
    return await api.put(`/${id}`, eventData);
  },

  delete: async (id) => {
    return await api.delete(`/${id}`);
  },

  register: async (id, registrationData) => {
    return await api.post(`/${id}/registrations`, registrationData);
  },

  getRegistrations: async (id) => {
    return await api.get(`/${id}/registrations`);
  },
};
