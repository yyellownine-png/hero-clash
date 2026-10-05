from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.database import connect,init_db
from backend.services.hero_service import seed_heroes
import json
from pathlib import Path
from backend.api import auth,profile,heroes,chests,world,battles,rewards,shop,rankings,referrals,admin
app=FastAPI(title='NEON HEROES API')
@app.on_event('startup')
def startup():
 init_db(); c=connect(); seed_heroes(c)
 data=json.loads(Path('backend/data/worlds.json').read_text())
 for m in data:c.execute('INSERT OR IGNORE INTO missions(district,number,name,enemy_power,reward_coins,reward_gems,energy_cost,unlocked_level) VALUES(?,?,?,?,?,?,?,?)',(m['district'],m['number'],m['name'],m['enemy_power'],m['reward_coins'],m['reward_gems'],m['energy_cost'],m['unlocked_level']))
 c.commit()
 row=c.execute("SELECT id FROM players WHERE tg_id='guest'").fetchone()
 if not row:
  c.execute("INSERT INTO players(tg_id,username,name) VALUES('guest','player','Neon Player')"); pid=c.execute('SELECT last_insert_rowid()').fetchone()[0]
 else: pid=row['id']
 if c.execute('SELECT COUNT(*) FROM player_heroes WHERE player_id=?',(pid,)).fetchone()[0]==0:
  ids=c.execute("SELECT id FROM heroes ORDER BY CASE rarity WHEN 'Legendary' THEN 1 WHEN 'Epic' THEN 2 ELSE 3 END LIMIT 4").fetchall()
  for i,x in enumerate(ids): c.execute('INSERT INTO player_heroes(player_id,hero_id,equipped) VALUES(?,?,1)',(pid,x['id']))
 c.commit();c.close()
for r in [auth.router,profile.router,heroes.router,chests.router,world.router,battles.router,rewards.router,shop.router,rankings.router,referrals.router,admin.router]:app.include_router(r)
app.mount('/assets',StaticFiles(directory='frontend/src/assets'),name='assets')
app.mount('/static',StaticFiles(directory='frontend'),name='static')
@app.get('/app.js')
def app_js(): return FileResponse('frontend/app.js')
@app.get('/style.css')
def style_css(): return FileResponse('frontend/style.css')
@app.get('/')
def index(): return FileResponse('frontend/index.html')
