// src/components/Header.js

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/Imagotipo-Maya-Digital-2022.png';

export default function Header({ cartItemCount, onCartClick, onLoginClick, onLogout, isLoggedIn, userData }) {
    const [showUserMenu, setShowUserMenu] = useState(false);

    const navLinks = [
        { to: '/', label: 'Hoteles' },
        { to: '/restaurantes', label: 'Restaurantes' },
        { to: '/experiencias', label: 'Experiencias' },
        { to: '/artesanos', label: 'Artesanos' },
        { to: '/transporte', label: 'Transporte' },
    ];

    // Función para determinar el estilo del NavLink (activo vs inactivo)
    const getNavLinkClass = ({ isActive }) => 
        `relative z-10 px-4 py-1.5 text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-theme-dark' : 'text-gray-500 hover:text-theme-dark'}`;

    const handleLogout = () => {
        console.log('🚪 [HEADER] Cerrando sesión...');
        
        // Limpiar localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        // Cerrar menú
        setShowUserMenu(false);
        
        // Llamar callback de logout
        if (onLogout) {
            onLogout();
        }
        
        console.log('✅ [HEADER] Sesión cerrada');
    };

    return (
        <header className="bg-white/70 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-white/20">
            <nav className="container mx-auto px-6 py-2 flex justify-between items-center">
                <NavLink to="/">
                    <img src={logo} alt="Logo Maya Digital" className="h-12 w-auto" />
                </NavLink>

                {/* Navegación ahora usa NavLink */}
                <div className="hidden md:flex items-center space-x-2 relative bg-gray-100 p-1 rounded-full">
                    {navLinks.map(link => (
                        <NavLink
                            key={link.label}
                            to={link.to}
                            className={getNavLinkClass}
                            end // 'end' es importante para que la ruta principal "/" no esté siempre activa
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {/* Carrito */}
                    <div className="relative cursor-pointer" onClick={onCartClick}>
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        {cartItemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-theme-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold border-2 border-white">{cartItemCount}</span>
                        )}
                    </div>

                    {/* Usuario - Logueado o No Logueado */}
                    {isLoggedIn && userData ? (
                        <div className="relative">
                            <button 
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 bg-theme-primary text-white font-semibold text-sm px-4 py-2 rounded-full hover:bg-theme-primary/90 transition-colors"
                            >
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold">
                                        {userData.name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <span className="hidden md:block">
                                    {userData.name || 'Usuario'}
                                </span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                                    <div className="px-4 py-2 border-b">
                                        <p className="font-semibold text-gray-800">{userData.name}</p>
                                        <p className="text-sm text-gray-500">{userData.email}</p>
                                    </div>
                                    <NavLink 
                                        to="/portal" 
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        🏠 Mi Panel
                                    </NavLink>
                                    <button 
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        🚪 Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button 
                            onClick={onLoginClick} 
                            className="hidden md:block bg-gray-800 text-white font-semibold text-sm px-4 py-2 rounded-full hover:bg-gray-900 transition-colors"
                        >
                            Iniciar Sesión
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
}