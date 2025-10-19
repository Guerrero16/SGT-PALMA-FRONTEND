import DashboardService from './services/dashboardService.js';
import AuthService from './services/auth.js';
import EmpresasComponent from './components/empresas.js';
import FincasComponent from './components/fincas.js';
import LotesComponent from './components/lotes.js'; // 👈 nuevo

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
        await this.loadDashboardModule();
    }

    setupNavigation() {
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

        // Limpiar contenido anterior
        if (this.currentModule) {
            this.currentModule = null;
            contentArea.innerHTML = '';
        }

        // Actualizar menú activo
        this.updateActiveNav(moduleName);

        switch (moduleName) {
            case 'empresas':
                this.currentModule = new EmpresasComponent();
                await this.currentModule.init(contentArea);
                break;

            case 'fincas':
                this.currentModule = new FincasComponent();
                await this.currentModule.init(contentArea);
                break;

            case 'lotes': // 👈 nuevo caso
                this.currentModule = new LotesComponent();
                await this.currentModule.init(contentArea);
                break;

            default:
                await this.loadDashboardModule();
                break;
        }
    }

    async loadDashboardModule() {
        console.log('Cargando dashboard principal...');
        this.updateActiveNav('dashboard');

        try {
            const resumen = await DashboardService.getResumen();
            const pagosMetodo = await DashboardService.getPagosPorMetodo();
            const evolucion = await DashboardService.getEvolucionMensual();
            const liquidaciones = await DashboardService.getLiquidacionesPorEstado();

            // Totales principales
            document.getElementById('totalTrabajadores').textContent = resumen.trabajadores || 0;
            document.getElementById('liquidaciones').textContent = resumen.liquidaciones || 0;
            document.getElementById('adelantos').textContent = resumen.adelantos || 0;
            document.getElementById('pagos').textContent = resumen.pagos || 0;

            // Dibujar gráficos
            this.renderChartPagos(pagosMetodo);
            this.renderChartEvolucion(evolucion);
            this.renderChartEstados(liquidaciones);

        } catch (error) {
            console.error('Error cargando dashboard:', error);
        }
    }
    renderChartPagos(data) {
        const ctx = document.getElementById('estadoTrabajosChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(d => d.metodo || d.name),
                datasets: [{
                    data: data.map(d => d.total),
                    backgroundColor: ['#28a745', '#17a2b8', '#ffc107', '#dc3545'],
                }]
            },
            options: { responsive: true }
        });
    }

    renderChartEvolucion(data) {
        const ctx = document.getElementById('produccionChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.mes),
                datasets: [{
                    label: 'Pagos ($)',
                    data: data.map(d => d.total),
                    borderColor: '#007bff',
                    fill: true,
                    backgroundColor: 'rgba(0, 123, 255, 0.2)'
                }]
            },
            options: { responsive: true }
        });
    }

    renderChartEstados(data) {
        const ctx = document.getElementById('estadoTrabajosChart').getContext('2d');

        // 🔥 Si ya existe un gráfico previo en este canvas, destrúyelo
        if (this.estadoChart) {
            this.estadoChart.destroy();
        }

        // 💡 Crear el nuevo gráfico y guardarlo en la propiedad de la clase
        this.estadoChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(54, 162, 235, 0.5)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }



    updateActiveNav(activeModule) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

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

// Inicializar dashboard y exponer instancia global
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
    const script = document.querySelector('script[src*="dashboard.js"]');
    if (script) script.__dashboard_instance = dashboard;
});

window.loadModule = (moduleName) => {
    const dashboard = document.querySelector('script[src*="dashboard.js"]')?.__dashboard_instance;
    if (dashboard) dashboard.loadModule(moduleName);
};
window.authService = AuthService;