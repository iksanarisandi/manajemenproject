@echo off
echo ========================================
echo   Project Management App - Setup
echo ========================================
echo.

echo [1/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [2/5] Installing Netlify CLI...
call npm install -g netlify-cli
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Netlify CLI
    pause
    exit /b 1
)
echo ✓ Netlify CLI installed

echo.
echo [3/5] Login to Netlify...
echo Browser will open. Please authorize the app.
call netlify login
if %errorlevel% neq 0 (
    echo ERROR: Login failed
    pause
    exit /b 1
)
echo ✓ Logged in to Netlify

echo.
echo [4/5] Initialize Netlify site...
echo Please answer the prompts:
echo   - Create new site
echo   - Build command: npm run build
echo   - Publish directory: dist
echo   - Functions directory: netlify/functions
echo.
call netlify init
if %errorlevel% neq 0 (
    echo ERROR: Site initialization failed
    pause
    exit /b 1
)
echo ✓ Site initialized

echo.
echo [5/5] Setup complete!
echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo.
echo 1. Go to Netlify Dashboard: https://app.netlify.com
echo 2. Enable Neon Database integration
echo 3. Add environment variables:
echo    - JWT_SECRET (generate from randomkeygen.com)
echo    - TELEGRAM_BOT_TOKEN (already provided)
echo 4. Copy DATABASE_URL to local .env file
echo 5. Run: npm run db:generate
echo 6. Run: npm run db:migrate
echo 7. Run: netlify deploy --prod
echo.
echo OR simply run: deploy.bat
echo.
pause
