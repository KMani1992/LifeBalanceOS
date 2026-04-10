# PowerShell script to batch rewrite pages

# This script can be used to update multiple page files at once
# Usage: .\tmp-rewrite-pages.ps1

Write-Host "LifeBalanceOS Page Rewrite Script"
Write-Host "===================================="

$pages = @(
    "src/app/dashboard/page.tsx",
    "src/app/daily/page.tsx",
    "src/app/goals/page.tsx",
    "src/app/habits/page.tsx",
    "src/app/finance/page.tsx",
    "src/app/kids/page.tsx",
    "src/app/reflections/page.tsx",
    "src/app/weekly-review/page.tsx",
    "src/app/garden/page.tsx"
)

foreach ($page in $pages) {
    if (Test-Path $page) {
        Write-Host "Processing: $page"
        # Add your rewrite logic here
    }
}

Write-Host "Complete!"
