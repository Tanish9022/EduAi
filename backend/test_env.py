import os
print("Checking for API keys in env:")
for key in ["GEMINI_API_KEY", "GOOGLE_API_KEY", "OPENAI_API_KEY"]:
    val = os.getenv(key)
    if val:
        print(f"Found {key}: {val[:8]}... (length: {len(val)})")
    else:
        print(f"Not found: {key}")
