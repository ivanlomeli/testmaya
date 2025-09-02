// src/components/HotelBookingForm.js

import { useState, useEffect } from 'react';

const hotelAddonsData = [
    { name: 'Tour Romántico', price: 1500, icon: '💖' },
    { name: 'Paquete Luna de Miel', price: 3500, icon: '🥂' },
    { name: 'Acceso a Spa', price: 800, icon: '💆‍♀️' }
];

export default function HotelBookingForm({ hotel, onConfirm }) {
    const [checkinDate, setCheckinDate] = useState('');
    const [checkoutDate, setCheckoutDate] = useState('');
    const [selectedAddons, setSelectedAddons] = useState([]);
    
    // --- NUEVO ESTADO PARA EL DESGLOSE ---
    const [itinerary, setItinerary] = useState([]);
    const [total, setTotal] = useState(0);

    // Este "useEffect" ahora también construye el desglose del itinerario
    useEffect(() => {
        const newItinerary = [];
        let newTotal = 0;

        // Calcula el costo de las noches y las añade al desglose
        if (checkinDate && checkoutDate) {
            const date1 = new Date(checkinDate);
            const date2 = new Date(checkoutDate);
            if (date2 > date1) {
                const timeDiff = date2.getTime() - date1.getTime();
                const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                for (let i = 0; i < nights; i++) {
                    newItinerary.push({ description: `Noche ${i + 1}`, price: hotel.price });
                    newTotal += hotel.price;
                }
            }
        }

        // Suma el costo de los extras y los añade al desglose
        selectedAddons.forEach(addon => {
            newItinerary.push({ description: addon.name, price: addon.price });
            newTotal += addon.price;
        });
        
        setItinerary(newItinerary);
        setTotal(newTotal);
    }, [checkinDate, checkoutDate, selectedAddons, hotel.price]);

    const handleAddonToggle = (addon) => {
        setSelectedAddons(prevAddons => 
            prevAddons.find(a => a.name === addon.name)
                ? prevAddons.filter(a => a.name !== addon.name)
                : [...prevAddons, addon]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (total > 0) {
            const bookingData = { name: hotel.name, total, addons: selectedAddons.map(a => a.name) };
            onConfirm('hotel', bookingData);
        } else {
            alert('Por favor, selecciona al menos una noche de estancia.');
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-4">Reservar en {hotel.name}</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Columna Izquierda: Opciones */}
                    <div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 font-semibold">Entrada</label>
                                <input type="date" className="w-full p-2 border rounded-lg mt-1" value={checkinDate} onChange={(e) => setCheckinDate(e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold">Salida</label>
                                <input type="date" className="w-full p-2 border rounded-lg mt-1" value={checkoutDate} onChange={(e) => setCheckoutDate(e.target.value)} required />
                            </div>
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
                                        <button type="button" onClick={() => handleAddonToggle(addon)} className={`${selectedAddons.find(a => a.name === addon.name) ? 'bg-red-500 hover:bg-red-600' : 'btn-primary'} text-white text-xs font-bold py-1 px-3 rounded-full transition-colors`}>
                                            {selectedAddons.find(a => a.name === addon.name) ? 'Quitar' : 'Añadir'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Columna Derecha: Itinerario con Desglose */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                         <h4 className="font-bold text-lg mb-2">Resumen de tu Estancia</h4>
                         
                         {/* --- AQUÍ ESTÁ EL CAMBIO --- */}
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
                    </div>
                </div>
                <button type="submit" className="btn-primary w-full font-bold py-3 px-4 rounded-full mt-6">Confirmar Reserva</button>
            </form>
        </div>
    );
}