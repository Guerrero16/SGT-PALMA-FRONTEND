import LoginComponent from './components/login.js';
import AuthService from './services/auth.js';

class App {
    constructor() {
        this.currentPage = null;
    }

    async init() {
        // Verificar si ya está autenticado
        if (AuthService.isAuthenticated() && window.location.pathname === '/') {
            window.location.href = '/dashboard.html';
            return;
        }

        // Cargar componente según la página
        const path = window.location.pathname;

        if (path === '/' || path === '/index.html') {
            await this.loadLoginPage();
        } else if (path === '/dashboard.html') {
            await this.loadDashboardPage();
        }
    }

    async loadLoginPage() {
        const loginComponent = new LoginComponent();
        const loginHTML = await loginComponent.init();
        document.getElementById('app').innerHTML = await loginComponent.render();
        await loginComponent.initGoogleAuth();
    }

    async loadDashboardPage() {
        if (!AuthService.isAuthenticated()) {
            window.location.href = '/';
            return;
        }

        // Aquí cargaremos el dashboard después
        document.getElementById('app').innerHTML = `
            <div class="wrapper">
                <h1>Dashboard SGT Palma</h1>
                <p>Bienvenido, ${AuthService.user?.name || 'Usuario'}</p>
                <button onclick="authService.logout()" class="btn btn-danger">Cerrar Sesión</button>
            </div>
        `;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

// Exponer authService globalmente para funciones de logout
window.authService = AuthService;