"""
Pharmacy Management API — FastAPI entry point.
Registers all routers and configures CORS middleware.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import orders, products, inventory
from database import Base, engine
from models import order, product, inventory as inv_model # noqa: F401 — import so tables are registered

# Create database tables if they don't exist (only used with SQLAlchemy create_all approach)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pharmacy Management API",
    description="RESTful API for managing pharmacy orders, products, and inventory.",
    version="1.0.0",
)


# ---------------------------------------------------------------------------
# CORS — allow the frontend (served on a different port) to call the API
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to the frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Register routers
# ---------------------------------------------------------------------------
app.include_router(orders.router)
app.include_router(products.router)
app.include_router(inventory.router)


@app.get("/", tags=["Root"])
def root():
    """Health-check / welcome endpoint."""
    return {
        "message": "Welcome to the Pharmacy Management API",
        "docs": "/docs",
        "version": "1.0.0",
    }
