# OpenAI llm
from langchain.llms import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()

llm = OpenAI(temperature=0)

from langchain.chains import ConversationChain
from langchain.memory import ConversationSummaryBufferMemory

memory = ConversationSummaryBufferMemory(llm=llm, max_token_limit=150)

setup = '''
The sun begins to set, casting a warm glow on the quaint village of Eldershire.
A refreshing breeze rustles through the trees, carrying with it the sweet scent of blooming flowers.
In the heart of the village, a bustling marketplace hums with life as merchants peddle their wares and villagers chatter amongst themselves.
Our hero, a fledgling adventurer with dreams of grandeur, enters the scene, eager to embark on their first great quest.
'''
memory
print(memory)

from langchain.prompts.prompt import PromptTemplate

template = """You are a fantasy game NPC. Interact with the player accordingly.

Story so far:
{history}
Recent input: {input}
NPC:"""

my_custom_prompt = PromptTemplate(
    input_variables=["history", "input"], template=template
)

conversation = ConversationChain(
    llm=llm, 
    verbose=True, 
    memory=memory, # Implement starting memory,
    prompt=my_custom_prompt
)

# streaming LLM
from langchain.callbacks.base import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

sllm = OpenAI(streaming=True, callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]), verbose=True, temperature=0)


# conversation.predict(input="Tell me where is the lord of this village")

from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage
chat = ChatOpenAI(streaming=True, callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]), verbose=True, temperature=0)
# resp = chat([HumanMessage(content="Write me a song about sparkling water.")])