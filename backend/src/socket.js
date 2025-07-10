const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { db, messages, messageSessions } = require('./db');
const { and, or, eq, asc } = require('drizzle-orm');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Store online users: { userId: socketId }
const onlineUsers = {};

io.on('connection', (socket) => {
  // User joins with their userId
  socket.on('join', (userId) => {
    onlineUsers[userId] = socket.id;
  });

  // Handle sending a DM
  socket.on('send_dm', async ({ senderId, receiverId, message }) => {
    // Ensure a message session exists for this user pair
    let session = await db.select().from(messageSessions)
      .where(
        or(
          and(eq(messageSessions.user1Id, senderId), eq(messageSessions.user2Id, receiverId)),
          and(eq(messageSessions.user1Id, receiverId), eq(messageSessions.user2Id, senderId))
        )
      ).limit(1);
    if (!session.length) {
      await db.insert(messageSessions).values({ user1Id: senderId, user2Id: receiverId });
    }
    // Save message to DB
    await db.insert(messages).values({
      senderId,
      receiverId,
      content: message,
    });
    const receiverSocketId = onlineUsers[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_dm', { senderId, message });
    }
  });

  // Fetch chat history between two users
  socket.on('fetch_dm_history', async ({ userId, friendId }, callback) => {
    const chatHistory = await db.select().from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId), eq(messages.receiverId, friendId)),
          and(eq(messages.senderId, friendId), eq(messages.receiverId, userId))
        )
      )
      .orderBy(asc(messages.createdAt));
    callback(chatHistory);
  });

  // Fetch all DM sessions for a user
  socket.on('fetch_dm_sessions', async ({ userId }, callback) => {
    const sessions = await db.select().from(messageSessions)
      .where(or(eq(messageSessions.user1Id, userId), eq(messageSessions.user2Id, userId)));
    callback(sessions);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    for (const [userId, sockId] of Object.entries(onlineUsers)) {
      if (sockId === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }
  });
});

module.exports = { server }; 