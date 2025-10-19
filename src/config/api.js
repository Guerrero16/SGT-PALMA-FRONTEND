import axios from 'axios';
import AuthService from '../services/auth.js'; // 👈 Importa tu servicio de autenticación

// Base URL del backend
export const API_BASE_URL = 'http://localhost:4000/api';

// Instancia principal de Axios
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ✅ Interceptor: agrega token a cada petición
api.interceptors.request.use(
    (config) => {
        const user = AuthService.user;
        const token = user?.token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Endpoints centralizados
export const ENDPOINTS = {
    AUTH: {
        GOOGLE: '/auth/google',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/me',
    },
    EMPRESAS: {
        LIST: '/empresas',
        CREATE: '/empresas',
        UPDATE: '/empresas',
        DELETE: '/empresas',
    },
    FINCAS: {
        LIST: '/fincas',
        CREATE: '/fincas',
        UPDATE: '/fincas',
        DELETE: '/fincas',
    },
    LOTES: {
        LIST: '/lotes',
        CREATE: '/lotes',
        UPDATE: '/lotes',
        DELETE: '/lotes',
    },
};
