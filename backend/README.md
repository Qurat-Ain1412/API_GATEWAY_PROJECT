# API Gateway Backend

A Node.js backend API with user management, authentication, rate limiting, and news API integration.

## Features

- ✅ User registration and authentication
- ✅ JWT-based authentication
- ✅ Rate limiting with Redis
- ✅ News API integration
- ✅ MongoDB database
- ✅ Docker support

## Quick Start with Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Git

### Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd API_Gateway_Project
```

2. **Start all services**
```bash
docker-compose up -d
```

3. **Check if services are running**
```bash
docker-compose ps
```

4. **View logs**
```bash
docker-compose logs backend
```

**That's it!** Your backend will be running on `http://localhost:3000`

## Manual Setup (Without Docker)

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally
- Redis running locally

### Steps

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Create environment file**
Create `.env` file in backend directory:
```env
PORT=3000
NODE_ENV=development
MONGO_URL=mongo_key
REDIS_HOST=localhost
REDIS_PORT=redis_port
JWT_SECRET=secret_key
JWT_EXPIRES_IN=7d
NEWS_API_KEY=news_api_key
NEWS_API_BASE_URL=news_url
```

3. **Start the server**
```bash
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `MONGO_URL` | MongoDB connection string | mongodb://localhost:27017/api-gateway |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRES_IN` | JWT expiration | 7d |
| `NEWS_API_KEY` | News API key | Required |
| `NEWS_API_BASE_URL` | News API base URL | https://newsapi.org |

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# View logs
docker-compose logs -f backend

# Stop and remove volumes
docker-compose down -v
```

## Troubleshooting

**Backend not starting?**
- Check if MongoDB and Redis are running: `docker-compose ps`
- View logs: `docker-compose logs backend`

**Connection issues?**
- Make sure all services are on the same network
- Check environment variables are correct

**Rate limiting not working?**
- Verify Redis is connected: `docker-compose logs redis`
- Check backend logs for Redis connection status
