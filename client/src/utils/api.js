import axios from 'axios';
import toast from 'react-hot-toast';

// const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: "https://e-commerce-mern-stack-o7j7.onrender.com",
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const message = error.response?.data?.message || 'Something went wrong!';
    
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       // window.location.href = '/login';
//       toast.error('Session expired. Please log in again.');
//     } else if (error.response?.status >= 500) {
//       toast.error('Server error. Please try again later.');
//     } else if (error.response?.status >= 400) {
//       toast.error(message);
//     }
    
//     return Promise.reject(error);
//   }
// );

export default api;
