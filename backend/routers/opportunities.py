from fastapi import APIRouter
import database as db

router = APIRouter(prefix="/api/opportunities", tags=["Opportunities"])


@router.get("/scholarships")
def get_scholarships():
    return {"scholarships": db.scholarships}


@router.get("/jobs")
def get_jobs():
    return {"jobs": db.jobs}
