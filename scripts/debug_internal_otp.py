
import sys
import os
import hashlib
from uuid import uuid4
from datetime import datetime, timezone, timedelta

# Add /app to path (Docker container layout)
sys.path.append("/app")

try:
    from app.storage import init_db, get_db, OtpCodeDB
    from app.user_auth import OtpService
except ImportError:
    # Try local layout if running outside docker (unlikely to work due to DB)
    sys.path.append(os.getcwd())
    from app.storage import get_db, OtpCodeDB
    from app.user_auth import OtpService

def debug_otp():
    print("--- Starting Debug OTP ---")
    db = next(get_db())
    
    email = f"debug_{uuid4().hex[:8]}@example.com"
    code = "123456"
    code_hash = hashlib.sha256(code.encode()).hexdigest()
    otp_id = uuid4()
    
    print(f"Creating OTP record for {email}...")
    otp = OtpCodeDB(
        id=otp_id,
        email=email,
        code_hash=code_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
        verified=True
    )
    db.add(otp)
    db.commit()
    print(f"OTP Created: {otp_id}")
    
    svc = OtpService(db)
    print("Calling complete_signup...")
    try:
        svc.complete_signup(str(otp_id), f"Debug Org {uuid4().hex[:4]}", "password123")
        print("SUCCESS: complete_signup finished without error.")
    except Exception:
        print("FAILURE: complete_signup raised exception:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_otp()
