"""SQLAlchemy model for the orders table."""

from sqlalchemy import Column, Integer, String, DECIMAL, TIMESTAMP, Enum, ForeignKey, func
from database import Base


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_name = Column(String(100), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id", ondelete="RESTRICT", onupdate="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    order_date = Column(TIMESTAMP, server_default=func.now())
    status = Column(Enum("pending", "fulfilled", "cancelled", name="order_status"), default="pending")
