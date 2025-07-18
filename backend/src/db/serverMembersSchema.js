const { pgTable, serial, integer, varchar, timestamp } = require('drizzle-orm/pg-core');

const serverMembers = pgTable('server_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  serverId: integer('server_id').notNull(),
  role: varchar('role', { length: 20 }).default('member'),
  joinedAt: timestamp('joined_at').defaultNow(),
});

module.exports = { serverMembers }; 