from fastapi import APIRouter,HTTPException
from backend.database import connect
from backend.schemas import ChestOpen
from backend.services.chest_service import CHESTS,open_chest
router=APIRouter(prefix='/api/chests')
@router.get('')
def chests(): return list(CHESTS.values())
@router.post('/open')
def open_(req:ChestOpen,player_id:int=1):
 c=connect()
 try: h=open_chest(c,player_id,req.chest); c.commit(); return h
 except ValueError as e: c.rollback(); raise HTTPException(400,str(e))
 finally:c.close()
