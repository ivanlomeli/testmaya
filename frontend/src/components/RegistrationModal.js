// src/components/RegistrationModal.js

import { useState } from 'react';

// La línea 'export default' es crucial. Hace que este componente esté disponible para otros archivos.
export default function RegistrationModal({ onRegister }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validamos que los campos no estén vacíos antes de registrar
        if (name && email && password) {
            onRegister({ name, email });
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Crea tu Cuenta para Continuar</h3>
            <p className="text-gray-600 mb-6">Necesitas una cuenta para guardar tus compras y servicios.</p>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold">Nombre Completo</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full p-2 border rounded-lg mt-1" 
                        required 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold">Correo Electrónico</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full p-2 border rounded-lg mt-1" 
                        required 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold">Contraseña</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full p-2 border rounded-lg mt-1" 
                        required 
                    />
                </div>
                <button type="submit" className="btn-primary w-full font-bold py-3 px-4 rounded-full mt-2">
                    Registrarse y Continuar
                </button>
            </form>
        </div>
    );
}