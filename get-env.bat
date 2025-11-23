@echo off
echo ========================================
echo   Get Environment Variables from Netlify
echo ========================================
echo.

echo Fetching environment variables from Netlify...
echo.

netlify env:list

echo.
echo ========================================
echo COPY the DATABASE_URL value above
echo ========================================
echo.
echo Then run: setup-env.bat
echo.
pause
