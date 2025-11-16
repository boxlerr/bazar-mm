-- ============================================
-- MIGRACIÓN: Agregar campos para compras con PDF
-- Fecha: 2025-11-16
-- ============================================

-- Agregar campo numero_orden a la tabla compras
ALTER TABLE compras
ADD COLUMN IF NOT EXISTS numero_orden TEXT;

-- Agregar campo pdf_url a la tabla compras
ALTER TABLE compras
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Crear índice para búsqueda rápida por número de orden
CREATE INDEX IF NOT EXISTS idx_compras_numero_orden ON compras(numero_orden);

-- Comentarios
COMMENT ON COLUMN compras.numero_orden IS 'Número de orden del proveedor';
COMMENT ON COLUMN compras.pdf_url IS 'URL del PDF de la orden de compra';

-- ============================================
-- NOTA: Configurar Storage manualmente en Supabase:
-- 1. Ve a Storage en el dashboard
-- 2. Crea un bucket llamado "documentos" (público)
-- 3. En Policies, agrega:
--    - INSERT para authenticated users
--    - SELECT para public users
-- ============================================
