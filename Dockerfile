FROM python:3.12-slim

WORKDIR /code

COPY ./README.md ./README.md
COPY ./pyproject.toml ./pyproject.toml
COPY ./requirements.lock ./requirements.lock
COPY ./src ./src
COPY ./templates ./templates
COPY ./static ./static

RUN pip install --no-cache-dir --upgrade -r ./requirements.lock

CMD ["uvicorn", "letters_to_steve:app", "--proxy-headers", "--host", "0.0.0.0", "--port", "80"]
