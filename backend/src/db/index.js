const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { users, friendRequests, friends, messages, messageSessions, dmAttachments } = require('./schema');
const { groupDMSessions, groupDMMembers, groupDMMessages, groupDMAttachments } = require('./groupDMSchema');
const { channelInvites } = require('./channelInvitesSchema');
const { channelMembers } = require('./channelMembersSchema');
const { channelMessages } = require('./channelMessagesSchema');
const { channelAttachments } = require('./channelAttachmentsSchema');
const { serverMembers } = require('./serverMembersSchema');
const { serverInvites } = require('./serverInvitesSchema');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

module.exports = {
  db,
  users,
  friendRequests,
  friends,
  messages,
  messageSessions,
  dmAttachments,
  groupDMSessions,
  groupDMMembers,
  groupDMMessages,
  groupDMAttachments,
  channelInvites,
  channelMembers,
  channelMessages,
  channelAttachments,
  serverMembers,
  serverInvites,
};