-- Asegurar que la tabla configuracion_empresa tenga todas las columnas necesarias
create table if not exists configuracion_empresa (
  id uuid default gen_random_uuid() primary key,
  nombre text default 'Mi Negocio',
  direccion text default 'Dirección del Local',
  telefono text default '',
  cuit text default '',
  email text default '',
  mensaje_ticket text default '¡Gracias por su compra!',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Si la tabla ya existía pero le faltaban columnas, agregarlas
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'configuracion_empresa' and column_name = 'mensaje_ticket') then
    alter table configuracion_empresa add column mensaje_ticket text default '¡Gracias por su compra!';
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'configuracion_empresa' and column_name = 'email') then
    alter table configuracion_empresa add column email text default '';
  end if;
end $$;

-- Habilitar RLS
alter table configuracion_empresa enable row level security;

-- Política
drop policy if exists "Usuarios autenticados pueden ver y editar configuracion_empresa" on configuracion_empresa;
create policy "Usuarios autenticados pueden ver y editar configuracion_empresa"
  on configuracion_empresa for all
  to authenticated
  using (true)
  with check (true);
