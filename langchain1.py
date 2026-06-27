import os
from dotenv import load_dotenv
load_dotenv()

os.environ["GEMINI_API_KEY"]=os.getenv("GEMINI_API_KEY")

from langchain.chat_models import init_chat_model


model = init_chat_model(
    "gemini-2.5-flash-lite",
    model_provider="google_genai",
)

response = model.invoke("What is the capital of India?")

print(response.content)