import os
import re

directory = r"c:\VitalsVault - Copy\frontend\src"

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith((".ts", ".tsx", ".js", ".jsx")):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            original_content = content
            
            # 1. Replace exact match string literals: "http://localhost:5000" or 'http://localhost:5000'
            content = re.sub(r'["\']http://localhost:5000["\']', r'process.env.NEXT_PUBLIC_API_URL', content)
            
            # 2. Replace string literals with paths: "http://localhost:5000/api/..." -> `${process.env.NEXT_PUBLIC_API_URL}/api/...`
            content = re.sub(r'["\']http://localhost:5000(/.*?)["\']', r'`${process.env.NEXT_PUBLIC_API_URL}\1`', content)
            
            # 3. Replace anywhere else (like inside template literals: `http://localhost:5000/api/vitals/${id}`)
            content = content.replace("http://localhost:5000", "${process.env.NEXT_PUBLIC_API_URL}")
            
            if content != original_content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Updated {filepath}")
