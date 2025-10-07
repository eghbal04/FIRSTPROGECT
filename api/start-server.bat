@echo off
echo Starting API Server...
cd /d "%~dp0"
node price-api.js
pause
