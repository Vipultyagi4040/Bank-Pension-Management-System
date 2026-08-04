# Deployment Script for Bank Pension Management System
# This script helps deploy the application to a production server

param(
    [string]$ServerIP,
    [string]$SSHUser = "ubuntu",
    [string]$DomainName = "your-domain.com",
    [string]$Email = "admin@example.com"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Bank Pension System - Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker is not installed. Please install Docker first." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

Write-Host "Docker and Docker Compose found!" -ForegroundColor Green
Write-Host ""

# Get server details if not provided
if (-not $ServerIP) {
    $ServerIP = Read-Host "Enter your server IP address"
}

Write-Host "Deployment Configuration:" -ForegroundColor Cyan
Write-Host "  Server IP: $ServerIP"
Write-Host "  SSH User: $SSHUser"
Write-Host "  Domain: $DomainName"
Write-Host "  Email: $Email"
Write-Host ""

$confirm = Read-Host "Is this correct? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

# Create deployment package
Write-Host ""
Write-Host "Creating deployment package..." -ForegroundColor Yellow

$deployDir = "C:\Users\vipul\Desktop\BankPensionSystem\bank-pension-system-client-ready\deploy"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null

# Copy necessary files
Copy-Item -Path "C:\Users\vipul\Desktop\BankPensionSystem\bank-pension-system-client-ready\docker-compose.yml" -Destination $deployDir -Recurse -Force
Copy-Item -Path "C:\Users\vipul\Desktop\BankPensionSystem\bank-pension-system-client-ready\apps\api\Dockerfile" -Destination "$deployDir\apps\api" -Recurse -Force
Copy-Item -Path "C:\Users\vipul\Desktop\BankPensionSystem\bank-pension-system-client-ready\apps\admin\Dockerfile" -Destination "$deployDir\apps\admin" -Recurse -Force
Copy-Item -Path "C:\Users\vipul\Desktop\BankPensionSystem\bank-pension-system-client-ready\apps\admin\nginx.conf" -Destination "$deployDir\apps\admin" -Recurse -Force
Copy-Item -Path "C:\Users\vipul\Desktop\BankPensionSystem\bank-pension-system-client-ready\apps\portal\Dockerfile" -Destination "$deployDir\apps\portal" -Recurse -Force
Copy-Item -Path "C:\Users\vipul\Desktop\BankPensionSystem\bank-pension-system-client-ready\apps\portal\nginx.conf" -Destination "$deployDir\apps\portal" -Recurse -Force

# Create production environment file
$envContent = @"
# Production Environment Variables
NODE_ENV=production
DATABASE_URL=postgresql://pension_user:Pension@123@postgres:5432/pension_db?schema=public
JWT_ACCESS_SECRET=your-super-secure-jwt-access-secret-key-change-this-in-production
JWT_ACCESS_EXPIRES_IN=1d
OTP_TTL_MINUTES=5
CORS_ORIGINS=https://$DomainName,https://admin.$DomainName,https://portal.$DomainName
PORT=4000
"@

$envContent | Out-File -FilePath "$deployDir\.env" -Encoding UTF8

Write-Host "Deployment package created at: $deployDir" -ForegroundColor Green
Write-Host ""

# Create README for deployment
$readmeContent = @"
# Deployment Instructions

## Prerequisites on Server
1. Ubuntu 20.04+ or similar Linux server
2. Docker and Docker Compose installed
3. Domain name pointed to your server IP
4. SSL certificate (Let's Encrypt recommended)

## Steps to Deploy

### 1. Upload files to server
```bash
scp -r deploy/* $SSHUser@$ServerIP:/home/$SSHUser/pension-system/
```

### 2. SSH into server
```bash
ssh $SSHUser@$ServerIP
cd /home/$SSHUser/pension-system
```

### 3. Set up environment variables
Edit the .env file and change:
- JWT_ACCESS_SECRET to a secure random string
- CORS_ORIGINS to your actual domain(s)

### 4. Start the application
```bash
docker-compose up -d
```

### 5. Run database migrations
```bash
docker-compose exec api npx prisma migrate deploy
docker-compose exec api npm run seed
```

### 6. Set up SSL with Let's Encrypt (Recommended)
```bash
sudo apt install certbot
sudo certbot --nginx -d $DomainName -d admin.$DomainName -d portal.$DomainName
```

## Access Points
- Admin Portal: https://admin.$DomainName
- Pensioner Portal: https://portal.$DomainName
- API: https://$DomainName/api/v1

## Default Credentials
- Admin: admin@bank.local / Admin@123
- Pensioner: 9999999999 / OTP 123456

## Management Commands
```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Update application
git pull
docker-compose up -d --build
```
"@

$readmeContent | Out-File -FilePath "$deployDir\DEPLOY.md" -Encoding UTF8

Write-Host "Deployment package ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit deploy/.env file and update JWT secrets and domain names"
Write-Host "2. Upload deploy folder to your server"
Write-Host "3. Follow instructions in deploy/DEPLOY.md"
Write-Host ""
Write-Host "Server IP: $ServerIP"
Write-Host "Domain: $DomainName"
Write-Host ""
