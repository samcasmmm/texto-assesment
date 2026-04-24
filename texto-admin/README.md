# TextoHRMS - Enterprise Workforce Management Dashboard

TextoHRMS is a production-ready, full-stack admin dashboard designed for modern organizations to track employee attendance, monitor field workforce movements in real-time, and generate insightful performance reports.

![TextoHRMS Dashboard Mockup](public/dashboard-preview.png)

## 🚀 Features

- **Control Tower Dashboard**: Real-time workforce overview with live status indicators and key performance metrics.
- **Geospatial Intelligence**: Live employee tracking using Google Maps API, featuring route history polyline visualization.
- **Attendance Management**: Automated check-in/out logging with tardiness tracking and status filtering.
- **Workforce Directory**: Centralized employee management with role-based grouping and quick actions.
- **Performance Analytics**: Tabbed historical reporting with attendance rates and daily summaries.
- **Geo-Fencing**: Admin interface for creating virtual boundaries and monitoring entry/exit events.
- **Premium UI/UX**: Built with a sleek "Glassmorphism" aesthetic using Tailwind CSS 4 and shadcn/ui.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Maps**: [Google Maps Platform](https://developers.google.com/maps)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Dates**: [date-fns](https://date-fns.org/)

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB instance (Local or Atlas)
- Google Maps API Key

### 2. Environment Configuration
Create a `.env` file in the root directory and add the following:
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
JWT_SECRET=your_jwt_secret_key
```

### 3. Installation
```bash
bun install
# or
npm install
```

### 4. Run Development Server
```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📁 Project Structure

```text
src/
├── app/            # Next.js App Router (Pages & API)
├── components/     # Shared UI & Business Components
│   ├── ui/         # Base Radix-based components
│   └── skeleton/   # Loading states
├── lib/            # Utilities (DB connection, config)
├── models/         # Mongoose Schemas
└── types.d.ts      # Global Type Definitions
```

## 📄 License
This project is licensed under the MIT License.
