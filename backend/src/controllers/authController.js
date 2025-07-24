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
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, profilePicture: user.profilePicture } });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user?.id; // Assuming middleware sets req.user
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Get current user
    const found = await db.select().from(users).where(eq(users.id, userId));
    const user = found[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const emailExists = await db.select().from(users).where(eq(users.email, email));
      if (emailExists.length > 0 && emailExists[0].id !== userId) {
        return res.status(400).json({ error: 'Email is already taken' });
      }
    }

    // Prepare update data
    const updateData = { name, email };

    // If password is being changed, validate and hash it
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }

      // Verify current password
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedNewPassword;
    }

    // Update user in database
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    // Return updated user data (without password)
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get current user
    const found = await db.select().from(users).where(eq(users.id, userId));
    const user = found[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data (without password)
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    console.log('Upload profile picture request received');
    console.log('User:', req.user);
    console.log('File:', req.file);
    
    const userId = req.user?.id;
    
    if (!userId) {
      console.log('No userId found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      console.log('No file found in request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Get the uploaded image URL from Cloudinary
    const profilePictureUrl = req.file.path;
    console.log('Cloudinary URL:', profilePictureUrl);

    // Update user's profile picture in database
    const [updatedUser] = await db
      .update(users)
      .set({ profilePicture: profilePictureUrl })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      console.log('User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Profile picture updated successfully');
    
    // Emit profile update to connected users
    const io = require('../socket').getIO();
    if (io) {
      // Notify all users about the profile picture update
      io.emit('profile_picture_updated', {
        userId: updatedUser.id,
        profilePicture: updatedUser.profilePicture
      });
    }
    
    // Return updated user data
    res.json({
      message: 'Profile picture updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture
      }
    });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};