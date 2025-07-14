const express = require('express');
const router = express.Router();
const upload = require('../utils/multerCloudinary');
const { db, groupDMSessions, groupDMMembers, users } = require('../db');
const { eq, inArray } = require('drizzle-orm');

// Create group DM
router.post('/', upload.single('image'), async (req, res) => {
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
});

// Get group DM details
router.get('/:id', async (req, res) => {
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
});

// Get all group DMs for a user
router.get('/user/:userId', async (req, res) => {
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
});

module.exports = router; 