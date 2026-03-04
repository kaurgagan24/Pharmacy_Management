"""CRUD operations for products."""

from sqlalchemy.orm import Session
from models.product import Product
from schemas.product import ProductCreate


def get_products(db: Session):
    """Return all products ordered by name."""
    return db.query(Product).order_by(Product.name).all()


def get_product_by_id(db: Session, product_id: int):
    """Return a single product by its ID, or None."""
    return db.query(Product).filter(Product.product_id == product_id).first()


def create_product(db: Session, product_data: ProductCreate):
    """Insert a new product into the database."""
    db_product = Product(
        name=product_data.name,
        category=product_data.category,
        description=product_data.description,
        unit_price=product_data.unit_price,
        manufacturer=product_data.manufacturer,
        requires_prescription=product_data.requires_prescription,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def update_product(db: Session, product_id: int, product_data: ProductCreate):
    """Update an existing product. Returns the updated product or None."""
    db_product = db.query(Product).filter(Product.product_id == product_id).first()
    if not db_product:
        return None
    db_product.name = product_data.name
    db_product.category = product_data.category
    db_product.description = product_data.description
    db_product.unit_price = product_data.unit_price
    db_product.manufacturer = product_data.manufacturer
    db_product.requires_prescription = product_data.requires_prescription
    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product(db: Session, product_id: int) -> bool:
    """Delete a product by ID. Returns True if deleted, False if not found."""
    db_product = db.query(Product).filter(Product.product_id == product_id).first()
    if not db_product:
        return False
    db.delete(db_product)
    db.commit()
    return True
