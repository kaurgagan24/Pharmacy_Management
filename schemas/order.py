"""Pydantic schemas for Order validation and serialization."""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class OrderCreate(BaseModel):
    """Schema for creating / updating an order."""
    patient_name: str = Field(..., min_length=2, max_length=100, description="Patient full name")
    product_id: int = Field(..., gt=0, description="ID of the ordered product")
    quantity: int = Field(..., gt=0, description="Must be a positive integer")
    total_amount: float = Field(..., gt=0.0, description="Must be greater than zero")
    status: Optional[str] = Field(default="pending", description="Order status")


class OrderResponse(BaseModel):
    """Schema for order responses."""
    order_id: int
    patient_name: str
    product_id: int
    quantity: int
    total_amount: float
    order_date: datetime
    status: str

    class Config:
        from_attributes = True
