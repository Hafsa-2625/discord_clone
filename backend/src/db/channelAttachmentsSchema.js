const { pgTable, serial, integer, text, timestamp } = require('drizzle-orm/pg-core');

const channelAttachments = pgTable('channel_attachments', {
  id: serial('id').primaryKey(),
  channel_id: integer('channel_id').notNull(),
  user_id: integer('user_id').notNull(),
  file_url: text('file_url').notNull(),
  file_name: text('file_name').notNull(),
  file_type: text('file_type').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

module.exports = { channelAttachments }; 