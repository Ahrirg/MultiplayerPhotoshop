# Start backend session in background
Start-Process -NoNewWindow -FilePath ".\Back_end_session\target\release\Back_end_session.exe"

# Move to db directory
Set-Location ".\Back_end_database"

# Run FastAPI app using uv
uv run uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Move to authority directory
Set-Location ".\Back_end_authority"

# Run FastAPI app using uv
# uv run python -m fastapi run main.py --host 0.0.0.0 --port 8000 --reload
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload