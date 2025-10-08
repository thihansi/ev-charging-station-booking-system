# Debug User Login Issues - PowerShell Script
# This script helps debug login issues by testing various endpoints

$baseUrl = "https://localhost:7001"  # Adjust port if different
$httpUrl = "http://localhost:5000"   # Alternative HTTP port

Write-Host "🔍 Debugging User Login Issues..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Function to test endpoint connectivity
function Test-ApiEndpoint {
    param([string]$url, [string]$endpoint)
    
    $fullUrl = "$url$endpoint"
    Write-Host "`n🌐 Testing: $fullUrl" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $fullUrl -Method Get -SkipCertificateCheck -TimeoutSec 10
        Write-Host "✅ Success: $fullUrl" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "❌ Failed: $fullUrl" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to test login
function Test-UserLogin {
    param([string]$baseUrl, [string]$username, [string]$password)
    
    $loginData = @{
        username = $username
        password = $password
    } | ConvertTo-Json
    
    $loginUrl = "$baseUrl/api/auth/login"
    Write-Host "`n🔐 Testing login: $username" -ForegroundColor Yellow
    Write-Host "URL: $loginUrl" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginData -ContentType "application/json" -SkipCertificateCheck -TimeoutSec 10
        Write-Host "✅ Login successful for: $username" -ForegroundColor Green
        Write-Host "Token received: $($response.token.Substring(0, [Math]::Min(50, $response.token.Length)))..." -ForegroundColor Gray
        return $response
    }
    catch {
        Write-Host "❌ Login failed for: $username" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            try {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorBody = $reader.ReadToEnd()
                Write-Host "   Response: $errorBody" -ForegroundColor Red
            }
            catch {
                Write-Host "   Could not read error response" -ForegroundColor Red
            }
        }
        return $null
    }
}

# Function to fetch all users
function Get-AllUsers {
    param([string]$baseUrl)
    
    $usersUrl = "$baseUrl/api/users/debug"
    Write-Host "`n👥 Fetching all users..." -ForegroundColor Yellow
    Write-Host "URL: $usersUrl" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $usersUrl -Method Get -SkipCertificateCheck -TimeoutSec 10
        Write-Host "✅ Users fetched successfully" -ForegroundColor Green
        Write-Host "Total Users: $($response.TotalUsers)" -ForegroundColor Gray
        
        if ($response.Usernames -and $response.Usernames.Count -gt 0) {
            Write-Host "Usernames in database:" -ForegroundColor White
            foreach ($username in $response.Usernames) {
                Write-Host "  - $username" -ForegroundColor Cyan
            }
            
            Write-Host "`nUser Roles:" -ForegroundColor White
            foreach ($user in $response.Roles) {
                Write-Host "  - $($user.Username): $($user.Role)" -ForegroundColor Cyan
            }
        } else {
            Write-Host "⚠️  No users found in database!" -ForegroundColor Yellow
        }
        
        return $response
    }
    catch {
        Write-Host "❌ Failed to fetch users" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to test user creation
function Test-UserCreation {
    param([string]$baseUrl)
    
    Write-Host "`n👤 Testing user creation..." -ForegroundColor Yellow
    
    # Test creating a backoffice user
    $userData = @{
        username = "testadmin"
        password = "test123"
        fullName = "Test Administrator"
        email = "test@evcharging.com"
    } | ConvertTo-Json
    
    $createUrl = "$baseUrl/api/auth/create-backoffice-user"
    
    try {
        $response = Invoke-RestMethod -Uri $createUrl -Method Post -Body $userData -ContentType "application/json" -SkipCertificateCheck -TimeoutSec 10
        Write-Host "✅ Test user creation successful" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "❌ Test user creation failed" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Main debugging process
Write-Host "`n🚀 Starting comprehensive debugging..." -ForegroundColor Cyan

# Test both HTTPS and HTTP endpoints
$testUrls = @($baseUrl, $httpUrl)

foreach ($url in $testUrls) {
    Write-Host "`n" + "="*50 -ForegroundColor Blue
    Write-Host "Testing Base URL: $url" -ForegroundColor Blue
    Write-Host "="*50 -ForegroundColor Blue
    
    # 1. Test basic connectivity
    $healthCheck = Test-ApiEndpoint -url $url -endpoint "/api/users/debug"
    
    if ($healthCheck) {
        # 2. Fetch all users
        $allUsers = Get-AllUsers -baseUrl $url
        
        # 3. Test login with default credentials
        Test-UserLogin -baseUrl $url -username "admin" -password "admin123"
        Test-UserLogin -baseUrl $url -username "operator" -password "operator123"
        
        # 4. If no users found, test user creation
        if ($allUsers -and $allUsers.TotalUsers -eq 0) {
            Write-Host "`n⚠️  Database appears empty. Testing user creation..." -ForegroundColor Yellow
            Test-UserCreation -baseUrl $url
            
            # Re-fetch users after creation attempt
            Get-AllUsers -baseUrl $url
        }
        
        break  # If we successfully connected, no need to try other URLs
    }
}

Write-Host "`n📋 Debugging Summary:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "1. Check if the backend API is running on port 7001 or 5000" -ForegroundColor White
Write-Host "2. Ensure MongoDB is running on localhost:27017" -ForegroundColor White
Write-Host "3. Verify that user seeding completed during app startup" -ForegroundColor White
Write-Host "4. Check console logs of the backend application for errors" -ForegroundColor White

Write-Host "`n💡 Next Steps:" -ForegroundColor Blue
Write-Host "1. Start the backend with: dotnet run" -ForegroundColor Gray
Write-Host "2. Check the console output for user seeding messages" -ForegroundColor Gray
Write-Host "3. Run this script again to verify users exist" -ForegroundColor Gray

Write-Host "`nDebugging completed! 🎉" -ForegroundColor Green