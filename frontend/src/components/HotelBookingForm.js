// src/components/HotelBookingForm.js - VERSIÓN CORREGIDA CON MEJOR MANEJO DE ERRORES

import { useState, useEffect } from 'react';

const hotelAddonsData = [
    { name: 'Tour Romántico', price: 1500, icon: '💖' },
    { name: 'Paquete Luna de Miel', price: 3500, icon: '🥂' },
    { name: 'Acceso a Spa', price: 800, icon: '💆‍♀️' }
];

export default function HotelBookingForm({ hotel, onConfirm }) {
    const [checkinDate, setCheckinDate] = useState('');
    const [checkoutDate, setCheckoutDate] = useState('');
    const [guests, setGuests] = useState(2);
    const [rooms, setRooms] = useState(1);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [specialRequests, setSpecialRequests] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    // --- ESTADO PARA EL DESGLOSE ---
    const [itinerary, setItinerary] = useState([]);
    const [total, setTotal] = useState(0);

    // Calcular itinerario y total
    useEffect(() => {
        const newItinerary = [];
        let newTotal = 0;

        // Calcular noches y precio base
        if (checkinDate && checkoutDate) {
            const date1 = new Date(checkinDate);
            const date2 = new Date(checkoutDate);
            if (date2 > date1) {
                const timeDiff = date2.getTime() - date1.getTime();
                const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                for (let i = 0; i < nights; i++) {
                    newItinerary.push({ 
                        description: `Noche ${i + 1} (${rooms} habitación${rooms > 1 ? 'es' : ''})`, 
                        price: hotel.price * rooms 
                    });
                    newTotal += hotel.price * rooms;
                }
            }
        }

        // Agregar extras
        selectedAddons.forEach(addon => {
            newItinerary.push({ description: addon.name, price: addon.price });
            newTotal += addon.price;
        });
        
        setItinerary(newItinerary);
        setTotal(newTotal);
    }, [checkinDate, checkoutDate, rooms, selectedAddons, hotel.price]);

    const handleAddonToggle = (addon) => {
        setSelectedAddons(prevAddons => 
            prevAddons.find(a => a.name === addon.name)
                ? prevAddons.filter(a => a.name !== addon.name)
                : [...prevAddons, addon]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(''); // Limpiar errores previos

        console.log('🚀 [FRONTEND] Iniciando proceso de reserva...');

        // Validaciones básicas
        if (!checkinDate || !checkoutDate) {
            setError('Por favor selecciona las fechas de entrada y salida');
            setIsSubmitting(false);
            return;
        }

        if (new Date(checkoutDate) <= new Date(checkinDate)) {
            setError('La fecha de salida debe ser posterior a la fecha de entrada');
            setIsSubmitting(false);
            return;
        }

        // Verificar autenticación
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        console.log('🔐 [FRONTEND] Verificando autenticación...');
        console.log('Token existe:', !!token);
        console.log('User data existe:', !!userData);
        
        if (!token) {
            setError('Debes iniciar sesión para hacer una reserva');
            setIsSubmitting(false);
            return;
        }

        // Preparar datos para el backend
        const bookingData = {
            hotel_id: hotel.id,
            check_in: checkinDate,
            check_out: checkoutDate,
            guests: parseInt(guests),
            rooms: parseInt(rooms),
            special_requests: specialRequests.trim() || null,
            addon_services: selectedAddons.length > 0 ? selectedAddons : null
        };

        console.log('📦 [FRONTEND] Datos de reserva preparados:', bookingData);

        try {
            console.log('📡 [FRONTEND] Enviando petición al backend...');
            
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            });

            console.log('📥 [FRONTEND] Respuesta recibida:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            // Intentar obtener el contenido de la respuesta
            let result;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
                console.log('📋 [FRONTEND] Contenido de la respuesta:', result);
            } else {
                const text = await response.text();
                console.log('📋 [FRONTEND] Respuesta como texto:', text);
                result = { error: 'Respuesta del servidor no es JSON válido', raw: text };
            }

            if (response.ok) {
                // Reserva exitosa
                console.log('✅ [FRONTEND] Reserva creada exitosamente!');
                
                const successMessage = `¡Reserva confirmada! 🎉

Hotel: ${result.booking?.hotel_name || hotel.name}
Referencia: ${result.booking?.reference || 'N/A'}
Check-in: ${result.booking?.check_in || checkinDate}
Check-out: ${result.booking?.check_out || checkoutDate}
Total: ${result.booking?.total_price?.toFixed(2) || total.toFixed(2)} MXN

Estado: ${result.booking?.status || 'pendiente'}

¡Te enviaremos un email con los detalles!`;
                
                alert(successMessage);
                
                // Cerrar modal y actualizar la aplicación
                if (onConfirm) {
                    onConfirm('hotel', result.booking || { 
                        id: Date.now(), 
                        hotel_name: hotel.name, 
                        total_price: total,
                        reference: 'TEMP_' + Date.now()
                    });
                }
            } else {
                // Error del servidor
                console.error('❌ [FRONTEND] Error del servidor:', result);
                
                let errorMessage = 'Error al crear la reserva';
                
                if (result.error) {
                    errorMessage = result.error;
                } else if (response.status === 401) {
                    errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
                } else if (response.status === 403) {
                    errorMessage = 'No tienes permisos para realizar esta acción';
                } else if (response.status === 404) {
                    errorMessage = 'Hotel no encontrado o no disponible';
                } else if (response.status >= 500) {
                    errorMessage = 'Error interno del servidor. Intenta nuevamente.';
                }
                
                // Mostrar detalles técnicos si están disponibles
                if (result.technical_details || result.details) {
                    console.error('🔧 [FRONTEND] Detalles técnicos:', result.technical_details || result.details);
                }
                
                setError(errorMessage);
            }
        } catch (error) {
            console.error('💥 [FRONTEND] Error de conexión:', error);
            
            // Determinar tipo de error de conexión
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                setError('No se pudo conectar con el servidor. Verifica que el backend esté funcionando en el puerto 8080.');
            } else if (error.name === 'SyntaxError') {
                setError('Error procesando la respuesta del servidor.');
            } else {
                setError(`Error de conexión: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-4">Reservar en {hotel.name}</h2>
            
            {/* Mostrar errores */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <div className="flex">
                        <div className="py-1">
                            <svg className="fill-current h-4 w-4 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Columna Izquierda: Opciones */}
                    <div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 font-semibold">Entrada</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2 border rounded-lg mt-1" 
                                    value={checkinDate} 
                                    onChange={(e) => setCheckinDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold">Salida</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2 border rounded-lg mt-1" 
                                    value={checkoutDate} 
                                    onChange={(e) => setCheckoutDate(e.target.value)}
                                    min={checkinDate || new Date().toISOString().split('T')[0]}
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 font-semibold">Huéspedes</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border rounded-lg mt-1" 
                                    value={guests} 
                                    onChange={(e) => setGuests(e.target.value)}
                                    min="1"
                                    max="10"
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold">Habitaciones</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border rounded-lg mt-1" 
                                    value={rooms} 
                                    onChange={(e) => setRooms(e.target.value)}
                                    min="1"
                                    max="5"
                                    required 
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold">Solicitudes Especiales</label>
                            <textarea 
                                className="w-full p-2 border rounded-lg mt-1" 
                                value={specialRequests} 
                                onChange={(e) => setSpecialRequests(e.target.value)}
                                placeholder="Cama extra, vista al mar, etc."
                                rows="3"
                            />
                        </div>
                        
                        <hr className="my-4" />
                        
                        <div>
                            <h4 className="font-bold text-lg mb-2">Mejora tu Estancia</h4>
                            <div className="space-y-3">
                                {hotelAddonsData.map(addon => (
                                    <div key={addon.name} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100">
                                        <div>
                                            <span className="font-bold">{addon.icon} {addon.name}</span>
                                            <span className="text-sm text-gray-500"> +${addon.price}</span>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => handleAddonToggle(addon)} 
                                            className={`${selectedAddons.find(a => a.name === addon.name) 
                                                ? 'bg-red-500 hover:bg-red-600' 
                                                : 'btn-primary'
                                            } text-white text-xs font-bold py-1 px-3 rounded-full transition-colors`}
                                        >
                                            {selectedAddons.find(a => a.name === addon.name) ? 'Quitar' : 'Añadir'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Columna Derecha: Resumen */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                         <h4 className="font-bold text-lg mb-2">Resumen de tu Estancia</h4>
                         
                         <div className="space-y-2 text-sm border-b pb-2 mb-2">
                            {itinerary.length > 0 ? (
                                itinerary.map((item, index) => (
                                    <div key={index} className="flex justify-between">
                                        <span>{item.description}</span>
                                        <span>${item.price.toFixed(2)}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">Selecciona tus fechas y extras.</p>
                            )}
                         </div>

                         <div className="font-bold text-xl text-right">
                             Total: ${total.toFixed(2)} MXN
                         </div>

                         {/* Estado de debug */}
                         {process.env.NODE_ENV === 'development' && (
                             <div className="mt-4 p-2 bg-blue-50 rounded text-xs">
                                 <p><strong>Debug Info:</strong></p>
                                 <p>Hotel ID: {hotel.id}</p>
                                 <p>Check-in: {checkinDate}</p>
                                 <p>Check-out: {checkoutDate}</p>
                                 <p>Token: {localStorage.getItem('auth_token') ? 'Presente' : 'Ausente'}</p>
                             </div>
                         )}
                    </div>
                </div>
                
                <button 
                    type="submit" 
                    disabled={isSubmitting || total === 0}
                    className={`w-full font-bold py-3 px-4 rounded-full mt-6 transition-colors ${
                        isSubmitting || total === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'btn-primary hover:bg-blue-600'
                    }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando reserva...
                        </span>
                    ) : 'Confirmar Reserva'}
                </button>
            </form>
        </div>
    );
}