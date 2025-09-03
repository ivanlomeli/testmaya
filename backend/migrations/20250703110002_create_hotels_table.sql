-- Crear archivo: backend/migrations/20250703110002_create_hotels_table.sql
CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    address TEXT,
    price DECIMAL(10, 2) NOT NULL,
    owner_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de prueba
INSERT INTO hotels (name, location, address, price, status) VALUES
('Hotel Balam Kú', 'Tulum, Quintana Roo', 'Zona Hotelera Tulum', 2500.00, 'approved'),
('Hacienda Uxmal', 'Mérida, Yucatán', 'Centro Histórico Mérida', 3200.00, 'approved'),
('Resort Kin Ha', 'Palenque, Chiapas', 'Zona Arqueológica Palenque', 1900.00, 'approved');