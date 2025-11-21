@echo off
echo ====================================
echo  Soluciona Remodelaciones - Public
echo  Generando URL publica...
echo ====================================
echo.

REM Descargar localtunnel portable
curl -L https://localtunnel.github.io/www/install.html -o lt.txt

REM Usar npx para ejecutar localtunnel
echo Iniciando tunel publico...
npx localtunnel --port 3000

pause
