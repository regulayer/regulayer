import os

target_dir = r"c:\Users\sancheet\Documents\regulayer\regulayer-web"
old_string = 'from "motion/react"'
new_string = 'from "framer-motion"'

for root, dirs, files in os.walk(target_dir):
    if "node_modules" in root or ".next" in root:
        continue
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            if old_string in content:
                print(f"Patching {filepath}")
                new_content = content.replace(old_string, new_string)
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
