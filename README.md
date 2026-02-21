# 🏛️ HudumaHub

**Your Smart Guide to Kenyan Public Services**

HudumaHub is an independent civic technology platform that simplifies access to Kenyan government services. Ask about IDs, KRA, NHIF, HELB, NTSA and more — in simple language.

## 🚀 Tech Stack

### Client

- React 19 + TypeScript
- TailwindCSS v4
- shadcn/ui components
- TanStack Router (file-based routing)
- Sonner (notifications)
- Lucide React (icons)
- PWA (Progressive Web App)
- Theme system (Light / Dark / System)

### Server

- Node.js + Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod validation
- JWT authentication (scaffold)

## 📁 Project Structure

```
HudumaHub/
├── client/                 # React frontend
│   ├── public/             # Static assets & PWA icons
│   ├── src/
│   │   ├── app/            # Router & layout
│   │   ├── components/
│   │   │   ├── layout/     # Navbar, Footer, ThemeToggle, Logo
│   │   │   ├── sections/   # Landing page sections
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── lib/            # Utilities & theme provider
│   │   ├── routes/         # File-based routes
│   │   └── index.css       # Theme variables & globals
│   └── package.json
│
├── server/                 # Express backend
│   ├── prisma/             # Database schema
│   ├── src/
│   │   ├── config/         # Environment config
│   │   ├── controllers/    # Route controllers
│   │   ├── middlewares/     # Error handling
│   │   ├── prisma/         # Prisma client
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   └── package.json
│
└── .gitignore
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL (for server)

### Client Setup

```bash
cd client
pnpm install
pnpm dev
```

### Server Setup

```bash
cd server
cp .env.example .env
# Edit .env with your database credentials
pnpm install
pnpm dev
```

## 🎨 Features

- 🇰🇪 Kenya-themed government services color palette
- 🌗 Light / Dark / System theme toggle
- 📱 Mobile-first responsive design
- 📲 PWA — installable on mobile & desktop
- ♿ Accessible components (ARIA-friendly)
- 🔐 Privacy-first approach

## ⚠️ Disclaimer

HudumaHub is an independent civic platform and is **not officially affiliated** with the Government of Kenya. Information provided is for guidance purposes only.

## 📄 License

MIT
