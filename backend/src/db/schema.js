const { users } = require('./usersSchema');
const { friendRequests } = require('./friendRequestsSchema');
const { friends } = require('./friendsSchema');
const { messages } = require('./messagesSchema');
const { messageSessions } = require('./messageSessionsSchema');
const { dmAttachments } = require('./dmAttachmentsSchema');
const { groupDMSessions, groupDMMembers } = require('./groupDMSchema');
// Do not import or export servers here

module.exports = { users, friendRequests, friends, messages, messageSessions, dmAttachments, groupDMSessions, groupDMMembers }; 