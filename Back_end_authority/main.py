import os
import json
import logging
import markdown
import requests
import datetime
import subprocess
import socket
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from dotenv import load_dotenv
from pydantic import BaseModel

from database import get_database, init_db

if not os.path.exists("env/.env"):
    open("env/.env", "x")
load_dotenv("env/.env")

# NOT PERMANENT to create db for session storage
init_db()

#sessions = {}

class UserCreate(BaseModel):
    name: str

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

INTERNAL_API_TOKEN = os.getenv("INTERNAL_API_TOKEN")
if not INTERNAL_API_TOKEN:
    logging.error("Environment variable INTERNAL_API_TOKEN is not set!")
    raise RuntimeError("INTERNAL_API_TOKEN must be set for secure authentication")

SERVICE_PORT = int(os.getenv("SERVICE_PORT", 3000))

app = FastAPI()
#app.mount("/static", StaticFiles(directory="static/dist"), name="static")
#app.mount("/assets", StaticFiles(directory="static/dist/assets"), name="assets")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # fix this in future
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def authenticate(token: str | None):
    return True # currently bypassing auth because for testing fck users

    if not token:
        logging.warning("Authentication failed: No token provided")
        raise HTTPException(status_code=401, detail="Missing API token")
    if token != INTERNAL_API_TOKEN:
        logging.warning("Authentication failed: Invalid token")
        raise HTTPException(status_code=401, detail="Invalid API token")
    logging.info("Authentication successful")
    return True

def validate(sessionId: str, db: Session):
    result = db.execute(
        text("SELECT * FROM sessions WHERE session_id = :id"),
        {"id": sessionId}).fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = dict(result._mapping)

    if datetime.datetime.now().timestamp() > session['expires_at']:
        logging.warning("Session is expired")
        raise HTTPException(status_code=401, detail="Session is expired")
    return session

@app.exception_handler(404)
def not_found(request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Route not found"}
    )

@app.get("/")
def read_root():
    #return {"Authority server": "Hello world"}
    return FileResponse("./static/dist/frontpage.html")

#Health status Endpoint
@app.get("/status")
def show_server_status(db: Session = Depends(get_database)):
    status = {
        "api": "ok",
        "database": "unknown",
        "sessions": []
    }

    # Check database connectivity
    try:
        db.execute(text("SELECT 1"))
        status["database"] = "ok"
    except Exception:
        logging.exception("Database health check failed")
        status["database"] = "down"

    try:
        result = db.execute(text("SELECT * FROM sessions")).fetchall()
        now_ts = datetime.datetime.now().timestamp()
        for r in result:
            session = dict(r._mapping)
            session_status = {
                "session_id": session["session_id"],
                "host": session["host"],
                "valid": True,
                "host_reachable": False,
                "reason": ""
            }

            if now_ts > session["expires_at"]:
                session_status["valid"] = False
                session_status["reason"] = "expired"

            try:
                resp = requests.get(session["host"], timeout=2)
                if resp.status_code == 200:
                    session_status["host_reachable"] = True
                else:
                    session_status["reason"] = f"host returned {resp.status_code}"
            except requests.exceptions.RequestException:
                session_status["reason"] = "host not reachable"

            status["sessions"].append(session_status)

    except Exception:
        logging.exception("Failed to fetch sessions")
        status["sessions"] = "unavailable"

    overall = "ok"
    if status["database"] == "down":
        overall = "down"
    elif any(s.get("valid") is False or s.get("host_reachable") is False for s in status["sessions"] if isinstance(status["sessions"], list)):
        overall = "degraded"

    return {
        "status": overall,
        "services": status,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@app.get("/game")
def read_root():
    #return {"Authority server": "Hello world"}
    return FileResponse("./static/dist/game.html")

#Use this for testing
@app.get("/join/{sessionId}")
def get_ip_from_id(sessionId: str, x_api_token: str | None = Header(None)):
    authenticate(x_api_token)
    print("here")  
    # validate(sessionId) # disabling for testing + you still need to return if you not found 
    
    # HOST = sessions[sessionId]["host"] # THIS NOT DYNAMIC.......... :)
    HOST = "http://localhost:3000"

    try:
        print("here1")
        r = requests.get(HOST, timeout=2)
        print("here2")
        logging.info("Server connection successful")
        return {
            "Server ip": HOST,
            "Session ID": sessionId
        }
    except requests.exceptions.RequestException:
        logging.error(f"Join failed: {HOST} not reachable")
        raise HTTPException(
            status_code=503,
            detail={
                "Server ip": "None",
                "Session ID": sessionId,
                "Error": "Server is not reachable"
            }
        )

@app.get("/join/{sessionId}")
def get_ips_from_ids(sessionId: str, x_api_token: str | None = Header(None), db: Session = Depends(get_database)):
    authenticate(x_api_token)

    session = validate(sessionId, db)
    HOST = session["host"]

    try:
        requests.get(HOST, timeout=2)
        return {
            "Server ip": HOST,
            "Session ID": sessionId
        }
    except requests.exceptions.RequestException:
        raise HTTPException(
            status_code=503,
            detail={
                "Server ip": "None",
                "Session ID": sessionId,
                "Error": "Server is not reachable"
            }
        )

'''
@app.post("/test-user")
def create_user(user: UserCreate, db: Session = Depends(get_database), x_api_token: str | None = Header(None)):
    authenticate(x_api_token)

    try:
        db.execute(text(f"INSERT INTO users (name) VALUES (:name)"), {"name": user.name})
        db.commit()
        logging.info("Database: user inserted successfully")
        return {"message": "User created successfully"}
    except Exception as e:
        logging.exception(f"Database failed at creating user table: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "Error": f"Failed to make user table at Database: {e}"
            }
        )

@app.get("/test-user")
def get_users(db: Session = Depends(get_database), x_api_token: str | None = Header(None)):
    authenticate(x_api_token)
    
    try:
        result = db.execute(text("SELECT * FROM users")).fetchall()
        users = [dict(r._mapping) for r in result]
        logging.info(f"Database: fetched {len(users)} users")
        return {"users": users}
    except Exception as e:
        logging.exception("Database failed getting users")
        raise HTTPException(
            status_code=500,
            detail={
                "Error": f"Failed to get users at Database: {e}"
            }
        )
'''

def find_free_port():
    s = socket.socket()
    s.bind(('', 0))
    port = s.getsockname()[1]
    s.close()
    return port

def start_rust_session(port: int, session_id: str): #TO DO
    try:
        process = subprocess.Popen(
            ["cargo", "run", "--release", "--", "--port", str(port)],
            cwd="/../Back_end_session/",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        return process
    except Exception as e:
        logging.error(f"Failed to start Rust session server: {e}")
        return None

#SESSION_SERVER_URL = "http://localhost:3000"

@app.post("/session/create") # TO DO
def create_session(x_api_token: str | None = Header(None), db: Session = Depends(get_database)):
    authenticate(x_api_token)
    session_id = f"session-{int(datetime.datetime.now().timestamp())}"
    host = "http://localhost"
    port = find_free_port() # Finds a free port per session
    expires = int(datetime.datetime.now().timestamp())+3600 # 1 hour

    process = start_rust_session(port, session_id)
    if not process:
        pass #FOR TESTING
        #raise HTTPException(status_code=500, detail="Failed to start Rust session server")

    try:
        db.execute(
            text("""
                INSERT INTO sessions (session_id, host, port, expires_at)
                VALUES (:session_id, :host, :port, :expires)
            """),
            {
                "session_id": session_id,
                "host": host,
                "port": port,
                "expires": expires
            }
        )
        db.commit()

        logging.info(f"Session {session_id} created on port {port}")

        return {
            "session_id": session_id,
            "host": host,
            "port": port,
            "expires_at": expires
        }

    except Exception as e:
        logging.exception("Session storage failed")
        raise HTTPException(status_code=500, detail="Failed to store created session")

@app.get("/session/validate/{sessionId}")
def validate_session(sessionId: str, x_api_token: str | None = Header(None), db: Session = Depends(get_database)):
    authenticate(x_api_token)
    session = validate(sessionId, db)
    HOST = session["host"]
    try:
        response = requests.get(f"{HOST}/sessions/{sessionId}", timeout=2)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if response.status_code == 404:
            return {"valid": False, "reason": "Session not found or expired"}
        logging.exception("Session validation failed")
        raise HTTPException(status_code=500, detail={"Error": "Failed to validate session", "Message": str(e)})
    except requests.exceptions.RequestException as e:
        logging.exception("Session server unreachable")
        raise HTTPException(status_code=503, detail={"Error": "Session server unreachable", "Message": str(e)})

def get_active_sessions():
    return [{
        "name": "session1",
        "status": "ingame",
    }]

@app.get("/getallactive")
def get_all_active_server():
    return get_active_sessions().count()

@app.get("/sessions")
def get_sessions(db: Session = Depends(get_database)):
    result = db.execute(text("SELECT * FROM sessions")).fetchall()
    return [dict(r._mapping) for r in result]

@app.get("/info", response_class=HTMLResponse)
def read_info():
    with open("./Info.md", "r", encoding="utf-8") as file:
        message = file.read()
    html_content = markdown.markdown(message)
    return f"<html><body>{html_content}</body></html>"