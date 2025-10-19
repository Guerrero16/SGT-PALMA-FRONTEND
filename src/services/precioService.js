import AuthService from "./auth.js";

const API_URL = `${window.location.origin}/api/precios`;

const PrecioService = {
    async getPrecios() {
        const token = AuthService.getToken();
        const res = await fetch(API_URL, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al obtener precios");
        return res.json();
    },

    async createPrecio(data) {
        const token = AuthService.getToken();
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Error al crear precio");
        return res.json();
    },

    async updatePrecio(id, data) {
        const token = AuthService.getToken();
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Error al actualizar precio");
        return res.json();
    },

    async deletePrecio(id) {
        const token = AuthService.getToken();
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al eliminar precio");
        return res.json();
    },
};

export default PrecioService;
