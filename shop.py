from fastapi import APIRouter
router=APIRouter(prefix='/api/shop')
@router.get('')
def shop(): return {'gems_packages':[{'grams':1,'gems':100},{'grams':5,'gems':550},{'grams':10,'gems':1200},{'grams':20,'gems':2800},{'grams':50,'gems':7500},{'grams':100,'gems':16000}], 'premium':[5,15,20,50]}
