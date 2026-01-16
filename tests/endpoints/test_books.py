
import pytest
from fastapi.testclient import TestClient
from app.core.settings import settings

class TestBooks:
    @pytest.mark.asyncio
    async def test_create_book(self, client: TestClient):
        response = client.post(
            f"{settings.API_STR}/v1/books/",
            json={
                "title": "Test Book",
                "author": "Test Author",
                "isbn": "1234567890",
                "total_copies": 5,
                "available_copies": 5
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Book"
        assert data["id"] is not None

    @pytest.mark.asyncio
    async def test_read_books(self, client: TestClient):
        # Create a book first (could be done via fixture too)
        client.post(
            f"{settings.API_STR}/v1/books/",
            json={"title": "B1", "author": "A1", "isbn": "111", "total_copies": 1}
        )
        
        response = client.get(f"{settings.API_STR}/v1/books/")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) >= 1
        assert "total" in data

    @pytest.mark.asyncio
    async def test_update_book(self, client: TestClient):
        # Create
        create_res = client.post(
            f"{settings.API_STR}/v1/books/",
            json={"title": "Old Title", "author": "Auth", "isbn": "222", "total_copies": 1}
        )
        book_id = create_res.json()["id"]

        # Update
        response = client.patch(
            f"{settings.API_STR}/v1/books/{book_id}",
            json={"title": "New Title"}
        )
        assert response.status_code == 200
        assert response.json()["title"] == "New Title"

    @pytest.mark.asyncio
    async def test_delete_book(self, client: TestClient):
        # Create
        create_res = client.post(
            f"{settings.API_STR}/v1/books/",
            json={"title": "Delete Me", "author": "Auth", "isbn": "333", "total_copies": 1}
        )
        book_id = create_res.json()["id"]

        # Delete
        response = client.delete(f"{settings.API_STR}/v1/books/{book_id}")
        assert response.status_code == 204

        # Verify gone
        get_res = client.get(f"{settings.API_STR}/v1/books/?q=Delete Me")
        assert get_res.status_code == 200
        items = get_res.json()["items"]
        assert not any(b["id"] == book_id for b in items)

    @pytest.mark.asyncio
    async def test_search_books(self, client: TestClient):
        # Create books
        client.post(f"{settings.API_STR}/v1/books/", json={"title": "Python 101", "author": "Guido", "isbn": "P1", "total_copies": 1})
        client.post(f"{settings.API_STR}/v1/books/", json={"title": "Java 101", "author": "Gosling", "isbn": "J1", "total_copies": 1})
        
        # Search match
        res = client.get(f"{settings.API_STR}/v1/books/?q=Python")
        assert res.status_code == 200
        items = res.json()["items"]
        assert len(items) == 1
        assert items[0]["title"] == "Python 101"

        # Search no match
        res = client.get(f"{settings.API_STR}/v1/books/?q=Rust")
        assert res.status_code == 200
        assert len(res.json()["items"]) == 0

    @pytest.mark.asyncio
    async def test_update_book_isbn_conflict(self, client: TestClient):
        # Create two books
        b1 = client.post(f"{settings.API_STR}/v1/books/", json={"title": "B1", "author": "A", "isbn": "ISBN1", "total_copies": 1}).json()
        b2 = client.post(f"{settings.API_STR}/v1/books/", json={"title": "B2", "author": "A", "isbn": "ISBN2", "total_copies": 1}).json()

        # Try to update b2 with b1's ISBN
        res = client.patch(f"{settings.API_STR}/v1/books/{b2['id']}", json={"isbn": "ISBN1"})
        assert res.status_code == 409

    @pytest.mark.asyncio
    async def test_update_non_existing_book(self, client: TestClient):
        res = client.patch(f"{settings.API_STR}/v1/books/99999", json={"title": "Ghost"})
        assert res.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_non_existing_book(self, client: TestClient):
        res = client.delete(f"{settings.API_STR}/v1/books/99999")
        assert res.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_book_with_active_borrows(self, client: TestClient):
        from datetime import date
        # Create book and member
        book = client.post(f"{settings.API_STR}/v1/books/", json={"title": "Borrowed Book", "author": "A", "isbn": "BB1", "total_copies": 1}).json()
        member = client.post(f"{settings.API_STR}/v1/members/", json={"name": "M1", "email": "m1@test.com"}).json()

        # Borrow
        client.post(f"{settings.API_STR}/v1/borrow/", json={
            "book_id": book['id'],
            "member_id": member['id'],
            "borrowed_date": str(date.today()),
            "due_date": str(date.today())
        })

        # Try delete
        res = client.delete(f"{settings.API_STR}/v1/books/{book['id']}")
        assert res.status_code == 400

