import sys
from pathlib import Path
from uuid import uuid4
from datetime import datetime, timezone
from sqlalchemy import text
from app.storage import SessionLocal, UserDB, OrganizationDB, engine
from app.user_auth import hash_password
from app.enums import UserRole

def run_migration():
    print("Starting Super Admin migration...")
    
    # 1. Add columns using raw SQL since SQLAlchemy declarative won't auto-migrate SQLite
    try:
        with engine.connect() as conn:
            # Check and add custom_decision_cap to organizations
            try:
                conn.execute(text("ALTER TABLE organizations ADD COLUMN custom_decision_cap INTEGER DEFAULT NULL;"))
                print("Added custom_decision_cap to organizations.")
            except Exception as e:
                print(f"Skipping organizations alter (likely already exists): {e}")

            # Check and add is_superadmin to users
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_superadmin BOOLEAN DEFAULT false;"))
                print("Added is_superadmin to users.")
            except Exception as e:
                print(f"Skipping users alter (likely already exists): {e}")
            conn.commit()
    except Exception as e:
        print(f"Migration error: {e}")

    # 2. Add or Update Super Admin User
    TARGET_EMAIL = "kumarsancheet23@gmail.com"
    TARGET_PASS = "Ssancheet@23Ssunny@23"
    
    db = SessionLocal()
    try:
        user = db.query(UserDB).filter(UserDB.email == TARGET_EMAIL).first()
        
        if user:
            print(f"User {TARGET_EMAIL} found. Upgrading privileges and updating password...")
            user.is_superadmin = True
            user.password_hash = hash_password(TARGET_PASS)
            
            # Make sure their org is active too
            org = db.query(OrganizationDB).filter(OrganizationDB.id == user.organization_id).first()
            if org:
                # Optionally set infinite cap for their own org
                org.custom_decision_cap = -1
                print(f"User's org '{org.name}' upgraded to infinite limit.")
                
            db.commit()
            print("Successfully upgraded existing user.")
        else:
            print(f"User {TARGET_EMAIL} not found. Creating brand new Super Admin Organization & User...")
            org = OrganizationDB(
                id=uuid4(),
                name="Regulayer Global Admin",
                environment="prod",
                custom_decision_cap=-1  # Infinite
            )
            db.add(org)
            
            user = UserDB(
                id=uuid4(),
                organization_id=org.id,
                email=TARGET_EMAIL,
                password_hash=hash_password(TARGET_PASS),
                role=UserRole.OWNER,
                is_superadmin=True
            )
            db.add(user)
            db.commit()
            print("Successfully created new Super Admin.")

    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
    print("Migration complete!")
