from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, send
import eventlet

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

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

    message = f"Did you just say {msg} ?!"
    print("sending message")
    socketio.send(message)

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('localhost', 3001)), app)
