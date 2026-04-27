from fastapi import FastAPI, APIRouter, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ---- Hardcoded admin credentials ----
ADMIN_USER = "matiasfrancese"
ADMIN_PASS = "matias123"
ADMIN_TOKEN = "rey-de-los-tacos-secret-2026"

def require_admin(authorization: Optional[str] = Header(None)):
    if not authorization or authorization.replace("Bearer ", "") != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="No autorizado")

# ---- Models ----
class LoginIn(BaseModel):
    username: str
    password: str

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    order: int = 0

class CategoryIn(BaseModel):
    name: str
    order: int = 0

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category_id: str
    name: str
    description: str = ""
    price: float
    image_url: str = ""
    stock: int = 999
    is_taco: bool = False

class ProductIn(BaseModel):
    category_id: str
    name: str
    description: str = ""
    price: float
    image_url: str = ""
    stock: int = 999
    is_taco: bool = False

class Sauce(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""

class SauceIn(BaseModel):
    name: str
    description: str = ""

# ---- Auth ----
@api_router.post("/auth/login")
async def login(payload: LoginIn):
    if payload.username == ADMIN_USER and payload.password == ADMIN_PASS:
        return {"token": ADMIN_TOKEN, "username": ADMIN_USER}
    raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

# ---- Categories ----
@api_router.get("/categories", response_model=List[Category])
async def list_categories():
    docs = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    return docs

@api_router.post("/categories", response_model=Category)
async def create_category(payload: CategoryIn, authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    cat = Category(**payload.model_dump())
    await db.categories.insert_one(cat.model_dump())
    return cat

@api_router.put("/categories/{cat_id}", response_model=Category)
async def update_category(cat_id: str, payload: CategoryIn, authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    res = await db.categories.find_one_and_update(
        {"id": cat_id}, {"$set": payload.model_dump()}, return_document=True, projection={"_id": 0}
    )
    if not res:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return res

@api_router.delete("/categories/{cat_id}")
async def delete_category(cat_id: str, authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    await db.categories.delete_one({"id": cat_id})
    await db.products.delete_many({"category_id": cat_id})
    return {"ok": True}

# ---- Products ----
@api_router.get("/products", response_model=List[Product])
async def list_products():
    docs = await db.products.find({}, {"_id": 0}).to_list(2000)
    return docs

@api_router.post("/products", response_model=Product)
async def create_product(payload: ProductIn, authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    p = Product(**payload.model_dump())
    await db.products.insert_one(p.model_dump())
    return p

@api_router.put("/products/{pid}", response_model=Product)
async def update_product(pid: str, payload: ProductIn, authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    res = await db.products.find_one_and_update(
        {"id": pid}, {"$set": payload.model_dump()}, return_document=True, projection={"_id": 0}
    )
    if not res:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return res

@api_router.delete("/products/{pid}")
async def delete_product(pid: str, authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    await db.products.delete_one({"id": pid})
    return {"ok": True}

# ---- Sauces ----
@api_router.get("/sauces", response_model=List[Sauce])
async def list_sauces():
    docs = await db.sauces.find({}, {"_id": 0}).to_list(100)
    return docs

@api_router.post("/sauces", response_model=Sauce)
async def create_sauce(payload: SauceIn, authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    s = Sauce(**payload.model_dump())
    await db.sauces.insert_one(s.model_dump())
    return s

@api_router.put("/sauces/{sid}", response_model=Sauce)
async def update_sauce(sid: str, payload: SauceIn, authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    res = await db.sauces.find_one_and_update(
        {"id": sid}, {"$set": payload.model_dump()}, return_document=True, projection={"_id": 0}
    )
    if not res:
        raise HTTPException(status_code=404, detail="Salsa no encontrada")
    return res

@api_router.delete("/sauces/{sid}")
async def delete_sauce(sid: str, authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    await db.sauces.delete_one({"id": sid})
    return {"ok": True}

# ---- Seed sample data ----
@api_router.post("/seed")
async def seed():
    if await db.categories.count_documents({}) > 0:
        return {"seeded": False, "reason": "Ya hay datos"}

    cats = [
        Category(name="Tacos", order=1),
        Category(name="Corn Dogs", order=2),
        Category(name="Postres", order=3),
        Category(name="Bebidas", order=4),
    ]
    for c in cats:
        await db.categories.insert_one(c.model_dump())

    products = [
        Product(category_id=cats[0].id, name="Taco al Pastor", description="Cerdo marinado, piña, cilantro y cebolla.", price=2500, image_url="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600", is_taco=True),
        Product(category_id=cats[0].id, name="Taco de Carne Asada", description="Carne a la parrilla con guacamole fresco.", price=2800, image_url="https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=600", is_taco=True),
        Product(category_id=cats[0].id, name="Taco de Pollo", description="Pollo desmenuzado, queso y pico de gallo.", price=2300, image_url="https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600", is_taco=True),
        Product(category_id=cats[1].id, name="Corn Dog Clásico", description="Salchicha rebozada en masa de maíz dorada.", price=1800, image_url="https://images.unsplash.com/photo-1619740455993-8e577d40fcfd?w=600"),
        Product(category_id=cats[1].id, name="Corn Dog con Queso", description="Relleno extra de queso cheddar derretido.", price=2100, image_url="https://images.unsplash.com/photo-1606755456293-2dde9da41a06?w=600"),
        Product(category_id=cats[2].id, name="Churros con Dulce de Leche", description="Crocantes por fuera, suaves por dentro.", price=1600, image_url="https://images.unsplash.com/photo-1624371414361-e670edf4898d?w=600"),
        Product(category_id=cats[2].id, name="Flan Casero", description="Flan tradicional con caramelo.", price=1400, image_url="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600"),
        Product(category_id=cats[3].id, name="Coca Cola 500ml", description="Bebida bien fría.", price=1200, image_url="https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600"),
        Product(category_id=cats[3].id, name="Agua Mineral", description="Botella 500ml.", price=900, image_url="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600"),
    ]
    for p in products:
        await db.products.insert_one(p.model_dump())

    sauces = [
        Sauce(name="Salsa Roja", description="Tomate y chile picante."),
        Sauce(name="Salsa Verde", description="Tomatillo y cilantro fresco."),
        Sauce(name="Guacamole", description="Palta cremosa con limón."),
        Sauce(name="Chipotle", description="Ahumada y picante."),
        Sauce(name="Salsa de Ajo", description="Crema de ajo suave."),
        Sauce(name="Pico de Gallo", description="Tomate, cebolla y cilantro."),
        Sauce(name="Habanero", description="Muy picante - solo para valientes."),
    ]
    for s in sauces:
        await db.sauces.insert_one(s.model_dump())

    return {"seeded": True}

@api_router.get("/")
async def root():
    return {"message": "El Rey de los Tacos API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_seed():
    try:
        if await db.categories.count_documents({}) == 0:
            await seed()
            logger.info("Datos iniciales cargados")
    except Exception as e:
        logger.warning(f"Seed error: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
