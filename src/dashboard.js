import AuthService from './services/auth.js';
import EmpresasComponent from './components/empresas.js';
import FincasComponent from './components/fincas.js';

class Dashboard {
    constructor() {
        this.authService = AuthService;
        this.currentModule = null;
        this.init();
    }

    async init() {
        if (!this.authService.isAuthenticated()) {
            window.location.href = '/';
            return;
        }

        this.loadUserData();
        this.setupNavigation();

        // Cargar módulo por defecto (dashboard)
        await this.loadDashboardModule();
    }

    setupNavigation() {
        // Configurar eventos de navegación
        document.addEventListener('click', (e) => {
            if (e.target.closest('[onclick*="loadModule"]')) {
                e.preventDefault();
                const moduleName = e.target.closest('[onclick]').getAttribute('onclick').match(/'([^']+)'/)[1];
                this.loadModule(moduleName);
            }
        });
    }

    async loadModule(moduleName) {
        const contentArea = document.querySelector('.content-wrapper .container-fluid');

        // Remover módulo actual
        if (this.currentModule) {
            this.currentModule = null;
        }

        // Actualizar navegación activa
        this.updateActiveNav(moduleName);

        // Cargar módulo específico
        switch (moduleName) {
            case 'empresas':
                this.currentModule = new EmpresasComponent();
                await this.currentModule.init(contentArea);
                break;

            case 'fincas':
                this.currentModule = new FincasComponent();
                await this.currentModule.init(contentArea);
                break;

            default:
                await this.loadDashboardModule();
                break;
        }
    }

    async loadDashboardModule() {
        // Mantener el dashboard original
        console.log('Cargando dashboard...');
        this.updateActiveNav('dashboard');
    }

    updateActiveNav(activeModule) {
        // Remover clase active de todos los items
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Agregar active al item actual
        const activeLink = document.querySelector(`[onclick*="'${activeModule}'"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    loadUserData() {
        const user = this.authService.user;

        document.getElementById('userName').textContent = user.nombre || 'Usuario';
        document.getElementById('sidebarUserName').textContent = user.nombre || 'Usuario';
        document.getElementById('userRole').textContent = user.rol || 'OPERADOR';

        if (user.picture) {
            document.getElementById('userPhoto').src = user.picture;
            document.getElementById('userPhoto').style.display = 'block';
        }
    }
}

// Inicializar dashboard
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});

// Exponer función global para navegación
window.loadModule = function (moduleName) {
    const dashboard = document.querySelector('script[src*="dashboard.js"]')?.__dashboard_instance;
    if (dashboard) {
        dashboard.loadModule(moduleName);
    }
};

// Guardar instancia para acceso global
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
    const script = document.querySelector('script[src*="dashboard.js"]');
    if (script) {
        script.__dashboard_instance = dashboard;
    }
});