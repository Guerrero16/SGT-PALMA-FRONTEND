import { API_BASE_URL, ENDPOINTS } from '../config/api.js';
import AuthService from './auth.js';

class EmpresaService {
    constructor() {
        this.pendingRequests = new Map(); // ✅ Evitar requests duplicados
    }
    async getEmpresas() {
        try {
            const response = await fetch(`${API_BASE_URL}${ENDPOINTS.EMPRESAS.LIST}`, {
                method: 'GET',
                headers: AuthService.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching empresas:', error);
            throw error;
        }
    }

    async createEmpresa(empresaData) {
        // ✅ Crear una clave única para este request
        const requestKey = `create-${JSON.stringify(empresaData)}-${Date.now()}`;

        // ✅ Si ya hay un request pendiente similar, no hacer otro
        if (this.pendingRequests.has(requestKey)) {
            console.log('⚠️ Request duplicado detectado, ignorando...');
            return this.pendingRequests.get(requestKey);
        }

        try {
            console.log('📤 Enviando request crear empresa...'); // Debug

            const promise = fetch(`${API_BASE_URL}${ENDPOINTS.EMPRESAS.CREATE}`, {
                method: 'POST',
                headers: AuthService.getAuthHeaders(),
                body: JSON.stringify(empresaData)
            }).then(async (response) => {
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || `Error ${response.status}`);
                }
                return await response.json();
            });

            // ✅ Guardar el promise en el mapa
            this.pendingRequests.set(requestKey, promise);

            const result = await promise;

            // ✅ Limpiar del mapa después de completar
            this.pendingRequests.delete(requestKey);

            console.log('✅ Request completado'); // Debug
            return result;

        } catch (error) {
            // ✅ Limpiar del mapa incluso en error
            this.pendingRequests.delete(requestKey);
            console.error('Error creating empresa:', error);
            throw error;
        }
    }

    async updateEmpresa(id, empresaData) {
        const requestKey = `update-${id}-${Date.now()}`;

        if (this.pendingRequests.has(requestKey)) {
            console.log('⚠️ Request duplicado detectado, ignorando...');
            return this.pendingRequests.get(requestKey);
        }

        try {
            const promise = fetch(`${API_BASE_URL}${ENDPOINTS.EMPRESAS.UPDATE}/${id}`, {
                method: 'PUT',
                headers: AuthService.getAuthHeaders(),
                body: JSON.stringify(empresaData)
            }).then(async (response) => {
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || `Error ${response.status}`);
                }
                return await response.json();
            });

            this.pendingRequests.set(requestKey, promise);
            const result = await promise;
            this.pendingRequests.delete(requestKey);
            return result;

        } catch (error) {
            this.pendingRequests.delete(requestKey);
            console.error('Error updating empresa:', error);
            throw error;
        }
    }

    async deleteEmpresa(id) {
        const requestKey = `delete-${id}-${Date.now()}`;

        if (this.pendingRequests.has(requestKey)) {
            console.log('⚠️ Request duplicado detectado, ignorando...');
            return this.pendingRequests.get(requestKey);
        }

        try {
            const promise = fetch(`${API_BASE_URL}${ENDPOINTS.EMPRESAS.DELETE}/${id}`, {
                method: 'DELETE',
                headers: AuthService.getAuthHeaders()
            }).then(async (response) => {
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || `Error ${response.status}`);
                }
                return await response.json();
            });

            this.pendingRequests.set(requestKey, promise);
            const result = await promise;
            this.pendingRequests.delete(requestKey);
            return result;

        } catch (error) {
            this.pendingRequests.delete(requestKey);
            console.error('Error deleting empresa:', error);
            throw error;
        }
    }
}

export default new EmpresaService();