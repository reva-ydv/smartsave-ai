from sqlalchemy import Column, Integer, String
from database.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    income = Column(Integer, nullable=False)
    savings_goal = Column(Integer, nullable=False)