param(
    [string]$BaseUrl = "http://localhost:4000/api/v1"
)

$ErrorActionPreference = "Continue"

function Get-StatusLabel($status) {
    if ($status -eq "ERROR") { return "ERROR" }
    elseif ($status -ge 500) { return "FAIL" }
    elseif ($status -ge 400) { return "FAIL" }
    else { return "PASS" }
}

function Get-Color($status) {
    if ($status -eq "ERROR") { return "Red" }
    elseif ($status -ge 400) { return "Yellow" }
    else { return "Green" }
}

$results = @()

Write-Host "=== Bank Pension System QA Test ===" -ForegroundColor White
Write-Host "Base URL: $BaseUrl" -ForegroundColor White
Write-Host ""

# Test 1: Health check
$healthResult = Invoke-WebRequest -Uri "$BaseUrl/health" -Method GET -ErrorAction SilentlyContinue
Write-Host "[GET] Health Check" -ForegroundColor Cyan
Write-Host "  Status: $($healthResult.StatusCode)" -ForegroundColor $(Get-Color $healthResult.StatusCode)
Write-Host "  Body: $($healthResult.Content)" -ForegroundColor Gray
Write-Host ""
$results += @{ Url = "$BaseUrl/health"; Method = "GET"; Status = $healthResult.StatusCode }

# Test 2: Admin Login
$loginParams = @{
    Uri = "$BaseUrl/auth/admin/login"
    Method = "POST"
    Body = Get-Content -Raw -Path "admin-login.json"
    ContentType = "application/json"
}
$adminLoginResult = Invoke-WebRequest @loginParams -ErrorAction SilentlyContinue
Write-Host "[POST] Admin Login" -ForegroundColor Cyan
Write-Host "  Status: $($adminLoginResult.StatusCode)" -ForegroundColor $(Get-Color $adminLoginResult.StatusCode)
Write-Host "  Body: $($adminLoginResult.Content.Substring(0, [Math]::Min(300, $adminLoginResult.Content.Length)))" -ForegroundColor Gray
Write-Host ""

$adminToken = $null
if ($adminLoginResult) {
    $adminResp = $adminLoginResult.Content | ConvertFrom-Json
    if ($adminResp.success -eq $true) {
        $adminToken = $adminResp.data.accessToken
        Write-Host "[PASS] Admin login successful" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Admin login failed: $($adminResp.message)" -ForegroundColor Red
    }
} else {
    Write-Host "[ERROR] Admin login request failed" -ForegroundColor Red
}

Write-Host ""
$tokenLabel = if ($adminToken) { "SET" } else { "N/A" }
Write-Host "=== Admin Portal Tests (Token: $tokenLabel) ===" -ForegroundColor White
Write-Host ""

if ($adminToken) {
    # Admin Dashboard
    $r = Invoke-WebRequest -Uri "$BaseUrl/admin/dashboard" -Method GET -Headers @{"Authorization"="Bearer $adminToken"} -ErrorAction SilentlyContinue
    Write-Host "[GET] Admin Dashboard" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/admin/dashboard"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # Pensioners
    $r = Invoke-WebRequest -Uri "$BaseUrl/admin/pensioners?search=&page=1&limit=20" -Method GET -Headers @{"Authorization"="Bearer $adminToken"} -ErrorAction SilentlyContinue
    Write-Host "[GET] List Pensioners" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/admin/pensioners"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # Pension Details
    $r = Invoke-WebRequest -Uri "$BaseUrl/management/pension-details?search=&page=1&limit=20" -Method GET -Headers @{"Authorization"="Bearer $adminToken"} -ErrorAction SilentlyContinue
    Write-Host "[GET] List Pension Details" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/management/pension-details"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # Monthly Pensions
    $r = Invoke-WebRequest -Uri "$BaseUrl/management/monthly-pensions?page=1&limit=20" -Method GET -Headers @{"Authorization"="Bearer $adminToken"} -ErrorAction SilentlyContinue
    Write-Host "[GET] List Monthly Pensions" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/management/monthly-pensions"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # Grievances
    $r = Invoke-WebRequest -Uri "$BaseUrl/admin/grievances?search=&page=1&limit=20" -Method GET -Headers @{"Authorization"="Bearer $adminToken"} -ErrorAction SilentlyContinue
    Write-Host "[GET] List Grievances" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/admin/grievances"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # Notifications
    $r = Invoke-WebRequest -Uri "$BaseUrl/admin/notifications?search=&page=1&limit=20" -Method GET -Headers @{"Authorization"="Bearer $adminToken"} -ErrorAction SilentlyContinue
    Write-Host "[GET] List Notifications" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/admin/notifications"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # Policies
    $r = Invoke-WebRequest -Uri "$BaseUrl/management/policies?search=&page=1&limit=20" -Method GET -Headers @{"Authorization"="Bearer $adminToken"} -ErrorAction SilentlyContinue
    Write-Host "[GET] List Policies" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/management/policies"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # Jeevan Pramaan
    $r = Invoke-WebRequest -Uri "$BaseUrl/management/jeevan-pramaan?page=1&limit=20" -Method GET -Headers @{"Authorization"="Bearer $adminToken"} -ErrorAction SilentlyContinue
    Write-Host "[GET] List Jeevan Pramaan" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/management/jeevan-pramaan"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # Audit Logs
    $r = Invoke-WebRequest -Uri "$BaseUrl/admin/audit-logs?search=&page=1&limit=20" -Method GET -Headers @{"Authorization"="Bearer $adminToken"} -ErrorAction SilentlyContinue
    Write-Host "[GET] List Audit Logs" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/admin/audit-logs"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # Dashboard Stats
    $r = Invoke-WebRequest -Uri "$BaseUrl/management/dashboard/stats" -Method GET -Headers @{"Authorization"="Bearer $adminToken"} -ErrorAction SilentlyContinue
    Write-Host "[GET] Management Dashboard Stats" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/management/dashboard/stats"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # Reports Summary
    $r = Invoke-WebRequest -Uri "$BaseUrl/management/reports/summary" -Method GET -Headers @{"Authorization"="Bearer $adminToken"} -ErrorAction SilentlyContinue
    Write-Host "[GET] Reports Summary" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/management/reports/summary"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # Processing History
    $r = Invoke-WebRequest -Uri "$BaseUrl/management/processing-history?page=1&limit=20" -Method GET -Headers @{"Authorization"="Bearer $adminToken"} -ErrorAction SilentlyContinue
    Write-Host "[GET] Processing History" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/management/processing-history"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # Import
    $r = Invoke-WebRequest -Uri "$BaseUrl/management/import" -Method GET -Headers @{"Authorization"="Bearer $adminToken"} -ErrorAction SilentlyContinue
    Write-Host "[GET] Import Data" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/management/import"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""
}

# Pensioner OTP Request
Write-Host ""
$otpResult = Invoke-WebRequest -Uri "$BaseUrl/auth/pensioner/request-otp" -Method POST -Body (Get-Content -Raw -Path "otp-request.json") -ContentType "application/json" -ErrorAction SilentlyContinue
Write-Host "[POST] Request OTP (Pensioner Login)" -ForegroundColor Cyan
Write-Host "  Status: $($otpResult.StatusCode)" -ForegroundColor $(Get-Color $otpResult.StatusCode)
Write-Host "  Body: $($otpResult.Content)" -ForegroundColor Gray
Write-Host ""

if ($otpResult -and $otpResult.Content) {
    $otpResp = $otpResult.Content | ConvertFrom-Json
    if ($otpResp.success -eq $true) {
        $devOtp = $otpResp.data.developmentOtp
        Write-Host "[INFO] Development OTP: $devOtp" -ForegroundColor Yellow

        # Update OTP file
        $otpJson = '{"mobile":"9999999999","otp":"' + $devOtp + '"}'
        Set-Content -Path "otp-verify.json" -Value $otpJson
    }
}

# Pensioner OTP Verify
$otpVerifyResult = Invoke-WebRequest -Uri "$BaseUrl/auth/pensioner/verify-otp" -Method POST -Body (Get-Content -Raw -Path "otp-verify.json") -ContentType "application/json" -ErrorAction SilentlyContinue
Write-Host "[POST] Verify OTP (Pensioner Login)" -ForegroundColor Cyan
Write-Host "  Status: $($otpVerifyResult.StatusCode)" -ForegroundColor $(Get-Color $otpVerifyResult.StatusCode)
Write-Host "  Body: $($otpVerifyResult.Content.Substring(0, [Math]::Min(300, $otpVerifyResult.Content.Length)))" -ForegroundColor Gray
Write-Host ""

$pensionerToken = $null
if ($otpVerifyResult -and $otpVerifyResult.Content) {
    $otpResp = $otpVerifyResult.Content | ConvertFrom-Json
    if ($otpResp.success -eq $true) {
        $pensionerToken = $otpResp.data.accessToken
        Write-Host "[PASS] Pensioner login successful" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Pensioner login failed: $($otpResp.message)" -ForegroundColor Red
    }
}

Write-Host ""
$pTokenLabel = if ($pensionerToken) { "SET" } else { "N/A" }
Write-Host "=== Pensioner Portal API Tests (Token: $pTokenLabel) ===" -ForegroundColor White
Write-Host ""

if ($pensionerToken) {
    $pheader = @{"Authorization"="Bearer $pensionerToken"}

    # Pensioner Dashboard
    $r = Invoke-WebRequest -Uri "$BaseUrl/pensioner/dashboard" -Method GET -Headers $pheader -ErrorAction SilentlyContinue
    Write-Host "[GET] Pensioner Dashboard" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/pensioner/dashboard"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # Pensioner Profile
    $r = Invoke-WebRequest -Uri "$BaseUrl/pensioner/profile" -Method GET -Headers $pheader -ErrorAction SilentlyContinue
    Write-Host "[GET] Pensioner Profile" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/pensioner/profile"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # Pension History
    $r = Invoke-WebRequest -Uri "$BaseUrl/pensioner/pension" -Method GET -Headers $pheader -ErrorAction SilentlyContinue
    Write-Host "[GET] Pension History" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/pensioner/pension"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # Pension Slips
    $r = Invoke-WebRequest -Uri "$BaseUrl/pensioner/slips" -Method GET -Headers $pheader -ErrorAction SilentlyContinue
    Write-Host "[GET] Pension Slips" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/pensioner/slips"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # My Policies
    $r = Invoke-WebRequest -Uri "$BaseUrl/pensioner/policies" -Method GET -Headers $pheader -ErrorAction SilentlyContinue
    Write-Host "[GET] My Policies" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/pensioner/policies"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # My Notifications
    $r = Invoke-WebRequest -Uri "$BaseUrl/pensioner/notifications?search=&page=1&limit=20" -Method GET -Headers $pheader -ErrorAction SilentlyContinue
    Write-Host "[GET] My Notifications" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/pensioner/notifications"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # My Grievances
    $r = Invoke-WebRequest -Uri "$BaseUrl/pensioner/grievances" -Method GET -Headers $pheader -ErrorAction SilentlyContinue
    Write-Host "[GET] My Grievances" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/pensioner/grievances"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # My Leads
    $r = Invoke-WebRequest -Uri "$BaseUrl/pensioner/leads" -Method GET -Headers $pheader -ErrorAction SilentlyContinue
    Write-Host "[GET] My Leads" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/pensioner/leads"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # My Jeevan Pramaan
    $r = Invoke-WebRequest -Uri "$BaseUrl/pensioner/jeevan" -Method GET -Headers $pheader -ErrorAction SilentlyContinue
    Write-Host "[GET] My Jeevan Pramaan" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/pensioner/jeevan"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""

    # My Activity
    $r = Invoke-WebRequest -Uri "$BaseUrl/pensioner/activity?search=&page=1&limit=20" -Method GET -Headers $pheader -ErrorAction SilentlyContinue
    Write-Host "[GET] My Activity" -ForegroundColor Cyan
    Write-Host "  Status: $($r.StatusCode)" -ForegroundColor $(Get-Color $r.StatusCode)
    Write-Host "  Body: $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))" -ForegroundColor Gray
    $results += @{ Url = "$BaseUrl/pensioner/activity"; Method = "GET"; Status = $r.StatusCode }
    Write-Host ""
}

Write-Host ""
Write-Host "=== QA Test Summary ===" -ForegroundColor White
Write-Host ""

$passCount = 0
$failCount = 0
$errorCount = 0

foreach ($r in $results) {
    $status = $r.Status
    if ($status -eq "ERROR" -or $null -eq $status) {
        $errorCount++
    } elseif ($status -ge 400) {
        $failCount++
    } else {
        $passCount++
    }
}

Write-Host "Passed (2xx): $passCount" -ForegroundColor Green
Write-Host "Failed (4xx/5xx): $failCount" -ForegroundColor Yellow
Write-Host "Errors (network): $errorCount" -ForegroundColor Red
Write-Host "Total: $($results.Count)" -ForegroundColor White
