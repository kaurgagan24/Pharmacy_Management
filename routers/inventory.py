"""Inventory API routes — manage stock levels and reorder thresholds."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from schemas.inventory import InventoryCreate, InventoryUpdate, InventoryResponse
from crud import inventory as crud_inventory

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("/", response_model=list[InventoryResponse])
def list_inventory(db: Session = Depends(get_db)):
    """Retrieve all inventory records."""
    return crud_inventory.get_inventory(db)


@router.get("/{item_id}", response_model=InventoryResponse)
def get_inventory_item(item_id: int, db: Session = Depends(get_db)):
    """Retrieve a single inventory record by ID."""
    item = crud_inventory.get_inventory_by_id(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item


@router.post("/", response_model=InventoryResponse, status_code=201)
def add_inventory_item(item: InventoryCreate, db: Session = Depends(get_db)):
    """
    Add a new inventory item. Useful for rapidly onboarding new products
    such as masks, sanitizers, or PPE during emergencies.
    """
    return crud_inventory.create_inventory(db, item)


@router.put("/{item_id}", response_model=InventoryResponse)
def update_inventory_item(item_id: int, item: InventoryUpdate, db: Session = Depends(get_db)):
    """Update inventory quantities or reorder threshold."""
    updated = crud_inventory.update_inventory(db, item_id, item)
    if not updated:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return updated


@router.put("/{item_id}/restock", response_model=InventoryResponse)
def restock_item(item_id: int, quantity: int = Query(..., gt=0, description="Quantity to add"), db: Session = Depends(get_db)):
    """Add stock quantity to an existing inventory item."""
    updated = crud_inventory.restock_item(db, item_id, quantity)
    if not updated:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return updated


@router.delete("/{item_id}", status_code=204)
def delete_inventory_item(item_id: int, db: Session = Depends(get_db)):
    """Delete an inventory record."""
    if not crud_inventory.delete_inventory(db, item_id):
        raise HTTPException(status_code=404, detail="Inventory item not found")
