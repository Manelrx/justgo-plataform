from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True) # Relacionado com User (futuro FK)
    store_id = Column(Integer, index=True) # Relacionado com Store (futuro FK)
    
    # Valores
    total_amount = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)
    final_amount = Column(Float, nullable=False)
    
    # Gateway de Pagamento
    payment_method = Column(String) # PIX, CREDIT_CARD, WALLET
    gateway_provider = Column(String) # MERCADO_PAGO, PAGARME
    gateway_transaction_id = Column(String, unique=True, index=True) # ID lá no Mercado Pago
    status = Column(String, default="PENDING") # PENDING, PAID, FAILED, REFUNDED
    
    # Auditoria e Logs
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    metadata_payload = Column(JSON) # Para guardar JSON de resposta do Gateway (Debug)
