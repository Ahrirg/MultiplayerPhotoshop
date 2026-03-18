import os
import json
import logging
import markdown
import requests
import datetime
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from dotenv import load_dotenv
from pydantic import BaseModel

from database import get_database

load_dotenv("env/.env")

sessions = {}

class UserCreate(BaseModel):
    name: str

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

INTERNAL_API_TOKEN = os.getenv("INTERNAL_API_TOKEN")
if not INTERNAL_API_TOKEN:
    logging.error("Environment variable INTERNAL_API_TOKEN is not set!")
    raise RuntimeError("INTERNAL_API_TOKEN must be set for secure authentication")

# SESSION_IPS_JSON = os.getenv("SESSION_IPS")
# if not SESSION_IPS_JSON:
#     logging.error("Environment variable SESSION_IPS is not set!")
#     raise RuntimeError("SESSION_IPS must be set to map session IDs to IPs")
# try:
#     SESSION_IPS = json.loads(SESSION_IPS_JSON)
# except json.JSONDecodeError:
#     raise RuntimeError("SESSION_IPS is not valid JSON")

SERVICE_PORT = int(os.getenv("SERVICE_PORT", 3000))

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
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

def validate(sessionId: str):
    if sessionId not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if datetime.datetime.now().timestamp() > sessions[sessionId]['expired_at']:
        logging.warning("Session is expired")
        raise HTTPException(status_code=401, detail="Session is expired")
    return True

@app.exception_handler(404)
def not_found(request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Route not found"}
    )

@app.get("/")
def read_root():
    #return {"Authority server": "Hello world"}
    return FileResponse("static/index.html")

@app.get("/join/{sessionId}")
def get_ip_from_id(sessionId: str, x_api_token: str | None = Header(None)):
    authenticate(x_api_token)
    print("here")

    '''
    if sessionId not in sessions:
        logging.warning(f"Join failed: Unknown session {sessionId}")
        raise HTTPException(
            status_code=404,
            detail={
                "Server ip": "None",
                "Session ID": sessionId,
                "Error": "Server does not exist"
            }
        )
    '''
    
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

SESSION_SERVER_URL = "http://localhost:3000"

@app.post("/session/create") # TO DO
def create_session(user_id: str, x_api_token: str | None = Header(None)):
    authenticate(x_api_token)
    time = int(datetime.datetime.now().timestamp())+10
    try:
        response = requests.post(
            f"{SESSION_SERVER_URL}/sessions",
            json={"user_id": user_id, "expires_at": time},
            timeout=2
        )
        response.raise_for_status()
        sessions[response.json()["session_id"]] = {"host": "http://localhost:3001", "expired_at": time}
        print(sessions["session-1"]['expired_at'])
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.exception("Failed to create session")
        raise HTTPException(status_code=503, detail={"Error": "Session server unreachable", "Message": str(e)})

@app.get("/session/validate/{sessionId}")
def validate_session(sessionId: str, x_api_token: str | None = Header(None)):
    authenticate(x_api_token)
    validate(sessionId)
    try:
        response = requests.get(f"{SESSION_SERVER_URL}/sessions/{sessionId}", timeout=2)
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

@app.get("/info", response_class=HTMLResponse)
def read_info():
    with open("./Info.md", "r", encoding="utf-8") as file:
        message = file.read()
    html_content = markdown.markdown(message)
    return f"<html><body>{html_content}</body></html>"