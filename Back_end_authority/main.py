from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import markdown
import requests

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #fix this in future
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Authority server": "Hello world"}

@app.get("/join/{sessionId}")
def get_ip_from_id(sessionId: str):
    HOST = "http://localhost:3000" # CHANGE THIS TO BE DYNAMIC

    if sessionId != "one":
        raise HTTPException(
            status_code=404,  # Not Found
            detail={
                "Server ip": "None",
                "Session ID": sessionId,
                "Error": "Server does not exist"
            }
        )

    try:
        r = requests.get(HOST, timeout=2)
        return {
            "Server ip": HOST,
            "Session ID": sessionId
        }
    except requests.exceptions.RequestException:
        raise HTTPException(
            status_code=503,  # Service Unavailable
            detail={
                "Server ip": "None",
                "Session ID": sessionId,
                "Error": "Server is not reachable"
            }
        )
    

@app.get("/info", response_class=HTMLResponse)
def read_info():
    message: str = "" 
    with open("./Info.md", "r", encoding="utf-8") as file:
        message = file.read()

    html_content = markdown.markdown(message)
    return f"<html><body>{html_content}</body></html>"