import sys
import pytest

if __name__ == "__main__":
    print("Starting tests...")
    ret = pytest.main(["-v", "tests"])
    print(f"Tests finished with code {ret}")
    sys.exit(ret)
