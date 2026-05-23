import axios from 'axios';

const getToken = () => localStorage.getItem('token');

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api/events`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token on every request if present
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let normalizedError = { message: 'An unexpected network error occurred.', fields: {}, raw: error };
    if (error.response) {
      const { status, data } = error.response;
      if (status === 422 && data.errors) {
        normalizedError.message = 'Please correct the highlighted fields.';
        data.errors.forEach(err => { normalizedError.fields[err.path || err.field] = err.msg || err.message; });
      } else if (data?.message) {
        normalizedError.message = data.message;
      } else {
        normalizedError.message = `Server error: ${status}`;
      }
    } else if (error.request) {
      normalizedError.message = 'Unable to reach the server. Please check your connection.';
    }
    return Promise.reject(normalizedError);
  }
);

const usersApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api/users`,
  headers: { 'Content-Type': 'application/json' },
});

usersApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const eventsApi = {
  list: (params = {}) => api.get('/', { params }),
  get: (id) => api.get(`/${id}`),
  create: (eventData) => api.post('/', eventData),
  update: (id, eventData) => api.put(`/${id}`, eventData),
  delete: (id) => api.delete(`/${id}`),
  register: (id, registrationData) => api.post(`/${id}/registrations`, registrationData),
  getRegistrations: (id) => api.get(`/${id}/registrations`),
  getUserEvents: (userId) => usersApi.get(`/${userId}/events`),
};
