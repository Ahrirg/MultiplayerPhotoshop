from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import markdown

app = FastAPI()

@app.get("/")
def read_root():
    return {"Authority server": "Hello world"}

@app.get("/info", response_class=HTMLResponse)
def read_root():
    message: str = "" 
    with open("./Info.md", "r", encoding="utf-8") as file:
        message = file.read()

    html_content = markdown.markdown(message)
    return f"<html><body>{html_content}</body></html>"