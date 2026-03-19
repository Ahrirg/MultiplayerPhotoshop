#!/bin/bash
set -e

echo "=== BUILD FRONT PAGE ==="

cd ./Front_end/Pre_game
npm install
npm run build
mv ./dist/index.html ./dist/frontpage.html
cp -r ./dist/ ../../Back_end_authority/static
cd ../../



echo "=== BUILD GAME WEBAPP ==="

cd ./Front_end/In_game
npm install
npm run build
mv ./dist/index.html ./dist/game.html
cp -r ./dist/ ../../Back_end_authority/static
cd ../../



echo "=== BUILD SESSION SERVER ==="

cd ./Back_end_session
cargo build --release
cd ../



echo "=== BUILD AUTH SERVER ==="

cd ./Back_end_authority
uv sync
cd ../




echo "=== BUILD COMPLETE ==="