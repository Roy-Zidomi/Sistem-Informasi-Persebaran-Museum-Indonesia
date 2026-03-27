# MuseumNesia

MuseumNesia is a full-stack web application for exploring museum distribution across Indonesia.  
It combines an interactive public map experience with an admin dashboard for managing museum data and monitoring distribution insights.

## Highlights

- Interactive museum map with markers and clustering.
- Smart filtering by province, regency/city, category, and keyword.
- Nearby museum search using browser geolocation and radius.
- Museum detail pages for focused information.
- Admin authentication with JWT.
- Admin dashboard analytics:
  - Museums by province (bar chart)
  - Museums by category (donut chart)
  - Top regencies/cities (horizontal bar chart)
- Full museum CRUD from the admin panel.
- Responsive UI with dark/light mode.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Recharts, Framer Motion, Leaflet.
- Backend: Node.js, Express, PostgreSQL, JWT, bcryptjs.
- Database: PostgreSQL.

## Project Structure

```text
MuseumApp/
  src/                    # Frontend source (React)
  public/                 # Frontend public assets
  backend/
    src/                  # Backend source (Express)
    .env.example          # Backend environment template
  package.json            # Frontend scripts and dependencies
```

## Core Routes

- Public landing page: `/`
- Map explorer: `/map`
- Museum detail: `/museum/:id`
- Admin login: `/admin/login`
- Admin dashboard: `/admin/dashboard`

## Prerequisites

- Node.js 18+ (recommended)
- npm
- PostgreSQL 13+ (recommended)

## Installation

1. Clone the repository.
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```

## Environment Variables

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`, then fill values:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=museum_db

JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@museumnesia.com
ADMIN_PASSWORD=admin123
CORS_ORIGIN=*
```

### Frontend (`.env`, optional)

```env
VITE_API_URL=http://localhost:5000/api
```

If not provided, frontend already defaults to `http://localhost:5000/api`.

## Run Locally

Run backend and frontend in separate terminals.

1. Start backend:
   ```bash
   cd backend
   npm run dev
   ```
2. Start frontend:
   ```bash
   npm run dev
   ```
3. Open the app:
   - Frontend: `http://localhost:5173`
   - Backend health: `http://localhost:5000/api/health`

## Available Scripts

### Frontend (root)

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (`backend/`)

- `npm run dev` - Start API server with nodemon
- `npm start` - Start API server with node

## API Overview

### Public endpoints

- `GET /api/health`
- `GET /api/museums`
- `GET /api/museums/:id`
- `GET /api/museums/nearby`
- `GET /api/provinces`
- `GET /api/regencies`
- `GET /api/categories`

### Admin endpoints

- `POST /api/admin/login`
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/dashboard/museums-by-province`
- `GET /api/admin/dashboard/museums-by-category`
- `GET /api/admin/dashboard/top-regencies`
- `GET /api/admin/museums`
- `POST /api/admin/museums`
- `PUT /api/admin/museums/:id`
- `DELETE /api/admin/museums/:id`

## Database Notes

The backend expects these core tables to exist:

- `museum`
- `provinsi`
- `kabupaten`
- `kategori`

Make sure relations and IDs are consistent with the query logic in `backend/src/services`.

## Build for Production

Frontend:

```bash
npm run build
```

Backend:

```bash
cd backend
npm start
```

## License

This project is provided for educational and portfolio purposes.
