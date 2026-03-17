from fastapi import APIRouter
import database as db

router = APIRouter(prefix="/api/offers", tags=["Offers"])


@router.get("")
def get_offers():
    return {"offers": db.offers}
