"""
Predictor API routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from supabase import Client

from app.db.supabase_client import get_supabase
from app.services.predictor_service import PredictorService

router = APIRouter(prefix="/predictor", tags=["predictor"])


def get_predictor_service(supabase: Client = Depends(get_supabase)) -> PredictorService:
    """Dependency to get predictor service"""
    try:
        return PredictorService(supabase)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/process-log/{log_id}")
def process_inventory_log(
    user_id: UUID,
    log_id: UUID,
    service: PredictorService = Depends(get_predictor_service)
):
    """Process an inventory log event and update predictions"""
    try:
        service.process_inventory_log(str(log_id))
        return {"message": "Log processed successfully", "log_id": str(log_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/refresh/{user_id}")
def refresh_predictions(
    user_id: UUID,
    service: PredictorService = Depends(get_predictor_service)
):
    """Refresh predictions for all products in user's inventory"""
    try:
        service.refresh_user_inventory_forecasts(str(user_id))
        return {"message": "Predictions refreshed successfully", "user_id": str(user_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

