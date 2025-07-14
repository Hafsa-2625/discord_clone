const express = require('express');
const router = express.Router();
const upload = require('../utils/multerCloudinary');
const { db } = require('../db');
const { messageSessions } = require('../db/messageSessionsSchema');
const { dmAttachments } = require('../db/dmAttachmentsSchema');
const { eq, or, and } = require('drizzle-orm');

// GET /api/dms/list?userId=123 - get all DM sessions for the user
router.get('/list', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    const sessions = await db.select().from(messageSessions)
      .where(or(eq(messageSessions.user1Id, parseInt(userId, 10)), eq(messageSessions.user2Id, parseInt(userId, 10))));
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch DM sessions' });
  }
});

// DM file upload
router.post('/upload', upload.single('file'), async (req, res) => {
  const { sessionId, senderId, receiverId } = req.body;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const fileUrl = req.file.path;
  const fileName = req.file.originalname;
  const fileType = req.file.mimetype;

  const [attachment] = await db.insert(dmAttachments).values({
    sessionId: parseInt(sessionId, 10),
    senderId: parseInt(senderId, 10),
    receiverId: parseInt(receiverId, 10),
    fileUrl,
    fileName,
    fileType,
  }).returning();

  res.json({ attachment });
});

// GET /api/dms/:sessionId/messages - get all text and file messages for a DM session
router.get('/:sessionId/messages', async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
  try {
    const { db, messages, dmAttachments, messageSessions } = require('../db');
    // Find the session to get user1Id and user2Id
    const session = await db.select().from(messageSessions).where(eq(messageSessions.id, parseInt(sessionId, 10)));
    if (!session.length) return res.status(404).json({ error: 'Session not found' });
    const { user1Id, user2Id } = session[0];
    // Fetch text messages between these users
    const textMessages = await db.select().from(messages)
      .where(
        or(
          and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
          and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
        )
      );
    // Map text messages to unified format
    const formattedTextMessages = textMessages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      content: msg.content,
      createdAt: msg.createdAt,
      type: 'text',
    }));
    // Fetch file messages for this session
    const fileMessages = await db.select().from(dmAttachments)
      .where(eq(dmAttachments.sessionId, parseInt(sessionId, 10)));
    // Map file messages to unified format
    const formattedFileMessages = fileMessages.map(file => ({
      id: file.id,
      senderId: file.senderId,
      receiverId: file.receiverId,
      fileUrl: file.fileUrl,
      fileName: file.fileName,
      fileType: file.fileType,
      createdAt: file.createdAt,
      type: 'file',
    }));
    // Combine and sort by createdAt
    const allMessages = [...formattedTextMessages, ...formattedFileMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json(allMessages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch DM messages' });
  }
});

module.exports = router; 