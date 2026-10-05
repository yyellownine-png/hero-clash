from pydantic import BaseModel
class TelegramAuth(BaseModel): init_data:str|None=None
class ChestOpen(BaseModel): chest:str
class BattleRequest(BaseModel): mission_id:int
class LangRequest(BaseModel): lang:str
