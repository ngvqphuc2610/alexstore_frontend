import axios from 'axios';

/**
 * Axios instance that calls Next.js API proxy routes.
 * The proxy automatically injects the JWT from HttpOnly cookie.
 * No token handling needed on the client side.
 */
const api = axios.create({
    baseURL: '/api/proxy',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor: handle errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error.response?.data || error);
    }
);

export default api;
