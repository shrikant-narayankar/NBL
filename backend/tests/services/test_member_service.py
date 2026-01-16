
import pytest
from app.services import member_service
from app.schemas.members import MemberCreate, MemberUpdate
from fastapi import HTTPException

@pytest.mark.asyncio
async def test_member_service_full(async_session):
    # Create
    m = await member_service.create_member(async_session, MemberCreate(name="Srv Mem", email="sm@t.com"))
    
    # Get Members
    items, total = await member_service.get_members(async_session)
    assert total >= 1
    
    # Update Happy
    u = await member_service.update_member(async_session, m.id, MemberUpdate(name="Srv Mem Upd"))
    assert u.name == "Srv Mem Upd"
    
    # Update Not Found
    with pytest.raises(HTTPException) as exc:
        await member_service.update_member(async_session, 999, MemberUpdate(name="X"))
    assert exc.value.status_code == 404
    
    # Delete
    await member_service.delete_member(async_session, m.id)
    with pytest.raises(HTTPException) as exc:
        await member_service.update_member(async_session, m.id, MemberUpdate(name="X"))
    assert exc.value.status_code == 404
    
    # Delete Not Found
    with pytest.raises(HTTPException) as exc:
        await member_service.delete_member(async_session, 999)
    assert exc.value.status_code == 404
