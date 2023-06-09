from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles

from domain.user import user_router
from domain.server import server_router
from domain.channel import channel_router
from domain.message import message_router
from domain.zum import zum_router

app = FastAPI(docs_url="/api/docs")

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router.router)
app.include_router(server_router.router)
app.include_router(channel_router.router)
app.include_router(message_router.router)
app.include_router(zum_router.router)
