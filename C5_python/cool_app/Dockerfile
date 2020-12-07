FROM python:3.8

RUN mkdir /code

WORKDIR /code

ADD . /code

RUN ["chmod", "+x", "run_app.sh"]

RUN pip install -r requirements.txt