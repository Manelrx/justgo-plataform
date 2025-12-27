from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    sku = Column(String, primary_key=True, index=True) # Assuming SKU is PK or unique enough to act as ID based on request
    name = Column(String, index=True)
    price = Column(Float)
