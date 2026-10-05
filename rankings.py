from fastapi import APIRouter
from backend.database import connect
router=APIRouter(prefix='/api/rankings')
@router.get('')
def rankings():
 c=connect();r=[dict(x) for x in c.execute('SELECT id,name,level,xp FROM players ORDER BY level DESC,xp DESC LIMIT 100').fetchall()];c.close();return r
