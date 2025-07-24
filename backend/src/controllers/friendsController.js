const { db, users, friendRequests, friends } = require('../db');
const { eq, and, or, inArray } = require('drizzle-orm');

exports.sendFriendRequest = async (req, res) => {
  const senderId = req.user.id;
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: 'Username is required.' });
  const receiver = await db.select().from(users).where(eq(users.name, username));
  if (!receiver[0]) return res.status(404).json({ message: 'User not found.' });
  const receiverId = receiver[0].id;
  if (receiverId === senderId) return res.status(400).json({ message: 'Cannot add yourself.' });
  const existing = await db.select().from(friendRequests).where(and(eq(friendRequests.senderId, senderId), eq(friendRequests.receiverId, receiverId)));
  if (existing.length > 0) return res.status(400).json({ message: 'Friend request already sent.' });
  await db.insert(friendRequests).values({ senderId, receiverId, status: 'pending' });
  res.json({ message: 'Friend request sent.' });
};

exports.getFriendRequests = async (req, res) => {
  const userId = req.user.id;
  const requests = await db.select().from(friendRequests)
    .where(and(eq(friendRequests.receiverId, userId), eq(friendRequests.status, 'pending')));
  const result = await Promise.all(requests.map(async (reqq) => {
    const sender = await db.select().from(users).where(eq(users.id, reqq.senderId));
    return {
      id: reqq.id,
      senderId: reqq.senderId,
      senderName: sender[0]?.name || '',
      senderProfilePicture: sender[0]?.profilePicture || null,
      createdAt: reqq.createdAt,
    };
  }));
  res.json(result);
};

exports.respondToFriendRequest = async (req, res) => {
  const userId = req.user.id;
  const { requestId, action } = req.body; // action: 'accept' or 'reject'
  const requests = await db.select().from(friendRequests).where(and(eq(friendRequests.id, requestId), eq(friendRequests.receiverId, userId)));
  const request = requests[0];
  if (!request) return res.status(404).json({ message: 'Request not found.' });
  if (request.status !== 'pending') return res.status(400).json({ message: 'Request already handled.' });
  if (action === 'accept') {
    await db.insert(friends).values([
      { userId: userId, friendId: request.senderId },
      { userId: request.senderId, friendId: userId },
    ]);
    await db.update(friendRequests).set({ status: 'accepted' }).where(eq(friendRequests.id, requestId));
    return res.json({ message: 'Friend request accepted.' });
  } else if (action === 'reject') {
    await db.update(friendRequests).set({ status: 'rejected' }).where(eq(friendRequests.id, requestId));
    return res.json({ message: 'Friend request rejected.' });
  } else {
    return res.status(400).json({ message: 'Invalid action.' });
  }
};

exports.getFriends = async (req, res) => {
  const userId = req.user.id;
  const relations = await db.select().from(friends).where(eq(friends.userId, userId));
  const friendIds = relations.map(r => r.friendId);
  if (friendIds.length === 0) return res.json([]);
  const friendUsers = await db.select().from(users).where(inArray(users.id, friendIds));
  const result = friendUsers.map(u => ({
    id: u.id,
    name: u.name,
    profilePicture: u.profilePicture || null,
    status: 'offline',
    createdAt: u.createdAt,
  }));
  res.json(result);
};

exports.unfriend = async (req, res) => {
  const userId = req.user.id;
  const { friendId } = req.body;
  
  if (!friendId) return res.status(400).json({ message: 'Friend ID is required.' });
  if (friendId === userId) return res.status(400).json({ message: 'Cannot unfriend yourself.' });
  
  try {
    
    await db.delete(friends).where(
      and(eq(friends.userId, userId), eq(friends.friendId, friendId))
    );
    await db.delete(friends).where(
      and(eq(friends.userId, friendId), eq(friends.friendId, userId))
    );
    
    res.json({ message: 'Friend removed successfully.' });
  } catch (error) {
    console.error('Error unfriending:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}; 