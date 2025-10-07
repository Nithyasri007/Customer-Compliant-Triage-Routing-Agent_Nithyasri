Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Customer Complaint Triage Agent" -ForegroundColor Cyan
Write-Host " Complete Application Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\COLLEGE\optisol\complaint-triage-agent\backend'; python simple_backend.py"

Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\COLLEGE\optisol\Frontend\project'; npm run dev"

Write-Host "Waiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Application Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:5173/" -ForegroundColor White
Write-Host "Backend:  http://localhost:5000/" -ForegroundColor White
Write-Host ""

Write-Host "Opening application in browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173/"

Write-Host ""
Write-Host "Both servers are now running in separate windows." -ForegroundColor Green
Write-Host "You can close this window safely." -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
