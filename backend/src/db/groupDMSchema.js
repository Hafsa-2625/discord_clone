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

const groupDMMessages = pgTable('group_dm_messages', {
  id: serial('id').primaryKey(),
  groupDmId: integer('group_dm_id').notNull(),
  senderId: integer('sender_id').notNull(),
  senderName: varchar('sender_name', { length: 255 }).notNull(),
  content: varchar('content', { length: 2000 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

const groupDMAttachments = pgTable('group_dm_attachments', {
  id: serial('id').primaryKey(),
  groupDmId: integer('group_dm_id').notNull(),
  senderId: integer('sender_id').notNull(),
  senderName: varchar('sender_name', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 512 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 64 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = { groupDMSessions, groupDMMembers, groupDMMessages , groupDMAttachments}; 