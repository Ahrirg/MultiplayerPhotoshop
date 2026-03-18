# mock_session_server.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
sessions = {}

class SessionCreate(BaseModel):
    user_id: str
    expires_at: int

@app.post("/sessions")
def create_session(data: SessionCreate):
    session_id = f"session-{len(sessions)+1}"
    sessions[session_id] = {"user_id": data.user_id, "expires_at": data.expires_at}
    return {"session_id": session_id}

@app.get("/sessions/{session_id}")
def get_session(session_id: str):
    if session_id not in sessions:
        return {"detail": "Not found"}, 404
    return {"valid": True, "user_id": sessions[session_id]["user_id"], "expires_at":sessions[session_id]["expires_at"]}