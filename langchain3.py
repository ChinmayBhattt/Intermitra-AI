import os
from dotenv import load_dotenv

load_dotenv()

os.environ["GPOQ_API_KEY"]=os.getenv("GPOQ_API_KEY")


from langchain_groq import ChatGroq

model = ChatGroq(
    model="llama-3.1-8b-instant",
)

response = model.invoke("What is the capital of India?")
print(response.content)