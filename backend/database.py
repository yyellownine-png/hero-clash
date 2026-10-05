import sqlite3
from pathlib import Path
from .config import DB_PATH
Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)

def connect():
    c=sqlite3.connect(DB_PATH)
    c.row_factory=sqlite3.Row
    c.execute('PRAGMA foreign_keys=ON')
    return c

def init_db():
    c=connect()
    c.executescript(Path('database/schema.sql').read_text())
    c.commit(); c.close()
