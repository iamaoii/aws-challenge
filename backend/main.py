from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, events

app = FastAPI(title="ClikiTayo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://26.110.33.231:8080",
        "http://192.168.1.146:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(events.router)

@app.get("/")
async def root():
    return {"message": "ClikiTayo API"}