const { pgTable, serial, integer, varchar, timestamp } = require("drizzle-orm/pg-core");

const dmAttachments = pgTable("dm_attachments", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  fileUrl: varchar("file_url", { length: 512 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 64 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

module.exports = { dmAttachments }; 