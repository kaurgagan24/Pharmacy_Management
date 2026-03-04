"""Pydantic schemas for Inventory validation and serialization."""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class InventoryCreate(BaseModel):
    """Schema for creating a new inventory record."""
    product_id: int = Field(..., gt=0, description="ID of the product")
    quantity_on_hand: int = Field(default=0, ge=0, description="Current stock quantity")
    reorder_threshold: int = Field(default=10, ge=0, description="Low-stock alert threshold")


class InventoryUpdate(BaseModel):
    """Schema for updating inventory (restock)."""
    quantity_on_hand: Optional[int] = Field(default=None, ge=0, description="New quantity on hand")
    reorder_threshold: Optional[int] = Field(default=None, ge=0, description="New reorder threshold")


class InventoryResponse(BaseModel):
    """Schema for inventory responses."""
    inventory_id: int
    product_id: int
    quantity_on_hand: int
    reorder_threshold: int
    last_updated: datetime

    class Config:
        from_attributes = True
