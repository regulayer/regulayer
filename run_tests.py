import subprocess
import sys

with open("test_results.log", "w") as f:
    try:
        result = subprocess.run(
            [sys.executable, "-m", "pytest", "-vv", "regulayer-sdk/tests"],
            capture_output=True,
            text=True,
            encoding='utf-8'
        )
        f.write("STDOUT:\n")
        f.write(result.stdout)
        f.write("\nSTDERR:\n")
        f.write(result.stderr)
        f.write(f"\nEXIT CODE: {result.returncode}\n")
    except Exception as e:
        f.write(f"Error: {e}\n")
