"""Pydantic schemas for Product validation and serialization."""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ProductCreate(BaseModel):
    """Schema for creating / updating a product."""
    name: str = Field(..., min_length=2, max_length=150, description="Product name")
    category: str = Field(..., min_length=2, max_length=100, description="Product category")
    description: Optional[str] = Field(default=None, description="Product description")
    unit_price: float = Field(..., gt=0.0, description="Price per unit")
    manufacturer: Optional[str] = Field(default=None, max_length=150, description="Manufacturer name")
    requires_prescription: bool = Field(default=False, description="Whether a prescription is required")


class ProductResponse(BaseModel):
    """Schema for product responses."""
    product_id: int
    name: str
    category: str
    description: Optional[str]
    unit_price: float
    manufacturer: Optional[str]
    requires_prescription: bool
    created_at: datetime

    class Config:
        from_attributes = True
