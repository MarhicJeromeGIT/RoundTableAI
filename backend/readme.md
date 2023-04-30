

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

docker build -t my-python-app .
docker run --name my-running-app -p 3001:3001 my-python-app

docker run -it my-python-app bash


gunicorn --worker-class eventlet -w 1 app:app -b 127.0.0.1:3001

app is at 
```
cd /var/www/roundtableai-backend/current/backend
```