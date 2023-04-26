# OpenAI llm
from langchain.llms import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()
from langchain.chains import ConversationChain
from langchain.llms import OpenAI
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

memory.moving_summary_buffer = 'The player arrives in a village and meets a villager. The villager says "Hello, traveler. How can I help you?"'
memory.load_memory_variables(['history'])

def createConversation(callback):
  llm = OpenAI(temperature=0, verbose=True, streaming=True, callback_manager=CallbackManager([callback]))

  conversation = ConversationChain(
      llm=llm, 
      memory=memory, # Implement starting memory,
      prompt=my_custom_prompt,
      verbose=True
  )

  return conversation

