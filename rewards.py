from fastapi import APIRouter
router=APIRouter(prefix='/api/rewards')
@router.get('/daily')
def daily(): return {'coins':500,'gems':20}
