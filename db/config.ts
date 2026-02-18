import { defineDb, defineTable, column } from "astro:db";

const Counter = defineTable({
  columns: {
    count: column.number({ default: 0 }),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Counter,
  },
});
