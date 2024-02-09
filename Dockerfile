FROM python:3.12-slim

WORKDIR /code

COPY ./README.md ./README.md
COPY ./pyproject.toml ./pyproject.toml
COPY ./requirements.lock ./requirements.lock
COPY ./src ./src
COPY ./templates ./templates
COPY ./static ./static
COPY ./prod.py ./prod.py

RUN pip install --no-cache-dir --upgrade -r ./requirements.lock

CMD ["python", "prod.py"]
