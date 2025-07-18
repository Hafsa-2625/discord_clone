const { db } = require('../db');
const { channels } = require('../db/channelsSchema');
const { channelInvites } = require('../db/channelInvitesSchema');
const { channelMembers } = require('../db/channelMembersSchema');
const { users } = require('../db/usersSchema');
const { channelMessages } = require('../db/channelMessagesSchema');
const { channelAttachments } = require('../db/channelAttachmentsSchema');
const { upload } = require('../utils/multerCloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { cloudinary } = require('../utils/multerCloudinary');
const { and, eq } = require('drizzle-orm');
const { uploadChannelAttachmentMulter } = require('../utils/multerChannelAttachments');
const { serverMembers } = require('../db');
// Create a new channel
async function createChannel(req, res) {
  try {
    const { serverId, name, type } = req.body;
    if (!serverId || !name || !type) {
      return res.status(400).json({ error: 'serverId, name, and type are required' });
    }
    const [newChannel] = await db.insert(channels).values({
      serverId: parseInt(serverId, 10),
      name,
      type,
    }).returning();
    res.status(201).json(newChannel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create channel' });
  }
}

// Get all channels for a server
async function getChannels(req, res) {
  try {
    const { serverId } = req.params;
    if (!serverId) {
      return res.status(400).json({ error: 'serverId is required' });
    }
    const serverChannels = await db.select().from(channels).where(eq(channels.serverId, parseInt(serverId, 10)));
    res.json(serverChannels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
}

// Delete a channel by id
async function deleteChannel(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Channel id is required' });
    }
    await db.delete(channels).where(eq(channels.id, parseInt(id, 10)));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete channel' });
  }
}

// Get a single channel by id
async function getChannelById(req, res) {
  try {
    const { id } = req.params;
    const channelId = parseInt(id, 10);
    if (!id || isNaN(channelId)) return res.status(400).json({ error: 'Invalid channel id' });
    const channel = await db.select().from(channels).where(eq(channels.id, channelId));
    if (!channel || channel.length === 0) return res.status(404).json({ error: 'Channel not found' });
    res.json(channel[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch channel' });
  }
}

// Send a channel invite
async function sendChannelInvite(req, res) {
  try {
    const { channelId } = req.params;
    const { inviteeId } = req.body;
    const inviterId = req.user?.id || req.body.inviterId; // fallback for testing
    if (!channelId || !inviteeId || !inviterId) {
      return res.status(400).json({ error: 'channelId, inviterId, and inviteeId are required' });
    }
    const parsedChannelId = parseInt(channelId, 10);
    const parsedInviteeId = parseInt(inviteeId, 10);
    const parsedInviterId = parseInt(inviterId, 10);
    if (isNaN(parsedChannelId) || isNaN(parsedInviteeId) || isNaN(parsedInviterId)) {
      return res.status(400).json({ error: 'Invalid channelId, inviteeId, or inviterId' });
    }
    // Check for existing pending invite
    const existing = await db.select().from(channelInvites)
      .where(and(eq(channelInvites.channelId, parsedChannelId), eq(channelInvites.inviteeId, parsedInviteeId), eq(channelInvites.status, 'pending')));
    if (existing.length) return res.status(400).json({ error: 'Invite already sent' });
    await db.insert(channelInvites).values({ channelId: parsedChannelId, inviterId: parsedInviterId, inviteeId: parsedInviteeId, status: 'pending' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send invite' });
  }
}

// Get pending invites for a user
async function getChannelInvites(req, res) {
  try {
    console.log('getChannelInvites - req.query:', req.query);
    const { userId } = req.query;
    const parsedUserId = parseInt(userId, 10);
    console.log('getChannelInvites - userId:', userId, 'parsedUserId:', parsedUserId);
    if (isNaN(parsedUserId)) {
      console.log('getChannelInvites - Invalid userId:', userId);
      return res.status(400).json({ error: 'Invalid userId' });
    }
    const invites = await db.select().from(channelInvites)
      .where(and(eq(channelInvites.inviteeId, parsedUserId), eq(channelInvites.status, 'pending')));
    res.json(invites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch invites' });
  }
}

// Respond to a channel invite
async function respondToChannelInvite(req, res) {
  try {
    const { inviteId } = req.params;
    const { action } = req.body;
    if (!inviteId || !action) return res.status(400).json({ error: 'inviteId and action required' });
    const inviteArr = await db.select().from(channelInvites).where(eq(channelInvites.id, parseInt(inviteId, 10)));
    const invite = inviteArr[0];
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    if (invite.status !== 'pending') return res.status(400).json({ error: 'Invite already handled' });
    if (action === 'accept') {
      // Get the channel to find the serverId
      const channelArr = await db.select().from(channels).where(eq(channels.id, invite.channelId));
      const channel = channelArr[0];
      if (!channel) return res.status(404).json({ error: 'Channel not found' });
      const serverId = channel.serverId;
      // Add to server members if not already a member
      const existingServerMember = await db.select().from(serverMembers)
        .where(and(eq(serverMembers.serverId, serverId), eq(serverMembers.userId, invite.inviteeId)));
      if (existingServerMember.length === 0) {
        await db.insert(serverMembers).values({ serverId, userId: invite.inviteeId });
      }
      // Add to channel members if not already a member
      const existingChannelMember = await db.select().from(channelMembers)
        .where(and(eq(channelMembers.channelId, invite.channelId), eq(channelMembers.userId, invite.inviteeId)));
      if (existingChannelMember.length === 0) {
      await db.insert(channelMembers).values({ channelId: invite.channelId, userId: invite.inviteeId });
      }
      await db.update(channelInvites).set({ status: 'accepted' }).where(eq(channelInvites.id, parseInt(inviteId, 10)));
      return res.json({ success: true });
    } else if (action === 'decline') {
      await db.update(channelInvites).set({ status: 'declined' }).where(eq(channelInvites.id, parseInt(inviteId, 10)));
      return res.json({ success: true });
    }
    res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to respond to invite' });
  }
}

// Send a message in a channel (persist to DB)
async function sendChannelMessage(req, res) {
  try {
    const { channelId, content } = req.body;
    const userId = req.user?.id || req.body.userId; // fallback for testing
    if (!channelId || !content || !userId) {
      return res.status(400).json({ error: 'channelId, content, and userId are required' });
    }
    const [newMessage] = await db.insert(channelMessages).values({
      channel_id: parseInt(channelId, 10),
      user_id: parseInt(userId, 10),
      content,
    }).returning();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send channel message' });
  }
}

// Get all messages for a channel
async function getChannelMessages(req, res) {
  try {
    const { channelId } = req.params;
    if (!channelId) {
      return res.status(400).json({ error: 'channelId is required' });
    }
    // Use Drizzle's .select({ ... }) object syntax to avoid stack overflow
    const messages = await db
      .select({
        id: channelMessages.id,
        user_id: channelMessages.user_id,
        content: channelMessages.content,
        created_at: channelMessages.created_at,
        userName: users.name,
      })
      .from(channelMessages)
      .leftJoin(users, eq(channelMessages.user_id, users.id))
      .where(eq(channelMessages.channel_id, parseInt(channelId, 10)))
      .orderBy(channelMessages.created_at);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch channel messages' });
  }
}

// Upload a file to a channel
async function uploadChannelAttachment(req, res) {
  try {
    const { channelId } = req.params;
    const userId = req.user?.id || req.body.userId; // fallback for testing
    if (!req.file || !channelId || !userId) {
      return res.status(400).json({ error: 'file, channelId, and userId are required' });
    }
    const file = req.file;
    const [attachment] = await db.insert(channelAttachments).values({
      channel_id: parseInt(channelId, 10),
      user_id: parseInt(userId, 10),
      file_url: file.path,
      file_name: file.originalname,
      file_type: file.mimetype,
    }).returning();
    res.status(201).json(attachment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload channel attachment' });
  }
}

// Get all attachments for a channel
async function getChannelAttachments(req, res) {
  try {
    const { channelId } = req.params;
    if (!channelId) {
      return res.status(400).json({ error: 'channelId is required' });
    }
    const attachments = await db.select().from(channelAttachments)
      .where(eq(channelAttachments.channel_id, parseInt(channelId, 10)))
      .orderBy(channelAttachments.created_at);
    res.json(attachments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch channel attachments' });
  }
}

module.exports = {
  createChannel,
  getChannels,
  deleteChannel,
  getChannelById,
  sendChannelInvite,
  getChannelInvites,
  respondToChannelInvite,
  sendChannelMessage,
  getChannelMessages,
  uploadChannelAttachment,
  uploadChannelAttachmentMulter,
  getChannelAttachments,
}; 