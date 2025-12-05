<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🍱 SIVIK Restaurant - Order Management System

A modern restaurant order management system with AI-powered recommendations, real-time order tracking, and admin dashboard.

## Features

- 🍽️ **Menu Display** - Beautiful menu with categories (Sushi, Burgers, Shawarma, Salads)
- 🤖 **AI Chef** - Get personalized recommendations using Google Gemini AI
- 🛒 **Shopping Cart** - Add items, adjust quantities, view totals
- 📦 **Order Management** - Create orders with delivery details
- 👨‍💼 **Admin Panel** - Track and manage all orders at `/admin`
- 💾 **PostgreSQL Database** - Persistent order storage
- 🎨 **Modern UI** - Responsive design with Tailwind CSS

## 🐳 Quick Start with Docker (Recommended)

The easiest way to run this project locally is using Docker:

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd restaurant

# 2. Create environment file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 3. Start all services (frontend, backend, database)
docker-compose up -d

# 4. Access the application
# Frontend: http://localhost:3000
# Admin Panel: http://localhost:3000/admin
# Backend API: http://localhost:5001
```

**That's it!** 🎉 No need to install Node.js, PostgreSQL, or manage dependencies.

📖 **For detailed Docker setup**, see [DOCKER_SETUP.md](./DOCKER_SETUP.md)

## Run Locally (Without Docker)

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+ (or use Docker)

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_API_URL=http://localhost:5001
   ```

3. Run the frontend:
   ```bash
   npm run dev
   ```
   Frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to server directory:
   ```bash
   cd server
   npm install
   ```

2. Create `.env` file in `server/` directory:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5433/restaurant_db
   PORT=5001
   NODE_ENV=development
   ```

3. Make sure PostgreSQL is running and database exists:
   ```bash
   createdb restaurant_db
   ```

4. Run the backend:
   ```bash
   npm run dev
   ```
   Backend will be available at `http://localhost:5001`

## 🚀 Deployment

### Railway (Recommended)

Deploy to Railway with managed PostgreSQL and automatic HTTPS:

📖 **Step-by-step guide**: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

**Quick steps:**
1. Push your code to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Add PostgreSQL database
4. Deploy backend and frontend services
5. Set environment variables
6. Done! ✅

### Docker Deployment (Alternative)

Deploy using Docker to any cloud provider:
- **DigitalOcean App Platform**
- **AWS ECS / Fargate**
- **Google Cloud Run**
- **Azure Container Instances**

📖 **Docker setup guide**: [DOCKER_SETUP.md](./DOCKER_SETUP.md)

## Project Structure

```
restaurant/
├── components/          # React components
│   ├── Admin.tsx       # Admin dashboard
│   ├── CheckoutModal.tsx
│   ├── CartSidebar.tsx
│   └── ...
├── server/             # Backend API
│   ├── src/
│   │   ├── index.ts   # Express server
│   │   └── db.ts      # Database setup
│   └── package.json
├── services/           # API services
└── ...
```

## Environment Variables

### Frontend
- `VITE_API_URL` - Backend API URL
- `GEMINI_API_KEY` - Google Gemini API key

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 5001)
- `NODE_ENV` - Environment (development/production)

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **AI**: Google Gemini API
# Trigger rebuild
