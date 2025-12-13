-- Tabla para registrar ajustes manuales de stock
create table if not exists ajustes_stock (
  id uuid default gen_random_uuid() primary key,
  producto_id uuid references productos(id) not null,
  usuario_id uuid references usuarios(id) not null,
  cantidad integer not null, -- Positivo para entrada, negativo para salida
  motivo text not null check (motivo in ('inventario', 'rotura', 'perdida', 'regalo', 'actualizacion', 'otro')),
  observaciones text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indices
create index if not exists idx_ajustes_producto on ajustes_stock(producto_id);
create index if not exists idx_ajustes_fecha on ajustes_stock(created_at desc);

-- Trigger para actualizar el stock actual en productos
create or replace function actualizar_stock_por_ajuste()
returns trigger as $$
begin
    update productos 
    set stock_actual = stock_actual + NEW.cantidad, -- Se suma tal cual (si es negativo restará)
        updated_at = now()
    where id = NEW.producto_id;
    return NEW;
end;
$$ language plpgsql;

create trigger trigger_actualizar_stock_ajuste
after insert on ajustes_stock
for each row execute function actualizar_stock_por_ajuste();
