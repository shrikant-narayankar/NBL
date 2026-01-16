
import pytest
from app.crud import members_crud
from app.schemas.members import MemberCreate, MemberUpdate

@pytest.mark.asyncio
async def test_members_crud_full(async_session):
    # Create
    m = await members_crud.create(async_session, MemberCreate(name="M1", email="m1@test.com"))
    assert m.id is not None
    
    # Get by ID
    fetched = await members_crud.get_by_id(async_session, m.id)
    assert fetched.email == "m1@test.com"
    
    # Get by ID non-existent
    assert await members_crud.get_by_id(async_session, 999) is None
    
    # Update
    # Update object first
    m.name = "M1 Updated"
    updated = await members_crud.update(async_session, m)
    assert updated.name == "M1 Updated"
    
    # Pagination
    items, total = await members_crud.get_all_members(async_session, skip=0, limit=10)
    assert total == 1
    
    # Delete
    deleted = await members_crud.delete_by_id(async_session, m.id)
    assert deleted.id == m.id
    assert await members_crud.get_by_id(async_session, m.id) is None
