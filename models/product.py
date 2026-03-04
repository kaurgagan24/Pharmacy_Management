"""SQLAlchemy model for the products table."""

from sqlalchemy import Column, Integer, String, Text, DECIMAL, Boolean, TIMESTAMP, func
from database import Base


class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    unit_price = Column(DECIMAL(10, 2), nullable=False)
    manufacturer = Column(String(150), nullable=True)
    requires_prescription = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
