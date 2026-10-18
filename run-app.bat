@echo off
echo =======================================================
echo   ShikshaSetu (शिक्षासेतु) — Starting Application
echo   Learn by Doing, Grow by Understanding
echo =======================================================
echo.

echo 1. Seeding local database...
call npm --prefix backend run seed

echo.
echo 2. Starting Backend API Server (Port 5000)...
start "ShikshaSetu Backend Server" cmd /k "npm --prefix backend start"

echo.
echo 3. Starting App Frontend (Port 3000)...
start "ShikshaSetu Frontend App" cmd /k "npm --prefix frontend run dev"

echo.
echo =======================================================
echo   Application successfully launched!
echo   Open your browser at: http://localhost:3000
echo =======================================================
pause
