-- Create table for tracking current account movements
create table if not exists movimientos_cuenta_corriente (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id) not null,
  tipo text check (tipo in ('debito', 'credito')) not null,
  monto decimal(12,2) not null,
  descripcion text,
  venta_id uuid references ventas(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for performance
create index if not exists idx_movimientos_cc_cliente on movimientos_cuenta_corriente(cliente_id);
create index if not exists idx_movimientos_cc_created on movimientos_cuenta_corriente(created_at desc);

-- RLS Policies (Optional but recommended)
alter table movimientos_cuenta_corriente enable row level security;

create policy "Users can view all movements"
  on movimientos_cuenta_corriente for select
  using (true);

create policy "Users can insert movements"
  on movimientos_cuenta_corriente for insert
  with check (true);
