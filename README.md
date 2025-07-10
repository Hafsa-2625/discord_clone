# Discord Clone Implementation Plan - PERN Stack

## Project Structure

```
discord-clone/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── socket.js
│   │   │   └── cloudinary.js
│   │   ├── controllers/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── servers.js
│   │   │   ├── channels.js
│   │   │   ├── messages.js
│   │   │   ├── friends.js
│   │   │   └── upload.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   └── upload.js
│   │   ├── db/
│   │   │   ├── schema.js
│   │   │   ├── index.js
│   │   │   └── migrations/
│   │   ├── services/
│   │   │   ├── userService.js
│   │   │   ├── serverService.js
│   │   │   ├── channelService.js
│   │   │   ├── messageService.js
│   │   │   └── friendService.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── servers.js
│   │   │   ├── channels.js
│   │   │   ├── messages.js
│   │   │   ├── friends.js
│   │   │   └── upload.js
│   │   ├── socket/
│   │   │   ├── handlers/
│   │   │   │   ├── messageHandler.js
│   │   │   │   ├── voiceHandler.js
│   │   │   │   └── userHandler.js
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── bcrypt.js
│   │   │   └── validators.js
│   │   └── app.js
│   ├── package.json
│   ├── drizzle.config.js
│   └── .env
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Avatar.jsx
│   │   │   │   └── Loading.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── AuthLayout.jsx
│   │   │   ├── landing/
│   │   │   │   ├── Hero.jsx
│   │   │   │   ├── Features.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── ServerList.jsx
│   │   │   │   ├── ChannelList.jsx
│   │   │   │   ├── ChatArea.jsx
│   │   │   │   ├── UserPanel.jsx
│   │   │   │   └── MemberList.jsx
│   │   │   ├── messages/
│   │   │   │   ├── MessageList.jsx
│   │   │   │   ├── MessageItem.jsx
│   │   │   │   ├── MessageInput.jsx
│   │   │   │   └── FileUpload.jsx
│   │   │   ├── friends/
│   │   │   │   ├── FriendsList.jsx
│   │   │   │   ├── FriendItem.jsx
│   │   │   │   ├── AddFriend.jsx
│   │   │   │   └── FriendRequests.jsx
│   │   │   ├── servers/
│   │   │   │   ├── ServerModal.jsx
│   │   │   │   ├── ServerSettings.jsx
│   │   │   │   ├── ChannelModal.jsx
│   │   │   │   └── InviteModal.jsx
│   │   │   └── voice/
│   │   │       ├── VoiceChannel.jsx
│   │   │       ├── VoiceControls.jsx
│   │   │       └── VideoCall.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DirectMessages.jsx
│   │   │   └── NotFound.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useSocket.js
│   │   │   ├── useMessages.js
│   │   │   └── useVoice.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   ├── SocketContext.js
│   │   │   └── ThemeContext.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   ├── socket.js
│   │   │   └── upload.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   └── validation.js
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── components/
│   │   │   └── pages/
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── package.json
└── README.md
```

## Technology Stack Details

### Backend Technologies
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Drizzle ORM** - Type-safe ORM with excellent performance
- **Drizzle Kit** - Database migrations and introspection
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - File storage and CDN
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware

### Frontend Technologies
- **React.js** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Socket.IO Client** - Real-time client
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Framer Motion** - Animations
- **React Icons** - Icon library
- **date-fns** - Date manipulation
- **react-dropzone** - File drag & drop

## Database Schema with Drizzle ORM

### Schema Definition (src/db/schema.js)

```javascript
import { pgTable, serial, varchar, text, timestamp, integer, boolean, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 100 }),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  status: varchar('status', { length: 20 }).default('offline'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Servers table
export const servers = pgTable('servers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  iconUrl: varchar('icon_url', { length: 255 }),
  ownerId: integer('owner_id').references(() => users.id),
  inviteCode: varchar('invite_code', { length: 20 }).unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Channels table
export const channels = pgTable('channels', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).default('text'),
  serverId: integer('server_id').references(() => servers.id),
  position: integer('position').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  content: text('content'),
  authorId: integer('author_id').references(() => users.id),
  channelId: integer('channel_id').references(() => channels.id),
  messageType: varchar('message_type', { length: 20 }).default('text'),
  fileUrl: varchar('file_url', { length: 255 }),
  fileName: varchar('file_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Server members table
export const serverMembers = pgTable('server_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  serverId: integer('server_id').references(() => servers.id),
  role: varchar('role', { length: 20 }).default('member'),
  joinedAt: timestamp('joined_at').defaultNow(),
}, (table) => ({
  unique: unique().on(table.userId, table.serverId),
}));

// Friends table
export const friends = pgTable('friends', {
  id: serial('id').primaryKey(),
  requesterId: integer('requester_id').references(() => users.id),
  addresseeId: integer('addressee_id').references(() => users.id),
  status: varchar('status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  unique: unique().on(table.requesterId, table.addresseeId),
}));

// Direct messages table
export const directMessages = pgTable('direct_messages', {
  id: serial('id').primaryKey(),
  content: text('content'),
  senderId: integer('sender_id').references(() => users.id),
  recipientId: integer('recipient_id').references(() => users.id),
  messageType: varchar('message_type', { length: 20 }).default('text'),
  fileUrl: varchar('file_url', { length: 255 }),
  fileName: varchar('file_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  servers: many(servers),
  serverMembers: many(serverMembers),
  messages: many(messages),
  directMessagesSent: many(directMessages, { relationName: 'sender' }),
  directMessagesReceived: many(directMessages, { relationName: 'recipient' }),
  friendRequestsSent: many(friends, { relationName: 'requester' }),
  friendRequestsReceived: many(friends, { relationName: 'addressee' }),
}));

export const serversRelations = relations(servers, ({ one, many }) => ({
  owner: one(users, { fields: [servers.ownerId], references: [users.id] }),
  channels: many(channels),
  members: many(serverMembers),
}));

export const channelsRelations = relations(channels, ({ one, many }) => ({
  server: one(servers, { fields: [channels.serverId], references: [servers.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  author: one(users, { fields: [messages.authorId], references: [users.id] }),
  channel: one(channels, { fields: [messages.channelId], references: [channels.id] }),
}));

export const serverMembersRelations = relations(serverMembers, ({ one }) => ({
  user: one(users, { fields: [serverMembers.userId], references: [users.id] }),
  server: one(servers, { fields: [serverMembers.serverId], references: [servers.id] }),
}));

export const friendsRelations = relations(friends, ({ one }) => ({
  requester: one(users, { fields: [friends.requesterId], references: [users.id], relationName: 'requester' }),
  addressee: one(users, { fields: [friends.addresseeId], references: [users.id], relationName: 'addressee' }),
}));

export const directMessagesRelations = relations(directMessages, ({ one }) => ({
  sender: one(users, { fields: [directMessages.senderId], references: [users.id], relationName: 'sender' }),
  recipient: one(users, { fields: [directMessages.recipientId], references: [users.id], relationName: 'recipient' }),
}));
```

### Database Configuration (src/db/index.js)

```javascript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
```

### Drizzle Configuration (drizzle.config.js)

```javascript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.js',
  out: './src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
} satisfies Config;
```

## Phase 1: Project Setup & Authentication (Week 1-2)

### Backend Setup
1. **Initialize project structure**
   ```bash
   npm init -y
   npm install express cors helmet dotenv
   npm install drizzle-orm postgres
   npm install -D drizzle-kit
   npm install bcrypt jsonwebtoken
   npm install socket.io
   npm install multer cloudinary
   ```

2. **Database Configuration**
   - Set up PostgreSQL database
   - Configure Drizzle ORM connection
   - Create schema definitions
   - Set up Drizzle Kit for migrations
   - Set up environment variables

3. **Drizzle Setup Commands**
   ```bash
   # Generate migrations
   npx drizzle-kit generate:pg
   
   # Push schema to database
   npx drizzle-kit push:pg
   
   # View database in Drizzle Studio
   npx drizzle-kit studio
   ```

3. **Authentication System**
   - User registration endpoint
   - Login endpoint with JWT
   - Password hashing with bcrypt
   - JWT middleware for protected routes
   - User profile endpoints

### Frontend Setup
1. **React Application**
   ```bash
   npx create-react-app frontend
   cd frontend
   npm install react-router-dom axios
   npm install tailwindcss postcss autoprefixer
   npm install socket.io-client
   npm install react-hook-form
   npm install framer-motion react-icons
   ```

2. **Landing Page**
   - Hero section with Discord-like design
   - Features showcase
   - Call-to-action buttons
   - Responsive navigation

3. **Authentication Pages**
   - Login form with validation
   - Registration form
   - Protected route wrapper
   - Authentication context

## Phase 2: Core Dashboard & Servers (Week 3-4)

### Backend Features
1. **Server Management**
   - Create server endpoint
   - Join server endpoint
   - Server member management
   - Server settings endpoints

2. **Channel Management**
   - Create channel endpoint
   - Channel types (text, voice)
   - Channel permissions
   - Channel ordering

### Frontend Features
1. **Dashboard Layout**
   - Discord-like sidebar
   - Server list component
   - Channel list component
   - Main content area

2. **Server Features**
   - Server creation modal
   - Server settings panel
   - Member list display
   - Server navigation

## Phase 3: Real-time Messaging (Week 5-6)

### Backend Implementation
1. **Drizzle ORM Setup**
   - Database schema definition
   - Migration generation
   - Type-safe queries
   - Relationship mapping

2. **Message System**
   - Send message endpoint using Drizzle
   - Message history with pagination
   - Message reactions
   - Message editing/deletion

### Example Service Layer with Drizzle
```javascript
// src/services/messageService.js
import { db } from '../db/index.js';
import { messages, users, channels } from '../db/schema.js';
import { eq, desc, and } from 'drizzle-orm';

export class MessageService {
  static async createMessage(data) {
    const [message] = await db.insert(messages).values(data).returning();
    return message;
  }

  static async getChannelMessages(channelId, limit = 50, offset = 0) {
    return await db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        author: {
          id: users.id,
          username: users.username,
          avatarUrl: users.avatarUrl
        }
      })
      .from(messages)
      .innerJoin(users, eq(messages.authorId, users.id))
      .where(eq(messages.channelId, channelId))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  static async updateMessage(messageId, userId, content) {
    return await db
      .update(messages)
      .set({ content, updatedAt: new Date() })
      .where(and(eq(messages.id, messageId), eq(messages.authorId, userId)))
      .returning();
  }

  static async deleteMessage(messageId, userId) {
    return await db
      .delete(messages)
      .where(and(eq(messages.id, messageId), eq(messages.authorId, userId)))
      .returning();
  }
}
```

### Frontend Implementation
1. **Chat Interface**
   - Message list component
   - Message input with emoji support
   - Real-time message updates
   - Message formatting

2. **Socket Integration**
   - Socket context provider
   - Real-time message handling
   - User status updates
   - Typing indicators

## Phase 4: Friends & Direct Messages (Week 7-8)

### Backend Features
1. **Friend System**
   - Send friend request
   - Accept/decline requests
   - Friend list management
   - Block/unblock users

2. **Direct Messages**
   - DM endpoints
   - DM history
   - Online status
   - Message notifications

### Frontend Features
1. **Friends Interface**
   - Friends list component
   - Friend requests panel
   - Add friend functionality
   - Friend status display

2. **Direct Messages**
   - DM chat interface
   - DM list sidebar
   - Private messaging
   - Message search

## Phase 5: File Upload & Media (Week 9-10)

### Backend Implementation
1. **File Upload System**
   - Multer configuration
   - Cloudinary integration
   - File type validation
   - File size limits

2. **Media Handling**
   - Image upload endpoints
   - File sharing endpoints
   - Avatar upload
   - Media compression

### Frontend Implementation
1. **File Upload UI**
   - Drag & drop interface
   - File preview
   - Upload progress
   - Image/video display

2. **Media Features**
   - Image gallery
   - File download
   - Avatar management
   - Media optimization

## Phase 6: Voice & Video (Week 11-12)

### Backend Setup
1. **WebRTC Integration**
   - Signaling server
   - Room management
   - Peer connection handling
   - Audio/video stream management

### Frontend Implementation
1. **Voice Channels**
   - Voice channel UI
   - Microphone controls
   - Speaker selection
   - Voice activity detection

2. **Video Calling**
   - Video call interface
   - Camera controls
   - Screen sharing
   - Call quality indicators

## Phase 7: Advanced Features (Week 13-14)

### Additional Features
1. **Message Features**
   - Message reactions
   - Message threading
   - Message search
   - Message pinning

2. **User Experience**
   - Dark/light theme
   - Keyboard shortcuts
   - Push notifications
   - Mobile responsiveness

3. **Admin Features**
   - Server moderation
   - User roles/permissions
   - Audit logs
   - Server analytics

## UI/UX Design Guidelines

### Color Scheme
```css
:root {
  --primary-bg: #36393f;
  --secondary-bg: #2f3136;
  --tertiary-bg: #202225;
  --accent-color: #7289da;
  --text-primary: #ffffff;
  --text-secondary: #b9bbbe;
  --success: #43b581;
  --warning: #faa61a;
  --danger: #f04747;
}
```

### Component Design Principles
1. **Consistent Spacing** - Use 8px grid system
2. **Typography** - Clean, readable fonts
3. **Hover Effects** - Smooth transitions
4. **Loading States** - Skeleton screens
5. **Error Handling** - User-friendly messages

## Security Considerations

### Backend Security
1. **Authentication**
   - JWT with refresh tokens
   - Password strength requirements
   - Rate limiting on auth endpoints
   - CSRF protection

2. **Data Validation**
   - Input sanitization
   - SQL injection prevention
   - XSS protection
   - File upload validation

### Frontend Security
1. **Client-side Validation**
   - Form validation
   - Input sanitization
   - Secure token storage
   - HTTPS enforcement

## Performance Optimization

### Backend Performance
1. **Database**
   - Drizzle query optimization
   - Connection pooling with postgres.js
   - Prepared statements
   - Index optimization

2. **API Performance**
   - Response compression
   - Pagination with Drizzle
   - Rate limiting
   - CDN integration

### Example Drizzle Query Optimization
```javascript
// Efficient query with relations
const serverWithChannels = await db.query.servers.findFirst({
  where: eq(servers.id, serverId),
  with: {
    channels: {
      orderBy: [channels.position],
      with: {
        messages: {
          limit: 1,
          orderBy: [desc(messages.createdAt)],
          with: {
            author: {
              columns: {
                id: true,
                username: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    },
    members: {
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            status: true,
            avatarUrl: true
          }
        }
      }
    }
  }
});
```

### Frontend Optimization
1. **React Performance**
   - Component memoization
   - Lazy loading
   - Bundle splitting
   - Image optimization

2. **Real-time Features**
   - Socket connection management
   - Message batching
   - Efficient re-renders
   - Memory management

## Testing Strategy

### Backend Testing
1. **Unit Tests** - Service functions with Drizzle
2. **Integration Tests** - API endpoints with test database
3. **Socket Tests** - Real-time functionality
4. **Database Tests** - Schema validations and migrations

### Example Test Setup with Drizzle
```javascript
// tests/setup.js
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

const testClient = postgres(process.env.TEST_DATABASE_URL);
const testDb = drizzle(testClient);

beforeAll(async () => {
  await migrate(testDb, { migrationsFolder: './src/db/migrations' });
});

afterAll(async () => {
  await testClient.end();
});
```

### Frontend Testing
1. **Component Tests** - React Testing Library
2. **Integration Tests** - User workflows
3. **E2E Tests** - Cypress testing
4. **Performance Tests** - Lighthouse audits

## Deployment Plan

### Backend Deployment
1. **Production Setup**
   - Environment configuration
   - Database migrations
   - SSL certificates
   - Load balancing

2. **Hosting Options**
   - Heroku (easy setup)
   - AWS EC2 (scalable)
   - DigitalOcean (cost-effective)
   - Railway (modern platform)

### Frontend Deployment
1. **Build Optimization**
   - Production build
   - Asset optimization
   - Environment variables
   - CDN configuration

2. **Hosting Options**
   - Netlify (static hosting)
   - Vercel (React optimized)
   - AWS S3 + CloudFront
   - GitHub Pages

## Development Timeline

- **Week 1-2**: Project setup, authentication
- **Week 3-4**: Servers and channels
- **Week 5-6**: Real-time messaging
- **Week 7-8**: Friends and DMs
- **Week 9-10**: File upload and media
- **Week 11-12**: Voice and video
- **Week 13-14**: Advanced features and polish

## Next Steps

1. **Set up development environment**
2. **Create GitHub repository**
3. **Initialize both backend and frontend**
4. **Set up database and basic models**
5. **Start with authentication system**
6. **Follow the phased approach**

This plan provides a comprehensive roadmap for building a Discord clone with modern technologies and best practices. Focus on getting the core features working first, then gradually add advanced functionality.