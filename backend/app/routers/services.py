from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from utils.dbConfig import get_db
from ..models.services import Service


router = APIRouter()

def to_dict(service: Service):
    return {
        "id": service.id,
        "type": service.type,
        "label": service.label,
        "port": service.port,
        "image": service.image,
        "icon": service.icon,
        "color": service.color,
    }

@router.get("/")
def getServices(db:Session = Depends(get_db)):
     return [to_dict(s) for s in db.query(Service).all()]

