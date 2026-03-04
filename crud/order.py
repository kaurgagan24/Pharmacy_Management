"""CRUD operations for orders."""

from sqlalchemy.orm import Session
from models.order import Order
from schemas.order import OrderCreate


def get_orders(db: Session):
    """Return all orders, most recent first."""
    return db.query(Order).order_by(Order.order_date.desc()).all()


def get_order_by_id(db: Session, order_id: int):
    """Return a single order by its ID, or None."""
    return db.query(Order).filter(Order.order_id == order_id).first()


def create_order(db: Session, order_data: OrderCreate):
    """Insert a new order into the database."""
    db_order = Order(
        patient_name=order_data.patient_name,
        product_id=order_data.product_id,
        quantity=order_data.quantity,
        total_amount=order_data.total_amount,
        status=order_data.status or "pending",
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


def update_order(db: Session, order_id: int, order_data: OrderCreate):
    """Update an existing order. Returns the updated order or None."""
    db_order = db.query(Order).filter(Order.order_id == order_id).first()
    if not db_order:
        return None
    db_order.patient_name = order_data.patient_name
    db_order.product_id = order_data.product_id
    db_order.quantity = order_data.quantity
    db_order.total_amount = order_data.total_amount
    if order_data.status:
        db_order.status = order_data.status
    db.commit()
    db.refresh(db_order)
    return db_order


def delete_order(db: Session, order_id: int) -> bool:
    """Delete an order by ID. Returns True if deleted, False if not found."""
    db_order = db.query(Order).filter(Order.order_id == order_id).first()
    if not db_order:
        return False
    db.delete(db_order)
    db.commit()
    return True
