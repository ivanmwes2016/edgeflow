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
    try:
        return [to_dict(s) for s in db.query(Service).all()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/{service_id}")
def get_service(service_id: int, db: Session = Depends(get_db)):
    try:
        service = db.query(Service).filter(Service.id == service_id).first()
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        return to_dict(service)
    except HTTPException:
        raise  
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        

@router.post("/")
def createService(data: dict, db: Session  = Depends(get_db)):
    
    try:
        service = Service(**data)
        db.add(service)
        db.commit()
        db.refresh(service)
        return to_dict(service)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/{service_id}")
def UpdateService(service_id: int, data: dict, db: Session = Depends(get_db)):
    try:
        service = db.query(Service).filter(Service.id == service_id).first()
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        for key, val in data.items():
            setattr(service, key, val)
        db.commit()
        db.refresh(service)
        return to_dict(service)
    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        

@router.delete("/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db)):
    try:
        service = db.query(Service).filter(Service.id == service_id).first()
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        db.delete(service)
        db.commit()
        return {"deleted": service_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))




