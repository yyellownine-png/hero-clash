from fastapi import APIRouter
from backend.database import connect
router=APIRouter(prefix='/api/auth')
@router.post('/guest')
def guest():
 c=connect(); row=c.execute("SELECT * FROM players WHERE tg_id='guest'").fetchone()
 if not row:
  c.execute("INSERT INTO players(tg_id,username,name) VALUES('guest','player','Neon Player')"); pid=c.execute('SELECT last_insert_rowid()').fetchone()[0]; c.commit()
 else: pid=row['id']
 c.close(); return {'player_id':pid}
