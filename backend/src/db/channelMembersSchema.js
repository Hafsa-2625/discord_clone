const { pgTable, serial, integer, timestamp } = require('drizzle-orm/pg-core');

const channelMembers = pgTable('channel_members', {
  id: serial('id').primaryKey(),
  channelId: integer('channel_id').notNull(),
  userId: integer('user_id').notNull(),
  joinedAt: timestamp('joined_at').defaultNow(),
});

module.exports = { channelMembers }; 