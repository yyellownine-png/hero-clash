# Database tables are defined in database/schema.sql. This module documents the domain objects used by services.
from dataclasses import dataclass
@dataclass
class Player: id:int; tg_id:str; username:str; name:str; lang:str; level:int; xp:int; gems:int; coins:int; energy:int
