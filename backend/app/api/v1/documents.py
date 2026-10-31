"""Admin Document Ingestion and Coordinate Extraction API.

Enforces Blueprint Section 7.1 - 7.5:
- Shared single ingestion path for discovered and uploaded documents.
- Point coordinate inspection for every chunk and line box.
- Visual diagnostic rendering verification.
"""

from pathlib import Path
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.config import settings
from backend.app.core.envelope import success_response
from backend.app.core.errors import AppException
from backend.app.db.base import utc_now
from backend.app.db.models import (
    AuditEvent,
    Chunk,
    ChunkBox,
    Document,
    DocumentVersion,
    Page,
    Scheme,
    SchemeDocument
)
from backend.app.db.session import get_db
from backend.app.discovery.storage import storage_service
from backend.app.ingest.service import pdf_ingestion_service

router = APIRouter(prefix="/admin/documents", tags=["Admin Documents & Ingestion"])


@router.get("")
async def list_documents(
    request: Request,
    scheme_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Lists registered documents, immutable versions, and chunking states."""
    request_id = getattr(request.state, "request_id", "direct")
    query = (
        select(Document, DocumentVersion, SchemeDocument.scheme_id)
        .join(DocumentVersion, Document.id == DocumentVersion.document_id)
        .outerjoin(SchemeDocument, Document.id == SchemeDocument.document_id)
        .order_by(desc(DocumentVersion.fetched_at))
        .limit(limit)
    )

    if scheme_id:
        query = query.where(SchemeDocument.scheme_id == scheme_id)
    if status_filter:
        query = query.where(DocumentVersion.status == status_filter)

    res = await db.execute(query)
    rows = res.all()

    items = []
    for doc, ver, s_id in rows:
        # Count chunks for this version
        chunks_count_res = await db.execute(select(Chunk).where(Chunk.document_version_id == ver.id))
        chunk_count = len(chunks_count_res.scalars().all())

        items.append({
            "document_id": doc.id,
            "title": doc.title,
            "document_type": doc.document_type,
            "scheme_id": s_id,
            "version_id": ver.id,
            "version_number": ver.version_number,
            "binary_sha256": ver.binary_sha256,
            "status": ver.status,
            "page_count": ver.page_count,
            "chunk_count": chunk_count,
            "content_type": ver.content_type,
            "storage_key": ver.storage_key,
            "ingested_at": ver.ingested_at.isoformat() if ver.ingested_at else None,
            "created_at": ver.discovered_at.isoformat() if ver.discovered_at else None
        })

    return success_response(data=items, request_id=request_id)


@router.get("/{version_id}")
async def get_document_version(
    version_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Retrieves document version details, page count, and chunk telemetry."""
    request_id = getattr(request.state, "request_id", "direct")
    res = await db.execute(
        select(DocumentVersion, Document, SchemeDocument.scheme_id)
        .join(Document, DocumentVersion.document_id == Document.id)
        .outerjoin(SchemeDocument, Document.id == SchemeDocument.document_id)
        .where(DocumentVersion.id == version_id)
    )
    row = res.first()
    if not row:
        raise AppException(code="VERSION_NOT_FOUND", message=f"Version '{version_id}' not found", status_code=404)

    ver, doc, s_id = row

    pages_res = await db.execute(select(Page).where(Page.document_version_id == version_id))
    pages = pages_res.scalars().all()

    chunks_res = await db.execute(select(Chunk).where(Chunk.document_version_id == version_id))
    chunks = chunks_res.scalars().all()

    data = {
        "version_id": ver.id,
        "document_id": doc.id,
        "title": doc.title,
        "document_type": doc.document_type,
        "scheme_id": s_id,
        "version_number": ver.version_number,
        "binary_sha256": ver.binary_sha256,
        "normalized_text_sha256": ver.normalized_text_sha256,
        "status": ver.status,
        "page_count": len(pages),
        "chunk_count": len(chunks),
        "content_type": ver.content_type,
        "storage_key": ver.storage_key,
        "source_url": ver.source_url,
        "ingested_at": ver.ingested_at.isoformat() if ver.ingested_at else None
    }
    return success_response(data=data, request_id=request_id)


@router.post("/{version_id}/ingest")
async def ingest_document(
    version_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Runs coordinate extraction and page-bounded chunking via the shared ingestion service."""
    request_id = getattr(request.state, "request_id", "direct")
    result = await pdf_ingestion_service.ingest_document_version(
        db=db,
        version_id=version_id,
        actor="admin_api"
    )
    return success_response(data=result, request_id=request_id)


@router.post("/upload")
async def upload_and_ingest_document(
    request: Request,
    scheme_id: str = Form(...),
    document_title: str = Form(...),
    document_type: str = Form("guideline"),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Manual PDF upload entering the identical shared coordinate ingestion pipeline (Blueprint Section 7.1)."""
    request_id = getattr(request.state, "request_id", "direct")

    # Validate scheme exists
    scheme_res = await db.execute(select(Scheme).where(Scheme.scheme_id == scheme_id))
    scheme = scheme_res.scalar_one_or_none()
    if not scheme:
        raise AppException(code="SCHEME_NOT_FOUND", message=f"Scheme '{scheme_id}' not found", status_code=404)

    file_bytes = await file.read()
    if not file_bytes:
        raise AppException(code="EMPTY_FILE", message="Uploaded file is empty", status_code=400)

    # 1. Store immutably in content-addressable storage
    storage_path, sha256_hex = storage_service.store_bytes(
        content_bytes=file_bytes,
        content_type=file.content_type or "application/pdf"
    )

    # 2. Create logical Document and SchemeDocument
    doc_id = f"doc-{uuid.uuid4().hex[:12]}"
    doc = Document(
        id=doc_id,
        title=document_title,
        document_type=document_type,
        issuer=scheme.ministry_or_dept or "Central Ministry",
        jurisdiction=scheme.level,
        status="verified"
    )
    db.add(doc)

    sd = SchemeDocument(scheme_id=scheme_id, document_id=doc_id, is_primary=True)
    db.add(sd)

    # 3. Create DocumentVersion
    ver_id = f"ver-{uuid.uuid4().hex[:12]}"
    version = DocumentVersion(
        id=ver_id,
        document_id=doc_id,
        version_number=1,
        binary_sha256=sha256_hex,
        storage_key=storage_path,
        content_type=file.content_type or "application/pdf",
        source_url=f"upload://{file.filename}",
        status="verified"
    )
    db.add(version)
    await db.commit()

    # 4. Process via Shared Ingestion Pipeline
    ingest_result = await pdf_ingestion_service.ingest_document_version(
        db=db,
        version_id=ver_id,
        actor="manual_uploader"
    )

    return success_response(
        data={
            "document_id": doc_id,
            "version_id": ver_id,
            "ingestion": ingest_result
        },
        request_id=request_id
    )


@router.get("/{version_id}/pages")
async def get_version_pages(
    version_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Returns page-level dimensions, word counts, and OCR flags."""
    request_id = getattr(request.state, "request_id", "direct")
    res = await db.execute(
        select(Page)
        .where(Page.document_version_id == version_id)
        .order_by(Page.page_number)
    )
    pages = res.scalars().all()

    items = [
        {
            "id": p.id,
            "page_number": p.page_number,
            "width": p.width,
            "height": p.height,
            "rotation": p.rotation,
            "word_count": p.word_count,
            "ocr_used": p.ocr_used
        }
        for p in pages
    ]
    return success_response(data=items, request_id=request_id)


@router.get("/{version_id}/chunks")
async def get_version_chunks(
    version_id: str,
    request: Request,
    page_number: Optional[int] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db)
):
    """Returns page-bounded chunks with ordered line bounding boxes."""
    request_id = getattr(request.state, "request_id", "direct")
    query = select(Chunk).where(Chunk.document_version_id == version_id)

    if page_number is not None:
        query = query.where(Chunk.page_number == page_number)

    query = query.order_by(Chunk.page_number, Chunk.chunk_index).limit(limit)
    res = await db.execute(query)
    chunks = res.scalars().all()

    items = []
    for chk in chunks:
        boxes_res = await db.execute(select(ChunkBox).where(ChunkBox.chunk_id == chk.id))
        boxes = boxes_res.scalars().all()

        items.append({
            "chunk_id": chk.id,
            "page_number": chk.page_number,
            "chunk_index": chk.chunk_index,
            "section_title": chk.section_title,
            "text": chk.text,
            "token_count": chk.token_count,
            "boxes": [
                {
                    "x0": b.x0,
                    "y0": b.y0,
                    "x1": b.x1,
                    "y1": b.y1,
                    "text_snippet": b.text_snippet
                }
                for b in boxes
            ]
        })

    return success_response(data=items, request_id=request_id)


@router.get("/{version_id}/pages/{page_number}/debug-image")
async def get_page_debug_image(
    version_id: str,
    page_number: int,
    db: AsyncSession = Depends(get_db)
):
    """Serves the rendered diagnostic image with coordinate bounding boxes overlaid."""
    debug_dir = Path(settings.data_dir) / "debug"
    annotated_filename = f"{version_id}_p{page_number}_annotated.png"
    target_path = debug_dir / annotated_filename

    if not target_path.exists():
        # Trigger diagnostic render on demand
        res = await db.execute(select(DocumentVersion).where(DocumentVersion.id == version_id))
        version = res.scalar_one_or_none()
        if not version:
            raise HTTPException(status_code=404, detail="Version not found")

        # Get chunks and boxes for this page
        boxes_res = await db.execute(
            select(ChunkBox).where(
                ChunkBox.chunk_id.in_(
                    select(Chunk.id).where(
                        Chunk.document_version_id == version_id,
                        Chunk.page_number == page_number
                    )
                )
            )
        )
        boxes = boxes_res.scalars().all()
        from backend.app.ingest.chunker import ChunkBoxDTO
        box_dtos = [
            ChunkBoxDTO(x0=b.x0, y0=b.y0, x1=b.x1, y1=b.y1, text_snippet=b.text_snippet)
            for b in boxes
        ]

        raw_bytes = storage_service.get_bytes(version.binary_sha256)
        if not raw_bytes:
            raise HTTPException(status_code=404, detail="Raw document binary not found")

        from backend.app.ingest.diagnostics import diagnostic_renderer
        target_path, _ = diagnostic_renderer.render_page_with_boxes(
            pdf_bytes=raw_bytes,
            page_number=page_number,
            boxes=box_dtos,
            version_id=version_id
        )

    return FileResponse(target_path, media_type="image/png")
