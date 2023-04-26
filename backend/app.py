from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, send, emit
import eventlet
import os
from dotenv import load_dotenv
load_dotenv()

from chatbot import conversation

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

import time

def generate_text():
    words = ['This', 'is', 'an', 'example', 'of', 'streaming', 'text', 'word', 'by', 'word.']
    for word in words:
        yield word
        eventlet.sleep(0.1)  # Simulate the time it takes to generate a word

@socketio.on('stream_text')
def stream_text():
    print("starting to stream text")
    for word in generate_text():
        emit('new_word', {'word': word})

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

@socketio.on('message')
def handle_message(msg):
    print(f"Received message: {msg}")

    # message = f"Did you just say {msg} ?!"
    answer = conversation.predict(input=msg)
    print("answer : " + answer)
    socketio.send(answer)

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('127.0.0.1', 3001)), app)
