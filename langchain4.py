import os
from dotenv import load_dotenv
load_dotenv()

os.environ["GEMINI_API_KEY"]=os.getenv("GEMINI_API_KEY")

from langchain_google_genai import ChatGoogleGenerativeAI

model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite"
)

response = model.invoke("Why parrots are colorfull")

print(response.content)

# ------

for chunk in model.stream("Why do parrots have colorful feathers?"):
    print(chunk.text, flush=True, end="")