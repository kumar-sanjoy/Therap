FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .

ENV FLASK_APP=app.py
RUN pip install --no-cache-dir -r requirements.txt
ENV FLASK_RUN_HOST=0.0.0.0
COPY . .
ENV GOOGLE_API_KEY="AIzaSyDPdFfFzkIYl8P9hUAFrdBUVwIoaQmlDt4"
EXPOSE 5000
CMD ["python", "app.py"]

# docker build -t pyflask-app:1.0 .
