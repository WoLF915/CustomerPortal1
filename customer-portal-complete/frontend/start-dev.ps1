# PowerShell script to free port 5173 and start the dev server
Write-Host "Checking for processes using port 5173..." -ForegroundColor Yellow

$port = 5173
$processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    foreach ($pid in $processes) {
        try {
            $processName = (Get-Process -Id $pid -ErrorAction SilentlyContinue).ProcessName
            Write-Host "Killing process $pid ($processName) on port $port..." -ForegroundColor Red
            Stop-Process -Id $pid -Force -ErrorAction Stop
        } catch {
            Write-Host "Could not kill process $pid : $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 2
    Write-Host "Port $port should now be free." -ForegroundColor Green
} else {
    Write-Host "Port $port is already free." -ForegroundColor Green
}

# Verify port is free
Start-Sleep -Seconds 1
$stillInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($stillInUse) {
    Write-Host "Warning: Port $port may still be in use. Attempting to start anyway..." -ForegroundColor Yellow
}

Write-Host "Starting Vite dev server..." -ForegroundColor Cyan
# Change to the script directory to ensure we're in the right location
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Execute npm command using cmd to avoid PowerShell parsing issues
cmd /c "npm run dev:direct"

