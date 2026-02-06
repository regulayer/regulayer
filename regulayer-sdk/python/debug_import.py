
import sys
import os
print(f"CWD: {os.getcwd()}")
print(f"Path: {sys.path}")

try:
    import regulayer.errors
    print("Imported regulayer.errors directly")
    print(dir(regulayer.errors))
except ImportError as e:
    print(f"ImportError details: {e}")
except Exception as e:
    print(f"Other Error: {e}")

try:
    from regulayer import errors
    print("from regulayer import errors: OK")
except Exception as e:
    print(f"from regulayer import errors: Failed - {e}")
