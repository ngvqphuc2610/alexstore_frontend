import axios from 'axios';

/**
 * Axios instance that calls Next.js API proxy routes.
 * The proxy automatically injects the JWT from HttpOnly cookie.
 * No token handling needed on the client side.
 */
const api = axios.create({
    baseURL: '/api/proxy',
});

// Response interceptor: handle errors and unwrap success responses
api.interceptors.response.use(
    (response) => {
        // Automatically unwrap backend's ApiResponse format { success: true, data: T }
        if (response.data && response.data.success === true && 'data' in response.data) {
            return response.data.data;
        }
        return response.data;
    },
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
