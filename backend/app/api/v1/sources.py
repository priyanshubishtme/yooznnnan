"""Admin source registry and policy management endpoints."""

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.envelope import success_response
from backend.app.db.models import Source
from backend.app.db.session import get_db

router = APIRouter(prefix="/admin/sources", tags=["Admin Sources"])


@router.get("")
async def list_sources(request: Request, db: AsyncSession = Depends(get_db)):
    """Lists registered government sources with compliance and policy states."""
    request_id = getattr(request.state, "request_id", "direct")
    result = await db.execute(select(Source).order_by(Source.source_id))
    sources = result.scalars().all()

    items = [
        {
            "source_id": s.source_id,
            "name": s.name,
            "base_url": s.base_url,
            "source_family": s.source_family,
            "jurisdiction": s.jurisdiction,
            "language_hints": s.language_hints,
            "source_role": s.source_role,
            "adapter_key": s.adapter_key,
            "fetch_mode": s.fetch_mode,
            "allowed_content_types": s.allowed_content_types,
            "permission_status": s.permission_status,
            "automation_status": s.automation_status,
            "notes": s.notes,
            "schedule_cron": s.schedule_cron,
            "enabled": s.enabled,
            "last_success_at": s.last_success_at.isoformat() if s.last_success_at else None,
            "last_error_at": s.last_error_at.isoformat() if s.last_error_at else None,
            "last_error_code": s.last_error_code
        }
        for s in sources
    ]

    return success_response(data=items, request_id=request_id)
