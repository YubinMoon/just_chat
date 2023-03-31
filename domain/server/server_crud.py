from sqlalchemy import select
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from domain.user.user_schema import UserCreate
from domain.server.server_schema import ServerCreate
from models import User, Server, ServerUser
from datetime import datetime


async def create_server(db: AsyncSession, server_create: ServerCreate, user: User):
    db_server = Server(user=user, name=server_create.name,
                       description=server_create.description)
    db_serverUser = ServerUser(user=user, server=db_server, name=user.nickname)
    db.add(db_server)
    db.add(db_serverUser)
    await db.commit()


async def get_server_list(db: AsyncSession, user: User):
    # Load the User instance asynchronously from the database with the 'server_table' and 'server' relationships preloaded
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.server_table)
            .joinedload(ServerUser.server)
            .selectinload(Server.channel_list)  # 추가: server와 관련된 channel을 사전에 로드
        )
        .where(User.id == user.id)
    )
    user = result.scalar_one()

    _server_list = [serveruser.server for serveruser in user.server_table]
    # Access the Server instances through the ServerUser relationship
    return _server_list
