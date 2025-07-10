const { pgTable, serial, integer, timestamp } = require('drizzle-orm/pg-core');

const friends = pgTable('friends', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  friendId: integer('friend_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  unique: [table.userId, table.friendId],
}));

module.exports = { friends }; 