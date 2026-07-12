# TransitOps - Odoo Hackathon

TransitOps is a fleet and transport operations dashboard built for managing vehicles, drivers, trips, maintenance, fuel expenses, and reporting in one place. The project is split into a modern React frontend and an Express/Supabase backend, making it easier to track operational data and visualize business activity from a single workflow.

## Project Highlights

- Authentication screens for login and signup
- Central dashboard for operational snapshots and quick actions
- Fleet, driver, trip, maintenance, fuel, analytics, and settings modules
- Responsive UI built with React, TypeScript, and Vite
- Backend services organized by feature for easier maintenance

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router, Tailwind CSS
- UI Utilities: Lucide React, React Hook Form, Recharts
- Backend: Node.js, Express, Supabase, JWT, CORS

## Repository Structure

- `client/` - React application and UI components
- `server/` - API, business logic, and database integration
- `server/schema.sql` - database schema and setup reference

## Getting Started

### Frontend

```bash
cd client
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
npm start
```

## Notes

- Configure your Supabase credentials before running the backend.
- The frontend routes include login, dashboard, fleet, drivers, trips, maintenance, fuel expenses, analytics, and settings.
- Use `npm run build` inside `client/` to create a production build.
