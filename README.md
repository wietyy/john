# JOHN Finance Tracker 💰

A personal finance tracking application with multi-account support, transaction management, and secure cloud sync.

[![Demo](https://img.shields.io/badge/demo-available-brightgreen)](https://john-demo.example.com)
[![License](https://img.shields.io/badge/license-mit-blue)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

## ✨ Features

- **Multi-Account Support** - Manage multiple JOHN accounts with separate data
- **Transaction Tracking** - Record income/expenses with date, title, and amount
- **Fund Management** - Track savings goals with progress visualization
- **Cloud Sync** - Secure backup and restore across devices
- **Key Number System** - Simplified cash flow tracking
- **Dark Mode UI** - Modern Tailwind-styled interface

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS, Vite |
| Backend | Express.js, TypeScript, SQLite/PostgreSQL |
| Auth | bcrypt password hashing |
| Deployment | Docker, Bun runtime |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun runtime
- Docker (for containerized deployment)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/john.git
cd john

# Install dependencies
cd frontend && bun install
cd ../backend && bun install

# Initialize database
cd .. && cat schema.sql | sqlite3 database.db

# Start development server
just dev
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
# Build frontend
cd frontend && bun run build

# Run backend with database
DATABASE=/path/to/database.db bun run backend/src/index.ts
```

## 📦 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/getCloudData` | POST | Retrieve cloud-stored data |
| `/api/setCloudData` | POST | Save data to cloud |

**Request Body:**
```json
{
  "password": "your-secret-password",
  "data": "json-stringified-data"
}
```

## 🐳 Docker Deployment

```bash
# Build and run
docker build -t john-app .
docker run -p 3000:3000 -e DATABASE=/db/database.db john-app
```

**⚠️ Security Note:** When deploying to production, ensure SSL/TLS is configured and use environment variables for sensitive configuration. Consider adding:
- HTTPS termination
- Rate limiting
- Proper secret management

## 🏗️ Project Structure

```
john/
├── backend/           # Express server
│   ├── src/
│   │   ├── index.ts   # Server entry point
│   │   └── db.ts      # Database operations
│   └── package.json
├── frontend/          # React application
│   ├── src/
│   │   ├── app/
│   │   └── main.tsx
│   └── vite.config.ts
├── schema.sql         # Database schema
└── justfile          # Build scripts
```

## 🎯 Key Concepts

- **JOHN** = Your financial account/persona
- **UASM** = Your available money (in your pocket)
- **Key Number** = Simplified balance tracking
- **Funds** = Dedicated savings goals

## 🧪 Development Commands

```bash
# Run tests
bun test

# Lint
bun run lint

# Build
bun run build

# Start dev server
just dev
```

## 📖 License

MIT License - Feel free to use, modify, and distribute.

## 🙏 Acknowledgments

Built with ❤️ using modern web technologies. Special thanks to the Bun community for the amazing runtime.