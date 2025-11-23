@echo off
echo ========================================
echo   Migrate Database and Deploy
echo ========================================
echo.

echo [1/4] Checking .env file...
if not exist .env (
    echo ERROR: .env file not found!
    echo Please run: setup-env.bat first
    pause
    exit /b 1
)

findstr /C:"DATABASE_URL=" .env | findstr /V /C:"DATABASE_URL=$" >nul
if errorlevel 1 (
    echo ERROR: DATABASE_URL is empty in .env
    echo Please run: setup-env.bat first
    pause
    exit /b 1
)
echo ✓ .env file exists and configured

echo.
echo [2/4] Generating migrations...
call npm run db:generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate migrations
    echo.
    echo Possible issues:
    echo - DATABASE_URL not set correctly
    echo - Database not accessible
    echo.
    pause
    exit /b 1
)
echo ✓ Migrations generated

echo.
echo [3/4] Running migrations...
call npm run db:migrate
if %errorlevel% neq 0 (
    echo ERROR: Failed to run migrations
    echo.
    echo Possible issues:
    echo - DATABASE_URL incorrect
    echo - Database connection failed
    echo - Check Neon database is active
    echo.
    pause
    exit /b 1
)
echo ✓ Migrations applied successfully

echo.
echo [4/4] Deploying to production...
call netlify deploy --prod
if %errorlevel% neq 0 (
    echo ERROR: Deploy failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✓ SUCCESS! Application is LIVE!
echo ========================================
echo.
echo Opening your site...
call netlify open:site
echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo 1. Register your account
echo 2. Go to Settings
echo 3. Add your Telegram Chat ID
echo    (Get from: https://t.me/userinfobot)
echo 4. Start managing projects!
echo.
pause
