from regulayer import trace, configure

print(f"Type of trace is: {type(trace)}")

try:
    with trace(system="test") as t:
        pass
    print("Trace usage successful (mocked)")
except Exception as e:
    print(f"Trace usage failed: {e}") 
