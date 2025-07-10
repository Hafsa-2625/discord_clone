const { pgTable, serial, integer, varchar, timestamp } = require('drizzle-orm/pg-core');

const friendRequests = pgTable('friend_requests', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').notNull(),
  receiverId: integer('receiver_id').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = { friendRequests }; 