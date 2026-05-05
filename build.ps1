$ErrorActionPreference = "Stop"

Write-Host "=== BUILD FRONT PAGE ==="

New-Item -ItemType Directory -Force -Path "./Back_end_authority/static" | Out-Null

Set-Location "./Front_end/Pre_game"
npm install
npm run build
Rename-Item -Path "./dist/index.html" -NewName "frontpage.html"
Copy-Item -Path "./dist/*" -Destination "../../Back_end_authority/static" -Recurse -Force
Set-Location "../../"



Write-Host "=== BUILD GAME WEBAPP ==="

Set-Location "./Front_end/In_game"
npm install
npm run build
Rename-Item -Path "./dist/index.html" -NewName "game.html"
Copy-Item -Path "./dist/*" -Destination "../../Back_end_authority/static" -Recurse -Force
Set-Location "../../"



Write-Host "=== BUILD SESSION SERVER ==="

Set-Location "./Back_End_session"
cargo build --release
Set-Location "../"



Write-Host "=== BUILD AUTH SERVER ==="

Set-Location "./Back_end_authority"
uv sync
Set-Location "../"



Write-Host "=== BUILD COMPLETE ==="