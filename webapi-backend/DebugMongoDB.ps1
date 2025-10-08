# MongoDB User Debug Script
# This script connects directly to MongoDB to check users

Write-Host "🔍 Checking MongoDB for users..." -ForegroundColor Cyan

# Check if MongoDB is accessible
try {
    # Try to connect to MongoDB using mongo command (if installed)
    $mongoCheck = mongo --eval "db.adminCommand('ismaster')" --quiet 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MongoDB is accessible" -ForegroundColor Green
        
        # Query users collection
        Write-Host "`n👥 Querying Users collection..." -ForegroundColor Yellow
        $usersQuery = @"
use EVChargingSystem
db.Users.find({}, {username: 1, role: 1, _id: 0})
"@
        
        Write-Host "Executing MongoDB query:" -ForegroundColor Gray
        Write-Host $usersQuery -ForegroundColor Gray
        
        $result = $usersQuery | mongo --quiet
        Write-Host "`nUsers in database:" -ForegroundColor White
        Write-Host $result -ForegroundColor Cyan
        
        # Count users
        $countQuery = @"
use EVChargingSystem
db.Users.count()
"@
        $userCount = $countQuery | mongo --quiet
        Write-Host "`nTotal users: $userCount" -ForegroundColor Yellow
        
    } else {
        Write-Host "❌ MongoDB not accessible via mongo command" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Error connecting to MongoDB: $($_.Exception.Message)" -ForegroundColor Red
}

# Alternative: Check if MongoDB service is running
Write-Host "`n🔧 Checking MongoDB service status..." -ForegroundColor Yellow
try {
    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoService) {
        Write-Host "MongoDB service status: $($mongoService.Status)" -ForegroundColor Cyan
        if ($mongoService.Status -ne "Running") {
            Write-Host "⚠️  MongoDB service is not running!" -ForegroundColor Red
            Write-Host "Try starting it with: net start MongoDB" -ForegroundColor Yellow
        }
    } else {
        Write-Host "MongoDB service not found. It might be installed differently." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "Could not check MongoDB service status" -ForegroundColor Yellow
}

# Check if MongoDB process is running
Write-Host "`n🔍 Checking for MongoDB process..." -ForegroundColor Yellow
$mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✅ MongoDB process (mongod) is running" -ForegroundColor Green
    Write-Host "Process ID: $($mongoProcess.Id)" -ForegroundColor Gray
} else {
    Write-Host "❌ MongoDB process (mongod) not found" -ForegroundColor Red
    Write-Host "MongoDB might not be running or installed" -ForegroundColor Yellow
}

Write-Host "`n📋 MongoDB Debug Summary:" -ForegroundColor Cyan
Write-Host "1. Ensure MongoDB is installed and running" -ForegroundColor White
Write-Host "2. Default connection should be: mongodb://localhost:27017" -ForegroundColor White
Write-Host "3. Database name should be: EVChargingSystem" -ForegroundColor White
Write-Host "4. Users collection should contain admin and operator users" -ForegroundColor White