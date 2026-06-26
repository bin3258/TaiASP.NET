@echo off
REM ============================================
REM rundev.bat - Run react-scripts with Node.js
REM Bypasses npm/Bun to avoid crashes
REM ============================================
set "NODE=C:\nvm4w\nodejs\node.exe"
set "SCRIPT=node_modules\react-scripts\bin\react-scripts.js"

if not exist "%SCRIPT%" (
    echo Dependencies chua duoc cai. Chay: npm install
    pause
    exit /b 1
)

echo.
echo === Running react-scripts start with Node.js ===
echo.
"%NODE%" "%SCRIPT%" start
pause
