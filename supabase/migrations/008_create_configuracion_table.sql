create table if not exists configuracion (
  id uuid default gen_random_uuid() primary key,
  
  -- Empresa Config
  nombre text default 'Mi Negocio',
  direccion text default 'Dirección del Local',
  telefono text default '',
  cuit text default '',
  email text default '', -- Email de la empresa
  mensaje_ticket text default '¡Gracias por su compra!',
  
  -- Notificaciones Config
  alertas_stock boolean default true,
  stock_minimo_global integer default 5,
  alertas_ventas boolean default false,
  email_notificaciones text default '', -- Email para notificaciones
  
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Habilitar RLS
alter table configuracion enable row level security;

-- Política para permitir acceso total a usuarios autenticados
create policy "Usuarios autenticados pueden ver y editar configuracion"
  on configuracion for all
  to authenticated
  using (true)
  with check (true);

-- Insertar configuración inicial por defecto si no existe
insert into configuracion (id, nombre)
select gen_random_uuid(), 'Mi Negocio'
where not exists (select 1 from configuracion);
