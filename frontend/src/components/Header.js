// src/components/Header.js

import { NavLink } from 'react-router-dom'; // <-- 1. Importar NavLink
import logo from '../assets/Imagotipo-Maya-Digital-2022.png';

// El header ahora es más simple, ya no maneja el estado de la página activa
export default function Header({ cartItemCount, onCartClick, onLoginClick }) {

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
                    <div className="relative cursor-pointer" onClick={onCartClick}>
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        {cartItemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-theme-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold border-2 border-white">{cartItemCount}</span>
                        )}
                    </div>
                    <button onClick={onLoginClick} className="hidden md:block bg-gray-800 text-white font-semibold text-sm px-4 py-2 rounded-full hover:bg-gray-900 transition-colors">
                        Iniciar Sesión
                    </button>
                </div>
            </nav>
        </header>
    );
}