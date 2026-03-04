# Pharmacy_Management
 Complete Pharmacy Store Management Application  . A full-stack, 3-tier web application for managing pharmacy operations — built with Python (FastAPI), MySQL, and a Bootstrap-powered frontend
---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Features](#3-features)
4. [Frontend (UI)](#4-frontend-ui)
5. [Backend (FastAPI)](#5-backend-fastapi)
6. [Database (MySQL)](#6-database-mysql)
7. [Setup Instructions](#7-setup-instructions)
8. [Sample Workflow](#8-sample-workflow)
9. [Future Enhancements](#9-future-enhancements)
10. [Conclusion](#10-conclusion)

---

## 1. Project Overview

### Purpose

The **Pharmacy Store Management Application** is designed to digitize and streamline the day-to-day operations of a pharmacy business. It replaces manual, paper-based or spreadsheet-driven workflows with a centralized, web-based solution that provides real-time visibility into orders, inventory, and product data.

This system is suitable for:

- **Independent pharmacies** managing their own stock and patient orders
- **Chain pharmacies** needing a lightweight internal management tool
- **Healthcare administrators** who need audit trails and reporting on pharmaceutical inventory

### Key Features and Use Cases

| Use Case | Description |
|---|---|
| Order Management | Create, view, update, and delete patient orders with full details |
| Product Catalog | Maintain a searchable database of all pharmaceutical products |
| Inventory Tracking | Monitor stock levels and add new items as business needs evolve |
| Dynamic Inventory | Quickly add new products in response to demand (e.g., PPE during COVID-19) |
| Data Integrity | Enforce validation at the API layer before persisting to the database |

---

## 2. System Architecture

### 3-Tier Architecture Overview

This application follows a classic **3-tier architecture**, which separates concerns into three distinct layers:

```
┌──────────────────────────────────────────────────────────┐
│                    TIER 1: PRESENTATION                  │
│          HTML + CSS + JavaScript + Bootstrap             │
│    (Browser-based UI — runs on the client machine)       │
└──────────────────────┬───────────────────────────────────┘
                       │  HTTP Requests (JSON over REST API)
                       ▼
┌──────────────────────────────────────────────────────────┐
│                    TIER 2: APPLICATION                   │
│               Python — FastAPI Framework                 │
│    (Business logic, validation, API routing, ORM)        │
└──────────────────────┬───────────────────────────────────┘
                       │  SQL Queries (via SQLAlchemy ORM)
                       ▼
┌──────────────────────────────────────────────────────────┐
│                    TIER 3: DATA                          │
│                    MySQL Database                        │
│    (Persistent storage: orders, products, inventory)     │
└──────────────────────────────────────────────────────────┘
```

### How the Tiers Interact

1. **User interacts with the Frontend** — A pharmacy staff member fills out a form in the browser (e.g., a new order form).
2. **Frontend sends an HTTP request** — JavaScript collects the form data and sends a `POST` or `GET` request to the FastAPI backend using `fetch()` or `axios`.
3. **FastAPI processes the request** — The backend validates the incoming data using Pydantic schemas, applies business logic, and queries the database via SQLAlchemy.
4. **MySQL stores or retrieves data** — The database executes the SQL query and returns results to the backend.
5. **Backend returns a JSON response** — FastAPI sends a structured JSON response back to the browser.
6. **Frontend renders the response** — JavaScript dynamically updates the DOM to display order confirmations, product lists, or error messages.

---

## 3. Features

### 3.1 Order Management

- **Create orders** with the following fields:
  - `Order ID` (auto-generated or manual)
  - `Patient Name`
  - `Total Amount`
  - `Order Date` (auto-timestamped)
  - `Status` (pending, fulfilled, cancelled)
- **View all orders** in a sortable, paginated table
- **Update order details** (e.g., correct patient name or amount)
- **Delete orders** with confirmation prompts

### 3.2 Product Management

- Add new pharmaceutical products to the catalog
- Define product attributes: name, category, unit price, manufacturer, prescription required
- Edit existing product records
- Remove discontinued products

### 3.3 Inventory Management

- Track quantity-on-hand for every product
- Set reorder thresholds and receive low-stock alerts
- **Dynamically add new inventory items** — for example, during an outbreak like COVID-19, a manager can add masks, sanitizers, and PPE kits without any code changes
- Record inventory adjustments with date and reason

### 3.4 Cross-Cutting Features

- Form validation on both client-side (JavaScript) and server-side (Pydantic/FastAPI)
- RESTful API design for easy integration with third-party tools
- Interactive data tables with search and filter capabilities
- Responsive UI that works on desktop, tablet, and mobile

---

## 4. Frontend (UI)

### Technologies Used

| Technology | Purpose |
|---|---|
| **HTML5** | Page structure and semantic markup |
| **CSS3** | Custom styling and layout |
| **JavaScript (ES6+)** | Dynamic behavior, API calls, DOM manipulation |
| **Bootstrap 5** | Responsive grid, pre-built UI components, modals, forms |
| **Fetch API / Axios** | Asynchronous HTTP requests to the FastAPI backend |

### Folder Structure

```
frontend/
├── index.html                  # Landing page / Dashboard
├── orders/
│   ├── orders.html             # Order list view
│   └── order-form.html         # Create / Edit order form
├── products/
│   ├── products.html           # Product catalog view
│   └── product-form.html       # Create / Edit product form
├── inventory/
│   ├── inventory.html          # Inventory list view
│   └── inventory-form.html     # Add / Update inventory form
├── css/
│   ├── styles.css              # Global custom styles
│   └── dashboard.css           # Dashboard-specific styles
├── js/
│   ├── api.js                  # Centralized API call functions
│   ├── orders.js               # Order page logic
│   ├── products.js             # Product page logic
│   └── inventory.js            # Inventory page logic

```

### UI Pages Explained

**Dashboard (`index.html`)**
The home page displays summary cards showing total orders, total products, low-stock alerts, and recent activity. This gives pharmacy managers an at-a-glance operational view.

**Orders Page (`orders/orders.html`)**
A full-width data table displaying all patient orders. Each row has action buttons for editing or deleting. A prominent "New Order" button opens a modal or navigates to the order form.

**Order Form (`orders/order-form.html`)**
A clean, Bootstrap-styled form with fields for patient name, product selection (dropdown populated from the API), quantity, and total amount. Client-side validation ensures no empty submissions.

**Products Page (`products/products.html`)**
Displays the pharmacy's product catalog in a searchable, filterable table. Products can be sorted by name, category, or price.

**Inventory Page (`inventory/inventory.html`)**
Shows current stock levels for all products. Rows with quantity below the reorder threshold are highlighted in amber. Managers can click "Add Stock" to update inventory counts.

### UI Design Notes


---

## 5. Backend (FastAPI)

### Project Structure

```
backend/
├── main.py                     # FastAPI app entry point
├── database.py                 # Database engine and session factory
├── models/
│   ├── __init__.py
│   ├── order.py                # SQLAlchemy Order model
│   ├── product.py              # SQLAlchemy Product model
│   └── inventory.py            # SQLAlchemy Inventory model
├── schemas/
│   ├── __init__.py
│   ├── order.py                # Pydantic schemas for Orders
│   ├── product.py              # Pydantic schemas for Products
│   └── inventory.py            # Pydantic schemas for Inventory
├── routers/
│   ├── __init__.py
│   ├── orders.py               # Order API routes
│   ├── products.py             # Product API routes
│   └── inventory.py            # Inventory API routes
├── crud/
│   ├── __init__.py
│   ├── order.py                # CRUD operations for orders
│   ├── product.py              # CRUD operations for products
│   └── inventory.py            # CRUD operations for inventory
├── requirements.txt
└── .env                        # Environment variables (DB credentials)
```

### API Design Principles

- **RESTful conventions** — resources are nouns, HTTP verbs express actions (`GET`, `POST`, `PUT`, `DELETE`)
- **Pydantic validation** — all request bodies are validated against typed schemas before processing
- **Dependency Injection** — database sessions are injected into route handlers using FastAPI's `Depends()`
- **Separation of concerns** — routing, business logic (CRUD), and data models are kept in separate modules
- **Automatic documentation** — FastAPI generates interactive Swagger UI at `/docs` and ReDoc at `/redoc`

### Example API Endpoints

#### Orders

```python
# routers/orders.py

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
```

#### Products

```python
# routers/products.py  (abbreviated)

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/", response_model=list[ProductResponse])
def list_products(db: Session = Depends(get_db)): ...

@router.post("/", response_model=ProductResponse, status_code=201)
def add_product(product: ProductCreate, db: Session = Depends(get_db)): ...

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db)): ...

@router.delete("/{product_id}", status_code=204)
def remove_product(product_id: int, db: Session = Depends(get_db)): ...
```

#### Inventory Management

```python
# routers/inventory.py  (abbreviated)

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/", response_model=list[InventoryResponse])
def list_inventory(db: Session = Depends(get_db)): ...

@router.post("/", response_model=InventoryResponse, status_code=201)
def add_inventory_item(item: InventoryCreate, db: Session = Depends(get_db)):
    """
    Add a new inventory item. Useful for rapidly onboarding new products
    such as masks, sanitizers, or PPE during emergencies.
    """
    ...

@router.put("/{item_id}/restock", response_model=InventoryResponse)
def restock_item(item_id: int, quantity: int, db: Session = Depends(get_db)): ...
```

### Pydantic Schema Example

```python
# schemas/order.py

from pydantic import BaseModel, Field, constr
from datetime import datetime
from typing import Optional

class OrderCreate(BaseModel):
    patient_name: constr(min_length=2, max_length=100)
    product_id: int
    quantity: int = Field(gt=0, description="Must be a positive integer")
    total_amount: float = Field(gt=0.0, description="Must be greater than zero")

class OrderResponse(OrderCreate):
    order_id: int
    order_date: datetime
    status: str

    class Config:
        from_attributes = True  # Enables ORM mode (SQLAlchemy compatibility)
```

### Request / Response Flow

```
Browser (form submit)
    │
    ▼
JavaScript sends POST /orders/ with JSON body
    │
    ▼
FastAPI receives request → Pydantic validates body
    │── Validation fails → 422 Unprocessable Entity (returned to browser)
    │── Validation passes → continues
    ▼
CRUD function called → SQLAlchemy builds INSERT query
    │
    ▼
MySQL executes query → returns new row
    │
    ▼
SQLAlchemy ORM maps row → Python object
    │
    ▼
Pydantic serializes object → JSON response (201 Created)
    │
    ▼
JavaScript receives response → updates UI
```

---

## 6. Database (MySQL)

### Database Schema Overview

The database is named `pharmacy_db` and contains three primary tables: `products`, `orders`, and `inventory`. The `orders` table references `products` via a foreign key.

### Tables

#### `products` Table

```sql
CREATE TABLE products (
    product_id      INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150)    NOT NULL,
    category        VARCHAR(100)    NOT NULL,
    description     TEXT,
    unit_price      DECIMAL(10, 2)  NOT NULL,
    manufacturer    VARCHAR(150),
    requires_prescription BOOLEAN  DEFAULT FALSE,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);
```

#### `orders` Table

```sql
CREATE TABLE orders (
    order_id        INT AUTO_INCREMENT PRIMARY KEY,
    patient_name    VARCHAR(100)    NOT NULL,
    product_id      INT             NOT NULL,
    quantity        INT             NOT NULL CHECK (quantity > 0),
    total_amount    DECIMAL(10, 2)  NOT NULL,
    order_date      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    status          ENUM('pending', 'fulfilled', 'cancelled') DEFAULT 'pending',
    CONSTRAINT fk_orders_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);
```

#### `inventory` Table

```sql
CREATE TABLE inventory (
    inventory_id        INT AUTO_INCREMENT PRIMARY KEY,
    product_id          INT             NOT NULL UNIQUE,
    quantity_on_hand    INT             NOT NULL DEFAULT 0,
    reorder_threshold   INT             NOT NULL DEFAULT 10,
    last_updated        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
```

### Key and Relationship Explanation

- **Primary Keys** — Each table uses an `AUTO_INCREMENT INT` as its primary key, ensuring every row has a unique, system-assigned identifier.
- **Foreign Keys** — The `orders.product_id` column references `products.product_id`. This enforces referential integrity: you cannot create an order for a product that doesn't exist.
- **Cascade Rules** — `ON UPDATE CASCADE` ensures that if a product's ID changes, the orders table is updated automatically. `ON DELETE RESTRICT` prevents accidental deletion of a product that still has associated orders.
- **Unique Constraint** — `inventory.product_id` has a `UNIQUE` constraint because each product should have exactly one inventory record.

### Steps to Create the Database

```sql
-- Step 1: Connect to MySQL as root or admin user
-- mysql -u root -p

-- Step 2: Create the database
CREATE DATABASE IF NOT EXISTS pharmacy_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Step 3: Select the database
USE pharmacy_db;

-- Step 4: Run the CREATE TABLE statements above (products first, then orders, then inventory)

-- Step 5: Verify tables were created
SHOW TABLES;

-- Step 6: (Optional) Insert sample data
INSERT INTO products (name, category, unit_price, manufacturer, requires_prescription)
VALUES
    ('Paracetamol 500mg', 'Analgesic', 2.50, 'Generic Pharma', FALSE),
    ('Amoxicillin 250mg', 'Antibiotic', 8.75, 'MedCorp', TRUE),
    ('Surgical Mask (Pack of 50)', 'PPE', 15.00, 'SafeGuard Ltd', FALSE);

INSERT INTO inventory (product_id, quantity_on_hand, reorder_threshold)
VALUES (1, 200, 50), (2, 80, 20), (3, 500, 100);
```

---

## 7. Setup Instructions

### Prerequisites

Ensure the following are installed on your machine:

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **MySQL 8.0+** — [Download](https://dev.mysql.com/downloads/)
- **Node.js** (optional, only if using a frontend build tool) — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)
- A code editor such as **VS Code**

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/pharmacy-management-app.git
cd pharmacy-management-app
```

### Step 2: Set Up a Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate on macOS/Linux
source venv/bin/activate

# Activate on Windows
venv\Scripts\activate
```

### Step 3: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**`requirements.txt` contents:**

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy==2.0.30
pymysql==1.1.1
pydantic==2.7.1
python-dotenv==1.0.1
```

### Step 4: Configure the Database Connection

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=pharmacy_db
```

The `database.py` file reads these values to establish a connection:

```python
# backend/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = (
    f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Step 5: Create the Database and Tables

```bash
# Log into MySQL
mysql -u root -p

# Run the database setup script
source /path/to/pharmacy-management-app/database/schema.sql
```

Alternatively, if you use SQLAlchemy's `create_all()`:

```python
# Run once from backend/main.py or a separate init_db.py script
from database import Base, engine
from models import order, product, inventory  # Import all models

Base.metadata.create_all(bind=engine)
print("Database tables created successfully.")
```

### Step 6: Run the Backend Server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **Base URL:** `http://localhost:8000`
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Step 7: Run the Frontend

Since the frontend is plain HTML/CSS/JS, you can serve it using any static file server:

```bash
# Option A: Use Python's built-in server (from the frontend/ directory)
cd frontend
python -m http.server 5500

# Option B: Use VS Code Live Server extension
# Right-click index.html → "Open with Live Server"

# Option C: Use npx serve
npx serve frontend/ -p 5500
```

Open your browser and navigate to `http://localhost:5500`.

> **CORS Note:** To allow the frontend to call the FastAPI backend from a different port, add CORS middleware to `main.py`:

```python
# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import orders, products, inventory

app = FastAPI(title="Pharmacy Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500"],  # Add your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders.router)
app.include_router(products.router)
app.include_router(inventory.router)
```

---

## 8. Sample Workflow

### Placing a New Patient Order — End-to-End

This walkthrough traces a complete order submission from the UI to the database and back.

---

**Step 1 — Staff opens the New Order form**

The pharmacy technician navigates to `http://localhost:5500/orders/order-form.html`. The browser loads the form. JavaScript fires a `GET /products/` request to populate the product dropdown.

**Step 2 — Staff fills in the form**

The technician enters:
- Patient Name: `Sarah Johnson`
- Product: `Paracetamol 500mg` (selected from dropdown, `product_id = 1`)
- Quantity: `2`

JavaScript auto-calculates the total: `2 × $2.50 = $5.00`.

**Step 3 — Staff clicks "Submit Order"**

JavaScript intercepts the form's `submit` event, performs client-side validation (ensures no empty fields, quantity > 0), then sends:

```http
POST http://localhost:8000/orders/
Content-Type: application/json

{
  "patient_name": "Sarah Johnson",
  "product_id": 1,
  "quantity": 2,
  "total_amount": 5.00
}
```

**Step 4 — FastAPI receives and validates the request**

The `OrderCreate` Pydantic schema validates the body. All fields pass validation. The route handler calls `crud_order.create_order(db, order_data)`.

**Step 5 — CRUD function inserts into MySQL**

SQLAlchemy translates the Python object into:

```sql
INSERT INTO orders (patient_name, product_id, quantity, total_amount, status)
VALUES ('Sarah Johnson', 1, 2, 5.00, 'pending');
```

MySQL executes the insert and returns the new `order_id = 101` with a timestamp.

**Step 6 — API returns the response**

FastAPI serializes the new order as JSON and responds:

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "order_id": 101,
  "patient_name": "Sarah Johnson",
  "product_id": 1,
  "quantity": 2,
  "total_amount": 5.00,
  "order_date": "2025-06-01T14:23:45",
  "status": "pending"
}
```

**Step 7 — Frontend updates the UI**

JavaScript receives the `201` response, displays a green success toast notification: *"Order #101 created successfully for Sarah Johnson."*, and optionally redirects to the orders list page.

---

## 9. Future Enhancements

### Authentication and Role-Based Access Control (RBAC)

- Integrate **OAuth2 with JWT tokens** using FastAPI's built-in security utilities
- Define roles: `Admin`, `Pharmacist`, `Cashier`
- Restrict sensitive endpoints (e.g., delete operations) to admin roles only

### Reports and Analytics

- Add a `/reports/` module that aggregates sales data by date range, product, or category
- Export reports to PDF or Excel using libraries such as `reportlab` or `openpyxl`
- Build a dashboard with charts using **Chart.js** or **ApexCharts**

### Email / SMS Notifications

- Send order confirmation emails to patients using `FastAPI-Mail` or `SendGrid`
- Alert pharmacy managers via SMS when inventory drops below the reorder threshold using `Twilio`

### Advanced Inventory Features

- Support for **batch/lot tracking** and **expiry date monitoring**
- Automated **purchase order generation** when stock hits the reorder threshold
- Supplier management module for tracking vendor contacts and pricing

### Deployment

| Target | Recommendation |
|---|---|
| Backend | **Docker + Gunicorn** behind an **Nginx** reverse proxy on a cloud VM (AWS EC2, DigitalOcean) |
| Frontend | Deploy static files to **Netlify**, **Vercel**, or an **AWS S3 + CloudFront** distribution |
| Database | Use a managed database service: **AWS RDS (MySQL)**, **PlanetScale**, or **Google Cloud SQL** |
| CI/CD | Set up a **GitHub Actions** pipeline to run tests, lint code, and auto-deploy on merge to `main` |
| Containerization | Use **Docker Compose** for local development to orchestrate the backend and MySQL containers together |

### Testing

- Write unit tests for CRUD functions using **pytest**
- Write integration tests for API endpoints using **TestClient** from FastAPI
- Aim for >80% code coverage before deploying to production

---

## 10. Conclusion

The **Pharmacy Store Management Application** demonstrates how a clean, well-structured 3-tier architecture can power a practical business tool with minimal complexity. By decoupling the presentation layer (Bootstrap UI), the application layer (FastAPI), and the data layer (MySQL), the system is maintainable, testable, and extensible.

Key architectural decisions in this project — such as Pydantic validation, SQLAlchemy ORM, and RESTful API design — ensure that both the codebase and the data remain reliable as the application grows. The dynamic inventory capability, in particular, reflects a real-world business need: the ability to rapidly adapt to changing market demands without requiring deep technical changes.



---

