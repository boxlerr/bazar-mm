# Instrucciones de Instalación - Bazar M&M ERP

## Dependencias a Instalar

Ejecuta los siguientes comandos para instalar todas las dependencias necesarias:

```bash
# Dependencias principales
npm install next@latest react@latest react-dom@latest
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install tailwindcss postcss autoprefixer
npm install typescript @types/react @types/node
npm install resend

# Dependencias de desarrollo
npm install -D eslint eslint-config-next
npm install -D @types/react-dom

# Opcional: Para generación de PDFs (implementación futura)
# npm install jspdf html2canvas

# Opcional: Para exportación a Excel
# npm install xlsx
```

## Comando completo (copiar y pegar)

```bash
npm install next react react-dom @supabase/supabase-js @supabase/auth-helpers-nextjs tailwindcss postcss autoprefixer typescript @types/react @types/node resend eslint eslint-config-next @types/react-dom
```

## Configuración de TailwindCSS

Si TailwindCSS no está configurado, ejecuta:

```bash
npx tailwindcss init -p
```

## Verificar Instalación

```bash
npm run dev
```

El proyecto debería ejecutarse en http://localhost:3000

## Pasos Siguientes

1. Configurar las variables de entorno en `.env.local`
2. Crear un proyecto en Supabase
3. Ejecutar las migraciones SQL en Supabase
4. Crear una cuenta en Resend para el envío de emails
5. Iniciar el proyecto con `npm run dev`

## Problemas Comunes

### Error: Cannot find module '@supabase/...'
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### Error: Cannot find module 'next'
```bash
npm install next@latest
```

### Errores de TypeScript
Asegúrate de tener configurado correctamente el `tsconfig.json` que ya está incluido en el proyecto.

## Estructura del package.json

Tu `package.json` debería incluir:

```json
{
  "name": "bazar-mm-erp",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "resend": "^2.0.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "postcss": "^8.4.0"
  }
}
```
