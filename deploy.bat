@echo off
echo ========================================
echo   Project Management App - Deploy
echo ========================================
echo.

echo [1/3] Checking if npm is installed...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm not found. Please install Node.js first.
    pause
    exit /b 1
)
echo ✓ npm found

echo.
echo [2/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [3/3] Deploying to Netlify...
call netlify deploy --prod
if %errorlevel% neq 0 (
    echo ERROR: Deploy failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✓ Deploy Complete!
echo ========================================
echo.
echo Open your site:
call netlify open:site
echo.
pause
