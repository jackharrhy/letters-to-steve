from contextlib import asynccontextmanager
import aiosqlite

DB_FILE = "steve.db"


@asynccontextmanager
async def get_db():
    db = await aiosqlite.connect(DB_FILE)

    try:
        yield db
    finally:
        await db.close()


async def create_tables(db: aiosqlite.Connection):
    await db.execute(
        """
        CREATE TABLE IF NOT EXISTS counter (
            id INTEGER PRIMARY KEY,
            count INTEGER
        )
        """
    )

    await db.execute(
        """
        INSERT OR IGNORE INTO counter (id, count) VALUES (1, 0)
        """
    )

    await db.commit()


async def increment_counter(db: aiosqlite.Connection) -> int:
    cursor = await db.execute(
        """
        UPDATE counter SET count = count + 1 WHERE id = 1 RETURNING count
        """
    )

    row = await cursor.fetchone()

    if row is None:
        raise ValueError("No row found")

    return row[0]


async def get_counter(db) -> int:
    cursor = await db.execute(
        """
        SELECT count FROM counter WHERE id = 1
        """
    )

    row = await cursor.fetchone()

    if row is None:
        raise ValueError("No row found")

    return row[0]
