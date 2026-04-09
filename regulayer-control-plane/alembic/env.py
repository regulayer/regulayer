import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Add the app directory to the path so we can import models
sys.path.append(os.getcwd())

# Import the base model for metadata
try:
    from app.storage import Base
    target_metadata = Base.metadata
except ImportError:
    target_metadata = None

# Use environment variable for DB URL
config = context.config
db_url = os.getenv("DATABASE_URL")
if db_url:
    config.set_main_option("sqlalchemy.url", db_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

import time

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    max_retries = 10
    for attempt in range(max_retries):
        try:
            with connectable.connect() as connection:
                context.configure(
                    connection=connection, target_metadata=target_metadata
                )

                with context.begin_transaction():
                    context.run_migrations()
            break
        except Exception as e:
            print(f"Database connection failed (attempt {attempt + 1}/{max_retries}). Retrying in 3s... Error: {e}")
            if attempt == max_retries - 1:
                raise e
            time.sleep(3)

run_migrations_online()
