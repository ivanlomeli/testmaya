// src/pages/PortalPage.js

export default function PortalPage({ userData }) {
    if (!userData) {
        return (
            <div className="container mx-auto px-6 py-16 text-center">
                <h2 className="text-4xl font-bold mb-4">Acceso Denegado</h2>
                <p className="text-gray-600">Necesitas iniciar sesión para acceder al portal.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-16">
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-4xl font-bold mb-6">Mi Panel de Control</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Información del Usuario */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-2xl font-bold mb-4">Mi Información</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="font-semibold">Nombre:</span>
                                <p className="text-gray-700">{userData.name}</p>
                            </div>
                            <div>
                                <span className="font-semibold">Email:</span>
                                <p className="text-gray-700">{userData.email}</p>
                            </div>
                            <button className="btn-primary px-4 py-2 rounded-lg font-semibold">
                                Editar Perfil
                            </button>
                        </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-2xl font-bold mb-4">Mis Estadísticas</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-theme-primary">5</p>
                                <p className="text-sm text-gray-600">Reservas</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-theme-secondary">3</p>
                                <p className="text-sm text-gray-600">Experiencias</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-theme-primary">$15,200</p>
                                <p className="text-sm text-gray-600">Total Gastado</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-theme-secondary">2</p>
                                <p className="text-sm text-gray-600">Artesanías</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Historial de Reservas REAL */}
                <div className="mt-8">
                    <h3 className="text-2xl font-bold mb-4">Mis Reservas Recientes</h3>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="space-y-4">
                            {/* Hoteles */}
                            {userHistory?.hotels?.length > 0 && userHistory.hotels.map((reservation, index) => (
                                <div key={index} className="flex justify-between items-center border-b pb-2">
                                    <div>
                                        <h4 className="font-semibold">🏨 {reservation.name}</h4>
                                        <p className="text-sm text-gray-600">
                                            {new Date(reservation.date).toLocaleDateString('es-MX')} - ${reservation.total.toFixed(2)} MXN
                                        </p>
                                    </div>
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                        {reservation.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                                    </span>
                                </div>
                            ))}
                            
                            {/* Experiencias */}
                            {userHistory?.experiences?.length > 0 && userHistory.experiences.map((experience, index) => (
                                <div key={index} className="flex justify-between items-center border-b pb-2">
                                    <div>
                                        <h4 className="font-semibold">🎯 {experience.name}</h4>
                                        <p className="text-sm text-gray-600">
                                            {new Date(experience.date).toLocaleDateString('es-MX')} - ${experience.total.toFixed(2)} MXN
                                        </p>
                                        <p className="text-xs text-gray-500">{experience.personas} persona(s)</p>
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                        {experience.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                                    </span>
                                </div>
                            ))}
                            
                            {/* Restaurantes */}
                            {userHistory?.restaurants?.length > 0 && userHistory.restaurants.map((order, index) => (
                                <div key={index} className="flex justify-between items-center border-b pb-2">
                                    <div>
                                        <h4 className="font-semibold">🍽️ {order.name}</h4>
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.date).toLocaleDateString('es-MX')} - ${order.total.toFixed(2)} MXN
                                        </p>
                                    </div>
                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                                        {order.status === 'confirmed' ? 'Entregado' : 'Pendiente'}
                                    </span>
                                </div>
                            ))}
                            
                            {/* Compras */}
                            {userHistory?.purchases?.length > 0 && userHistory.purchases.map((purchase, index) => (
                                <div key={index} className="flex justify-between items-center border-b pb-2">
                                    <div>
                                        <h4 className="font-semibold">🎨 Artesanías</h4>
                                        <p className="text-sm text-gray-600">
                                            {new Date(purchase.date).toLocaleDateString('es-MX')} - ${purchase.total.toFixed(2)} MXN
                                        </p>
                                        <p className="text-xs text-gray-500">{purchase.items.length} producto(s)</p>
                                    </div>
                                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                        {purchase.status === 'confirmed' ? 'Comprado' : 'Pendiente'}
                                    </span>
                                </div>
                            ))}
                            
                            {/* Mensaje si no hay historial */}
                            {(!userHistory?.hotels?.length && !userHistory?.experiences?.length && 
                              !userHistory?.restaurants?.length && !userHistory?.purchases?.length) && (
                                <p className="text-gray-500 text-center py-4">
                                    Aún no tienes reservas. ¡Explora nuestros servicios para comenzar tu aventura maya!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}