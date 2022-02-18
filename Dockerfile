FROM python:3.8.6

ADD . /app
WORKDIR /app

RUN pip install --upgrade pip && pip install -r requirements.txt

CMD ["gunicorn", \
     "--bind", "0.0.0.0:5000", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "--workers", "1", \
     "--worker-class", "gthread", \
     "--threads", "20", "app:app"]
