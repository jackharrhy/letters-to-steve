import { column as c, table, type TableRow } from 'remix/data-table'

export const letterStates = ['inbox', 'draft', 'published', 'archived'] as const
export type LetterState = (typeof letterStates)[number]

export const letters = table({
  name: 'letters',
  columns: {
    id: c.integer().primaryKey().autoIncrement(),
    author: c.text().notNull(),
    email: c.text().nullable(),
    body: c.text().notNull(),
    can_publish: c.boolean().notNull(),
    state: c.enum(letterStates).notNull(),
    created_at: c.integer().notNull(),
    private_replied_at: c.integer().nullable(),
  },
})

export type Letter = TableRow<typeof letters>

export const issueStates = ['draft', 'published'] as const
export type IssueState = (typeof issueStates)[number]

export const issues = table({
  name: 'issues',
  columns: {
    id: c.integer().primaryKey().autoIncrement(),
    response: c.text().notNull(),
    state: c.enum(issueStates).notNull(),
    created_at: c.integer().notNull(),
    updated_at: c.integer().notNull(),
    published_at: c.integer().nullable(),
  },
})

export type Issue = TableRow<typeof issues>

export const issueLetters = table({
  name: 'issue_letters',
  columns: {
    id: c.integer().primaryKey().autoIncrement(),
    issue_id: c
      .integer()
      .notNull()
      .references('issues', 'id', 'issue_letters_issue_fk')
      .onDelete('cascade'),
    letter_id: c
      .integer()
      .notNull()
      .unique('issue_letters_letter_unique')
      .references('letters', 'id', 'issue_letters_letter_fk'),
    position: c.integer().notNull(),
    public_author: c.text().notNull(),
    public_body: c.text().notNull(),
  },
})

export type IssueLetter = TableRow<typeof issueLetters>
