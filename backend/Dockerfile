# Use the official Python 3.8 image as the base image
FROM python:3.8

# Set the working directory
WORKDIR /app

RUN pip install --upgrade pip

# Copy requirements.txt into the container
COPY requirements.txt .

# Install the required packages using pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Set the environment variable to make Python output unbuffered
ENV PYTHONUNBUFFERED=1

# Start the application
CMD ["gunicorn", "--worker-class", "eventlet", "-w", "1", "-b", "127.0.0.1:3001", "app:app"]