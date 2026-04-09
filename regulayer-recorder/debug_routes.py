from app.main import app
import sys

print("Routes:")
for route in app.routes:
    print(f"{route.path} {route.name}")
