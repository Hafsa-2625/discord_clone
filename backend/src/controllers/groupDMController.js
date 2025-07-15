const { db, groupDMSessions, groupDMMembers, groupDMMessages, users, groupDMAttachments } = require('../db');
const { eq, inArray } = require('drizzle-orm');

// Create group DM
exports.createGroupDM = async (req, res) => {
  try {
    const { name, memberIds, creatorId } = req.body;
    let imageUrl = null;
    if (req.file) imageUrl = req.file.path;

    // Create group session
    const [group] = await db.insert(groupDMSessions).values({
      name,
      imageUrl,
      creatorId: parseInt(creatorId, 10),
    }).returning();

    // Add members (including creator)
    const allMemberIds = [...new Set([...JSON.parse(memberIds), parseInt(creatorId, 10)])];
    await db.insert(groupDMMembers).values(
      allMemberIds.map(userId => ({
        groupDmId: group.id,
        userId: parseInt(userId, 10),
      }))
    );

    res.json({ group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create group DM' });
  }
};

// Get group DM details
exports.getGroupDMDetails = async (req, res) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    const [group] = await db.select().from(groupDMSessions).where(eq(groupDMSessions.id, groupId));
    const members = await db.select().from(groupDMMembers).where(eq(groupDMMembers.groupDmId, groupId));
    const memberIds = members.map(m => m.userId);
    const memberUsers = memberIds.length
      ? await db.select().from(users).where(inArray(users.id, memberIds))
      : [];
    res.json({ group, members: memberUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch group DM details' });
  }
};

// Get all group DMs for a user
exports.getUserGroupDMs = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const memberships = await db.select().from(groupDMMembers).where(eq(groupDMMembers.userId, userId));
    const groupIds = memberships.map(m => m.groupDmId);
    let groupDMs = [];
    if (groupIds.length > 0) {
      groupDMs = await db.select().from(groupDMSessions).where(inArray(groupDMSessions.id, groupIds));
      // Optionally, fetch members for each group (for sidebar display)
      for (const group of groupDMs) {
        const members = await db.select().from(groupDMMembers).where(eq(groupDMMembers.groupDmId, group.id));
        group.members = members;
      }
    }
    res.json({ groupDMs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user group DMs' });
  }
};

// Fetch all messages for a group DM
exports.getGroupDMMessages = async (req, res) => {
  try {
    const groupDmId = parseInt(req.params.id, 10);
    // Fetch text messages
    const textMessages = await db.select().from(groupDMMessages)
      .where(eq(groupDMMessages.groupDmId, groupDmId))
      .orderBy('created_at');
    // Map text messages to unified format
    const formattedTextMessages = textMessages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.senderName,
      content: msg.content,
      createdAt: msg.createdAt,
      type: 'text',
    }));
    // Fetch file messages
    const fileMessages = await db.select().from(groupDMAttachments)
      .where(eq(groupDMAttachments.groupDmId, groupDmId));
    // Map file messages to unified format
    const formattedFileMessages = fileMessages.map(file => ({
      id: file.id,
      senderId: file.senderId,
      senderName: file.senderName,
      fileUrl: file.fileUrl,
      fileName: file.fileName,
      fileType: file.fileType,
      createdAt: file.createdAt,
      type: 'file',
    }));
    // Combine and sort by createdAt
    const allMessages = [...formattedTextMessages, ...formattedFileMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json({ messages: allMessages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch group DM messages' });
  }
};

// Send a new message to a group DM
exports.sendGroupDMMessage = async (req, res) => {
  try {
    const groupDmId = parseInt(req.params.id, 10);
    const { senderId, senderName, content } = req.body;
    const [message] = await db.insert(groupDMMessages).values({
      groupDmId,
      senderId,
      senderName,
      content,
    }).returning();
    res.json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send group DM message' });
  }
};

// Group DM file upload
exports.uploadGroupDMFile = async (req, res) => {
  console.log('POST /api/group-dms/upload called');
  console.log('Body:', req.body);
  console.log('File:', req.file);
  try {
    const { groupDmId, senderId, senderName } = req.body;
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = req.file.path;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;

    // Save as a file message in groupDMAttachments
    const [attachment] = await db.insert(groupDMAttachments).values({
      groupDmId: parseInt(groupDmId, 10),
      senderId: parseInt(senderId, 10),
      senderName,
      fileUrl,
      fileName,
      fileType,
    }).returning();

    console.log('File uploaded and saved to DB:', attachment);
    res.json({ attachment });
  } catch (err) {
    console.error('Error uploading file to group DM:', err);
    res.status(500).json({ error: 'Failed to upload file' });
  }
}; 