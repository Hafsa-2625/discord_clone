const { pgTable, serial, integer, text, timestamp } = require('drizzle-orm/pg-core');

const channelMessages = pgTable('channel_messages', {
  id: serial('id').primaryKey(),
  channel_id: integer('channel_id').notNull(),
  user_id: integer('user_id').notNull(),
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

module.exports = { channelMessages }; 