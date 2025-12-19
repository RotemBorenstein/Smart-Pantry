"""
Receipts API routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from supabase import Client

from app.db.supabase_client import get_supabase
from app.services.receipt_service import ReceiptService
from app.schemas.receipt import ReceiptCreate, ReceiptResponse

router = APIRouter(prefix="/receipts", tags=["receipts"])


def get_receipt_service(supabase: Client = Depends(get_supabase)) -> ReceiptService:
    """Dependency to get receipt service"""
    return ReceiptService(supabase)


@router.get("", response_model=List[ReceiptResponse])
def get_receipts(
    user_id: UUID,
    limit: int = 100,
    service: ReceiptService = Depends(get_receipt_service)
):
    """Get all receipts for a user"""
    receipts = service.get_receipts(user_id, limit)
    return receipts


@router.get("/{receipt_id}", response_model=ReceiptResponse)
def get_receipt(
    receipt_id: UUID,
    service: ReceiptService = Depends(get_receipt_service)
):
    """Get a specific receipt with items"""
    receipt = service.get_receipt(receipt_id)
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return receipt


@router.post("", response_model=ReceiptResponse, status_code=status.HTTP_201_CREATED)
def create_receipt(
    user_id: UUID,
    receipt: ReceiptCreate,
    service: ReceiptService = Depends(get_receipt_service)
):
    """Create a new receipt with items"""
    new_receipt = service.create_receipt(user_id, receipt)
    return new_receipt


@router.put("/{receipt_id}", response_model=ReceiptResponse)
def update_receipt(
    receipt_id: UUID,
    receipt_data: dict,
    service: ReceiptService = Depends(get_receipt_service)
):
    """Update a receipt"""
    receipt = service.update_receipt(receipt_id, receipt_data)
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return receipt


@router.delete("/{receipt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_receipt(
    receipt_id: UUID,
    service: ReceiptService = Depends(get_receipt_service)
):
    """Delete a receipt"""
    deleted = service.delete_receipt(receipt_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Receipt not found")

