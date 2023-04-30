from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, send, emit
import eventlet
import os
from dotenv import load_dotenv
load_dotenv()

from chatbot import createConversation

from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.callbacks.base import AsyncCallbackHandler

# class StreamingLLMCallbackHandler(AsyncCallbackHandler):
#     """Callback handler for streaming LLM responses."""

#     def __init__(self, websocket):
#         self.websocket = websocket

#     async def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
#         resp = ChatResponse(sender="bot", message=token, type="stream")
#         await self.websocket.send_json(resp.dict())



class MyCallbackHandler(StreamingStdOutCallbackHandler):
    """my own callback handler"""

    # initializer
    def __init__(self):
      super().__init__()
      self.buffer = []

    def on_llm_new_token(self, token, **kwargs):
      self.buffer.append(token)
      print("got a new token : " + token)
      """Run on new LLM token. Only available when streaming is enabled."""
      # print("buffer so far : " + self.buffer.join(' '))
      emit('new_word', {'word': self.buffer })
      eventlet.sleep(0) # ???

    def on_llm_end(self, response, **kwargs):
      """Run when LLM ends running."""
      print("finished running llm")
      self.buffer = []

my_callback_handler = MyCallbackHandler()

conversation = createConversation(my_callback_handler)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

import time

# def generate_text():
#     result = conversation.predict(input="show me your wares")
#     words = result.split()
#     # words = ['This', 'is', 'an', 'example', 'of', 'streaming', 'text', 'word', 'by', 'word.']
#     for i in range(len(words)):
#         yield ' '.join(words[:i+1])
#         eventlet.sleep(0.1)  # Simulate the time it takes to generate a word

@socketio.on('message')
def handle_message(message):
    result = conversation.predict(input=message)
    print(result)
    # print("starting to stream text")
    # for word in generate_text():
    #     emit('new_word', {'word': word})

def send_regular_messages():
    while True:
        eventlet.sleep(5)  # Send a message every 5 seconds (non-blocking)
        message = "Hello from server!"
        print("sending message")
        socketio.send(message)

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    # eventlet.spawn(send_regular_messages)

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')  

# @socketio.on('generate_background_image')
# def generate_background_image():
#     url = 'https://images.nightcafe.studio/jobs/01rpW0BNf6m7gfqSzA3A/01rpW0BNf6m7gfqSzA3A.jpg?tr=w-1600,c-at_max'
#     print("generating background image")
#     emit('new_background_image', {'url': background_image_url})

if __name__ == '__main__':
    # eventlet.wsgi.server(eventlet.listen(('127.0.0.1', 3001)), app)
    socketio.run(app, host='127.0.0.1', port=3001)