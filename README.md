# TransitOps - Fleet Management System

TransitOps is a comprehensive, modern Fleet Management System built for the Odoo Hackathon 2026. It provides a centralized platform for logistics and transport companies to manage their vehicles, drivers, trips, maintenance, and operational expenses in real-time.

With a premium dark-themed UI and role-based access control, TransitOps ensures that Fleet Managers, Drivers, Safety Officers, and Financial Analysts have the exact tools and insights they need to do their jobs efficiently.

## 🌟 Key Features (Fully Working)

### 1. Role-Based Dashboards
The application dynamically adapts its UI and available features based on the logged-in user's role:
- **Fleet Manager:** Complete overview of the fleet, vehicle statuses, trip dispatching, and system-wide KPI tracking.
- **Driver:** Personalized dashboard to view assigned trips, active trip statuses, and track completed jobs.
- **Safety Officer:** Dedicated views to monitor driver compliance, safety scores, and license expirations.
- **Financial Analyst:** Deep dive into operational costs, fuel consumption, and expense categorization.

### 2. Vehicle & Fleet Management
- Track the entire lifecycle of a vehicle.
- Real-time status updates (Available, On Trip, In Shop, Retired).
- Monitor odometer readings, load capacities, and acquisition costs.

### 3. Driver Management & Compliance
- Search and onboard registered drivers to your specific fleet via email.
- Track driver licenses, categories, and expiration dates.
- **Bonus Feature:** Automated email reminders for expiring licenses. Safety officers can click a button to instantly send a warning email (via Nodemailer) to drivers whose licenses expire within 30 days.

### 4. Trip Dispatching & Tracking
- Create and assign trips to specific vehicles and drivers.
- Track trip statuses from Scheduled -> In Progress -> Completed.
- Visual status badges and chronological trip history.

### 5. Maintenance Logging
- Record scheduled and emergency maintenance tasks.
- Keep vehicles "In Shop" until maintenance is marked as "Completed".
- Log the final cost of maintenance, which automatically feeds into the financial reports.

### 6. Fuel & Expense Tracking
- Log fuel consumption (liters and cost) per vehicle.
- Track granular operational expenses (Tolls, Maintenance, Miscellaneous) tied to specific trips and vehicles.

### 7. Advanced Analytics & Reporting
The system crunches raw operational data into actionable insights:
- **Fuel Efficiency Report:** Analyzes km/L per vehicle.
- **Operational Cost Breakdown:** Visualizes expenses categorized by Fuel, Tolls, and Maintenance.
- **Vehicle ROI:** Compares the total cost of ownership against acquisition costs.
- **Fleet Utilization:** Calculates the percentage of active vs idle vehicles.

### 8. Data Export (CSV & PDF)
- **CSV Export:** Download raw data for any report with a single click.
- **PDF Export with Charts:** High-quality, client-side generated PDF reports that include data tables AND visual charts (powered by `jsPDF`, `jspdf-autotable`, and `html2canvas`).

### 9. Security & Optimization
- **Rate Limiting:** API endpoints are protected against brute-force and DDoS attacks using `express-rate-limit` (Max 50 requests per 15 minutes per IP).
- **JWT Authentication:** Secure, token-based authentication system.

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Custom Dark/Zinc Theme)
- **Icons:** Lucide React
- **Charts:** Recharts
- **PDF Generation:** jsPDF, jspdf-autotable, html2canvas

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (with Supabase)
- **Email Service:** Nodemailer
- **Security:** CORS, express-rate-limit

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL / Supabase instance

### Environment Variables

Before starting the applications, you will need to set up your environment variables. 

**Backend (`server/.env`)**
Create a `.env` file in the `server` directory and add the following keys:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_or_service_key
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_gmail_address (for Nodemailer)
EMAIL_PASS=your_gmail_app_password
```

**Frontend (`client/.env`)**
Create a `.env` file in the `client` directory and add:
```env
VITE_BACKEND_URL=http://localhost:5000
```

### 1. Setup the Backend
```bash
cd server
npm install

# Create a .env file and add your database/JWT credentials
# Run the server
npm run dev
# or
npm start
```

### 2. Setup the Frontend
```bash
cd client
npm install

# Create a .env file with VITE_BACKEND_URL=http://localhost:5000
# Run the dev server
npm run dev
```

### 3. Build for Production
To compile the frontend for production deployment:
```bash
cd client
npm run build
```
This will generate optimized, minified static files in the `dist` directory, completely resolving all TypeScript strict-mode checks.

---

## 🎨 Design Philosophy
TransitOps was built with a strong emphasis on **Aesthetics and User Experience (UX)**. Instead of a generic dashboard, it uses a custom, highly polished dark mode with glass-morphism effects, smooth micro-animations, and a cohesive "Zinc & Emerald" color palette. Data tables are clean, and KPIs are immediately digestible.

---

*Built with ❤️ for the Odoo Hackathon 2026*
