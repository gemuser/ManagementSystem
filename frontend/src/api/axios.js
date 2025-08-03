import axios from 'axios';

const instance = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    }
});

// Request interceptor to add auth token to requests
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle authentication errors
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('loginTime');
            
            // Show user-friendly message
            if (error.response?.data?.message?.includes('expired') || 
                error.response?.data?.message?.includes('Invalid token')) {
                console.log('Session expired. Please login again.');
                // You could show a toast notification here
            }
            
            // Redirect to login page if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default instance;