const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { db, messages, messageSessions, groupDMMessages } = require('./db');
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

  // Join a group DM room
  socket.on('join_group_dm', (groupDmId) => {
    socket.join(`group_dm_${groupDmId}`);
  });

  // Send a group DM message
  socket.on('send_group_dm', async ({ groupDmId, senderId, senderName, content }) => {
    // Save message to DB
    const [message] = await db.insert(groupDMMessages).values({
      groupDmId,
      senderId,
      senderName,
      content,
    }).returning();
    // Emit to all in the group room
    io.to(`group_dm_${groupDmId}`).emit('receive_group_dm', message);
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