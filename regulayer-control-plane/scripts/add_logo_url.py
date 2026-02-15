import sys
import os

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.config import settings

def migrate():
    print(f"Connecting to DB: {settings.database_url}")
    engine = create_engine(settings.database_url)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE organizations ADD COLUMN logo_url VARCHAR(500)"))
            conn.commit()
            print("Successfully added logo_url column")
        except Exception as e:
            if "duplicate column" in str(e):
                print("Column logo_url already exists")
            else:
                print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
