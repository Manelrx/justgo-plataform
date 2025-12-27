from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import engine, Base, get_db
from app.routers import auth
# Models are imported to ensure they are registered with Base where needed, 
# but we are moving to Alembic for table creation.
from app.models import transaction, user, store, product 

# If you strictly want to use Alembic, you might comment this out. 
# But for dev speed sometimes people leave it. 
# The user said: "Não quero apenas criar as tabelas com...". 
# So I will NOT include Base.metadata.create_all(bind=engine) per instructions to rely on Alembic.

app = FastAPI(title="Just Go Core API", version="1.0.0")

app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"system": "Just Go Market", "status": "online", "environment": "dev"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    # Teste simples de conexão com banco
    try:
        db.execute("SELECT 1")
        return {"database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database connection failed")
