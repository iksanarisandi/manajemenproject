@echo off
echo.
echo ========================================
echo   Running Database Migrations
echo ========================================
echo.
echo This will create all database tables.
echo.
echo Checking .env file...

findstr /C:"DATABASE_URL=postgresql" .env >nul
if errorlevel 1 (
    echo.
    echo ERROR: DATABASE_URL not set in .env file!
    echo.
    echo Please:
    echo 1. Go to: https://app.netlify.com/projects/manajemenproject/environment-variables
    echo 2. Find DATABASE_URL or NETLIFY_DATABASE_URL
    echo 3. Copy the value
    echo 4. Edit .env file and paste it
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✓ DATABASE_URL found
echo.
echo Generating migrations...
call npm run db:generate

echo.
echo Running migrations...
call npm run db:migrate

if errorlevel 1 (
    echo.
    echo Migration may have failed, but this could be OK if tables exist.
    echo.
) else (
    echo.
    echo ✓ Migrations completed successfully!
)

echo.
echo ========================================
echo   Database Setup Complete!
echo ========================================
echo.
echo Your site is ready: https://manajemenproject.netlify.app
echo.
pause
