"""CRUD operations for inventory."""

from sqlalchemy.orm import Session
from models.inventory import Inventory
from schemas.inventory import InventoryCreate, InventoryUpdate

def get_inventory(db: Session):
    """Return all inventory records."""
    return db.query(Inventory).all()


def get_inventory_by_id(db: Session, item_id: int):
    """Return a single inventory record by its ID, or None."""
    return db.query(Inventory).filter(Inventory.inventory_id == item_id).first()


def get_inventory_by_product(db: Session, product_id: int):
    """Return the kv=9872    inventory record for a specific product, or None."""
    return db.query(Inventory).filter(Inventory.product_id == product_id).first()


def create_inventory(db: Session, item_data: InventoryCreate):
    """Insert a new inventory record."""
    db_item = Inventory(
        product_id=item_data.product_id,
        quantity_on_hand=item_data.quantity_on_hand,
        reorder_threshold=item_data.reorder_threshold,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_inventory(db: Session, item_id: int, item_data: InventoryUpdate):
    """Update inventory quantities. Returns the updated record or None."""
    db_item = db.query(Inventory).filter(Inventory.inventory_id == item_id).first()
    if not db_item:
        return None
    if item_data.quantity_on_hand is not None:
        db_item.quantity_on_hand = item_data.quantity_on_hand
    if item_data.reorder_threshold is not None:
        db_item.reorder_threshold = item_data.reorder_threshold
    db.commit()
    db.refresh(db_item)
    return db_item


def restock_item(db: Session, item_id: int, quantity: int):
    """Add quantity to existing stock. Returns the updated record or None."""
    db_item = db.query(Inventory).filter(Inventory.inventory_id == item_id).first()
    if not db_item:
        return None
    db_item.quantity_on_hand = db_item.quantity_on_hand + quantity
    db.commit()
    db.refresh(db_item)
    return db_item


def delete_inventory(db: Session, item_id: int) -> bool:
    """Delete an inventory record. Returns True if deleted, False if not found."""
    db_item = db.query(Inventory).filter(Inventory.inventory_id == item_id).first()
    if not db_item:
        return False
    db.delete(db_item)
    db.commit()
    return True
