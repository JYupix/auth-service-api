param(
    [Parameter(Mandatory=$true)]
    [string]$Name
)

Write-Host "Loading DATABASE_URL from .env..." -ForegroundColor Cyan
$dbUrl = (Get-Content .env | Select-String "DATABASE_URL" | ForEach-Object { $_ -replace 'DATABASE_URL=', '' } | ForEach-Object { $_ -replace '"', '' })

Write-Host "Running migration: $Name" -ForegroundColor Green
npx prisma migrate dev --name $Name --url $dbUrl

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nMigration completed successfully!" -ForegroundColor Green
    Write-Host "Generating Prisma Client..." -ForegroundColor Cyan
    npx prisma generate
} else {
    Write-Host "`nMigration failed!" -ForegroundColor Red
    exit 1
}
