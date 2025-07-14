const { pgTable, serial, varchar, integer, text, timestamp } = require('drizzle-orm/pg-core');

const servers = pgTable('servers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  image_url: text('image_url'),
  owner_id: integer('owner_id').notNull(), // Foreign key to users.id
  created_at: timestamp('created_at').defaultNow(),
});

module.exports = { servers }; 