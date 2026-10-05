from fastapi import APIRouter,HTTPException
from backend.database import connect
from backend.schemas import BattleRequest
from backend.services.battle_service import run_battle
router=APIRouter(prefix='/api/battles')
@router.post('/run')
def battle(req:BattleRequest,player_id:int=1):
 c=connect()
 try:r=run_battle(c,player_id,req.mission_id);c.commit();return r
 except ValueError as e:c.rollback();raise HTTPException(400,str(e))
 finally:c.close()
