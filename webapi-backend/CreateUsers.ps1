# PowerShell script to create users in EV Charging System Backend
# Make sure the backend API is running before executing this script

$baseUrl = "https://localhost:7001"

Write-Host "Creating users in EV Charging System..." -ForegroundColor Green

# Function to create backoffice user
function Create-BackofficeUser {
    param(
        [string]$username,
        [string]$password,
        [string]$fullName,
        [string]$email
    )
    
    $userData = @{
        username = $username
        password = $password
        fullName = $fullName
        email = $email
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/create-backoffice-user" -Method Post -Body $userData -ContentType "application/json" -SkipCertificateCheck
        Write-Host "✅ Created backoffice user: $username" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "❌ Failed to create backoffice user: $username" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to create station operator
function Create-StationOperator {
    param(
        [string]$username,
        [string]$password,
        [string]$fullName,
        [string]$email,
        [string]$assignedStationId = ""
    )
    
    $userData = @{
        username = $username
        password = $password
        fullName = $fullName
        email = $email
        assignedStationId = $assignedStationId
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/create-station-operator" -Method Post -Body $userData -ContentType "application/json" -SkipCertificateCheck
        Write-Host "✅ Created station operator: $username" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "❌ Failed to create station operator: $username" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to test login
function Test-Login {
    param(
        [string]$username,
        [string]$password
    )
    
    $loginData = @{
        username = $username
        password = $password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginData -ContentType "application/json" -SkipCertificateCheck
        Write-Host "✅ Login successful for: $username" -ForegroundColor Green
        Write-Host "Token received (first 50 chars): $($response.token.Substring(0, [Math]::Min(50, $response.token.Length)))..." -ForegroundColor Yellow
        return $response.token
    }
    catch {
        Write-Host "❌ Login failed for: $username" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Main execution
Write-Host "`n🚀 Starting user creation process..." -ForegroundColor Cyan

# Create the two main users
Write-Host "`n📝 Creating Backoffice Admin..." -ForegroundColor Yellow
$admin = Create-BackofficeUser -username "admin" -password "admin123" -fullName "System Administrator" -email "admin@evcharging.com"

Write-Host "`n📝 Creating Station Operator..." -ForegroundColor Yellow
$operator = Create-StationOperator -username "operator" -password "operator123" -fullName "Station Operator" -email "operator@evcharging.com"

# Test login for both users
Write-Host "`n🔐 Testing login functionality..." -ForegroundColor Cyan

if ($admin) {
    Write-Host "`nTesting admin login..." -ForegroundColor Yellow
    $adminToken = Test-Login -username "admin" -password "admin123"
}

if ($operator) {
    Write-Host "`nTesting operator login..." -ForegroundColor Yellow
    $operatorToken = Test-Login -username "operator" -password "operator123"
}

Write-Host "`n✨ User creation process completed!" -ForegroundColor Green
Write-Host "`n📋 Summary of created users:" -ForegroundColor Cyan
Write-Host "  👤 Admin User:" -ForegroundColor White
Write-Host "     Username: admin" -ForegroundColor Gray
Write-Host "     Password: admin123" -ForegroundColor Gray
Write-Host "     Role: Backoffice" -ForegroundColor Gray
Write-Host "`n  👤 Operator User:" -ForegroundColor White
Write-Host "     Username: operator" -ForegroundColor Gray
Write-Host "     Password: operator123" -ForegroundColor Gray
Write-Host "     Role: StationOperator" -ForegroundColor Gray

Write-Host "`n💡 Note: Make sure the backend API is running at $baseUrl before executing this script." -ForegroundColor Blue