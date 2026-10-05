from fastapi import APIRouter
from backend.database import connect
router=APIRouter(prefix='/api/heroes')
@router.get('/all')
def all_heroes():
 c=connect(); r=[dict(x) for x in c.execute('SELECT * FROM heroes').fetchall()]; c.close(); return r
@router.get('/player/{pid}')
def player_heroes(pid:int):
 c=connect(); r=[dict(x) for x in c.execute('SELECT h.*,ph.level,ph.stars,ph.equipped FROM heroes h JOIN player_heroes ph ON ph.hero_id=h.id WHERE ph.player_id=?',(pid,)).fetchall()]; c.close(); return r
