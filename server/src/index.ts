import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb, pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize database
initDb().catch(console.error);

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
app.get('/api/orders', async (req, res) => {
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
app.patch('/api/orders/:id/status', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

