# PowerShell Dev Server Runner for Private Docs AI
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Starting PRIVATE DOCS AI Development Stack" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Start Backend in Background Process
$BackendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\backend'; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --host 127.0.0.1 --port 8000" -PassThru

Write-Host "[+] Backend launching at http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "[+] Swagger docs at http://127.0.0.1:8000/docs" -ForegroundColor Green

# Start Frontend
Write-Host "[+] Starting Vite React Frontend at http://localhost:5174" -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\..\frontend"
npm run dev
