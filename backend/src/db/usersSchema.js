const { pgTable, serial, varchar, timestamp } = require('drizzle-orm/pg-core');

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  profilePicture: varchar('profile_picture', { length: 500 }), // URL to profile picture
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = { users }; 