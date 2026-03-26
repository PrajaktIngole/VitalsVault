import os

directory = r"c:\VitalsVault - Copy\frontend\src"

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith((".ts", ".tsx", ".js", ".jsx")):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            original_content = content

            if "replace(/\\/$/, '')" in original_content:
                continue

            content = content.replace(
                "process.env.NEXT_PUBLIC_API_URL",
                "process.env.NEXT_PUBLIC_API_URL?.replace(/\\/$/, '')"
            )

            if content != original_content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Updated {filepath}")
