# TransitOps Backend API Documentation

Welcome to the **TransitOps Backend API**. This application serves as the core logistics orchestration service, managing vehicles, drivers, trips, maintenance logs, expenses, fuel data, and analytical reports with strict role-based access controls (RBAC) and business rule validations.

---

## 🚀 Tech Stack
- **Node.js** & **Express.js**: Modern JavaScript runtime and robust web framework.
- **Supabase (PostgreSQL)**: Scalable transactional relational database storage with integrated row-level security (RLS).
- **Supabase Auth**: JWT-based session management and identity resolution.
- **JSON Web Tokens (JWT)**: Locally verifies symmetric signature tokens for high-performance authentication fallbacks.

---

## 📂 Project Directory Structure

The backend follows a clean, modular structure where each business subdomain contains its own routes, controller, and service layer.

```
server/
├── src/
│   ├── app.js                 # Express app configuration & middleware mounts
│   ├── server.js              # Server entry point, port binding
│   ├── middlewares/
│   │   ├── authMiddleware.js  # JWT validation & RBAC rules handler
│   │   └── errorHandler.js    # Global standard JSON error formatter
│   ├── utils/
│   │   ├── authUtils.js       # Scoping helpers for multi-role database access
│   │   └── supabase.js        # Supabase client instantiation
│   └── modules/
│       ├── auth/              # Signup, login, & token refresh endpoints
│       ├── dashboard/         # Role-specific KPI calculation logic
│       ├── driver/            # Driver management, linked manager assignment
│       ├── vehicle/           # Vehicle registry, odometer & status logs
│       ├── trip/              # Trip dispatcher lifecycle, validation rules
│       ├── maintenance/       # Maintenance logging & auto-expense hooks
│       ├── fuel/              # Fuel logs & auto-expense sync
│       ├── expense/           # Operational cost aggregates & manual records
│       ├── report/            # Fuel efficiency, utilization, ROI metrics (JSON/CSV)
│       └── user/              # User profile settings (name updates)
├── package.json               # Backend dependencies and scripts
└── README.md                  # This developer documentation file
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the `server/` directory:

```env
PORT=5001
FRONTEND_PORT=5173
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_or_service_key
SUPABASE_JWT_SECRET=your_supabase_jwt_signing_secret (Optional: enables local HS256 validation)
```

---

## 🔐 Auth & Role-Based Access Control (RBAC)

TransitOps enforces role-based endpoint authorization. All protected requests must contain a valid JWT in the authorization header:
`Authorization: Bearer <your_access_token>`

### User Roles:
1. **Fleet Manager**: Full write access to vehicles, drivers, trips, maintenance, fuel logs, and analytical reports.
2. **Dispatcher**: Dedicated role for handling trip logistics and dispatch operations.
3. **Safety Officer**: Focused on safety logs, driver verification, and maintenance status tracking.
4. **Financial Analyst**: Access to operational costs, expense logs, fuel logging, and analytics.
5. **Driver**: Read-only profile view, visibility restricted to assigned trips and dashboard.

---

## 📡 API Endpoint Catalog

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/signup` | Public | Registers a new user. If role is 'Driver', automatically registers an empty driver record in the DB. |
| `POST` | `/login` | Public | Authenticates credentials. Returns `token` (access token), `refreshToken`, and user object. |
| `POST` | `/refresh` | Public | Receives `refreshToken` and issues a fresh session keypair. |
| `GET` | `/me` | Protected | Returns details of the currently authenticated active session. |

### 2. Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/summary` | Protected | Returns KPIs tailored for the user's role. Fleet Managers can filter results using optional query parameters: `vehicle_type`, `vehicle_status`, and `region`. |

### 3. Vehicles (`/api/vehicles`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Protected | Returns all vehicles managed by/assigned to the logged-in user. |
| `POST` | `/` or `/new` | Fleet Manager, Safety Officer | Creates a new vehicle. Registration numbers are strictly unique. |
| `POST` | `/update-status` | Protected | Manually transitions vehicle status (`Available`, `On Trip`, `In Shop`, `Retired`). |
| `POST` | `/update-odometer` | Protected | Updates current vehicle mileage. |

### 4. Drivers (`/api/drivers`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Protected | Drivers see their own profile. Managers see all drivers linked to their account. |
| `POST` | `/update-details`| Protected | Updates driver profile card (license code, contact info, category, expiry). |
| `GET` | `/search` | Protected | Search for a driver by email address. |
| `POST` | `/add` | Protected | Assigns/links a driver profile to a Fleet Manager's scope. |

### 5. Trip Dispatcher (`/api/trips`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/create` | Protected | Registers a trip draft. Validates that: cargo weight ≤ vehicle load capacity, driver's license is not expired, vehicle is not retired/in shop, and driver/vehicle status are `Available`. |
| `POST` | `/:tripId/status` | Protected | Progresses trip status (`Pending`, `Dispatched`, `Completed`, `Cancelled`). Automatically synchronizes driver and vehicle statuses. |
| `GET` | `/` | Protected | Returns a scoped list of trips. Drivers see only their assigned trips. |

### 6. Maintenance Logs (`/api/maintenance`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Protected | Lists maintenance histories. |
| `GET` | `/:id` | Protected | Returns a specific maintenance log. |
| `POST` | `/` | Fleet Manager, Safety Officer | Places a vehicle in maintenance. Automatically transitions the vehicle status to `In Shop`. |
| `PUT` | `/:id` | Fleet Manager, Safety Officer | Modifies active log details. |
| `PUT` | `/:id/complete` | Fleet Manager, Safety Officer | Completes maintenance. Restores vehicle status to `Available` (unless Retired) and automatically posts a corresponding entry to the Expenses system. |

### 7. Fuel Registry (`/api/fuel`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Protected | Lists logged fuel details. |
| `POST` | `/` | Fleet Manager, Analyst, Driver | Submits a fuel log. Automatically creates a matching Fuel expense entry. |
| `PUT` | `/:id` | Fleet Manager, Analyst, Driver | Updates fuel records and synchronized expense entries. |
| `DELETE` | `/:id` | Fleet Manager, Financial Analyst | Deletes fuel log and the associated sync expense. |

### 8. Expense Management (`/api/expenses`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Protected | Lists all operational expenses. |
| `GET` | `/operational-cost` | Protected | Returns cost breakdown: total fuel cost, maintenance cost, tolls/other, and grand total. |
| `POST` | `/` | Fleet Manager, Financial Analyst | Logs operational cost items manually (e.g. Tolls, Salary, Repair). |
| `PUT` | `/:id` | Fleet Manager, Financial Analyst | Updates custom expense details. |
| `DELETE` | `/:id` | Fleet Manager, Financial Analyst | Removes expense record from database. |

### 9. Analytical Reports (`/api/reports`)
All report endpoints are protected and accessible to **Fleet Managers**, **Financial Analysts**, and **Safety Officers**. 

*Pro Tip: Add query parameter `?format=csv` to stream reports as a direct CSV download.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/fuel-efficiency` | Displays mileage aggregates (`km/L`) calculated from fuel logs and completed trip distances. |
| `GET` | `/fleet-utilization` | Returns fleet utilization percentage rates and per-vehicle total trip counters. |
| `GET` | `/operational-cost` | Groups all active costs (maintenance, fuel, tolls) per vehicle. |
| `GET` | `/vehicle-roi` | Computes overall ROI parameters, highlighting total cost ownership, monthly upkeep rates, and trip costs. |

### 10. User Settings (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile` | Protected | Returns logged-in profile metadata. |
| `PUT` | `/profile` | Protected | Modifies current account variables (e.g., updates `full_name`). |

---

## 🛡️ Business Rule Enforcements

The API guarantees clean transactional states by strictly enforcing these business rules:
- **Vehicle Exclusivity**: A vehicle on trip, retired, or in maintenance cannot be dispatched.
- **Cargo Constraint**: A trip will reject registration if `cargo_weight_kg` exceeds the selected vehicle's `max_load_capacity`.
- **Driver Verification**: Drivers with expired licenses or "Suspended" statuses cannot be assigned.
- **Auto Status Sync**: Dispatching a trip sets vehicle and driver statuses to `On Trip`. Completing/cancelling restores them to `Available`.
- **Active Maintenance Constraint**: Only one active maintenance record is permitted per vehicle.
- **Expense Integrity**: Modifying or removing fuel entries automatically cascades to correct the operational ledger.