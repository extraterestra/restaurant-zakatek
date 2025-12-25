import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import { initDb, pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  'http://localhost:3000',
  'https://restaurant-frontend-nuu5.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Log CORS check for debugging
    console.log('CORS check for origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    console.log('FRONTEND_URL env:', process.env.FRONTEND_URL);
    
    if (allowedOrigins.includes(origin) || process.env.FRONTEND_URL === '*') {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Trust proxy for correct secure cookies when behind a reverse proxy (e.g. Railway)
// This is required so that express-session can set `secure` cookies based on
// the `X-Forwarded-Proto: https` header from the proxy.
app.set('trust proxy', 1);

// Session configuration
// Treat both "production" and "staging" as secure environments (Railway)
const env = process.env.NODE_ENV || 'development';
const isSecureEnv = env === 'production' || env === 'staging';
app.use(session({
  secret: process.env.SESSION_SECRET || 'restaurant-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isSecureEnv, // true for HTTPS in production/staging on Railway
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: isSecureEnv ? 'none' : 'lax' // 'none' required for cookies across different subdomains
  }
}));

// Initialize database
initDb().catch(console.error);

// Extend session type
declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    role: string;
  }
}

// Authentication middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Admin-only middleware
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId || req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Write access middleware (admin or write role)
const requireWriteAccess = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId || (req.session.role !== 'admin' && req.session.role !== 'write')) {
    return res.status(403).json({ error: 'Write access required' });
  }
  next();
};

// ============ Authentication Endpoints ============

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for:', username);
    console.log('Request origin:', req.get('origin'));
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));

    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ error: 'Username and password required' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      console.log('User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', validPassword, 'for user:', username);

    if (!validPassword) {
      console.log('Password mismatch for:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;

    console.log('Login successful for:', username);
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', {
      userId: req.session.userId,
      username: req.session.username,
      role: req.session.role
    });

    // Save session before sending response
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.status(500).json({ error: 'Failed to save session' });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        role: user.role
      });
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Check session
app.get('/api/auth/session', (req, res) => {
  if (req.session.userId) {
    res.json({
      isAuthenticated: true,
      user: {
        id: req.session.userId,
        username: req.session.username,
        role: req.session.role
      }
    });
  } else {
    res.json({ isAuthenticated: false, user: null });
  }
});

// ============ User Management Endpoints (Admin only) ============

// Get all users
app.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user
app.post('/api/users', requireAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role required' });
    }

    if (!['admin', 'read_only', 'write'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at, updated_at',
      [username, passwordHash, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
app.patch('/api/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;

    let query = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
    const values: any[] = [];
    let paramCount = 1;

    if (username) {
      query += `, username = $${paramCount}`;
      values.push(username);
      paramCount++;
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      query += `, password_hash = $${paramCount}`;
      values.push(passwordHash);
      paramCount++;
    }

    if (role) {
      if (!['admin', 'read_only', 'write'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      query += `, role = $${paramCount}`;
      values.push(role);
      paramCount++;
    }

    query += ` WHERE id = $${paramCount} RETURNING id, username, role, created_at, updated_at`;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
app.delete('/api/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (parseInt(id) === req.session.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ============ Order Endpoints (Protected) ============

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, address, phone, deliveryDate, deliveryTime, paymentMethod, items, total } = req.body;

    if (!customerName || !address || !deliveryDate || !deliveryTime || !paymentMethod || !items || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO orders (customer_name, address, phone, delivery_date, delivery_time, payment_method, items, total, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [customerName, address, phone, deliveryDate, deliveryTime, paymentMethod, JSON.stringify(items), total, 'pending']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get all orders
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
app.patch('/api/orders/:id/status', requireWriteAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ============ Menu Items (Food Configuration) ============

// Public: get enabled menu items for the main menu
app.get('/api/menu-items', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, image_url, calories, category, price, is_enabled
       FROM menu_items
       WHERE is_enabled = TRUE
       ORDER BY category, name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Admin: get all menu items (including disabled)
app.get('/api/admin/menu-items', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, image_url, calories, category, price, is_enabled,
              created_at, updated_at
       FROM menu_items
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Admin: create menu item
app.post('/api/admin/menu-items', requireAdmin, async (req, res) => {
  try {
    const { name, description, imageUrl, calories, category, price, isEnabled } = req.body;

    if (!name || !description || !imageUrl || !category || price == null) {
      return res.status(400).json({ error: 'Name, description, imageUrl, category and price are required' });
    }

    const result = await pool.query(
      `INSERT INTO menu_items
        (name, description, image_url, calories, category, price, is_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, description, image_url, calories, category, price, is_enabled, created_at, updated_at`,
      [name, description, imageUrl, calories ?? null, category, price, isEnabled ?? true]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Admin: update menu item
app.patch('/api/admin/menu-items/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, calories, category, price, isEnabled } = req.body;

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }
    if (imageUrl !== undefined) {
      fields.push(`image_url = $${idx++}`);
      values.push(imageUrl);
    }
    if (calories !== undefined) {
      fields.push(`calories = $${idx++}`);
      values.push(calories);
    }
    if (category !== undefined) {
      fields.push(`category = $${idx++}`);
      values.push(category);
    }
    if (price !== undefined) {
      fields.push(`price = $${idx++}`);
      values.push(price);
    }
    if (isEnabled !== undefined) {
      fields.push(`is_enabled = $${idx++}`);
      values.push(isEnabled);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Always update updated_at
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE menu_items
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, name, description, image_url, calories, category, price, is_enabled, created_at, updated_at
    `;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Admin: delete menu item
app.delete('/api/admin/menu-items/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM menu_items WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

