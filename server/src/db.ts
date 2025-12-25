import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://sergiykucheryavyy@localhost:5433/restaurant_db?schema=public',
});

export const initDb = async () => {
  try {
    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(50),
        delivery_date DATE NOT NULL,
        delivery_time VARCHAR(10) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        items JSONB NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Orders table initialized successfully');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'read_only', 'write')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table initialized successfully');

    // Create menu_items table for food configuration
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        calories INTEGER,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        is_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Menu items table initialized successfully');

    // Seed initial menu items if table is empty
    const menuCountResult = await pool.query('SELECT COUNT(*) FROM menu_items');
    const menuCount = parseInt(menuCountResult.rows[0].count);
    console.log(`Current menu item count: ${menuCount}`);
    
    if (menuCount === 0) {
      console.log('Table is empty, seeding initial items...');
      await pool.query(`
        INSERT INTO menu_items (name, description, image_url, calories, category, price, is_enabled)
        VALUES
          (
            'Philadelphia z Łososiem',
            'Klasyczna rolka z aksamitnym serkiem, świeżym ogórkiem i dużą porcją norweskiego łososia.',
            'https://i.imgur.com/avvAzr1.jpg',
            320,
            'Sushi',
            38.00,
            TRUE
          ),
          (
            'Pieczony z Łososiem i Mango',
            'Ciepła rolka z łososiem pod pierzynką z sosu serowego, przełamana słodyczą mango.',
            'https://i.imgur.com/ZMLpjTC.jpg',
            410,
            'Sushi',
            41.00,
            TRUE
          ),
          (
            'Pieczony z Kurczakiem i Mango',
            'Pieczona rolka z delikatnym kurczakiem, mango i sosem teriyaki.',
            'https://i.imgur.com/ZMLpjTC.jpg',
            430,
            'Sushi',
            40.00,
            TRUE
          ),
          (
            'Burger Wołowy Klasyk',
            'Soczysta wołowina 100%, świeże warzywa i nasz autorski sos w maślanej bułce.',
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
            650,
            'Burgery',
            35.00,
            TRUE
          ),
          (
            'Burger Crispy Chicken',
            'Chrupiący kurczak w złocistej panierce z sosem majonezowym i świeżą sałatą.',
            'https://i.imgur.com/IavBLF8.jpg',
            580,
            'Burgery',
            32.00,
            TRUE
          ),
          (
            'Shoarma Drobiowa Fit',
            'Lekka wersja klasyka. Grillowane kawałki kurczaka z dużą ilością warzyw w pełnoziarnistej tortilli.',
            'https://i.imgur.com/uAdZoHz.jpeg',
            420,
            'Shoarma',
            29.00,
            TRUE
          ),
          (
            'Sałatka Warzywna Ogród',
            'Eksplozja witamin. Mieszanka chrupiących sałat i sezonowych warzyw.',
            'https://i.imgur.com/x6QzvGw.jpeg',
            180,
            'Sałatki',
            25.00,
            TRUE
          ),
          (
            'Sałatka Cezar Królewska',
            'Klasyka gatunku. Grillowany kurczak, chrupiące grzanki, parmezan i oryginalny sos Cezar.',
            'https://i.imgur.com/vSvEnnC.jpeg',
            350,
            'Sałatki',
            31.00,
            TRUE
          ),
          (
            'Cytrusowe Przebudzenie',
            'Orzeźwiająca kompozycja z grejpfrutem, pomarańczą, awokado i prażonymi pestkami słonecznika.',
            'https://i.imgur.com/6iyIoju.jpeg',
            220,
            'Sałatki',
            27.00,
            TRUE
          )
      `);
      console.log('Seeded initial menu items');
    }

    // Seed default admin user if no users exist
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      const passwordHash = await bcrypt.hash('admin0617', 10);
      await pool.query(
        'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
        ['admin', passwordHash, 'admin']
      );
      console.log('Default admin user created successfully');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export { pool };
export default pool;
