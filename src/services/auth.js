import { API_BASE_URL, ENDPOINTS } from '../config/api.js';
import { jwtDecode } from 'jwt-decode';

class AuthService {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('userData') || 'null');
        this.GOOGLE_CLIENT_ID = '210390594125-i923bbcpb23crrru0gmn1vrh862krpeb.apps.googleusercontent.com';
    }

    async handleGoogleResponse(response) {
        try {
            console.log('🔐 Google response received');
            this.showLoading(true);

            console.log('📤 Decoding Google token and preparing for backend...');
            const result = await this.sendTokenToBackend(response.credential);

            console.log('📥 Backend response:', result);

            if (result && result.token) {
                await this.handleSuccessfulAuth(result);
            } else {
                this.handleAuthError(result?.message || 'No se recibió token del servidor');
            }
        } catch (error) {
            console.error('❌ Auth error:', error);
            this.handleAuthError(this.getErrorMessage(error));
        } finally {
            this.showLoading(false);
        }
    }

    async sendTokenToBackend(googleToken) {
        const url = `${API_BASE_URL}${ENDPOINTS.AUTH.GOOGLE}`;
        console.log('🌐 Calling backend URL:', url);

        try {
            // Decodificar el token de Google para extraer los datos
            const decodedToken = jwtDecode(googleToken);
            console.log('🔍 Decoded Google token:', decodedToken);

            // Preparar el payload según lo que espera tu backend
            const payload = {
                credential: googleToken,  // Tu backend puede decodificarlo también
                google_id: decodedToken.sub,
                nombre: decodedToken.name,
                correo: decodedToken.email
            };

            console.log('📦 Payload to backend:', payload);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Backend error response:', errorText);

                let errorMessage = `Error del servidor: ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }

                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('✅ Backend success response:', result);
            return result;

        } catch (error) {
            console.error('🚨 Network error details:', error);

            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error(`No se puede conectar con el servidor backend en ${API_BASE_URL}`);
            }

            throw error;
        }
    }

    getErrorMessage(error) {
        if (error.message.includes('Failed to fetch')) {
            return `Error de conexión: No se puede contactar al servidor backend en ${API_BASE_URL}`;
        }
        return error.message || 'Error desconocido en la autenticación';
    }

    async handleSuccessfulAuth(result) {
        // Tu backend devuelve "token" y "usuario"
        this.token = result.token;
        this.user = result.usuario;  // Nota: "usuario" no "user"

        if (!this.token) {
            throw new Error('No se recibió token de autenticación del servidor');
        }

        localStorage.setItem('authToken', this.token);
        localStorage.setItem('userData', JSON.stringify(this.user));

        console.log('🎉 Authentication successful! User:', this.user);

        // Mostrar mensaje de éxito antes de redirigir
        this.showSuccess('¡Autenticación exitosa! Redirigiendo...');

        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);
    }

    handleAuthError(message) {
        this.showError(message);
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        const buttonContainer = document.getElementById('googleButtonContainer');

        if (spinner) {
            spinner.style.display = show ? 'block' : 'none';
        }
        if (buttonContainer) {
            buttonContainer.style.opacity = show ? '0.3' : '1';
            buttonContainer.style.pointerEvents = show ? 'none' : 'all';
        }
    }

    showError(message) {
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
        alertDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Error:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const cardBody = document.querySelector('.login-card-body');
        if (cardBody) {
            cardBody.appendChild(alertDiv);
        }
    }

    showSuccess(message) {
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show mt-3';
        alertDiv.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const cardBody = document.querySelector('.login-card-body');
        if (cardBody) {
            cardBody.appendChild(alertDiv);
        }
    }
    getToken() {
        // Devuelve el token actual o el guardado en localStorage
        return this.token || localStorage.getItem('authToken');
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        this.token = null;
        this.user = null;
        window.location.href = '/';
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}

export default new AuthService();