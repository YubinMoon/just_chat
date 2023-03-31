from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table, Text
from sqlalchemy.orm import relationship

from database import Base


class Channel(Base):
    __tablename__ = 'channel'

    id = Column(Integer, primary_key=True, autoincrement=True)
    server_id = Column(Integer, ForeignKey(
        'server.id', ondelete="CASCADE"), nullable=False)
    server = relationship("Server", backref="channel_list")
    type = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)


class Message(Base):
    __tablename__ = 'message'

    id = Column(Integer, primary_key=True)
    channel_id = Column(Integer, ForeignKey('channel.id', ondelete="CASCADE"), nullable=False)
    channel = relationship("Channel", backref="message_list")
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    user = relationship("User", backref="message_list")
    content_type = Column(String, nullable=False, default='text')
    content = Column(Text, nullable=False)
    create_date = Column(DateTime, nullable=False)
    modify_date = Column(DateTime)


class Server(Base):
    __tablename__ = 'server'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    user = relationship("User", backref="own_server")
    name = Column(String, nullable=False)
    description = Column(String)


class ServerUser(Base):
    __tablename__ = 'serveruser'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    user = relationship("User", backref="server_table")
    server_id = Column(Integer, ForeignKey('server.id'), nullable=False)
    server = relationship("Server", backref="user_table")
    name = Column(String)


class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    nickname = Column(String, nullable=False)
    create_date = Column(DateTime, nullable=False)