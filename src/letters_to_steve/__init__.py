import asyncio
from fastapi import FastAPI, Request
import uvicorn
from loguru import logger
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from letters_to_steve.db import get_db, increment_counter, get_counter, create_tables
from sse_starlette.sse import EventSourceResponse

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
def index_route(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")


counter_check_delay = 1


async def counter_check(request):
    while True:
        if await request.is_disconnected():
            logger.debug("Request disconnected")
            break

        async with get_db() as db:
            count = await get_counter(db)

        yield {"event": "count", "data": f"count: {count}"}

        await asyncio.sleep(counter_check_delay)


@app.get("/get-counter")
async def get_counter_route(request: Request):
    return EventSourceResponse(counter_check(request))


@app.post("/inc-counter", response_class=HTMLResponse)
async def inc_counter_route(request: Request):
    async with get_db() as db:
        count = await increment_counter(db)
        await db.commit()

    return templates.TemplateResponse(
        request=request, name="counter.html", context={"count": count}
    )


async def shared():
    async with get_db() as db:
        await create_tables(db)


def dev():
    asyncio.run(shared())
    uvicorn.run("letters_to_steve:app", port=5000, reload=True)


def prod():
    asyncio.run(shared())
    uvicorn.run("letters_to_steve:app", port=5000)
