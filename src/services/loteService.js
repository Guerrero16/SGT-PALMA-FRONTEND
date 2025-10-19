import { API_BASE_URL, ENDPOINTS } from '../config/api.js';
import AuthService from './auth.js';

class LoteService {
    constructor() {
        this.pendingRequests = new Map();
    }

    async getLotes() {
        try {
            const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOTES.LIST}`, {
                method: 'GET',
                headers: AuthService.getAuthHeaders()
            });
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching lotes:', error);
            throw error;
        }
    }

    async createLote(loteData) {
        return this.sendRequest('create', `${API_BASE_URL}${ENDPOINTS.LOTES.CREATE}`, 'POST', loteData);
    }

    async updateLote(id, loteData) {
        return this.sendRequest('update', `${API_BASE_URL}${ENDPOINTS.LOTES.UPDATE}/${id}`, 'PUT', loteData);
    }

    async deleteLote(id) {
        return this.sendRequest('delete', `${API_BASE_URL}${ENDPOINTS.LOTES.DELETE}/${id}`, 'DELETE');
    }

    async sendRequest(type, url, method, body = null) {
        const requestKey = `${type}-${url}-${Date.now()}`;
        if (this.pendingRequests.has(requestKey)) {
            console.log('⚠️ Request duplicado detectado');
            return this.pendingRequests.get(requestKey);
        }

        try {
            const promise = fetch(url, {
                method,
                headers: AuthService.getAuthHeaders(),
                body: body ? JSON.stringify(body) : null
            }).then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || errorData.message || `Error ${res.status}`);
                }
                return await res.json();
            });

            this.pendingRequests.set(requestKey, promise);
            const result = await promise;
            this.pendingRequests.delete(requestKey);
            return result;

        } catch (error) {
            this.pendingRequests.delete(requestKey);
            console.error(`Error ${type} lote:`, error);
            throw error;
        }
    }
}

export default new LoteService();
