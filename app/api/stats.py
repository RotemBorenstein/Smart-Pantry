"""
Statistics API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from uuid import UUID
from supabase import Client

from app.db.supabase_client import get_supabase

router = APIRouter(prefix="/stats", tags=["statistics"])


def get_supabase_client(supabase: Client = Depends(get_supabase)) -> Client:
    """Dependency to get Supabase client"""
    return supabase


@router.get("/{user_id}")
def get_user_statistics(
    user_id: UUID,
    supabase: Client = Depends(get_supabase_client)
) -> Dict[str, Any]:
    """Get comprehensive statistics for a user's dashboard"""
    try:
        # Inventory statistics
        inventory_response = supabase.table("inventory").select("state, estimated_qty").eq("user_id", str(user_id)).execute()
        inventory_items = inventory_response.data if inventory_response.data else []
        
        total_products = len(inventory_items)
        empty_items = len([i for i in inventory_items if i.get("state") == "EMPTY"])
        low_items = len([i for i in inventory_items if i.get("state") == "LOW"])
        medium_items = len([i for i in inventory_items if i.get("state") == "MEDIUM"])
        full_items = len([i for i in inventory_items if i.get("state") == "FULL"])
        
        # Shopping lists statistics
        shopping_lists_response = supabase.table("shopping_list").select("status, shopping_list_items(status)").eq("user_id", str(user_id)).execute()
        shopping_lists = shopping_lists_response.data if shopping_lists_response.data else []
        
        active_lists = len([sl for sl in shopping_lists if sl.get("status") == "ACTIVE"])
        total_list_items = sum(len(sl.get("shopping_list_items", [])) for sl in shopping_lists if sl.get("status") == "ACTIVE")
        bought_items = sum(
            len([item for item in sl.get("shopping_list_items", []) if item.get("status") == "BOUGHT"])
            for sl in shopping_lists if sl.get("status") == "ACTIVE"
        )
        
        # Recent activity (last 7 days)
        from datetime import datetime, timedelta, timezone
        week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        
        logs_response = supabase.table("inventory_log").select("action, occurred_at").eq(
            "user_id", str(user_id)
        ).gte("occurred_at", week_ago).execute()
        recent_logs = logs_response.data if logs_response.data else []
        
        purchases_this_week = len([log for log in recent_logs if log.get("action") == "PURCHASE"])
        adjustments_this_week = len([log for log in recent_logs if log.get("action") == "ADJUST"])
        
        # Receipts statistics
        receipts_response = supabase.table("receipts").select("receipt_id, total_amount").eq(
            "user_id", str(user_id)
        ).gte("purchased_at", week_ago).execute()
        receipts = receipts_response.data if receipts_response.data else []
        
        total_receipts = len(receipts)
        total_spent = sum(float(r.get("total_amount", 0) or 0) for r in receipts)
        
        # Predictor statistics
        forecasts_response = supabase.table("inventory_forecasts").select("expected_days_left, confidence").eq(
            "user_id", str(user_id)
        ).order("generated_at", desc=True).limit(50).execute()
        forecasts = forecasts_response.data if forecasts_response.data else []
        
        items_running_out = len([f for f in forecasts if (f.get("expected_days_left") or 999) < 3])
        avg_confidence = sum(f.get("confidence", 0) for f in forecasts) / len(forecasts) if forecasts else 0
        
        return {
            "inventory": {
                "total_products": total_products,
                "empty": empty_items,
                "low": low_items,
                "medium": medium_items,
                "full": full_items,
                "stock_health": round((full_items + medium_items) / total_products * 100, 1) if total_products > 0 else 0
            },
            "shopping": {
                "active_lists": active_lists,
                "total_items": total_list_items,
                "bought_items": bought_items,
                "pending_items": total_list_items - bought_items,
                "completion_rate": round(bought_items / total_list_items * 100, 1) if total_list_items > 0 else 0
            },
            "activity": {
                "purchases_this_week": purchases_this_week,
                "adjustments_this_week": adjustments_this_week,
                "total_receipts": total_receipts,
                "total_spent": round(total_spent, 2),
                "total_activities": len(recent_logs)
            },
            "predictions": {
                "items_running_out": items_running_out,
                "avg_confidence": round(avg_confidence * 100, 1),
                "total_forecasts": len(forecasts)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch statistics: {str(e)}")

