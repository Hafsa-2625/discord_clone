const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { users, friendRequests, friends, messages, messageSessions, dmAttachments, groupDMSessions, groupDMMembers } = require('./schema');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

module.exports = { db, users, friendRequests, friends, messages, messageSessions, dmAttachments, groupDMSessions, groupDMMembers };