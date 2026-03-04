"""Product API routes — full CRUD for the product catalog."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.product import ProductCreate, ProductResponse
from crud import product as crud_product

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=list[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    """Retrieve all products in the catalog."""
    return crud_product.get_products(db)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Retrieve a single product by ID."""
    product = crud_product.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductResponse, status_code=201)
def add_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Add a new pharmaceutical product to the catalog."""
    return crud_product.create_product(db, product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db)):
    """Update an existing product."""
    updated = crud_product.update_product(db, product_id, product)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@router.delete("/{product_id}", status_code=204)
def remove_product(product_id: int, db: Session = Depends(get_db)):
    """Remove a product from the catalog."""
    if not crud_product.delete_product(db, product_id):
        raise HTTPException(status_code=404, detail="Product not found")
