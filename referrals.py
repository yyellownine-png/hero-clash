from fastapi import APIRouter
router=APIRouter(prefix='/api/referrals')
@router.get('/{pid}')
def ref(pid:int): return {'code':f'NEON{pid}','invited':0,'bonus':0}
