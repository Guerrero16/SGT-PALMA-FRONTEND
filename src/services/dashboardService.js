import AuthService from './auth.js';

const API_URL = `${window.location.origin}/api/dashboard`;

const DashboardService = {
    async getResumen() {
        const token = AuthService.getToken();
        const res = await fetch(`${API_URL}/resumen`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al obtener resumen');
        return await res.json();
    },

    async getPagosPorMetodo() {
        const token = AuthService.getToken();
        const res = await fetch(`${API_URL}/pagos-metodo`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al obtener pagos por método');
        return await res.json();
    },

    async getEvolucionMensual() {
        const token = AuthService.getToken();
        const res = await fetch(`${API_URL}/evolucion`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al obtener evolución mensual');
        return await res.json();
    },

    async getLiquidacionesPorEstado() {
        const token = AuthService.getToken();
        const res = await fetch(`${API_URL}/liquidaciones-estado`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al obtener liquidaciones por estado');
        return await res.json();
    }
};

export default DashboardService;
