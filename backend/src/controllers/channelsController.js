const { db } = require('../db');
const { channels } = require('../db/channelsSchema');
const { eq } = require('drizzle-orm');

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
    if (!id) return res.status(400).json({ error: 'Channel id is required' });
    const channel = await db.select().from(channels).where(eq(channels.id, parseInt(id, 10)));
    if (!channel || channel.length === 0) return res.status(404).json({ error: 'Channel not found' });
    res.json(channel[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch channel' });
  }
}

module.exports = {
  createChannel,
  getChannels,
  deleteChannel,
  getChannelById,
}; 