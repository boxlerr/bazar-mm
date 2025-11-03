-- Relaciones y constraints adicionales

-- Agregar foreign key para usuario_id en ventas (si la tabla usuarios está en auth)
-- Nota: Ajustar según la estructura de autenticación de Supabase

-- Función para actualizar stock automáticamente después de una venta
CREATE OR REPLACE FUNCTION actualizar_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE productos 
        SET stock_actual = stock_actual - NEW.cantidad
        WHERE id = NEW.producto_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE productos 
        SET stock_actual = stock_actual + OLD.cantidad
        WHERE id = OLD.producto_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar stock al insertar o eliminar items de venta
CREATE TRIGGER trigger_actualizar_stock_venta
AFTER INSERT OR DELETE ON venta_items
FOR EACH ROW EXECUTE FUNCTION actualizar_stock();

-- Función para actualizar saldo de cuenta corriente
CREATE OR REPLACE FUNCTION actualizar_cuenta_corriente()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.metodo_pago = 'cuenta_corriente' AND NEW.estado = 'completada' THEN
        UPDATE clientes 
        SET saldo_cuenta_corriente = saldo_cuenta_corriente + NEW.total
        WHERE id = NEW.cliente_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar cuenta corriente al completar venta
CREATE TRIGGER trigger_cuenta_corriente
AFTER INSERT OR UPDATE ON ventas
FOR EACH ROW EXECUTE FUNCTION actualizar_cuenta_corriente();

-- Función RPC para actualizar stock manualmente
CREATE OR REPLACE FUNCTION actualizar_stock(p_producto_id UUID, p_cantidad INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE productos
    SET stock_actual = stock_actual + p_cantidad
    WHERE id = p_producto_id;
END;
$$ LANGUAGE plpgsql;

-- Políticas de seguridad (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE compra_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura/escritura a usuarios autenticados
CREATE POLICY "Permitir acceso completo a usuarios autenticados"
ON usuarios FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir acceso completo a clientes"
ON clientes FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir acceso completo a productos"
ON productos FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir acceso completo a ventas"
ON ventas FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir acceso completo a venta_items"
ON venta_items FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir acceso completo a compras"
ON compras FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir acceso completo a compra_items"
ON compra_items FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir acceso completo a caja"
ON caja FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir acceso completo a movimientos_caja"
ON movimientos_caja FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
