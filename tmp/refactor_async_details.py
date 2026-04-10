import os
import re

DIR = 'regulayer-web/app/(app)'

def process_detail_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content

    # Replace sync variable fetch -> async fetch
    # E.g., const doc = getTechDoc(docId); if (!doc) { router.push('/tech-docs'); return; } setDoc(doc);
    # To: getTechDoc(docId).then(doc => { if (!doc) { router.push('/tech-docs'); return; } setDoc(doc); }).catch(...)

    # Specifically for Conformity Assessment
    if "const a = getConformityAssessment(assessmentId);" in content:
        content = content.replace("const a = getConformityAssessment(assessmentId);\n        if (!a) { router.push('/conformity'); return; }\n        setAssessment(a);", 
        "getConformityAssessment(assessmentId).then(a => {\n            if (!a) { router.push('/conformity'); return; }\n            setAssessment(a);\n        }).catch(() => router.push('/conformity'));")
    
    # Specifically for FRIA
    if "const f = getFRIA(friaId);" in content:
        content = content.replace("const f = getFRIA(friaId);\n        if (!f) { router.push('/fria'); return; }\n        setFria(f);",
        "getFRIA(friaId).then(f => {\n            if (!f) { router.push('/fria'); return; }\n            setFria(f);\n        }).catch(() => router.push('/fria'));")

    # Specifically for Tech Docs
    if "const d = getTechDoc(docId);" in content:
        content = content.replace("const d = getTechDoc(docId);\n        if (!d) { router.push('/tech-docs'); return; }\n        setDoc(d);",
        "getTechDoc(docId).then(d => {\n            if (!d) { router.push('/tech-docs'); return; }\n            setDoc(d);\n        }).catch(() => router.push('/tech-docs'));")
        
    # Specifically for Incident Report
    if "const r = getIncidentReport(reportId);" in content:
        content = content.replace("const r = getIncidentReport(reportId);\n        if (!r) { router.push('/incident-report'); return; }\n        setReport(r);",
        "getIncidentReport(reportId).then(r => {\n            if (!r) { router.push('/incident-report'); return; }\n            setReport(r);\n        }).catch(() => router.push('/incident-report'));")

    if orig != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated detail {filepath}")

for root, _, files in os.walk(DIR):
    for file in files:
        if file.endswith('page.tsx') and '[' in root:
            process_detail_file(os.path.join(root, file))
