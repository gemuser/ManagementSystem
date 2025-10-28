@echo off
echo Launching Management System silently...

:: Store the current folder path (portable, works on any drive)
set "BASE=%~dp0"

:: Start backend silently
powershell -WindowStyle Hidden -Command "Start-Process cmd -ArgumentList '/c cd /d \"%BASE%backend\" && npm run server' -WindowStyle Hidden"

:: Start frontend silently
powershell -WindowStyle Hidden -Command "Start-Process cmd -ArgumentList '/c cd /d \"%BASE%frontend\" && npm run dev
' -WindowStyle Hidden"

:: Wait a short moment to ensure frontend boots
timeout /t 1 /nobreak >nul

:: Open the frontend in the default browser
start "" "http://localhost:5173"

exit
