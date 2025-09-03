// frontend/src/services/api.js

const API_BASE_URL = 'http://127.0.0.1:8080/api';

// Servicio para manejar todas las llamadas al API
const apiService = {
    // === OBTENER DATOS ===
    getHoteles: async () => {
        const response = await fetch(`${API_BASE_URL}/hoteles`);
        return response.json();
    },

    getRestaurantes: async () => {
        const response = await fetch(`${API_BASE_URL}/restaurantes`);
        return response.json();
    },

    getExperiencias: async () => {
        const response = await fetch(`${API_BASE_URL}/experiencias`);
        return response.json();
    },

    getProductos: async () => {
        const response = await fetch(`${API_BASE_URL}/productos`);
        return response.json();
    },

    // === CREAR RESERVAS ===
    createHotelReservation: async (reservationData) => {
        const response = await fetch(`${API_BASE_URL}/reservations/hotel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservationData),
        });
        
        if (!response.ok) {
            throw new Error('Error al crear la reserva de hotel');
        }
        
        return response.json();
    },

    createExperienceReservation: async (reservationData) => {
        const response = await fetch(`${API_BASE_URL}/reservations/experience`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservationData),
        });
        
        if (!response.ok) {
            throw new Error('Error al crear la reserva de experiencia');
        }
        
        return response.json();
    },

    createRestaurantOrder: async (orderData) => {
        const response = await fetch(`${API_BASE_URL}/reservations/restaurant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });
        
        if (!response.ok) {
            throw new Error('Error al crear la orden del restaurante');
        }
        
        return response.json();
    },

    // === OBTENER HISTORIAL ===
    getUserHistory: async () => {
        const response = await fetch(`${API_BASE_URL}/user/history`);
        
        if (!response.ok) {
            throw new Error('Error al obtener el historial');
        }
        
        return response.json();
    },

    // === COMPRAS (Por implementar con MongoDB) ===
    createPurchase: async (purchaseData) => {
        // Por ahora simulamos, pero esto debería guardar en MongoDB
        console.log('Compra a guardar:', purchaseData);
        return {
            id: `P${Date.now()}`,
            ...purchaseData,
            date: new Date().toISOString(),
            status: 'confirmed'
        };
    }
};

export default apiService;