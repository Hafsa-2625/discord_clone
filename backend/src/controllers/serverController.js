const { db } = require('../db');
const { servers } = require('../db/serversSchema');
const { eq } = require('drizzle-orm');

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

module.exports = {
  createServer,
  getServers,
  getServerById,
}; 