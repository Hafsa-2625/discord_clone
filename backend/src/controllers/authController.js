const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db, users } = require('../db');
const { eq } = require('drizzle-orm');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return res.status(400).json({ message: 'User already exists.' });
  }
  const hashed = await bcrypt.hash(password, 10);
  await db.insert(users).values({ name, email, password: hashed });
  res.status(201).json({ message: 'User registered successfully.' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  const found = await db.select().from(users).where(eq(users.email, email));
  const user = found[0];
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials.' });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ message: 'Invalid credentials.' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
};