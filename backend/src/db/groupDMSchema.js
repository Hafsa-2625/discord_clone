const { pgTable, serial, integer, varchar, timestamp } = require('drizzle-orm/pg-core');

const groupDMSessions = pgTable('group_dm_sessions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  imageUrl: varchar('image_url', { length: 512 }),
  creatorId: integer('creator_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

const groupDMMembers = pgTable('group_dm_members', {
  id: serial('id').primaryKey(),
  groupDmId: integer('group_dm_id').notNull(),
  userId: integer('user_id').notNull(),
});

module.exports = { groupDMSessions, groupDMMembers }; 