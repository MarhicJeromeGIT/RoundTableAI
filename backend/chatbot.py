# OpenAI llm
from langchain.llms import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()
from langchain.chains import ConversationChain
from langchain.llms import OpenAI, LlamaCpp
from langchain.prompts.prompt import PromptTemplate
from langchain.memory import ConversationSummaryBufferMemory
from langchain.callbacks.base import CallbackManager

template = """
You are an adventure Game Master (GM). The GM describes the game world and its inhabitants;
the other players describe the intended actions of their characters, and the GM describes the outcomes.
You can either write the NPC's lines (start with the NPC's name), or act as a narrator and describe the scene or ask questions to the player.

Current conversation:
{history}
Human: {input}
NPC:"""

my_custom_prompt = PromptTemplate(
    input_variables=["history", "input"], template=template
)

custom_summary_template = """Summarize the conversation between the Human and NPC from the current summary and the new lines of conversation.

Current summary:
{summary}

New lines of conversation:
{new_lines}

New summary:"""

custom_summary_prompt = PromptTemplate(
    input_variables=["summary", "new_lines"], template=custom_summary_template
)

summary_llm = OpenAI(temperature=0, verbose=False)
memory = ConversationSummaryBufferMemory(llm=summary_llm, max_token_limit=500, prompt=custom_summary_prompt, ai_prefix="NPC")
print(memory)


story_start = """
The sun begins to set, casting a warm glow on the quaint village of Eldershire.
A refreshing breeze rustles through the trees, carrying with it the sweet scent of blooming flowers.
In the heart of the village, a bustling marketplace hums with life as merchants peddle their wares and villagers chatter amongst themselves.
Our hero, a fledgling adventurer with dreams of grandeur, enters the scene, eager to embark on their first great quest.
"""

ai_message = """
Well met, traveler! The name's Olaf. You look like a newcomer to these parts.
Tell me, what brings you to our humble village of Eldershire?
"""

memory.moving_summary_buffer = story_start
memory.chat_memory.add_ai_message(ai_message)

memory.load_memory_variables(['history'])

def createConversation(callback):
  # llm = OpenAI(temperature=0, verbose=True, streaming=True, callback_manager=CallbackManager([callback]))

  # Try with llama
  # Alpaca
  # 
  llm = LlamaCpp(
    model_path="/home/jerome/Wovn/llama/llama.cpp/models/7B/ggml-model-q4_0.bin",
    n_ctx=2048,
    max_tokens=128,
    streaming=True,
    verbose=True,
    callback_manager=CallbackManager([callback])
  )

  # for chunk in llm.stream("Ask 'Hi, how are you?' like a pirate:'", stop=["'","\n"]):
  #   result = chunk["choices"][0]
  #   print(result["text"], end='', flush=True)

  conversation = ConversationChain(
      llm=llm, 
      memory=memory, # Implement starting memory,
      prompt=my_custom_prompt,
      verbose=True
  )

  return conversation

if __name__ == "__main__":
  conversation = createConversation(None)
  print(conversation)

