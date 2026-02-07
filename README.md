# 🌿 GitHub Manager

A premium, organic-themed task management system for GitHub repositories. Track tasks directly in your repos, anchor them to specific files and lines, and keep your development workflow organized.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)

## ✨ Features

- **🔐 GitHub OAuth** - Seamless authentication with your GitHub account
- **📍 Code Anchoring** - Pin tasks to specific files and line ranges
- **🏷️ Smart Labels** - TODO, BUG, FIXME, SECURITY, and more task types
- **⚡ Real-time Sync** - Instant sync with your GitHub repositories
- **🌙 Dark Mode** - Beautiful "Midnight Aurora" dark theme
- **📊 Dashboard** - Comprehensive stats and activity overview
- **⭐ Task Pinning** - Star important tasks for quick access

## 🚀 Getting Started

### Prerequisites

- Bun (v1.0+) or Node.js (v18+)
- Supabase account
- GitHub OAuth app

### Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun run build

# Start production server
bun start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: Supabase (PostgreSQL)
- **Auth**: GitHub OAuth via Supabase
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Toasts**: Sonner

## 📁 Project Structure

```
├── app/
│   ├── (auth)/           # Auth routes (login, logout, callback)
│   ├── dashboard/        # Dashboard pages
│   │   ├── all-tasks/    # All tasks view
│   │   ├── repos/        # Repository management
│   │   └── settings/     # User settings
│   ├── globals.css       # Global styles & themes
│   └── page.tsx          # Landing page
├── components/
│   ├── dashboard/        # Dashboard components
│   └── ui/               # Shadcn UI components
├── lib/
│   ├── db/               # Database actions
│   ├── gitdata/          # GitHub API functions
│   └── supabase/         # Supabase client
└── types/
    └── database.ts       # Type definitions
```

## 🎨 Design System

The app features an **organic/natural design language**:

- **Light Theme**: Warm cream, sage green, forest tones
- **Dark Theme**: Deep black with emerald accents (Midnight Aurora)
- **Typography**: Playfair Display (headings) + Outfit (body)
- **Components**: Cards with subtle shadows, rounded corners, natural transitions

## 📝 Task Types

| Type | Description |
|------|-------------|
| `TODO` | General task |
| `FIXME` | Code that needs fixing |
| `BUG` | Known bug |
| `SECURITY` | Security issue |
| `OPTIMIZE` | Performance optimization |
| `HACK` | Temporary workaround |
| `NOTE` | Documentation note |
| `ALERT` | Critical attention needed |
| `DEPRECATED` | Code to be removed |
| `REVIEW` | Needs code review |

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform supporting Next.js:

```bash
bun run build
bun start
```

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Built with 🌿 and ☕
