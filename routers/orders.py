"""Order API routes — full CRUD for patient orders."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.order import OrderCreate, OrderResponse
from crud import order as crud_order

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/", response_model=list[OrderResponse])
def get_all_orders(db: Session = Depends(get_db)):
    """Retrieve all patient orders."""
    return crud_order.get_orders(db)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Retrieve a single order by ID."""
    order = crud_order.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """Create a new patient order."""
    return crud_order.create_order(db, order)


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, order: OrderCreate, db: Session = Depends(get_db)):
    """Update an existing order."""
    updated = crud_order.update_order(db, order_id, order)
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    return updated


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete an order by ID."""
    if not crud_order.delete_order(db, order_id):
        raise HTTPException(status_code=404, detail="Order not found")
