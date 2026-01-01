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

// Middleware to refresh session from DB
const refreshSession = async (req: express.Request, _res: express.Response, next: express.NextFunction) => {
  if (req.session.userId) {
    try {
      const result = await pool.query(
        'SELECT id, username, role, can_manage_users, can_manage_integrations, can_manage_payments FROM users WHERE id = $1',
        [req.session.userId]
      );
      if (result.rows.length > 0) {
        const user = result.rows[0];
        console.log(`[Session Refresh] User: ${user.username}`);
        
        req.session.username = user.username;
        req.session.role = user.role;
        req.session.canManageUsers = user.can_manage_users;
        req.session.canManageIntegrations = user.can_manage_integrations;
        req.session.canManagePayments = user.can_manage_payments;
        
        // Ensure session is saved if modified
        req.session.save((err) => {
          if (err) console.error('[Session Refresh] Error saving session:', err);
          next();
        });
        return; // Don't call next() yet, wait for save
      }
    } catch (error) {
      console.error('[Session Refresh] Error:', error);
    }
  }
  next();
};

app.use(refreshSession);

// Extend session type
declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    role: string;
    canManageUsers: boolean;
    canManageIntegrations: boolean;
    canManagePayments: boolean;
  }
}

// Authentication middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Admin-only middleware (role 'admin' or specific permission)
const requireUserManagement = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.session.role !== 'admin' && !req.session.canManageUsers) {
    return res.status(403).json({ error: 'User management access required' });
  }
  next();
};

// Integration-only middleware (role 'admin' or specific permission)
const requireIntegrationManagement = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.session.role !== 'admin' && !req.session.canManageIntegrations) {
    return res.status(403).json({ error: 'Integration access required' });
  }
  next();
};

// Payment-only middleware (role 'admin' or specific permission)
const requirePaymentManagement = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.session.role !== 'admin' && !req.session.canManagePayments) {
    return res.status(403).json({ error: 'Payment management access required' });
  }
  next();
};

// Admin-only middleware (for full admin tasks)
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
    req.session.canManageUsers = user.can_manage_users;
    req.session.canManageIntegrations = user.can_manage_integrations;
    req.session.canManagePayments = user.can_manage_payments;

    console.log('Login successful for:', username);
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', {
      userId: req.session.userId,
      username: req.session.username,
      role: req.session.role,
      canManageUsers: req.session.canManageUsers,
      canManageIntegrations: req.session.canManageIntegrations,
      canManagePayments: req.session.canManagePayments
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
        role: user.role,
        can_manage_users: user.can_manage_users,
        can_manage_integrations: user.can_manage_integrations,
        can_manage_payments: user.can_manage_payments
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
app.get('/api/auth/session', async (req, res) => {
  if (req.session.userId) {
    try {
      // Fetch latest user data from DB to be 100% sure
      const result = await pool.query(
        'SELECT id, username, role, can_manage_users, can_manage_integrations, can_manage_payments FROM users WHERE id = $1',
        [req.session.userId]
      );

      if (result.rows.length === 0) {
        return res.json({ isAuthenticated: false, user: null });
      }

      const user = result.rows[0];
      
      // Update session with latest data
      req.session.username = user.username;
      req.session.role = user.role;
      req.session.canManageUsers = user.can_manage_users;
      req.session.canManageIntegrations = user.can_manage_integrations;
      req.session.canManagePayments = user.can_manage_payments;

      console.log(`[Auth Session Check] User: ${user.username}`);

      res.json({
        isAuthenticated: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          can_manage_users: user.can_manage_users,
          can_manage_integrations: user.can_manage_integrations,
          can_manage_payments: user.can_manage_payments
        }
      });
    } catch (error) {
      console.error('[Auth Session Check] Error:', error);
      res.status(500).json({ error: 'Failed to fetch session' });
    }
  } else {
    res.json({ isAuthenticated: false, user: null });
  }
});

// ============ User Management Endpoints (Admin only) ============

// Get all users
app.get('/api/users', requireUserManagement, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role, can_manage_users, can_manage_integrations, can_manage_payments, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user
app.post('/api/users', requireUserManagement, async (req, res) => {
  try {
    const { username, password, role, canManageUsers, canManageIntegrations, canManagePayments } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role required' });
    }

    if (!['admin', 'read_only', 'write'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, password_hash, role, can_manage_users, can_manage_integrations, can_manage_payments) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, role, can_manage_users, can_manage_integrations, can_manage_payments, created_at, updated_at',
      [username, passwordHash, role, canManageUsers ?? false, canManageIntegrations ?? false, canManagePayments ?? false]
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
app.patch('/api/users/:id', requireUserManagement, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, canManageUsers, canManageIntegrations, canManagePayments } = req.body;

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

    if (canManageUsers !== undefined) {
      query += `, can_manage_users = $${paramCount}`;
      values.push(canManageUsers);
      paramCount++;
    }

    if (canManageIntegrations !== undefined) {
      query += `, can_manage_integrations = $${paramCount}`;
      values.push(canManageIntegrations);
      paramCount++;
    }

    if (canManagePayments !== undefined) {
      query += `, can_manage_payments = $${paramCount}`;
      values.push(canManagePayments);
      paramCount++;
    }

    query += ` WHERE id = $${paramCount} RETURNING id, username, role, can_manage_users, can_manage_integrations, can_manage_payments, created_at, updated_at`;
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
app.delete('/api/users/:id', requireUserManagement, async (req, res) => {
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

// Public: get ALL menu items for the main menu
app.get('/api/menu-items', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, image_url, calories, category, price, is_enabled
       FROM menu_items
       ORDER BY category, name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Admin: get all menu items (including disabled)
app.get('/api/admin/menu-items', requireAuth, async (_req, res) => {
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
app.post('/api/admin/menu-items', requireAuth, async (req, res) => {
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
app.patch('/api/admin/menu-items/:id', requireAuth, async (req, res) => {
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
app.delete('/api/admin/menu-items/:id', requireAuth, async (req, res) => {
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

// ============ Integration Endpoints (Admin only or specific permission) ============

// Get integration settings
app.get('/api/admin/integration', requireIntegrationManagement, async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM integrations LIMIT 1');
    res.json(result.rows[0] || {});
  } catch (error) {
    console.error('Error fetching integration:', error);
    res.status(500).json({ error: 'Failed to fetch integration settings' });
  }
});

// Update integration settings
app.patch('/api/admin/integration', requireIntegrationManagement, async (req, res) => {
  try {
    const { platformUrl, apiKey, restaurantName, restaurantExternalId, restaurantAddress, restaurantPhone, currency } = req.body;
    
    // For simplicity, we only manage one integration record
    const check = await pool.query('SELECT id FROM integrations LIMIT 1');
    
    if (check.rows.length === 0) {
      await pool.query(
        'INSERT INTO integrations (platform_name, platform_url, api_key, restaurant_name, restaurant_external_id, restaurant_address, restaurant_phone, currency) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        ['External Platform', platformUrl, apiKey, restaurantName, restaurantExternalId, restaurantAddress, restaurantPhone, currency]
      );
    } else {
      await pool.query(
        'UPDATE integrations SET platform_url = $1, api_key = $2, restaurant_name = $3, restaurant_external_id = $4, restaurant_address = $5, restaurant_phone = $6, currency = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8',
        [platformUrl, apiKey, restaurantName, restaurantExternalId, restaurantAddress, restaurantPhone, currency, check.rows[0].id]
      );
    }
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating integration:', error);
    res.status(500).json({ error: 'Failed to update integration settings' });
  }
});

// Inbound: accept menu data from external platform
app.post('/api/external-menu', async (req, res) => {
  try {
    const apiKey = req.header('x-api-key');
    if (!apiKey) {
      return res.status(401).json({ error: 'Missing API key' });
    }

    const integrationResult = await pool.query('SELECT * FROM integrations LIMIT 1');
    if (integrationResult.rows.length === 0) {
      return res.status(400).json({ error: 'Integration settings not configured' });
    }

    const integration = integrationResult.rows[0];
    if (integration.api_key !== apiKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const {
      restaurantExternalId,
      restaurantName,
      restaurantAddress,
      restaurantPhone,
      currency,
      items,
    } = req.body;

    if (!restaurantExternalId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'restaurantExternalId and items are required' });
    }

    // Persist restaurant metadata if provided
    await pool.query(
      `UPDATE integrations
       SET restaurant_external_id = COALESCE($1, restaurant_external_id),
           restaurant_name = COALESCE($2, restaurant_name),
           restaurant_address = COALESCE($3, restaurant_address),
           restaurant_phone = COALESCE($4, restaurant_phone),
           currency = COALESCE($5, currency),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [
        restaurantExternalId,
        restaurantName,
        restaurantAddress,
        restaurantPhone,
        currency,
        integration.id,
      ]
    );

    let processed = 0;
    for (const rawItem of items) {
      const { id, name, description, price, picture, category, calories, isEnabled } = rawItem;

      if (!id || !name || price === undefined || price === null) {
        console.warn('[External Import] Skipping item due to missing required fields', rawItem);
        continue;
      }

      await pool.query(
        `INSERT INTO menu_items (external_id, name, description, image_url, calories, category, price, is_enabled)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (external_id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           image_url = EXCLUDED.image_url,
           calories = EXCLUDED.calories,
           category = EXCLUDED.category,
           price = EXCLUDED.price,
           is_enabled = EXCLUDED.is_enabled,
           updated_at = CURRENT_TIMESTAMP`,
        [
          String(id),
          name,
          description || '',
          picture || '',
          Number.isFinite(calories) ? calories : 0,
          category || 'Other',
          parseFloat(price),
          isEnabled !== undefined ? !!isEnabled : true,
        ]
      );
      processed += 1;
    }

    res.json({
      message: 'Menu imported successfully',
      restaurantExternalId,
      restaurantName,
      itemsProcessed: processed,
    });
  } catch (error) {
    console.error('External menu import failed:', error);
    res.status(500).json({ error: 'Failed to import menu from external platform' });
  }
});

// Sync/Export menu to external platform
app.post('/api/admin/integration/sync', requireIntegrationManagement, async (_req, res) => {
  try {
    // 1. Get all menu items (both enabled and disabled)
    const menuResult = await pool.query(
      'SELECT id, name, description, image_url, calories, category, price, is_enabled FROM menu_items'
    );
    const menuData = menuResult.rows;

    // 2. Get integration settings
    const integrationResult = await pool.query('SELECT * FROM integrations LIMIT 1');
    if (integrationResult.rows.length === 0 || !integrationResult.rows[0].platform_url) {
      return res.status(400).json({ error: 'Integration settings not configured' });
    }
    
    const config = integrationResult.rows[0];

    console.log(`[Integration] Attempting sync to: ${config.platform_url}`);
    console.log(`[Integration] External ID: ${config.restaurant_external_id}`);
    console.log(`[Integration] Item count: ${menuData.length}`);

    // 3. Prepare data in the exact format required by the external platform
    const exportData = {
      restaurantExternalId: config.restaurant_external_id,
      restaurantName: config.restaurant_name || 'SIVIK Restaurant',
      restaurantAddress: config.restaurant_address,
      restaurantPhone: config.restaurant_phone,
      currency: config.currency,
      items: menuData.map(item => ({
        id: item.id.toString(),
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        currency: config.currency,
        picture: item.image_url,
        category: item.category,
        calories: parseInt(item.calories) || 0,
        isEnabled: item.is_enabled // Added field based on updated API schema
      }))
    };

    // 4. Send data to external platform (REST API call)
    const response = await fetch(config.platform_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.api_key
      },
      body: JSON.stringify(exportData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External sync failed:', errorText);
      throw new Error(`External platform responded with status ${response.status}`);
    }

    // 5. Update last sync time
    await pool.query('UPDATE integrations SET last_sync_at = CURRENT_TIMESTAMP');

    res.json({ message: `Successfully synced ${menuData.length} items to external platform.` });
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
    console.error('Sync error:', errMsg);
    res.status(500).json({ error: `Sync failed: ${errMsg}` });
  }
});

// ============ Payment Configuration Endpoints ============

// Public: get enabled payment methods
app.get('/api/payment-methods', async (_req, res) => {
  try {
    const result = await pool.query('SELECT name, display_name, is_enabled FROM payment_methods WHERE is_enabled = TRUE');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

// Admin: get all payment methods
app.get('/api/admin/payment-methods', requirePaymentManagement, async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payment_methods ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

// Admin: update/toggle payment method (enable/disable or rename display name)
app.patch('/api/admin/payment-methods/:name', requirePaymentManagement, async (req, res) => {
  try {
    const { name } = req.params;
    const { isEnabled, displayName } = req.body;

    if (isEnabled === undefined && !displayName) {
      return res.status(400).json({ error: 'No changes provided' });
    }

    const result = await pool.query(
      `UPDATE payment_methods
         SET is_enabled = COALESCE($1, is_enabled),
             display_name = COALESCE($2, display_name),
             updated_at = CURRENT_TIMESTAMP
       WHERE name = $3
       RETURNING *`,
      [isEnabled, displayName, name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ error: 'Failed to update payment method' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

