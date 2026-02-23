-- ============================================
-- TABLA: TEMPLATES DE PARSEO DE PDF
-- ============================================

CREATE TABLE IF NOT EXISTS pdf_parsing_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    proveedor_id UUID REFERENCES proveedores(id), -- Opcional, para asociar a un proveedor específico
    activo BOOLEAN DEFAULT true,
    
    -- Palabras clave para detección automática
    detect_keywords TEXT[] DEFAULT '{}', 
    
    -- Configuración del Encabezado (Regex para Nro Orden, Fecha, Total)
    header_config JSONB DEFAULT '{}'::jsonb,
    -- Estructura esperada:
    -- {
    --   "order_regex": "Orden\\s*#?(\\d+)",
    --   "date_regex": "(\\d{2}/\\d{2}/\\d{4})",
    --   "total_regex": "Total:\\s*\\$?\\s*([\\d.,]+)"
    -- }

    -- Configuración de Productos (Tabla)
    products_config JSONB DEFAULT '{}'::jsonb,
    -- Estructura esperada:
    -- {
    --   "table_start_marker": "Descripcion",
    --   "table_end_marker": "Subtotal",
    --   "line_regex": "^(\\d+)\\s+(.+?)\\s+([\\d.,]+)$",
    --   "field_mapping": { "qty": 1, "description": 2, "price": 3 }
    -- }

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para updated_at
CREATE TRIGGER update_pdf_templates_updated_at BEFORE UPDATE ON pdf_parsing_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
