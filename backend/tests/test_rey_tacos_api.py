"""Backend tests for El Rey de los Tacos API"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://digital-taco-shop.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_USER = "matiasfrancese"
ADMIN_PASS = "matias123"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(session):
    r = session.post(f"{API}/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data
    assert data["username"] == ADMIN_USER
    return data["token"]


@pytest.fixture
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# -- Auth --
class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{API}/auth/login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data["token"], str) and len(data["token"]) > 0
        assert data["username"] == ADMIN_USER

    def test_login_invalid(self, session):
        r = session.post(f"{API}/auth/login", json={"username": "x", "password": "y"})
        assert r.status_code == 401


# -- Public reads / seed validation --
class TestPublicReads:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200

    def test_categories_seeded(self, session):
        r = session.get(f"{API}/categories")
        assert r.status_code == 200
        cats = r.json()
        assert len(cats) >= 4
        names = {c["name"] for c in cats}
        for expected in ["Tacos", "Corn Dogs", "Postres", "Bebidas"]:
            assert expected in names, f"missing category {expected}"
        # ensure no _id leak
        assert all("_id" not in c for c in cats)

    def test_products_seeded(self, session):
        r = session.get(f"{API}/products")
        assert r.status_code == 200
        prods = r.json()
        assert len(prods) >= 9
        # at least one taco
        tacos = [p for p in prods if p.get("is_taco")]
        assert len(tacos) >= 3
        assert all("_id" not in p for p in prods)

    def test_sauces_seeded(self, session):
        r = session.get(f"{API}/sauces")
        assert r.status_code == 200
        sauces = r.json()
        assert len(sauces) >= 7
        assert all("_id" not in s for s in sauces)


# -- Auth protection --
class TestAuthProtection:
    def test_create_category_no_auth(self, session):
        r = session.post(f"{API}/categories", json={"name": "X", "order": 99})
        assert r.status_code == 401

    def test_create_product_no_auth(self, session):
        r = session.post(f"{API}/products", json={"category_id": "x", "name": "X", "price": 1})
        assert r.status_code == 401

    def test_create_sauce_no_auth(self, session):
        r = session.post(f"{API}/sauces", json={"name": "X"})
        assert r.status_code == 401

    def test_bad_token(self, session):
        r = session.post(f"{API}/categories", json={"name": "X", "order": 1},
                         headers={"Authorization": "Bearer wrong"})
        assert r.status_code == 401


# -- Category CRUD --
class TestCategoryCRUD:
    def test_full_cycle(self, session, auth_headers):
        # CREATE
        r = session.post(f"{API}/categories", json={"name": "TEST_Promos", "order": 50}, headers=auth_headers)
        assert r.status_code == 200
        cat = r.json()
        cid = cat["id"]
        assert cat["name"] == "TEST_Promos"
        assert cat["order"] == 50

        # GET (verify persisted)
        cats = session.get(f"{API}/categories").json()
        assert any(c["id"] == cid for c in cats)

        # UPDATE
        r = session.put(f"{API}/categories/{cid}", json={"name": "TEST_Promos2", "order": 51}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["name"] == "TEST_Promos2"

        # verify persisted
        cats = session.get(f"{API}/categories").json()
        cat_now = next(c for c in cats if c["id"] == cid)
        assert cat_now["name"] == "TEST_Promos2"

        # DELETE
        r = session.delete(f"{API}/categories/{cid}", headers=auth_headers)
        assert r.status_code == 200
        cats = session.get(f"{API}/categories").json()
        assert not any(c["id"] == cid for c in cats)

    def test_update_nonexistent(self, session, auth_headers):
        r = session.put(f"{API}/categories/does-not-exist",
                        json={"name": "X", "order": 0}, headers=auth_headers)
        assert r.status_code == 404


# -- Product CRUD --
class TestProductCRUD:
    def test_full_cycle(self, session, auth_headers):
        cats = session.get(f"{API}/categories").json()
        cid = cats[0]["id"]
        payload = {
            "category_id": cid,
            "name": "TEST_Burrito",
            "description": "Test product",
            "price": 3000,
            "image_url": "https://example.com/x.jpg",
            "stock": 50,
            "is_taco": False,
        }
        r = session.post(f"{API}/products", json=payload, headers=auth_headers)
        assert r.status_code == 200
        p = r.json()
        pid = p["id"]
        assert p["name"] == "TEST_Burrito"
        assert p["price"] == 3000

        # GET verify
        prods = session.get(f"{API}/products").json()
        assert any(x["id"] == pid for x in prods)

        # UPDATE
        payload["price"] = 3500
        payload["is_taco"] = True
        r = session.put(f"{API}/products/{pid}", json=payload, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["price"] == 3500
        assert r.json()["is_taco"] is True

        # DELETE
        r = session.delete(f"{API}/products/{pid}", headers=auth_headers)
        assert r.status_code == 200
        prods = session.get(f"{API}/products").json()
        assert not any(x["id"] == pid for x in prods)


# -- Sauce CRUD --
class TestSauceCRUD:
    def test_full_cycle(self, session, auth_headers):
        r = session.post(f"{API}/sauces", json={"name": "TEST_Mayo", "description": "test"}, headers=auth_headers)
        assert r.status_code == 200
        sid = r.json()["id"]

        # update
        r = session.put(f"{API}/sauces/{sid}", json={"name": "TEST_Mayo2", "description": "x"}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["name"] == "TEST_Mayo2"

        # verify in list
        sauces = session.get(f"{API}/sauces").json()
        assert any(s["id"] == sid for s in sauces)

        # delete
        r = session.delete(f"{API}/sauces/{sid}", headers=auth_headers)
        assert r.status_code == 200
        sauces = session.get(f"{API}/sauces").json()
        assert not any(s["id"] == sid for s in sauces)
