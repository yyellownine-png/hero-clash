from fastapi import APIRouter
from backend.database import connect
router=APIRouter(prefix='/api/world')
@router.get('')
def world():
 c=connect(); r=[dict(x) for x in c.execute('SELECT * FROM missions ORDER BY district,number').fetchall()]; c.close(); return r
