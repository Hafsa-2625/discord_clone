const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/friends', require('./routes/friendsRoutes'));
app.use('/api/servers', require('./routes/serverRoutes'));
app.use('/api/dms', require('./routes/dmRoutes'));
app.use('/api/channels', require('./routes/channelsRoutes'));
app.use('/api/group-dms', require('./routes/groupDMRoutes'));

module.exports = app;
