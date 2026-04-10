import os
import re

DIR = 'regulayer-web/app/(app)'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    orig = content

    # 1. Page loaders (e.g., setAssessments(getConformityAssessments());)
    content = re.sub(r'set([A-Za-z]+)\(get([A-Za-z]+)\(\)\);', r'get\2().then(set\1).catch(console.error);', content)

    # 2. Page detail loaders (e.g., const doc = getTechDoc(docId); if(!doc) return;)
    # Since these vary heavily, we can simply change the sync assignments to .then().
    # However, because some components unpack the state directly inside the effect, 
    # doing an exact regex on all of them is slightly risky.
    
    # 3. Simple saves without promise handlers
    content = re.sub(r'save([A-Za-z]+)\(([^)]+)\);(\s+)set([A-Za-z]+)\(get\1s\(\)\);', r'save\1(\2).then(() => get\1s().then(set\4));\3', content)

    if orig != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(DIR):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
