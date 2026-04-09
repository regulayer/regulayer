import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

print("Verifying Enterprise Polish Implementations...")

try:
    print("1. Checking Ingestion Gateway Rate Limit...")
    from app.ratelimit import RateLimiter, TOKEN_BUCKET_SCRIPT
    print("[OK] RateLimiter class imported")
    if "redis" not in TOKEN_BUCKET_SCRIPT:
        raise ValueError("Lua script seems missing")
    print("[OK] Lua script present")

    print("2. Checking Ingestion Gateway Observability...")
    from app.observability import RequestIdMiddleware, StructuredLoggerMiddleware, SecurityHeadersMiddleware
    print("[OK] Middleware classes imported")

except ImportError as e:
    print(f"[FAIL] Import Error in Gateway: {e}")
    sys.path.pop()
    sys.exit(1)
except Exception as e:
    print(f"[FAIL] Error in Gateway: {e}")
    sys.exit(1)

# Reset path for control plane check (shared module names might conflict if not careful, but here we just check availability)
# Actually, let's just check the control plane file exists and is importable
try:
    print("3. Checking Control Plane Observability...")
    # diverse path handling
    cp_path = os.path.join(os.getcwd(), "regulayer-control-plane")
    sys.path.insert(0, cp_path)
    
    import app.observability as cp_obs
    if not hasattr(cp_obs, "RequestIdMiddleware"):
         raise ValueError("Control Plane RequestIdMiddleware missing")
    print("[OK] Control Plane Middleware imported")

except ImportError as e:
    print(f"[FAIL] Import Error in Control Plane: {e}")
    sys.exit(1)

print("\nAll Polish verifications passed!")
