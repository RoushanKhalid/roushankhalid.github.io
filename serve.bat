@echo off
title Portfolio Dev Server — Sk. Roushan Khalid
echo.
echo  ========================================
echo   Portfolio Local Server
echo   http://localhost:3000
echo  ========================================
echo.
echo  Starting server... Press Ctrl+C to stop.
echo.
start "" http://localhost:3000
python -m http.server 3000
pause

