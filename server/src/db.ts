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
        delivery_type VARCHAR(20) DEFAULT 'delivery',
        payment_method VARCHAR(50) NOT NULL,
        items JSONB NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Orders table initialized successfully');

    // Ensure delivery_type column exists for existing orders table
    await pool.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20) DEFAULT 'delivery';
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'read_only', 'write')),
        can_manage_users BOOLEAN DEFAULT FALSE,
        can_manage_integrations BOOLEAN DEFAULT FALSE,
        can_manage_payments BOOLEAN DEFAULT FALSE,
        can_manage_delivery BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table initialized successfully');

    // Ensure columns exist if table was already created
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS can_manage_users BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS can_manage_integrations BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS can_manage_payments BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS can_manage_delivery BOOLEAN DEFAULT FALSE;
    `);
    console.log('Users table columns verified');

    // Create menu_items table for food configuration
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        external_id VARCHAR(255),
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

    // Ensure external_id exists and is indexed for idempotent imports
    await pool.query(`
      ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);
    `);
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS menu_items_external_id_idx ON menu_items(external_id);
    `);
    console.log('Menu items external_id column and index verified');

    // Seed initial menu items if table is empty or missing new categories
    const newCategoriesCheck = await pool.query("SELECT COUNT(*) FROM menu_items WHERE category IN ('Zupy', 'Dania główne')");
    const hasNewCategories = parseInt(newCategoriesCheck.rows[0].count) > 0;
    const oldItemsCheck = await pool.query("SELECT COUNT(*) FROM menu_items WHERE category IN ('Sushi', 'Burgery', 'Shoarma', 'Sałatki')");
    const hasOldItems = parseInt(oldItemsCheck.rows[0].count) > 0;
    const menuCountResult = await pool.query('SELECT COUNT(*) FROM menu_items');
    const menuCount = parseInt(menuCountResult.rows[0].count);

    if (menuCount === 0 || hasOldItems || !hasNewCategories) {
      console.log('Seeding/Updating menu items...');
      // Clear existing items if we are doing a full swap or adding missing sections
      await pool.query('DELETE FROM menu_items');

      await pool.query(`
        INSERT INTO menu_items (name, description, image_url, calories, category, price, is_enabled)
        VALUES
          (
            'Czeburek Tradycyjny',
            'Chrupiący pieróg z nadzieniem z mięsa mielonego wołowo-wieprzowego, cebuli, soli i pieprzu.',
            'https://i.imgur.com/eVXA6y7.jpeg',
            350,
            'Chebureki',
            10.00,
            TRUE
          ),
          (
            'Czeburek z Twarogiem',
            'Delikatny pieróg z nadzieniem z twarogu, świeżego pomidora i koperku.',
            'https://i.imgur.com/OBfuuCE.jpeg',
            320,
            'Chebureki',
            10.00,
            TRUE
          ),
          (
            'Czeburek z Warzywami',
            'Wegetariańska wersja z ziemniakami, cebulą i aromatycznymi przyprawami.',
            'https://i.imgur.com/grrti6a.jpeg',
            280,
            'Chebureki',
            10.00,
            TRUE
          ),
          (
            'Chinkali',
            'Gruzińskie pierożki: mięso mielone wołowo-wieprzowe, cebula, przyprawy i soczysty bulion.',
            'https://i.imgur.com/04TQ1pr.jpeg',
            400,
            'Chinkali',
            20.00,
            TRUE
          ),
          (
            'Pierogi Tradycyjne',
            'Klasyczne pierogi z nadzieniem z ziemniaków, cebuli, soli i pieprzu.',
            'https://i.imgur.com/CZ0tqfn.jpeg',
            380,
            'Pierogi',
            15.00,
            TRUE
          ),
          (
            'Pierogi Słodkie',
            'Słodka wersja z twarogiem wiejskim, cukrem i wanilią.',
            'https://i.imgur.com/gKySyuI.jpeg',
            420,
            'Pierogi',
            15.00,
            TRUE
          ),
          (
            'Pierogi Mięsne',
            'Sycące pierogi z mięsem mielonym z łopatki, cebulą i przyprawami.',
            'https://i.imgur.com/mMnPEBU.jpeg',
            450,
            'Pierogi',
            15.00,
            TRUE
          ),
          (
            'Herbata',
            'Gorąca, aromatyczna herbata.',
            'https://i.imgur.com/Yc7OV2q.jpeg',
            0,
            'Napoje',
            5.00,
            TRUE
          ),
          (
            'Kawa po turecku',
            'Mocna kawa parzona w tradycyjny sposób.',
            'https://i.imgur.com/vqzcP6O.jpeg',
            5,
            'Napoje',
            8.00,
            TRUE
          ),
          (
            'Kawa z mlekiem',
            'Aromatyczna kawa z delikatnym mlekiem.',
            'https://i.imgur.com/posqUaI.jpeg',
            40,
            'Napoje',
            10.00,
            TRUE
          ),
          (
            'Kompot',
            'Domowy kompot z owoców.',
            'https://i.imgur.com/BXQNIlV.jpeg',
            80,
            'Napoje',
            5.00,
            TRUE
          ),
          (
            'Uzwar',
            'Tradycyjny napój z suszonych owoców.',
            'https://i.imgur.com/LKEWLnh.jpeg',
            90,
            'Napoje',
            5.00,
            TRUE
          ),
          (
            'Barszcz',
            'Tradycyjny barszcz czerwony z buraków, podawany z nutą śmietany.',
            'https://i.imgur.com/eE3aK0K.jpeg',
            180,
            'Zupy',
            10.00,
            TRUE
          ),
          (
            'Charczo',
            'Gęsta i aromatyczna gruzińska zupa z wołowiny, ryżu i orzechów włoskich.',
            'https://i.imgur.com/L3nzvY5.jpeg',
            320,
            'Zupy',
            10.00,
            TRUE
          ),
          (
            'Zupa z pulpecikami',
            'Delikatny wywar z mięsnymi pulpecikami i warzywami.',
            'https://i.imgur.com/k4eZPcG.jpeg',
            250,
            'Zupy',
            10.00,
            TRUE
          ),
          (
            'Pilaw',
            'Tradycyjne danie z ryżu, soczystej wołowiny, marchwi i aromatycznych przypraw wschodnich.',
            'https://i.imgur.com/ZdWsFHO.jpeg',
            550,
            'Dania główne',
            15.00,
            TRUE
          ),
          (
            'Ziemniaki po wiejsku z żeberkami',
            'Sycące danie z pieczonych ziemniaków i duszonych żeberek wieprzowych.',
            'https://i.imgur.com/1BAbrwk.jpeg',
            750,
            'Dania główne',
            25.00,
            TRUE
          ),
          (
            'Frytki z skrzydełkami',
            'Chrupiący frytki podawane ze złocistymi skrzydełkami z kurczaka.',
            'https://i.imgur.com/GZrmxEG.jpeg',
            680,
            'Dania główne',
            25.00,
            TRUE
          ),
          (
            'Szaszłyk',
            'Soczyste kawałki mięsa grillowane na szpadzie, podawane z cebulą.',
            'https://i.imgur.com/myYXkDE.jpeg',
            600,
            'Dania główne',
            25.00,
            TRUE
          ),
          (
            'Kasza gryczana z wątróbką',
            'Pożywna kasza gryczana serwowana z duszoną wątróbką i cebulką.',
            'https://i.imgur.com/IYxzbt6.jpeg',
            420,
            'Dania główne',
            15.00,
            TRUE
          )
      `);
      console.log('Seeded updated menu items');
    }

    // Create integrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS integrations (
        id SERIAL PRIMARY KEY,
        platform_name VARCHAR(255) NOT NULL,
        platform_url TEXT NOT NULL,
        api_key TEXT NOT NULL,
        restaurant_name TEXT,
        restaurant_external_id VARCHAR(255),
        restaurant_address TEXT,
        restaurant_phone VARCHAR(50),
        currency VARCHAR(10) DEFAULT 'PLN',
        last_sync_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Integrations table initialized successfully');

    // Ensure columns exist if table was already created
    await pool.query(`
      ALTER TABLE integrations ADD COLUMN IF NOT EXISTS restaurant_external_id VARCHAR(255);
      ALTER TABLE integrations ADD COLUMN IF NOT EXISTS restaurant_name TEXT;
      ALTER TABLE integrations ADD COLUMN IF NOT EXISTS restaurant_address TEXT;
      ALTER TABLE integrations ADD COLUMN IF NOT EXISTS restaurant_phone VARCHAR(50);
      ALTER TABLE integrations ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'PLN';
    `);
    console.log('Integrations table columns verified');

    // Seed default integration if none exist
    const integrationCount = await pool.query('SELECT COUNT(*) FROM integrations');
    if (parseInt(integrationCount.rows[0].count) === 0) {
      await pool.query(
        'INSERT INTO integrations (platform_name, platform_url, api_key, restaurant_name, restaurant_external_id, restaurant_address, restaurant_phone, currency) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          'External Food Platform',
          'http://host.docker.internal:3001/api/external-menu',
          'da079e38fcb44b6d86ad08ac3ee33a42',
          'SIVIK Restaurant',
          'partner-123',
          '1234 Main Street, Fez, Morroko',
          '+33 30 1234562',
          'PLN'
        ]
      );
      console.log('Default integration settings created');
    }

    // Seed default admin user if no users exist
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      const passwordHash = await bcrypt.hash('admin0617', 10);
      await pool.query(
        'INSERT INTO users (username, password_hash, role, can_manage_users, can_manage_integrations, can_manage_payments, can_manage_delivery) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        ['admin', passwordHash, 'admin', true, true, true, true]
      );
      console.log('Default admin user created successfully');
    }

    // Create payment_methods table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        is_enabled BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Payment methods table initialized successfully');

    // Seed default payment methods
    const pmCount = await pool.query('SELECT COUNT(*) FROM payment_methods');
    if (parseInt(pmCount.rows[0].count) === 0) {
      const methods = [
        ['card', 'Karta', true],
        ['blik', 'BLIK', true],
        ['transfer', 'Przelew na telefon +48 570 719 819', true],
        ['cash', 'Gotówka przy odbiorze', true]
      ];
      for (const [name, display, enabled] of methods) {
        await pool.query(
          'INSERT INTO payment_methods (name, display_name, is_enabled) VALUES ($1, $2, $3)',
          [name, display, enabled]
        );
      }
      console.log('Default payment methods seeded');
    }

    // Online ordering settings (single row)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ordering_settings (
        id SERIAL PRIMARY KEY,
        is_ordering_enabled BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      ALTER TABLE ordering_settings
      ADD COLUMN IF NOT EXISTS is_ordering_enabled BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    const orderingCount = await pool.query('SELECT COUNT(*) FROM ordering_settings');
    if (parseInt(orderingCount.rows[0].count) === 0) {
      await pool.query('INSERT INTO ordering_settings (is_ordering_enabled) VALUES (TRUE)');
      console.log('Default ordering setting created (enabled)');
    }

    // Delivery settings table (single row)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS delivery_settings (
        id SERIAL PRIMARY KEY,
        is_enabled BOOLEAN DEFAULT FALSE,
        min_order_amount DECIMAL(10,2) DEFAULT 0,
        delivery_fee DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Delivery settings table initialized successfully');

    const deliveryCount = await pool.query('SELECT COUNT(*) FROM delivery_settings');
    if (parseInt(deliveryCount.rows[0].count) === 0) {
      await pool.query(
        'INSERT INTO delivery_settings (is_enabled, min_order_amount, delivery_fee) VALUES ($1, $2, $3)',
        [false, 0, 0]
      );
      console.log('Default delivery settings created');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export { pool };
export default pool;
