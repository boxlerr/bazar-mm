@echo off
title SERVIDOR DE IMPRESION - BAZAR M&M
color 0A
echo ===================================================
echo   SERVIDOR DE IMPRESION - NO CERRAR ESTA VENTANA
echo ===================================================
echo.
echo Iniciando servicio...
cd /d "%~dp0"

:: Verificar si existe node
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Node.js no esta instalado.
    echo Por favor instale Node.js desde https://nodejs.org/
    pause
    exit
)

:: Verificar si existe SumatraPDF.exe
if not exist "SumatraPDF.exe" (
    color 0E
    echo ADVERTENCIA: No se encontro SumatraPDF.exe en esta carpeta.
    echo La impresion no funcionara sin este archivo.
    echo Por favor descargue el ejecutable portable y copielo aqui.
    echo.
)

:: Iniciar servidor
node server.js
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo El servidor se ha cerrado con un error.
    pause
)
