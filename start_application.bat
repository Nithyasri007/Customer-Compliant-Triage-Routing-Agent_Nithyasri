@echo off
echo ========================================
echo  Customer Complaint Triage Agent
echo  Complete Application Startup
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d E:\COLLEGE\optisol\complaint-triage-agent\backend && python simple_backend.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d E:\COLLEGE\optisol\Frontend\project && npm run dev"

echo Waiting for frontend to start...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo  Application Started Successfully!
echo ========================================
echo.
echo Frontend: http://localhost:5173/
echo Backend:  http://localhost:5000/
echo.
echo Opening application in browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173/

echo.
echo Press any key to exit this startup script...
pause >nul
