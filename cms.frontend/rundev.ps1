$node = "C:\nvm4w\nodejs\node.exe"
$script = "node_modules\react-scripts\bin\react-scripts.js"
$args = "start"

if (-not (Test-Path $script)) {
    Write-Host "Dependencies chưa được cài. Chạy: npm install" -ForegroundColor Yellow
    exit 1
}

Write-Host "=== Running react-scripts start with Node.js ===" -ForegroundColor Cyan
& $node $script $args
