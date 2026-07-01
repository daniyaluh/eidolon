@echo off
setlocal
rem ===========================================================================
rem  Eidolon - one-click local startup
rem  Opens 3 windows: API server, web client, and the Stripe webhook listener.
rem  The Stripe listener uses STRIPE_SECRET_KEY from server\.env, so you never
rem  need "stripe login" and the webhook signing secret stays the same.
rem ===========================================================================
set "ROOT=%~dp0"

rem --- read STRIPE_SECRET_KEY from server\.env ---
set "STRIPE_KEY="
for /f "usebackq tokens=1,* delims==" %%a in ("%ROOT%server\.env") do (
  if /i "%%a"=="STRIPE_SECRET_KEY" set "STRIPE_KEY=%%b"
)

echo Starting Eidolon (server + client + Stripe webhooks)...

start "Eidolon Server" /d "%ROOT%server" cmd /k "npm run dev"
start "Eidolon Client" /d "%ROOT%client" cmd /k "npm run dev"

if defined STRIPE_KEY (
  start "Stripe Webhooks" cmd /k "stripe listen --api-key %STRIPE_KEY% --forward-to localhost:4000/api/webhooks/stripe"
) else (
  start "Stripe Webhooks" cmd /k "echo [!] STRIPE_SECRET_KEY not found in server\.env && pause"
)

echo.
echo   Server:  http://localhost:4000/api/health
echo   Client:  http://localhost:5173
echo   Stripe:  forwarding webhooks to the server
echo.
echo   Three windows opened. Leave them running; close them to stop.
echo   If the Stripe window says 'stripe is not recognized', open a NEW terminal
echo   (PATH refresh after install) or reboot once, then run this again.
endlocal
