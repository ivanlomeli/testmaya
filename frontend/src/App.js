// frontend/src/App.js

import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './index.css';

// Importar todos los componentes y páginas
import Modal from './components/Modal';
import IntroAnimation from './components/IntroAnimation';
import Header from './components/Header';
import HotelBookingForm from './components/HotelBookingForm';
import RestaurantMenu from './components/RestaurantMenu';
import CaballosBookingForm from './components/CaballosBookingForm';
import CenoteBookingForm from './components/CenoteBookingForm';
import TourBookingForm from './components/TourBookingForm';
import ProductDetailPage from './pages/ProductDetailPage';
import CartModal from './components/CartModal';
import TransporteModal from './components/TransporteModal';
import RegistrationModal from './components/RegistrationModal';
import HotelesPage from './pages/HotelesPage';
import RestaurantesPage from './pages/RestaurantesPage';
import ExperienciasPage from './pages/ExperienciasPage';
import ArtesanosPage from './pages/ArtesanosPage';
import TransportePage from './pages/TransportePage';
import PortalPage from './pages/PortalPage';

function App() {
    const [introComplete, setIntroComplete] = useState(false);
    const [modalState, setModalState] = useState({ type: null, data: null });
    const [cart, setCart] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [pendingAction, setPendingAction] = useState(null);
    
    // ✅ NUEVOS ESTADOS PARA HISTORIAL REAL
    const [userHistory, setUserHistory] = useState({
        hotels: [],
        restaurants: [],
        experiences: [],
        purchases: [],
        totalSpent: 0
    });

    const openModal = (type, data = null) => setModalState({ type, data });
    const closeModal = () => setModalState({ type: null, data: null });

    // ✅ FUNCIÓN: Agregar productos al carrito
    const handleAddToCart = (product) => {
        setCart(prevCart => [...prevCart, product]);
        alert(`${product.name} agregado al carrito!`);
    };

    // ✅ FUNCIÓN: Remover productos del carrito
    const handleRemoveFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    // ✅ FUNCIÓN MODIFICADA: Manejar confirmaciones de reservas - AHORA GUARDA REAL
    const handleConfirmAction = (actionType, actionData) => {
        // Si no está logueado, guardar la acción pendiente y mostrar registro
        if (!isLoggedIn) {
            setPendingAction({ type: actionType, data: actionData });
            openModal('register');
            return;
        }

        // ✅ CREAR REGISTRO REAL CON TIMESTAMP
        const timestamp = new Date().toISOString();
        const newRecord = {
            id: Date.now(), // ID único basado en timestamp
            ...actionData,
            date: timestamp,
            status: 'confirmed'
        };

        // ✅ GUARDAR EN EL HISTORIAL SEGÚN EL TIPO
        setUserHistory(prevHistory => {
            const newHistory = { ...prevHistory };
            
            switch (actionType) {
                case 'hotel':
                    newHistory.hotels.push(newRecord);
                    newHistory.totalSpent += actionData.total;
                    alert(`✅ Reserva confirmada en ${actionData.name} por $${actionData.total.toFixed(2)} MXN`);
                    break;
                    
                case 'restaurant':
                    newHistory.restaurants.push(newRecord);
                    newHistory.totalSpent += actionData.total;
                    alert(`✅ Pedido confirmado en ${actionData.name} por $${actionData.total.toFixed(2)} MXN`);
                    break;
                    
                case 'experience':
                    newHistory.experiences.push(newRecord);
                    newHistory.totalSpent += actionData.total;
                    alert(`✅ Experiencia "${actionData.name}" reservada para ${actionData.personas} persona(s) por $${actionData.total.toFixed(2)} MXN`);
                    break;
                    
                default:
                    alert('Acción confirmada');
            }
            
            return newHistory;
        });
        
        closeModal();
    };

    // ✅ NUEVA FUNCIÓN: Procesar compras del carrito
    const handleCartCheckout = () => {
        if (cart.length === 0) return;
        
        if (!isLoggedIn) {
            setPendingAction({ type: 'cart', data: { items: cart, total: cart.reduce((sum, item) => sum + item.price, 0) } });
            openModal('register');
            return;
        }

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const timestamp = new Date().toISOString();
        
        const purchaseRecord = {
            id: Date.now(),
            items: [...cart],
            total: total,
            date: timestamp,
            status: 'confirmed'
        };

        setUserHistory(prevHistory => ({
            ...prevHistory,
            purchases: [...prevHistory.purchases, purchaseRecord],
            totalSpent: prevHistory.totalSpent + total
        }));

        setCart([]); // Vaciar carrito
        alert(`✅ Compra realizada por $${total.toFixed(2)} MXN`);
    };

    // ✅ FUNCIÓN: Manejar registro de usuarios
    const handleRegistration = (newUserInfo) => {
        setUserData(newUserInfo);
        setIsLoggedIn(true);
        closeModal();
        
        // Si había una acción pendiente, ejecutarla ahora
        if (pendingAction) {
            if (pendingAction.type === 'cart') {
                handleCartCheckout();
            } else {
                handleConfirmAction(pendingAction.type, pendingAction.data);
            }
            setPendingAction(null);
        }
        
        alert(`¡Bienvenido ${newUserInfo.name}! Tu cuenta ha sido creada exitosamente.`);
    };

    // ✅ FUNCIÓN: Manejar inicio de sesión
    const handleLogin = (loginUserInfo) => {
        setUserData(loginUserInfo);
        setIsLoggedIn(true);
        closeModal();
        
        // Si había una acción pendiente, ejecutarla ahora
        if (pendingAction) {
            if (pendingAction.type === 'cart') {
                handleCartCheckout();
            } else {
                handleConfirmAction(pendingAction.type, pendingAction.data);
            }
            setPendingAction(null);
        }
        
        alert(`¡Bienvenido de vuelta ${loginUserInfo.name}!`);
    };

    // ✅ FUNCIÓN MODIFICADA: Manejar cierre de sesión
    const handleLogout = () => {
        setUserData(null);
        setIsLoggedIn(false);
        setCart([]);
        setPendingAction(null);
        // ✅ MANTENER EL HISTORIAL (en una app real esto se guardaría en base de datos)
        // setUserHistory({ hotels: [], restaurants: [], experiences: [], purchases: [], totalSpent: 0 });
        alert('Sesión cerrada exitosamente');
    };
    
    if (!introComplete) {
        return <IntroAnimation onAnimationComplete={() => setIntroComplete(true)} />;
    }

    return (
        <div className="antialiased">
            <Header 
                cartItemCount={cart.length}
                onCartClick={() => openModal('cart')}
                onLoginClick={() => openModal('register')}
                onLogout={handleLogout}
                isLoggedIn={isLoggedIn}
                userData={userData}
            />

            <main>
                <Routes>
                    <Route 
                        path="/" 
                        element={
                            <HotelesPage 
                                onReserveClick={(data) => {
                                    console.log('onReserveClick llamada con:', data);
                                    openModal('hotel', data);
                                }} 
                            />
                        } 
                    />
                    <Route 
                        path="/restaurantes" 
                        element={
                            <RestaurantesPage 
                                onMenuClick={(data) => openModal('restaurant', data)} 
                            />
                        } 
                    />
                    <Route 
                        path="/experiencias" 
                        element={
                            <ExperienciasPage 
                                onExperienceClick={(data) => openModal('experience', data)} 
                            />
                        } 
                    />
                    <Route path="/artesanos" element={<ArtesanosPage />} />
                    <Route path="/artesanos/:productId" element={<ProductDetailPage onAddToCart={handleAddToCart}/>} />
                    <Route path="/transporte" element={<TransportePage onSolicitarClick={() => openModal('transporte')} />} />
                    {/* ✅ PASAR EL HISTORIAL REAL AL PORTAL */}
                    <Route path="/portal" element={<PortalPage userData={userData} userHistory={userHistory} />} />
                </Routes>
            </main>

            <footer className="bg-gray-800 text-white py-10">
                <div className="container mx-auto px-6 text-center">
                    <h3 className="text-2xl font-bold mb-4">Maya Digital</h3>
                    <p className="text-gray-400">Conectando el mundo maya con la tecnología moderna</p>
                    <div className="mt-4 flex justify-center space-x-6">
                        <Link to="/" className="text-gray-400 hover:text-white transition-colors">Hoteles</Link>
                        <Link to="/restaurantes" className="text-gray-400 hover:text-white transition-colors">Restaurantes</Link>
                        <Link to="/experiencias" className="text-gray-400 hover:text-white transition-colors">Experiencias</Link>
                        <Link to="/artesanos" className="text-gray-400 hover:text-white transition-colors">Artesanos</Link>
                        <Link to="/transporte" className="text-gray-400 hover:text-white transition-colors">Transporte</Link>
                    </div>
                </div>
            </footer>

            <Modal isOpen={!!modalState.type} onClose={closeModal}>
                {modalState.type === 'hotel' && <HotelBookingForm hotel={modalState.data} onConfirm={handleConfirmAction} />}
                {modalState.type === 'restaurant' && <RestaurantMenu restaurant={modalState.data} onConfirm={handleConfirmAction} />}
                {/* ✅ PASAR LA FUNCIÓN DE CHECKOUT REAL */}
                {modalState.type === 'cart' && <CartModal cartItems={cart} onRemoveItem={handleRemoveFromCart} onCheckout={handleCartCheckout} />}
                {modalState.type === 'transporte' && <TransporteModal />}
                {modalState.type === 'register' && (
                    <RegistrationModal 
                        onRegister={handleRegistration} 
                        onLogin={handleLogin}
                    />
                )}
                {modalState.type === 'experience' && (
                    <>
                        {modalState.data?.type === 'caballos' && <CaballosBookingForm experience={modalState.data} onConfirm={handleConfirmAction} />}
                        {modalState.data?.type === 'cenote' && <CenoteBookingForm experience={modalState.data} onConfirm={handleConfirmAction} />}
                        {modalState.data?.type === 'tour' && <TourBookingForm experience={modalState.data} onConfirm={handleConfirmAction} />}
                    </>
                )}
            </Modal>
        </div>
    );
}

export default App;