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
import TourBookingForm from './components/TourBookingForm'; // <-- Importar nuevo formulario
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

    const openModal = (type, data = null) => setModalState({ type, data });
    const closeModal = () => setModalState({ type: null, data: null });

    const handleAddToCart = (product) => { /* ...lógica sin cambios... */ };
    const handleRemoveFromCart = (productId) => { /* ...lógica sin cambios... */ };
    const handleConfirmAction = (actionType, actionData) => { /* ...lógica sin cambios... */ };
    const handleRegistration = (newUserInfo) => { /* ...lógica sin cambios... */ };
    
    if (!introComplete) {
        return <IntroAnimation onAnimationComplete={() => setIntroComplete(true)} />;
    }

    return (
        <div className="antialiased">
            <Header 
                cartItemCount={cart.length}
                onCartClick={() => openModal('cart')}
                onLoginClick={() => openModal('register')}
                isLoggedIn={isLoggedIn}
            />

            <main>
                <Routes>
                    <Route path="/" element={<HotelesPage onReserveClick={(data) => openModal('hotel', data)} />} />
                    <Route path="/restaurantes" element={<RestaurantesPage onMenuClick={(data) => openModal('restaurant', data)} />} />
                    <Route path="/experiencias" element={<ExperienciasPage onExperienceClick={(data) => openModal('experience', data)} />} />
                    <Route path="/artesanos" element={<ArtesanosPage />} />
                    <Route path="/artesanos/:productId" element={<ProductDetailPage onAddToCart={handleAddToCart}/>} />
                    <Route path="/transporte" element={<TransportePage onSolicitarClick={() => openModal('transporte')} />} />
                    <Route path="/portal" element={<PortalPage userData={userData} />} />
                </Routes>
            </main>

            <footer className="bg-gray-800 text-white py-10">
                {/* ... footer sin cambios ... */}
            </footer>

            <Modal isOpen={!!modalState.type} onClose={closeModal}>
                {modalState.type === 'hotel' && <HotelBookingForm hotel={modalState.data} onConfirm={handleConfirmAction} />}
                {modalState.type === 'restaurant' && <RestaurantMenu restaurant={modalState.data} onConfirm={handleConfirmAction} />}
                {modalState.type === 'cart' && <CartModal cartItems={cart} onRemoveItem={handleRemoveFromCart} />}
                {modalState.type === 'transporte' && <TransporteModal />}
                {modalState.type === 'register' && <RegistrationModal onRegister={handleRegistration} />}
                {modalState.type === 'experience' && (
                    <>
                        {modalState.data?.type === 'caballos' && <CaballosBookingForm experience={modalState.data} onConfirm={handleConfirmAction} />}
                        {modalState.data?.type === 'cenote' && <CenoteBookingForm experience={modalState.data} onConfirm={handleConfirmAction} />}
                        
                        {/* --- AQUÍ ESTÁ EL CAMBIO --- */}
                        {modalState.data?.type === 'tour' && <TourBookingForm experience={modalState.data} onConfirm={handleConfirmAction} />}
                    </>
                )}
            </Modal>
        </div>
    );
}

export default App;