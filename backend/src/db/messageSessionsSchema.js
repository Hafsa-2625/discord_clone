const { pgTable, serial, integer, timestamp } = require('drizzle-orm/pg-core');

const messageSessions = pgTable('message_sessions', {
  id: serial('id').primaryKey(),
  user1Id: integer('user1_id').notNull(),
  user2Id: integer('user2_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = { messageSessions }; 