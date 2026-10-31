"""Aggregates all API v1 routers into a single master router."""

from fastapi import APIRouter
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.schemes import router as schemes_router
from backend.app.api.v1.sources import router as sources_router
from backend.app.api.v1.discovery import router as discovery_router
from backend.app.api.v1.review import router as review_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(schemes_router)
api_v1_router.include_router(sources_router)
api_v1_router.include_router(discovery_router)
api_v1_router.include_router(review_router)

