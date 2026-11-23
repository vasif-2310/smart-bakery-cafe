@echo off
title Smart Bakery & Cafe Launcher
cd /d "%~dp0"
echo ========================================================
echo   Smart Bakery & Cafe - Quick Launcher
echo   Database: D:\mongodb-data
echo ========================================================
echo.

:: 1. Ensure D:\mongodb-data directory exists
if not exist "D:\mongodb-data" (
    echo Creating D:\mongodb-data directory...
    mkdir "D:\mongodb-data"
)

:: 2. Check if MongoDB is already listening on port 27017
echo Checking MongoDB on port 27017...
netstat -ano | findstr :27017 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo [OK] MongoDB is already running on port 27017.
) else (
    echo Starting MongoDB with data path D:\mongodb-data...
    start "MongoDB Database (D:\mongodb-data)" /min "C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe" --dbpath "D:\mongodb-data" --port 27017
    timeout /t 3 /nobreak >nul
)

:: 3. Start Backend Server
echo Starting Backend Server on port 5000...
start "Bakery Backend Server (Port 5000)" cmd /k "cd /d "%~dp0server" && npm.cmd run dev"
timeout /t 2 /nobreak >nul

:: 4. Start Frontend Client
echo Starting Frontend Client on port 5173...
start "Bakery Frontend Client (Port 5173)" cmd /k "cd /d "%~dp0client" && npm.cmd run dev"

echo.
echo ========================================================
echo   All services launched!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000/api
echo   MongoDB:  127.0.0.1:27017 (D:\mongodb-data)
echo ========================================================
echo Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

