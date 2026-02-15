import sys
import os
from sqlalchemy import create_engine, MetaData, Table, Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.engine import reflection

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings

def migrate():
    print("Migrating database: Adding password_reset_tokens table...")
    
    engine = create_engine(settings.database_url)
    metadata = MetaData()
    
    # Inspect existing tables
    insp = reflection.Inspector.from_engine(engine)
    
    if "password_reset_tokens" in insp.get_table_names():
        print("Table 'password_reset_tokens' already exists. Skipping.")
        return

    # Define table
    password_reset_tokens = Table(
        'password_reset_tokens', metadata,
        Column('id', UUID(as_uuid=True), primary_key=True),
        Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), nullable=False),
        Column('token_hash', String(64), nullable=False),
        Column('expires_at', DateTime(timezone=True), nullable=False),
        Column('created_at', DateTime(timezone=True), nullable=True),
        Column('used', Boolean, default=False, nullable=False)
    )

    # Create table
    metadata.create_all(engine)
    print("Table 'password_reset_tokens' created successfully.")

if __name__ == "__main__":
    migrate()
