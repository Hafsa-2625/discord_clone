const { users } = require('./usersSchema');
const { friendRequests } = require('./friendRequestsSchema');
const { friends } = require('./friendsSchema');
const { messages } = require('./messagesSchema');
const { messageSessions } = require('./messageSessionsSchema');

module.exports = { users, friendRequests, friends, messages, messageSessions }; 