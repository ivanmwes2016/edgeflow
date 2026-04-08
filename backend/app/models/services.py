from sqlalchemy import Column, Integer, String
from  utils.dbConfig import Base
from utils.utils import random_color
from utils.dbConfig import get_db

class Service(Base):
    __tablename__ = "servies"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    label = Column(String)
    port = Column(Integer)
    image = Column(String)
    icon = Column(String)
    color = Column(String, default=random_color)


    

