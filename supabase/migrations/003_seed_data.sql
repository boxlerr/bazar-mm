-- Datos de ejemplo para desarrollo

-- Insertar usuario administrador de ejemplo
-- Nota: El usuario real se creará a través de Supabase Auth

-- Insertar clientes de ejemplo
INSERT INTO clientes (nombre, email, telefono, dni, direccion, saldo_cuenta_corriente, limite_credito) VALUES
('Cliente Genérico', 'cliente@example.com', '123456789', '12345678', 'Calle Ejemplo 123', 0, 10000),
('María González', 'maria@example.com', '987654321', '23456789', 'Av. Principal 456', 500, 5000),
('Juan Pérez', 'juan@example.com', '555123456', '34567890', 'Calle Secundaria 789', 0, 8000);

-- Insertar productos de ejemplo
INSERT INTO productos (codigo, nombre, descripcion, categoria, precio_costo, precio_venta, stock_actual, stock_minimo, proveedor) VALUES
('001', 'Aceite Girasol 1L', 'Aceite de girasol refinado 1 litro', 'Almacén', 800, 1200, 50, 10, 'Distribuidora Central'),
('002', 'Azúcar 1kg', 'Azúcar refinada común', 'Almacén', 500, 750, 100, 20, 'Distribuidora Central'),
('003', 'Coca Cola 2.25L', 'Gaseosa Coca Cola 2.25 litros', 'Bebidas', 1200, 1800, 80, 15, 'Embotelladora S.A.'),
('004', 'Detergente Limpieza', 'Detergente multiuso 500ml', 'Limpieza', 600, 950, 60, 10, 'Limpiadores Unidos'),
('005', 'Shampoo Sedal', 'Shampoo Sedal 400ml', 'Perfumería', 1500, 2300, 40, 8, 'Distribuidora Belleza'),
('006', 'Papel Higiénico 4 rollos', 'Papel higiénico doble hoja', 'Bazar', 800, 1200, 120, 30, 'Papelera Nacional'),
('007', 'Arroz Largo Fino 1kg', 'Arroz largo fino tipo 1', 'Almacén', 900, 1400, 90, 20, 'Distribuidora Central'),
('008', 'Jabón Tocador', 'Jabón de tocador neutro', 'Perfumería', 300, 500, 150, 40, 'Distribuidora Belleza'),
('009', 'Galletitas Dulces', 'Galletitas dulces surtidas 200g', 'Almacén', 400, 650, 70, 15, 'Golosinas Express'),
('010', 'Lavandina 1L', 'Lavandina concentrada 1 litro', 'Limpieza', 400, 700, 55, 12, 'Limpiadores Unidos');

-- Insertar una caja de ejemplo (cerrada)
-- INSERT INTO caja (usuario_id, saldo_inicial, saldo_final, fecha_apertura, fecha_cierre, estado) VALUES
-- ('UUID_DEL_USUARIO', 5000, 12000, NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours', 'cerrada');

-- Nota: Las ventas de ejemplo se pueden agregar después de tener usuarios reales
