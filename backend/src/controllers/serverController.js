const { db } = require('../db');
const { servers } = require('../db/serversSchema');
const { serverMembers } = require('../db');
const { eq, inArray } = require('drizzle-orm');
const { serverInvites } = require('../db');
const crypto = require('crypto');
const { and } = require('drizzle-orm');

// Create a new server (with image upload)
async function createServer(req, res) {
  try {
    const { name, owner_id } = req.body;
    const image_url = req.file ? req.file.path : null;
    if (!name || !owner_id) {
      return res.status(400).json({ error: 'Name and owner_id are required' });
    }
    const [createdServer] = await db.insert(servers).values({
      name,
      image_url,
      owner_id: parseInt(owner_id, 10),
    }).returning();
    // Add creator to serverMembers as 'owner'
    await db.insert(serverMembers).values({
      userId: parseInt(owner_id, 10),
      serverId: createdServer.id,
      role: 'owner',
    });
    res.status(201).json(createdServer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server creation failed' });
  }
}

// Get all servers owned by the user
async function getServers(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }
    const userServers = await db.select().from(servers).where(eq(servers.owner_id, parseInt(userId, 10)));
    res.json({ servers: userServers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch servers' });
  }
}

// Get a single server by ID
async function getServerById(req, res) {
  try {
    const { id } = req.params;
    const [server] = await db.select().from(servers).where(eq(servers.id, parseInt(id, 10)));
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }
    res.json({ server });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch server' });
  }
}

// Get all servers where a user is a member
async function getServersForUser(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }
    // Find all serverIds where user is a member
    const memberships = await db.select().from(serverMembers).where(eq(serverMembers.userId, userId));
    const serverIds = memberships.map(m => m.serverId);
    if (serverIds.length === 0) return res.json([]);
    // Get server details
    const userServers = await db.select().from(servers).where(inArray(servers.id, serverIds));
    res.json(userServers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user servers' });
  }
}

// Create a new invite link for a server
async function createServerInvite(req, res) {
  try {
    const { serverId } = req.params;
    const { channelId, expiresAt, maxUses } = req.body;
    const code = crypto.randomBytes(6).toString('base64url');
    const [invite] = await db.insert(serverInvites).values({
      code,
      serverId: parseInt(serverId, 10),
      createdBy: req.user?.id || 1, // fallback to 1 if not using auth
      channelId: channelId ? parseInt(channelId, 10) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      maxUses: maxUses ? parseInt(maxUses, 10) : null,
    }).returning();
    res.json({ inviteUrl: `${req.protocol}://${req.get('host')}/invite/${invite.code}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create invite' });
  }
}

// Join a server via invite code
async function joinServerByInviteCode(req, res) {
  try {
    const { inviteCode } = req.params;
    const userId = req.user?.id || req.body.userId; // fallback for testing
    if (!userId) return res.status(400).json({ error: 'User ID required' });
    // Find invite
    const inviteArr = await db.select().from(serverInvites).where(eq(serverInvites.code, inviteCode));
    const invite = inviteArr[0];
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    // Check expiry
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Invite expired' });
    }
    // Check max uses
    if (invite.maxUses && invite.uses >= invite.maxUses) {
      return res.status(400).json({ error: 'Invite has reached max uses' });
    }
    // Add user to serverMembers if not already a member
    const existing = await db.select().from(serverMembers)
      .where(and(eq(serverMembers.serverId, invite.serverId), eq(serverMembers.userId, userId)));
    if (existing.length === 0) {
      await db.insert(serverMembers).values({ serverId: invite.serverId, userId });
    }
    // Increment uses
    await db.update(serverInvites).set({ uses: (invite.uses || 0) + 1 }).where(eq(serverInvites.id, invite.id));
    // Optionally add to channelMembers if invite.channelId
    if (invite.channelId) {
      const { channelMembers } = require('../db');
      const channelExists = await db.select().from(channelMembers)
        .where(and(eq(channelMembers.channelId, invite.channelId), eq(channelMembers.userId, userId)));
      if (channelExists.length === 0) {
        await db.insert(channelMembers).values({ channelId: invite.channelId, userId });
      }
    }
    // Return server info
    const { servers } = require('../db/serversSchema');
    const [server] = await db.select().from(servers).where(eq(servers.id, invite.serverId));
    res.json({ success: true, server });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to join server by invite' });
  }
}

module.exports = {
  createServer,
  getServers,
  getServerById,
  getServersForUser,
  createServerInvite,
  joinServerByInviteCode,
}; 