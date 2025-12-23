-- Agregar la relación de clave foránea entre ventas y usuarios
-- Esto permite hacer queries como .select('*, usuarios(*)')

DO $$
BEGIN
    -- Verificar si la restricción ya existe para evitar errores
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'ventas_usuario_id_fkey'
        AND table_name = 'ventas'
    ) THEN
        ALTER TABLE "public"."ventas"
        ADD CONSTRAINT "ventas_usuario_id_fkey"
        FOREIGN KEY ("usuario_id")
        REFERENCES "public"."usuarios" ("id");
    END IF;
END $$;
