const { pgTable, serial, varchar, timestamp } = require("drizzle-orm/pg-core");

const dmCallLogs = pgTable("dm_call_logs", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  callerId: varchar("caller_id", { length: 64 }).notNull(),
  receiverId: varchar("receiver_id", { length: 64 }).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  status: varchar("status", { length: 16 }), // e.g., 'completed', 'missed', 'ongoing'
}); 

module.exports = { dmCallLogs };