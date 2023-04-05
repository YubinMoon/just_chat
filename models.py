from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    username = Column(String, index=True, unique=True, nullable=False)
    password = Column(String, nullable=False)
    nickname = Column(String, nullable=False)
    create_date = Column(DateTime, nullable=False)
    admin = Column(Boolean, default=False)
    settings = Column(Text)

    def __repr__(self):
        return f"User(id={self.id!r}, username={self.username!r}, nickname={self.nickname!r})"


class Server(Base):
    __tablename__ = 'server'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    user = relationship("User", backref="own_server")
    name = Column(String, nullable=False)
    description = Column(String)

    def __repr__(self):
        return f"Server(id={self.id!r}, User={self.user_id!r}, name={self.name!r})"


class Channel(Base):
    __tablename__ = 'channel'

    id = Column(Integer, primary_key=True, autoincrement=True)
    server_id = Column(Integer, ForeignKey(
        'server.id', ondelete="CASCADE"), nullable=False)
    server = relationship("Server", backref="channel_list")
    type = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)

    def __repr__(self):
        return f"Channel(id={self.id!r}, server={self.server_id!r}, name={self.name!r}, type={self.type!r})"


class Message(Base):
    __tablename__ = 'message'

    id = Column(Integer, primary_key=True)
    channel_id = Column(Integer, ForeignKey(
        'channel.id', ondelete="CASCADE"), nullable=False)
    channel = relationship("Channel", backref="message_list")
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    user = relationship("User", backref="message_list")
    content_type = Column(String, nullable=False, default='text')
    content = Column(Text, nullable=False)
    create_date = Column(DateTime, nullable=False)
    modify_date = Column(DateTime)

    def __repr__(self):
        return f"Message(id={self.id!r}, channel={self.channel_id!r}, user={self.user_id!r}, content={self.content!r}, create_date={self.create_date!r})"


class ServerUser(Base):
    __tablename__ = 'serveruser'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    user = relationship("User", backref="server_table")
    server_id = Column(Integer, ForeignKey('server.id'), nullable=False)
    server = relationship("Server", backref="user_table")
    name = Column(String)

    def __repr__(self):
        return f"ServerUser(id={self.id!r}, user={self.user_id!r}, server={self.server_id!r}, name={self.name!r})"
