import os
from dotenv import load_dotenv
load_dotenv()
BOT_TOKEN=os.getenv("TELEGRAM_BOT_TOKEN","")
SECRET_KEY=os.getenv("SECRET_KEY","change-me")
DB_PATH=os.getenv("DB_PATH","database/game.db")
