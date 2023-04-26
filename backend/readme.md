

pip install flask flask-socketio eventlet
pip install flask_cors

python3 app.py


# in python console

from chatbot import sllm


# How to deploy the backend

ssh 44.229.112.117
bundle exec cap production deploy
sudo service roundtableai-backend restart

# run with gunicorn

# python 3.8