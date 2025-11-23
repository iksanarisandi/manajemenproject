@echo off
echo.
echo ========================================
echo   Test Telegram Notification
echo ========================================
echo.

set /p chatid="Enter your Telegram Chat ID: "

if "%chatid%"=="" (
    echo ERROR: Chat ID cannot be empty!
    pause
    exit /b 1
)

echo.
echo Testing with Chat ID: %chatid%
echo.
echo Sending request...
echo.

node -e "fetch('https://manajemenproject.netlify.app/.netlify/functions/test-reminder', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({chatId: '%chatid%'})}).then(r => r.json()).then(d => {console.log('\nResponse:'); console.log(JSON.stringify(d, null, 2)); if(d.success) console.log('\n✓ Check your Telegram!'); else console.log('\n✗ Failed! Check error above.')}).catch(e => console.error('Error:', e.message))"

echo.
echo.
pause
