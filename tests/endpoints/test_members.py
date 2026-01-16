
import pytest
from fastapi.testclient import TestClient
from app.core.settings import settings

class TestMembers:
    @pytest.mark.asyncio
    async def test_create_member(self, client: TestClient):
        response = client.post(
            f"{settings.API_STR}/v1/members/",
            json={
                "name": "John Doe",
                "email": "john@example.com"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "john@example.com"
        assert "id" in data

    @pytest.mark.asyncio
    async def test_read_members(self, client: TestClient):
        client.post(
            f"{settings.API_STR}/v1/members/",
            json={"name": "Jane", "email": "jane@example.com"}
        )
        
        response = client.get(f"{settings.API_STR}/v1/members/")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 1

    @pytest.mark.asyncio
    async def test_update_member(self, client: TestClient):
        create_res = client.post(
            f"{settings.API_STR}/v1/members/",
            json={"name": "Old Name", "email": "old@example.com"}
        )
        member_id = create_res.json()["id"]

        response = client.patch(
            f"{settings.API_STR}/v1/members/{member_id}",
            json={"name": "New Name"}
        )
        assert response.status_code == 200
        assert response.json()["name"] == "New Name"

    @pytest.mark.asyncio
    async def test_delete_member(self, client: TestClient):
        create_res = client.post(
            f"{settings.API_STR}/v1/members/",
            json={"name": "Delete Me", "email": "delete@example.com"}
        )
        member_id = create_res.json()["id"]

        response = client.delete(f"{settings.API_STR}/v1/members/{member_id}")
        assert response.status_code == 204

    @pytest.mark.asyncio
    async def test_duplicate_email(self, client: TestClient):
        data = {"name": "Test", "email": "duplicate@example.com"}
        client.post(f"{settings.API_STR}/v1/members/", json=data)
        response = client.post(f"{settings.API_STR}/v1/members/", json=data)
        assert response.status_code == 409

    @pytest.mark.asyncio
    async def test_update_non_existing_member(self, client: TestClient):
        res = client.patch(f"{settings.API_STR}/v1/members/99999", json={"name": "Ghost"})
        assert res.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_non_existing_member(self, client: TestClient):
        res = client.delete(f"{settings.API_STR}/v1/members/99999")
        assert res.status_code == 404

    @pytest.mark.asyncio
    async def test_get_member_borrows(self, client: TestClient):
        # Setup
        m = client.post(f"{settings.API_STR}/v1/members/", json={"name": "History Check", "email": "h@h.com"}).json()
        b = client.post(f"{settings.API_STR}/v1/books/", json={"title": "H Book", "author": "H", "isbn": "HH", "total_copies": 2}).json()
        
        # Borrow
        client.post(f"{settings.API_STR}/v1/borrow/", json={
            "book_id": b['id'],
            "member_id": m['id'],
            "borrowed_date": "2023-01-01",
            "due_date": "2023-01-08"
        })
        
        # Check history
        res = client.get(f"{settings.API_STR}/v1/members/{m['id']}/borrows")
        assert res.status_code == 200
        items = res.json()["items"]
        assert len(items) == 1
        assert items[0]['book']['title'] == "H Book"

