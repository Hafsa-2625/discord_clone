const { pgTable, serial, integer, varchar, timestamp } = require('drizzle-orm/pg-core');

const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').notNull(),
  receiverId: integer('receiver_id').notNull(),
  content: varchar('content', { length: 2000 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = { messages }; 