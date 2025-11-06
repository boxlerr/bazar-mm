-- ============================================
-- DATOS DE EJEMPLO PARA DESARROLLO
-- Versión 1.2 - BAZAR M&M ERP / Vaxler Software
-- ============================================

-- Nota:
-- Los usuarios reales se crean a través de Supabase Auth
-- Este seed inicializa clientes, proveedores y productos base

-- ============================================
-- INSERTAR CLIENTES DE EJEMPLO
-- ============================================
INSERT INTO clientes (nombre, email, telefono, dni, direccion, saldo_cuenta_corriente, limite_credito)
VALUES
('Cliente Genérico', 'cliente@example.com', '123456789', '12345678', 'Calle Ejemplo 123', 0, 10000),
('María González', 'maria@example.com', '987654321', '23456789', 'Av. Principal 456', 500, 5000),
('Juan Pérez', 'juan@example.com', '555123456', '34567890', 'Calle Secundaria 789', 0, 8000);

-- ============================================
-- INSERTAR PROVEEDORES DE EJEMPLO
-- ============================================
INSERT INTO proveedores (nombre, razon_social, cuit, email, telefono)
VALUES
('Distribuidora Central', 'Distribuidora Central SRL', '30-12345678-9', 'distcentral@example.com', '011-4444-1111'),
('Embotelladora S.A.', 'Embotelladora S.A.', '30-22334455-9', 'ventas@embotelladora.com', '011-2222-3333'),
('Limpiadores Unidos', 'Limpiadores Unidos SRL', '30-11223344-5', 'contacto@limpiadores.com', '011-1111-2222'),
('Distribuidora Belleza', 'Distribuidora Belleza SRL', '30-99887766-5', 'ventas@belleza.com', '011-5555-6666'),
('Papelera Nacional', 'Papelera Nacional SRL', '30-33445566-7', 'ventas@papelera.com', '011-8888-9999'),
('Golosinas Express', 'Golosinas Express SRL', '30-66778899-0', 'ventas@golosinas.com', '011-7777-8888');

-- ============================================
-- INSERTAR PRODUCTOS DE EJEMPLO
-- ============================================
INSERT INTO productos (
    codigo,
    nombre,
    descripcion,
    categoria,
    precio_costo,
    precio_venta,
    stock_actual,
    stock_minimo,
    proveedor_id
)
VALUES
('001', 'Aceite Girasol 1L', 'Aceite de girasol refinado 1 litro', 'Almacén', 800, 1200, 50, 10, (SELECT id FROM proveedores WHERE nombre = 'Distribuidora Central')),
('002', 'Azúcar 1kg', 'Azúcar refinada común', 'Almacén', 500, 750, 100, 20, (SELECT id FROM proveedores WHERE nombre = 'Distribuidora Central')),
('003', 'Coca Cola 2.25L', 'Gaseosa Coca Cola 2.25 litros', 'Bebidas', 1200, 1800, 80, 15, (SELECT id FROM proveedores WHERE nombre = 'Embotelladora S.A.')),
('004', 'Detergente Limpieza', 'Detergente multiuso 500ml', 'Limpieza', 600, 950, 60, 10, (SELECT id FROM proveedores WHERE nombre = 'Limpiadores Unidos')),
('005', 'Shampoo Sedal', 'Shampoo Sedal 400ml', 'Perfumería', 1500, 2300, 40, 8, (SELECT id FROM proveedores WHERE nombre = 'Distribuidora Belleza')),
('006', 'Papel Higiénico 4 rollos', 'Papel higiénico doble hoja', 'Bazar', 800, 1200, 120, 30, (SELECT id FROM proveedores WHERE nombre = 'Papelera Nacional')),
('007', 'Arroz Largo Fino 1kg', 'Arroz largo fino tipo 1', 'Almacén', 900, 1400, 90, 20, (SELECT id FROM proveedores WHERE nombre = 'Distribuidora Central')),
('008', 'Jabón Tocador', 'Jabón de tocador neutro', 'Perfumería', 300, 500, 150, 40, (SELECT id FROM proveedores WHERE nombre = 'Distribuidora Belleza')),
('009', 'Galletitas Dulces', 'Galletitas dulces surtidas 200g', 'Almacén', 400, 650, 70, 15, (SELECT id FROM proveedores WHERE nombre = 'Golosinas Express')),
('010', 'Lavandina 1L', 'Lavandina concentrada 1 litro', 'Limpieza', 400, 700, 55, 12, (SELECT id FROM proveedores WHERE nombre = 'Limpiadores Unidos'));

-- ============================================
-- INSERTAR UNA CAJA DE EJEMPLO (CERRADA)
-- ============================================
-- Nota: reemplazar UUID_DEL_USUARIO por un usuario válido del Auth de Supabase
-- INSERT INTO caja (usuario_id, saldo_inicial, saldo_final, fecha_apertura, fecha_cierre, estado)
-- VALUES ('UUID_DEL_USUARIO', 5000, 12000, NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours', 'cerrada');

-- ============================================
-- NOTA FINAL
-- ============================================
-- Las ventas de ejemplo se pueden agregar después de tener usuarios reales
-- (ya que necesitan un usuario_id del sistema de autenticación)
