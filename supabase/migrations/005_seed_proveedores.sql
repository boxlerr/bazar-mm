-- ============================================
-- SEED: Proveedores de ejemplo
-- ============================================

-- Insertar proveedores de ejemplo si no existen
INSERT INTO proveedores (nombre, razon_social, cuit, email, telefono, condicion_iva, activo)
VALUES 
  ('D&G Distribuidora', 'D&G S.A.', '20-12345678-9', 'ventas@dyg.com', '011-4444-5555', 'RI', true),
  ('Librería Central', 'Librería Central S.R.L.', '20-98765432-1', 'info@libreriacentral.com', '011-3333-4444', 'RI', true),
  ('Almacén Mayorista', 'Almacén Mayorista S.A.', '30-11223344-5', 'mayorista@almacen.com', '011-2222-3333', 'RI', true)
ON CONFLICT (cuit) DO NOTHING;
