@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist node_modules (
  echo Установка зависимостей...
  call npm install
)
echo Запуск HanziFlow: http://localhost:5173
start "" http://localhost:5173
call npm run dev
