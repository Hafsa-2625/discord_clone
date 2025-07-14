const { pgTable, serial, integer, varchar, timestamp } = require('drizzle-orm/pg-core');

const channels = pgTable('channels', {
  id: serial('id').primaryKey(),
  serverId: integer('server_id').notNull(), // FK to servers.id
  name: varchar('name', { length: 64 }).notNull(),
  type: varchar('type', { length: 16 }).notNull(), // 'text' or 'voice'
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = { channels }; 