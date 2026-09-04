import { column as c, table, type TableRow } from 'remix/data-table'

export const letterDesigns = ['airmail', 'graph', 'pressed', 'night'] as const
export type LetterDesign = (typeof letterDesigns)[number]

export const letterVisibilities = ['public', 'private'] as const
export type LetterVisibility = (typeof letterVisibilities)[number]

export const letters = table({
  name: 'letters',
  columns: {
    id: c.integer().primaryKey().autoIncrement(),
    author: c.text().notNull(),
    email: c.text().nullable(),
    body: c.text().notNull(),
    design: c.enum(letterDesigns).notNull(),
    visibility: c.enum(letterVisibilities).notNull(),
    public_reply: c.text().nullable(),
    created_at: c.integer().notNull(),
    replied_at: c.integer().nullable(),
  },
})

export type Letter = TableRow<typeof letters>
