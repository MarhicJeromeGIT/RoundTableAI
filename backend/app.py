from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, send, emit
import eventlet
import os
from dotenv import load_dotenv
load_dotenv()
import uuid
from chatbot import createConversation

from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

class MyCallbackHandler(StreamingStdOutCallbackHandler):
    """my own callback handler"""

    # initializer
    def __init__(self):
      super().__init__()
      self.cleanup()

    def on_llm_new_token(self, token, **kwargs):
      self.buffer.append(token)
      print("got a new token : " + token)
      """Run on new LLM token. Only available when streaming is enabled."""
      # print("buffer so far : " + self.buffer.join(' '))
      emit('new_message', { 'id': self.random_uuid, 'type': 'bot', 'text': self.buffer })
      eventlet.sleep(0) # ???

    def on_llm_end(self, response, **kwargs):
      """Run when LLM ends running."""
      print("finished running llm")
      self.cleanup()

    def cleanup(self):       
      self.buffer = []
      self.random_uuid = str(uuid.uuid4())

my_callback_handler = MyCallbackHandler()

conversation = createConversation(my_callback_handler)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

import time

@socketio.on('message')
def handle_message(message):
    result = conversation.predict(input=message)
    print(result)

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    # eventlet.spawn(send_regular_messages)
    emit('new_message', { 'id': 1, 'type': 'narrator', 'text': conversation.memory.moving_summary_buffer })
    eventlet.sleep(0.1)
    emit('new_message', { 'id': 2, 'type': 'bot', 'text': conversation.memory.chat_memory.messages[0].content })
    # socketio.send("hello from server")

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