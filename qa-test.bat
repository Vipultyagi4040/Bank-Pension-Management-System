@echo off
setlocal enabledelayedexpansion

set BASE_URL=http://localhost:4000/api/v1
set PASS_COUNT=0
set FAIL_COUNT=0
set ERROR_COUNT=0

echo === Bank Pension System QA Test ===
echo Base URL: %BASE_URL%
echo.

REM Test 1: Health Check
echo [GET] Health Check
curl.exe -s "%BASE_URL%/health"
echo.
set /a ERROR_COUNT+=0
echo.

REM Test 2: Admin Login
echo [POST] Admin Login
for /f "delims=" %%i in ('curl.exe -s -X POST "%BASE_URL%/auth/admin/login" -H "Content-Type: application/json" -d @admin-login.json') do set ADMIN_LOGIN=%%i
echo !ADMIN_LOGIN!
echo.

REM Extract token using powershell
for /f "delims=" %%i in ('echo !ADMIN_LOGIN! ^| powershell -Command "$x = [Console]::InputEncoding = [System.Text.Encoding]::UTF8; $inp = [Console]::In.ReadLine(); ($inp | ConvertFrom-Json^).data.accessToken"') do set ADMIN_TOKEN=%%i
echo Admin Token: !ADMIN_TOKEN:~0,50!...
echo.

set AUTH_HEADER=Authorization: Bearer !ADMIN_TOKEN!

REM Admin Dashboard
echo [GET] Admin Dashboard
curl.exe -s "%BASE_URL%/admin/dashboard" -H "!AUTH_HEADER!:!ADMIN_TOKEN!"
echo.
echo.

REM Pensioners
echo [GET] List Pensioners
curl.exe -s "%BASE_URL%/admin/pensioners?search=&page=1&limit=20" -H "!AUTH_HEADER!"
echo.
echo.

REM Pension Details
echo [GET] List Pension Details
curl.exe -s "%BASE_URL%/management/pension-details?search=&page=1&limit=20" -H "!AUTH_HEADER!"
echo.
echo.

REM Monthly Pensions
echo [GET] List Monthly Pensions
curl.exe -s "%BASE_URL%/management/monthly-pensions?page=1&limit=20" -H "!AUTH_HEADER!"
echo.
echo.

REM Grievances
echo [GET] List Grievances
curl.exe -s "%BASE_URL%/admin/grievances?search=&page=1&limit=20" -H "!AUTH_HEADER!"
echo.
echo.

REM Notifications
echo [GET] List Notifications
curl.exe -s "%BASE_URL%/admin/notifications?search=&page=1&limit=20" -H "!AUTH_HEADER!"
echo.
echo.

REM Policies
echo [GET] List Policies
curl.exe -s "%BASE_URL%/management/policies?search=&page=1&limit=20" -H "!AUTH_HEADER!"
echo.
echo.

REM Jeevan Pramaan
echo [GET] List Jeevan Pramaan
curl.exe -s "%BASE_URL%/management/jeevan-pramaan?page=1&limit=20" -H "!AUTH_HEADER!"
echo.
echo.

REM Audit Logs
echo [GET] List Audit Logs
curl.exe -s "%BASE_URL%/admin/audit-logs?search=&page=1&limit=20" -H "!AUTH_HEADER!"
echo.
echo.

REM Dashboard Stats
echo [GET] Management Dashboard Stats
curl.exe -s "%BASE_URL%/management/dashboard/stats" -H "!AUTH_HEADER!"
echo.
echo.

REM Reports Summary
echo [GET] Reports Summary
curl.exe -s "%BASE_URL%/management/reports/summary" -H "!AUTH_HEADER!"
echo.
echo.

REM Processing History
echo [GET] Processing History
curl.exe -s "%BASE_URL%/management/processing-history?page=1&limit=20" -H "!AUTH_HEADER!"
echo.
echo.

REM Import
echo [GET] Import Data
curl.exe -s "%BASE_URL%/management/import" -H "!AUTH_HEADER!"
echo.
echo.

REM Pensioner OTP Request
echo [POST] Request OTP (Pensioner Login)
for /f "delims=" %%i in ('curl.exe -s -X POST "%BASE_URL%/auth/pensioner/request-otp" -H "Content-Type: application/json" -d @otp-request.json') do set OTP_RESULT=%%i
echo !OTP_RESULT!
echo.

REM Extract OTP
for /f "delims=" %%i in ('echo !OTP_RESULT! ^| powershell -Command "$inp = [Console]::In.ReadLine(); ($inp | ConvertFrom-Json^).data.developmentOtp"') do set DEV_OTP=%%i
echo Development OTP: !DEV_OTP!
echo.

REM Update OTP file
echo {"mobile":"9999999999","otp":"!DEV_OTP!"} > otp-verify.json

REM Pensioner OTP Verify
echo [POST] Verify OTP (Pensioner Login)
for /f "delims=" %%i in ('curl.exe -s -X POST "%BASE_URL%/auth/pensioner/verify-otp" -H "Content-Type: application/json" -d @otp-verify.json') do set OTP_VERIFY=%%i
echo !OTP_VERIFY!
echo.

REM Extract pensioner token
for /f "delims=" %%i in ('echo !OTP_VERIFY! ^| powershell -Command "$inp = [Console]::In.ReadLine(); ($inp | ConvertFrom-Json^).data.accessToken"') do set PENSIONER_TOKEN=%%i
echo Pensioner Token: !PENSIONER_TOKEN:~0,50!...
echo.

set PEN_AUTH=Authorization: Bearer !PENSIONER_TOKEN!

REM Pensioner Dashboard
echo [GET] Pensioner Dashboard
curl.exe -s "%BASE_URL%/pensioner/dashboard" -H "!PEN_AUTH!"
echo.
echo.

REM Pensioner Profile
echo [GET] Pensioner Profile
curl.exe -s "%BASE_URL%/pensioner/profile" -H "!PEN_AUTH!"
echo.
echo.

REM Pension History
echo [GET] Pension History
curl.exe -s "%BASE_URL%/pensioner/pension" -H "!PEN_AUTH!"
echo.
echo.

REM Pension Slips
echo [GET] Pension Slips
curl.exe -s "%BASE_URL%/pensioner/slips" -H "!PEN_AUTH!"
echo.
echo.

REM My Policies
echo [GET] My Policies
curl.exe -s "%BASE_URL%/pensioner/policies" -H "!PEN_AUTH!"
echo.
echo.

REM My Notifications
echo [GET] My Notifications
curl.exe -s "%BASE_URL%/pensioner/notifications?search=&page=1&limit=20" -H "!PEN_AUTH!"
echo.
echo.

REM My Grievances
echo [GET] My Grievances
curl.exe -s "%BASE_URL%/pensioner/grievances" -H "!PEN_AUTH!"
echo.
echo.

REM My Leads
echo [GET] My Leads
curl.exe -s "%BASE_URL%/pensioner/leads" -H "!PEN_AUTH!"
echo.
echo.

REM My Jeevan Pramaan
echo [GET] My Jeevan Pramaan
curl.exe -s "%BASE_URL%/pensioner/jeevan" -H "!PEN_AUTH!"
echo.
echo.

REM My Activity
echo [GET] My Activity
curl.exe -s "%BASE_URL%/pensioner/activity?search=&page=1&limit=20" -H "!PEN_AUTH!"
echo.
echo.

echo === QA Test Complete ===
