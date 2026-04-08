from utils.dbConfig import engine, SessionLocal, Base
from models.services import Service


def seed_data_to_db():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    if db.query(Service).first():
        print("DB already seeded")
        db.close()
        return
    

    services = [
        Service(type="web",label="Web App", port=3000, image="nginx:alpine", icon="🌐"),
        Service(type="api",label="API Service", port=8000, image="python:3.12-slim", icon="⚡"),
        Service(type="gateway",label="API Gateway", port=8080, image="traefik:v3", icon="🔀"),
        Service(type="database", label="Database",   port=5432, image="postgres:16", icon="🗄️"),
        Service(type="cache", label="Cache", port=6379, image="redis:7-alpine", icon="⚡"),
    ]

    db.add_all(services)
    db.commit()
    db.close()
    print("Seeded successfully")

if __name__ == "__main__":
    seed_data_to_db()