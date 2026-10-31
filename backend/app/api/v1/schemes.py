"""Public scheme catalogue and detail endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.envelope import error_response, success_response
from backend.app.core.errors import AppException
from backend.app.db.models import Scheme
from backend.app.db.session import get_db

router = APIRouter(prefix="/schemes", tags=["Schemes"])


@router.get("")
async def list_schemes(
    request: Request,
    q: Optional[str] = Query(None, description="Search term for name or description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    level: Optional[str] = Query(None, description="Filter by jurisdiction level (central/state)"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """Lists schemes with search and category filters."""
    request_id = getattr(request.state, "request_id", "direct")
    query = select(Scheme)

    if category:
        query = query.where(Scheme.category == category)
    if level:
        query = query.where(Scheme.level == level)
    if q:
        search_filter = f"%{q}%"
        query = query.where(
            or_(
                Scheme.name_en.ilike(search_filter),
                Scheme.name_hi.ilike(search_filter),
                Scheme.description_en.ilike(search_filter),
                Scheme.description_hi.ilike(search_filter),
                Scheme.short_name.ilike(search_filter)
            )
        )

    # Order by category and name
    query = query.order_by(Scheme.category, Scheme.name_en).limit(limit).offset(offset)
    result = await db.execute(query)
    schemes = result.scalars().all()

    items = [
        {
            "scheme_id": s.scheme_id,
            "code": s.code,
            "name_en": s.name_en,
            "name_hi": s.name_hi,
            "short_name": s.short_name,
            "level": s.level,
            "ministry_or_dept": s.ministry_or_dept,
            "category": s.category,
            "description_en": s.description_en,
            "description_hi": s.description_hi,
            "initial_mode": s.initial_mode,
            "rule_scope": s.rule_scope,
            "rag_enabled": s.rag_enabled,
            "rules_enabled": s.rules_enabled,
            "official_portal_url": s.official_portal_url,
            "benefits_summary_en": s.benefits_summary_en,
            "benefits_summary_hi": s.benefits_summary_hi
        }
        for s in schemes
    ]

    pagination = {
        "limit": limit,
        "offset": offset,
        "count": len(items)
    }

    return success_response(data=items, request_id=request_id, pagination=pagination)


@router.get("/{scheme_id}")
async def get_scheme_detail(
    scheme_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Retrieves full scheme detail by scheme_id."""
    request_id = getattr(request.state, "request_id", "direct")
    result = await db.execute(select(Scheme).where(Scheme.scheme_id == scheme_id))
    scheme = result.scalar_one_or_none()

    if not scheme:
        raise AppException(
            code="SCHEME_NOT_FOUND",
            message=f"Scheme with ID '{scheme_id}' was not found",
            status_code=404
        )

    data = {
        "scheme_id": scheme.scheme_id,
        "code": scheme.code,
        "name_en": scheme.name_en,
        "name_hi": scheme.name_hi,
        "short_name": scheme.short_name,
        "level": scheme.level,
        "ministry_or_dept": scheme.ministry_or_dept,
        "category": scheme.category,
        "description_en": scheme.description_en,
        "description_hi": scheme.description_hi,
        "initial_mode": scheme.initial_mode,
        "rule_scope": scheme.rule_scope,
        "rag_enabled": scheme.rag_enabled,
        "rules_enabled": scheme.rules_enabled,
        "official_portal_url": scheme.official_portal_url,
        "benefits_summary_en": scheme.benefits_summary_en,
        "benefits_summary_hi": scheme.benefits_summary_hi
    }

    # Load only verified documents linked to this scheme (Blueprint Section 5.2 & Gate Rule)
    from backend.app.db.models import Document, DocumentVersion, SchemeDocument

    doc_query = (
        select(Document, DocumentVersion)
        .join(SchemeDocument, Document.id == SchemeDocument.document_id)
        .join(DocumentVersion, Document.id == DocumentVersion.document_id)
        .where(
            SchemeDocument.scheme_id == scheme_id,
            Document.status == "verified",
            DocumentVersion.status == "verified"
        )
    )
    doc_res = await db.execute(doc_query)
    verified_docs = [
        {
            "document_id": doc.id,
            "title": doc.title,
            "document_type": doc.document_type,
            "version_id": ver.id,
            "version_number": ver.version_number,
            "storage_key": ver.storage_key,
            "content_type": ver.content_type,
            "binary_sha256": ver.binary_sha256
        }
        for doc, ver in doc_res.all()
    ]
    data["verified_documents"] = verified_docs

    # Active human-verified eligibility rules with official page citations
    from backend.app.db.models import EligibilityRule, RuleDocumentDependency
    rules_res = await db.execute(
        select(EligibilityRule).where(
            EligibilityRule.scheme_id == scheme_id,
            EligibilityRule.status == "active"
        )
    )
    active_rules = []
    for r in rules_res.scalars().all():
        dep_res = await db.execute(select(RuleDocumentDependency).where(RuleDocumentDependency.rule_id == r.id))
        dep = dep_res.scalars().first()
        active_rules.append({
            "id": r.id,
            "rule_code": r.rule_code,
            "version": r.version,
            "logic_expression": r.logic_expression,
            "evidence_quote": r.evidence_quote,
            "page_reference": r.page_reference,
            "document_version_id": dep.document_version_id if dep else None
        })
    data["active_rules"] = active_rules

    return success_response(data=data, request_id=request_id)

