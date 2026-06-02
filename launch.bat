@echo off
title RoushanKhalid Portfolio

echo.
echo  ================================================
echo   RoushanKhalid Portfolio Launcher
echo  ================================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js is not installed.
    echo.
    echo  Please download and install it from:
    echo  https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Check if server.js exists
if not exist "%~dp0server.js" (
    echo  [ERROR] server.js not found.
    echo  Make sure you are running this from the portfolio folder.
    echo.
    pause
    exit /b 1
)

echo  Starting server...
echo.

:: Start the server in this window
:: Open browser after a short delay using a background ping trick
start "" cmd /c "ping 127.0.0.1 -n 3 >nul && start http://localhost:3000"

:: Now start the actual server (this keeps the window alive)
node "%~dp0server.js"

pause
