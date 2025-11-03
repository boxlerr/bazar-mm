-- Schema inicial para Bazar M&M ERP

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('admin', 'vendedor', 'gerente')),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    dni TEXT,
    direccion TEXT,
    saldo_cuenta_corriente DECIMAL(12, 2) DEFAULT 0,
    limite_credito DECIMAL(12, 2),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT NOT NULL,
    precio_costo DECIMAL(12, 2) NOT NULL,
    precio_venta DECIMAL(12, 2) NOT NULL,
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 0,
    proveedor TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id),
    usuario_id UUID NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    iva DECIMAL(12, 2) DEFAULT 0,
    descuento DECIMAL(12, 2) DEFAULT 0,
    metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'cuenta_corriente')),
    estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'completada', 'cancelada')),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de venta
CREATE TABLE IF NOT EXISTS venta_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de compras
CREATE TABLE IF NOT EXISTS compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proveedor TEXT NOT NULL,
    usuario_id UUID NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    metodo_pago TEXT NOT NULL,
    estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'completada', 'cancelada')),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de compra
CREATE TABLE IF NOT EXISTS compra_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compra_id UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de caja
CREATE TABLE IF NOT EXISTS caja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    saldo_inicial DECIMAL(12, 2) NOT NULL,
    saldo_final DECIMAL(12, 2),
    fecha_apertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    estado TEXT NOT NULL CHECK (estado IN ('abierta', 'cerrada')),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de movimientos de caja
CREATE TABLE IF NOT EXISTS movimientos_caja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caja_id UUID NOT NULL REFERENCES caja(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    concepto TEXT NOT NULL,
    monto DECIMAL(12, 2) NOT NULL,
    venta_id UUID REFERENCES ventas(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_usuario ON ventas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(created_at);
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_clientes_dni ON clientes(dni);

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ventas_updated_at BEFORE UPDATE ON ventas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compras_updated_at BEFORE UPDATE ON compras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
