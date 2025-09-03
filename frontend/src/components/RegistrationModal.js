// src/components/RegistrationModal.js

import { useState } from 'react';

export default function RegistrationModal({ onRegister, onLogin }) {
    const [activeTab, setActiveTab] = useState('login'); // 'login' o 'register'
    
    // Estados para Login
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    
    // Estados para Registro
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (loginEmail && loginPassword) {
            // Por ahora simulamos que el login es exitoso con cualquier email/password
            const userData = { 
                name: loginEmail.split('@')[0], // Usamos la parte antes del @ como nombre
                email: loginEmail 
            };
            onLogin(userData);
        }
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        if (registerName && registerEmail && registerPassword) {
            onRegister({ name: registerName, email: registerEmail });
        }
    };

    return (
        <div>
            {/* Pestañas */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                        activeTab === 'login'
                            ? 'bg-white text-theme-primary shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Iniciar Sesión
                </button>
                <button
                    onClick={() => setActiveTab('register')}
                    className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                        activeTab === 'register'
                            ? 'bg-white text-theme-primary shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Registrarse
                </button>
            </div>

            {/* Contenido del Login */}
            {activeTab === 'login' && (
                <div>
                    <h3 className="text-2xl font-bold mb-4">Iniciar Sesión</h3>
                    <p className="text-gray-600 mb-6">Ingresa a tu cuenta para continuar</p>
                    <form onSubmit={handleLoginSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold">Correo Electrónico</label>
                            <input 
                                type="email" 
                                value={loginEmail} 
                                onChange={(e) => setLoginEmail(e.target.value)} 
                                className="w-full p-2 border rounded-lg mt-1" 
                                required 
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold">Contraseña</label>
                            <input 
                                type="password" 
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="••••••••" 
                                className="w-full p-2 border rounded-lg mt-1" 
                                required 
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full font-bold py-3 px-4 rounded-full mt-2">
                            Iniciar Sesión
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-4">
                        ¿No tienes cuenta?{' '}
                        <button 
                            onClick={() => setActiveTab('register')}
                            className="text-theme-primary hover:underline font-semibold"
                        >
                            Regístrate aquí
                        </button>
                    </p>
                </div>
            )}

            {/* Contenido del Registro */}
            {activeTab === 'register' && (
                <div>
                    <h3 className="text-2xl font-bold mb-4">Crear Cuenta</h3>
                    <p className="text-gray-600 mb-6">Crea tu cuenta para guardar tus compras y servicios</p>
                    <form onSubmit={handleRegisterSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold">Nombre Completo</label>
                            <input 
                                type="text" 
                                value={registerName} 
                                onChange={(e) => setRegisterName(e.target.value)} 
                                className="w-full p-2 border rounded-lg mt-1" 
                                required 
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold">Correo Electrónico</label>
                            <input 
                                type="email" 
                                value={registerEmail} 
                                onChange={(e) => setRegisterEmail(e.target.value)} 
                                className="w-full p-2 border rounded-lg mt-1" 
                                required 
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold">Contraseña</label>
                            <input 
                                type="password" 
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)}
                                placeholder="••••••••" 
                                className="w-full p-2 border rounded-lg mt-1" 
                                required 
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full font-bold py-3 px-4 rounded-full mt-2">
                            Registrarse y Continuar
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-4">
                        ¿Ya tienes cuenta?{' '}
                        <button 
                            onClick={() => setActiveTab('login')}
                            className="text-theme-primary hover:underline font-semibold"
                        >
                            Inicia sesión aquí
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
}