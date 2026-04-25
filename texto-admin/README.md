# TextoHRMS Admin - Workforce Intelligence Dashboard

TextoHRMS Admin is a high-performance, full-stack dashboard built with Next.js 15, designed for modern organizations to monitor field workforce movements, manage attendance geofencing, and analyze performance metrics.

## 🚀 Features

- **Control Tower**: Real-time visualization of active staff on a live map with status indicators.
- **Geospatial Intelligence**: Historical route tracking using polylines and Google Maps API.
- **Geofence Management**: Admin tools to define and manage workplace boundaries.
- **Comprehensive Reports**: Automated analytics for attendance rates, tardiness, and daily summaries.
- **Glassmorphism UI**: A premium, modern design aesthetic built with Tailwind CSS 4 and shadcn/ui.
- **Scalable API**: Robust backend handling high-frequency location synchronization from mobile clients.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Maps**: [Google Maps Platform](https://developers.google.com/maps)
- **Auth**: JWT-based secure authentication

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB instance
- Google Maps API Key

### 2. Environment Configuration
Create a `.env` file in the root of `texto-admin/`:
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
JWT_SECRET=your_jwt_secret_key
```

### 3. Installation
```bash
npm install
```

### 4. Development Server
```bash
npm run dev
```

### 5. Seeding Data (Optional)
To populate the database with demo employees, attendance, and geofences:
```bash
bun run scripts/seed-data.ts
```

## 📂 Directory Structure
```text
texto-admin/
├── src/app/          # Next.js Pages & API Routes
├── src/components/   # Dashboard UI System
├── src/models/       # Mongoose Schemas (Attendance, Employee, GeoFence, LocationLog)
├── src/lib/          # Database & Auth Utilities
└── scripts/          # Database seeding scripts
```

## 📄 License
This project is licensed under the MIT License.
