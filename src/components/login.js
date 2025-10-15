import AuthService from '../services/auth.js';

class LoginComponent {
    constructor() {
        this.authService = AuthService;
    }

    async init() {
        await this.render();
        this.bindEvents();
        await this.initGoogleAuth();
    }

    async render() {
        return `
            <div class="login-box">
                <div class="card login-card">
                    <div class="card-body login-card-body">
                        <div class="login-logo">
                            <i class="fas fa-seedling logo-icon fa-2x"></i>
                            <a href="#" class="h2">SGT <b>Palma</b></a>
                            <p class="text-muted mt-2">Sistema de Gestión Agrícola</p>
                        </div>
                        
                        <div class="text-center mb-4">
                            <p class="login-box-msg">Inicia sesión con tu cuenta Google</p>
                        </div>

                        <!-- Contenedor simplificado para Google Sign-In -->
                        <div class="d-grid gap-2">
                            <div id="googleButtonContainer"></div>
                        </div>

                        <div id="loadingSpinner" class="loading-spinner mt-3" style="display: none;">
                            <div class="spinner-border text-success" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                            <p class="mt-2">Autenticando...</p>
                        </div>

                        <div class="mt-4 text-center">
                            <small class="text-muted">
                                <i class="fas fa-info-circle me-1"></i>
                                Usa tu cuenta corporativa Google
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async initGoogleAuth() {
        // Esperar a que cargue la librería de Google
        const checkGoogle = () => {
            if (window.google) {
                this.initializeGoogleAuth();
            } else {
                setTimeout(checkGoogle, 100);
            }
        };
        checkGoogle();
    }

    initializeGoogleAuth() {
        try {
            window.google.accounts.id.initialize({
                client_id: this.authService.GOOGLE_CLIENT_ID,
                callback: this.authService.handleGoogleResponse.bind(this.authService),
                auto_select: false,
                ux_mode: 'popup'
            });

            // Renderizar el botón de manera más simple
            window.google.accounts.id.renderButton(
                document.getElementById('googleButtonContainer'),
                {
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    type: 'standard',
                    logo_alignment: 'left'
                }
            );

            // Opcional: Mostrar el One Tap UI
            // window.google.accounts.id.prompt();

        } catch (error) {
            console.error('Error initializing Google Auth:', error);
            this.showFallbackButton();
        }
    }

    showFallbackButton() {
        document.getElementById('googleButtonContainer').innerHTML = `
            <button onclick="window.handleManualGoogleAuth()" class="btn btn-google">
                <i class="fab fa-google me-2"></i>
                Iniciar sesión con Google
            </button>
        `;
    }

    bindEvents() {
        // Función de respaldo para autenticación manual
        window.handleManualGoogleAuth = () => {
            alert('Para autenticación manual, necesitaríamos implementar flujo OAuth completo');
        };
    }
}

export default LoginComponent;