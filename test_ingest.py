from regulayer import configure, trace

configure(
    api_key="PASTE_YOUR_REAL_API_KEY_HERE",
    endpoint="http://localhost:8080/v1/ingest/decision"
)

with trace(system="local_test") as t:
    t.set_input({"x": 1})
    t.set_output({"y": 2})

print("Trace submitted.")
