const { pgTable, serial, integer, varchar, timestamp } = require('drizzle-orm/pg-core');

const channelInvites = pgTable('channel_invites', {
  id: serial('id').primaryKey(),
  channelId: integer('channel_id').notNull(),
  inviterId: integer('inviter_id').notNull(),
  inviteeId: integer('invitee_id').notNull(),
  status: varchar('status', { length: 16 }).default('pending'), // 'pending', 'accepted', 'declined'
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = { channelInvites }; 