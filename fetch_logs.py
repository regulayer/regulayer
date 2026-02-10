import subprocess

try:
    result = subprocess.run(["docker", "logs", "regulayer-governance-1"], capture_output=True, text=True, encoding='utf-8')
    print("STDOUT:", result.stdout)
    print("STDERR:", result.stderr)
except Exception as e:
    print(f"Error: {e}")
