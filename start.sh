./Back_end_session/target/release/Back_end_session &

(
  cd ./Back_end_authority && \
  uv run python -m fastapi run main.py --host 0.0.0.0 --port 8000 --reload
) &

(
  cd ./Back_end_database && \
  uv run uvicorn app.main:app --reload --port 8001
) &

wait
