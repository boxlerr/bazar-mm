@echo off
title Instalar Inicio Automatico
color 0B
echo ===========================================
echo   CONFIGURANDO INICIO AUTOMATICO (WINDOWS)
echo ===========================================
echo.

set "SCRIPT_NAME=Iniciar Servidor Impresora.lnk"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_PATH=%STARTUP_FOLDER%\%SCRIPT_NAME%"
set "TARGET_FILE=%~dp0start_server.bat"
set "WORK_DIR=%~dp0"

echo Creando acceso directo en:
echo %SHORTCUT_PATH%
echo.
echo Apuntando a:
echo %TARGET_FILE%
echo.

:: Crear acceso directo usando PowerShell
powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('%SHORTCUT_PATH%');$s.TargetPath='%TARGET_FILE%';$s.WorkingDirectory='%WORK_DIR%';$s.Description='Inicia el servidor de impresion de Bazar M&M';$s.Save()"

if %errorlevel% equ 0 (
    color 0A
    echo [OK] Instalado correctamente!
    echo El servidor se abrira automaticamente la proxima vez que inicie Windows.
) else (
    color 0C
    echo [ERROR] No se pudo crear el acceso directo.
)

echo.
pause
