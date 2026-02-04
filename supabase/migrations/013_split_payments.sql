-- 1. Crear tabla PAGOS (Tabla pivote para multiples medios de pago)
CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    metodo TEXT NOT NULL, 
    monto DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_pagos_venta_id ON pagos(venta_id);

-- 2. Migrar datos existentes
INSERT INTO pagos (venta_id, metodo, monto, created_at)
SELECT id, metodo_pago, total, created_at
FROM ventas
WHERE NOT EXISTS (SELECT 1 FROM pagos WHERE pagos.venta_id = ventas.id);

-- 3. Actualizar constraint en VENTAS
ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_metodo_pago_check;

ALTER TABLE ventas ADD CONSTRAINT ventas_metodo_pago_check 
    CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'cuenta_corriente', 'multiple'));

-- 4. REFACTOR LOGICA CUENTA CORRIENTE
DROP TRIGGER IF EXISTS trigger_cuenta_corriente ON ventas;

CREATE OR REPLACE FUNCTION public.actualizar_saldo_cliente_desde_movim()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.tipo = 'debito' THEN
      UPDATE clientes SET saldo_cuenta_corriente = saldo_cuenta_corriente + NEW.monto WHERE id = NEW.cliente_id;
    ELSIF NEW.tipo = 'credito' THEN
      UPDATE clientes SET saldo_cuenta_corriente = saldo_cuenta_corriente - NEW.monto WHERE id = NEW.cliente_id;
    END IF;
    RETURN NEW;
  
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.tipo = 'debito' THEN
      UPDATE clientes SET saldo_cuenta_corriente = saldo_cuenta_corriente - OLD.monto WHERE id = OLD.cliente_id;
    ELSIF OLD.tipo = 'credito' THEN
      UPDATE clientes SET saldo_cuenta_corriente = saldo_cuenta_corriente + OLD.monto WHERE id = OLD.cliente_id;
    END IF;
    RETURN OLD;
  END IF;
  return NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_saldo_movim ON movimientos_cuenta_corriente;

CREATE TRIGGER trigger_update_saldo_movim
AFTER INSERT OR DELETE ON movimientos_cuenta_corriente
FOR EACH ROW
EXECUTE FUNCTION actualizar_saldo_cliente_desde_movim();
