@echo off
REM ===========================================================================
REM  Run the SIRH onboarding E2E suite (Windows).
REM
REM  Usage:
REM    run-tests.bat                         -> run ALL tests
REM    run-tests.bat tests\onboarding_agent_e2e.robot   -> run one file
REM
REM  Set secrets via environment variables BEFORE running, e.g.:
REM    set E2E_BASE_URL=http://localhost:4200
REM    set E2E_ACTIVATION_TOKEN=your-fresh-token
REM    set E2E_AGENT_USERNAME=agent.test
REM    set E2E_AGENT_PASSWORD=YourPassw0rd!
REM    set E2E_HEADLESS=true
REM ===========================================================================
setlocal
cd /d "%~dp0"

if "%~1"=="" (
    set TARGET=tests
) else (
    set TARGET=%*
)

robot --outputdir results --loglevel INFO %TARGET%

echo.
echo Reports:
echo   results\report.html
echo   results\log.html
endlocal
