@echo off
echo.
echo ========================================
echo   FINAL DEPLOYMENT
echo ========================================
echo.
echo Checking .env file...
echo.

findstr /C:"DATABASE_URL=postgresql" .env >nul
if errorlevel 1 (
    echo ERROR: DATABASE_URL not found in .env file!
    echo.
    echo Please:
    echo 1. Open .env file
    echo 2. Add DATABASE_URL from Netlify
    echo 3. Save the file
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✓ DATABASE_URL found
echo.
echo ========================================
echo   Generating Migrations...
echo ========================================
echo.

call npm run db:generate
if errorlevel 1 (
    echo.
    echo WARNING: Migration generation had issues
    echo This might be okay if migrations already exist.
    echo.
    echo Do you want to continue? (Y/N)
    set /p continue=
    if /i "!continue!" neq "Y" exit /b 1
)

echo.
echo ========================================
echo   Running Migrations...
echo ========================================
echo.

call npm run db:migrate
if errorlevel 1 (
    echo.
    echo WARNING: Migration failed
    echo This might be okay if tables already exist.
    echo.
    echo Do you want to continue with deployment? (Y/N)
    set /p continue=
    if /i "!continue!" neq "Y" exit /b 1
)

echo.
echo ========================================
echo   Deploying to Production...
echo ========================================
echo.

call netlify deploy --prod

if errorlevel 1 (
    echo.
    echo ERROR: Deployment failed!
    echo Check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   🎉 SUCCESS! 🎉
echo ========================================
echo.
echo Your site is now LIVE at:
echo https://manajemenproject.netlify.app
echo.
echo Opening site...
timeout /t 2 >nul
start https://manajemenproject.netlify.app
echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo.
echo 1. Register your account
echo 2. Login to the app
echo 3. Go to Settings
echo 4. Add Telegram Chat ID from @userinfobot
echo 5. Start using!
echo.
echo ========================================
echo   SAVE THESE:
echo ========================================
echo.
echo Site: https://manajemenproject.netlify.app
echo JWT Secret: [Check Netlify environment variables]
echo.
pause
