@echo off
echo ========================================
echo   Environment Setup Helper
echo ========================================
echo.

echo This script will help you setup .env file
echo.

set /p db_url="Paste DATABASE_URL from Netlify: "
echo.

echo Generating JWT_SECRET...
set jwt_secret=%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%
echo Generated JWT_SECRET: %jwt_secret%
echo.

echo Creating .env file...
(
echo # Environment Variables
echo DATABASE_URL=%db_url%
echo JWT_SECRET=%jwt_secret%
echo TELEGRAM_BOT_TOKEN=
echo.
echo # TELEGRAM_CHAT_ID is optional - users set it in Profile Settings
echo TELEGRAM_CHAT_ID=
) > .env

echo.
echo ✓ .env file created!
echo.
echo ========================================
echo   NEXT: Add JWT_SECRET to Netlify
echo ========================================
echo.
echo 1. Go to: https://app.netlify.com
echo 2. Your site -^> Site settings -^> Environment variables
echo 3. Add new variable:
echo    Key: JWT_SECRET
echo    Value: [COPY THIS FROM OUTPUT ABOVE]
echo.
echo 4. Then run: migrate-and-deploy.bat
echo.
pause
