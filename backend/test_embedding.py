import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key: {api_key[:10]}...")

client = genai.Client(api_key=api_key)

print("Listing models...")
try:
    for m in client.models.list():
        if 'embedContent' in m.supported_generation_methods:
            print(f"Name: {m.name}, Display: {m.display_name}")
except Exception as e:
    print(f"Error listing models: {e}")
