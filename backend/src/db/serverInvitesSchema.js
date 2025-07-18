const { pgTable, serial, integer, varchar, timestamp } = require('drizzle-orm/pg-core');

const serverInvites = pgTable('server_invites', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 16 }).notNull().unique(),
  serverId: integer('server_id').notNull(),
  createdBy: integer('created_by').notNull(),
  channelId: integer('channel_id'),
  expiresAt: timestamp('expires_at'),
  uses: integer('uses').default(0),
  maxUses: integer('max_uses'),
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = { serverInvites }; 