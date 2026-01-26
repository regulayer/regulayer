import sys
import os

# Add parent directory to path so we can import 'app'
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.storage import SessionLocal, OrganizationDB, ProjectDB, UserDB, ApiKeyDB
from app.enums import OrgStatus, ProjectEnvironment, UserRole
from app.user_auth import hash_password
from app.storage import generate_api_key
from uuid import uuid4

def seed():
    db = SessionLocal()
    try:
        print("Seeding demo data...")
        
        # 1. Create Organization
        org = db.query(OrganizationDB).filter(OrganizationDB.name == "Demo Corp").first()
        if not org:
            org = OrganizationDB(
                id=uuid4(),
                name="Demo Corp",
                status=OrgStatus.ACTIVE
            )
            db.add(org)
            print(f"Created Org: Demo Corp ({org.id})")
        else:
            print("Org 'Demo Corp' already exists")
            
        # 2. Create User
        email = "admin@regulayer.ai"
        user = db.query(UserDB).filter(UserDB.email == email).first()
        if not user:
            user = UserDB(
                id=uuid4(),
                email=email,
                password_hash=hash_password("password123"), # Using helper from user_auth
                organization_id=org.id,
                role=UserRole.OWNER
            )
            db.add(user)
            print(f"Created User: {email} / password123")
        else:
            print(f"User '{email}' already exists")
            
        # 3. Create Project
        project = db.query(ProjectDB).filter(ProjectDB.name == "Demo Project").first()
        if not project:
            project = ProjectDB(
                id=uuid4(),
                organization_id=org.id,
                name="Demo Project",
                environment=ProjectEnvironment.PROD
            )
            db.add(project)
            print(f"Created Project: Demo Project ({project.id})")
        else:
            print("Project 'Demo Project' already exists")

        db.commit()
        print("Seeding complete!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed()
