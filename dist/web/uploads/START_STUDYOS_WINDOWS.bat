@echo off
setlocal
cd /d "%~dp0"
if not exist "css\styles.css" goto :not_extracted
if not exist "js\core.js" goto :not_extracted
if not exist "pages\dashboard.page.js" goto :not_extracted
start "StudyOS" "%~dp0index.html"
exit /b 0

:not_extracted
cls
echo.
echo StudyOS cannot start because the full project was not extracted.
echo.
echo 1. Close this window.
echo 2. Right-click the ZIP file and choose Extract All.
echo 3. Open the extracted folder.
echo 4. Double-click START_STUDYOS_WINDOWS.bat.
echo.
pause
exit /b 1
