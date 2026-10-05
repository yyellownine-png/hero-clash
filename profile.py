from fastapi import APIRouter,HTTPException
from backend.database import connect
router=APIRouter(prefix='/api/profile')
def player(c,pid):
 r=c.execute('SELECT * FROM players WHERE id=?',(pid,)).fetchone()
 if not r: raise HTTPException(404,'player_not_found')
 return dict(r)
@router.get('/{pid}')
def profile(pid:int):
 c=connect(); p=player(c,pid); hs=[dict(x) for x in c.execute('SELECT h.*,ph.level,ph.stars,ph.equipped FROM heroes h JOIN player_heroes ph ON ph.hero_id=h.id WHERE ph.player_id=?',(pid,)).fetchall()]; c.close(); p['heroes']=hs; return p
