@echo off
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  🐘 BlackElephant - Iniciando Servidor                   ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

cd backend

echo Verificando dependências...
if not exist "node_modules" (
    echo Instalando dependências pela primeira vez...
    call npm install
)

echo.
echo Iniciando servidor...
echo.
call npm start
