import urllib.request

url = "http://127.0.0.1:8003/v1/reports/governance?format=pdf"
req = urllib.request.Request(url, headers={
    "X-Internal-Auth": "2689c1d4bf5073ea",
    "X-Org-Id": "test"
})
resp = urllib.request.urlopen(req)
pdf_bytes = resp.read()
content_type = resp.headers.get("Content-Type", "")
disposition = resp.headers.get("Content-Disposition", "")
print(f"Governance PDF: {len(pdf_bytes)} bytes, type={content_type}, disposition={disposition}")
print(f"  Starts with %PDF: {pdf_bytes[:5]}")

url2 = "http://127.0.0.1:8003/v1/reports/incidents?format=pdf"
req2 = urllib.request.Request(url2, headers={
    "X-Internal-Auth": "2689c1d4bf5073ea",
    "X-Org-Id": "test"
})
resp2 = urllib.request.urlopen(req2)
pdf_bytes2 = resp2.read()
print(f"Incidents PDF:  {len(pdf_bytes2)} bytes, type={resp2.headers.get('Content-Type')}")

url3 = "http://127.0.0.1:8003/v1/reports/sla?format=pdf"
req3 = urllib.request.Request(url3, headers={
    "X-Internal-Auth": "2689c1d4bf5073ea",
    "X-Org-Id": "test"
})
resp3 = urllib.request.urlopen(req3)
pdf_bytes3 = resp3.read()
print(f"SLA PDF:        {len(pdf_bytes3)} bytes, type={resp3.headers.get('Content-Type')}")
