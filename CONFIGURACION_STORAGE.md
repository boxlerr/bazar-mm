# Configuración de Storage en Supabase

## Paso 1: Crear el Bucket

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, haz clic en **Storage**
3. Haz clic en **New bucket**
4. Configura el bucket:
   - **Name**: `documentos`
   - **Public**: ✅ Activado (checked)
   - **File size limit**: 50 MB (o el que prefieras)
   - **Allowed MIME types**: `application/pdf` (opcional, para solo PDFs)
5. Haz clic en **Create bucket**

## Paso 2: Configurar Políticas de Acceso

### Política 1: Permitir Subir Archivos (INSERT)

1. En la página del bucket `documentos`, haz clic en **Policies**
2. Haz clic en **New Policy**
3. Selecciona **Custom Policy**
4. Configura:
   - **Policy name**: `Permitir subir documentos autenticados`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **USING expression**: Dejar vacío
   - **WITH CHECK expression**:
   ```sql
   bucket_id = 'documentos'
   ```
5. Haz clic en **Review** y luego **Save policy**

### Política 2: Permitir Leer Archivos (SELECT)

1. Haz clic en **New Policy** nuevamente
2. Selecciona **Custom Policy**
3. Configura:
   - **Policy name**: `Permitir leer documentos públicos`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public` (o `authenticated` si prefieres solo usuarios logueados)
   - **USING expression**:
   ```sql
   bucket_id = 'documentos'
   ```
   - **WITH CHECK expression**: Dejar vacío
4. Haz clic en **Review** y luego **Save policy**

## Paso 3: Verificar Configuración

Para verificar que todo funciona:

1. Ve a `/compras/nueva` en tu aplicación
2. Intenta cargar un PDF
3. Si se sube correctamente, verás el mensaje de éxito
4. Si hay error, revisa las políticas

## Configuración Alternativa (Más Permisiva)

Si tienes problemas, puedes usar políticas más simples:

### Para INSERT:
```sql
-- Policy para subir archivos
CREATE POLICY "Public can upload to documentos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'documentos');
```

### Para SELECT:
```sql
-- Policy para leer archivos
CREATE POLICY "Public can read documentos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documentos');
```

## Troubleshooting

### Error: "Policy violation"
- Verifica que las políticas estén activas
- Verifica que el usuario esté autenticado
- Revisa los roles en las políticas

### Error: "Bucket not found"
- Verifica el nombre del bucket (debe ser exactamente `documentos`)
- Verifica que el bucket esté marcado como público

### Los PDFs no se ven
- Verifica la política SELECT
- Verifica que el bucket sea público
- Intenta acceder directamente a la URL del PDF

## URLs de los PDFs

Los PDFs se guardarán con esta estructura:
```
https://[tu-proyecto].supabase.co/storage/v1/object/public/documentos/compras/[timestamp]-[nombre-archivo].pdf
```

Estas URLs se guardan en la columna `pdf_url` de la tabla `compras`.
