# Dhaka Zoo Management System

Dhaka Zoo Management System is a full-stack database project for a Mirpur/Dhaka Zoo style visitor experience. It combines a public-facing React website with an Express API, JWT auth, Prisma ORM, PostgreSQL, normalized zoo operations data, and seed data large enough to demonstrate meaningful relational queries.

## Live Website

Frontend (Vercel):

https://dhaka-zoo-visitor-portal.vercel.app/

Backend health check (Render):

https://dhaka-zoo-management-system.onrender.com/api/health

The production database is PostgreSQL on Neon. GitHub Pages is not used.

## Tech Stack

- Frontend: React, Vite, React Router, CSS custom properties
- Backend: Node.js, Express
- ORM: Prisma
- Database: PostgreSQL
- Auth: JWT
- Validation: Zod
- Password hashing: bcryptjs

## Main Features

- Modern home page with hero, featured animals, zone previews, feeding teaser, and visitor information
- Animal directory with search, zone filter, diet filter, health filter, and detail modal
- Auth pages for visitor registration and sign in
- Protected ticket booking with adult, child, and family pricing
- Unique ticket code generation and visitor ticket history
- Feeding schedule endpoints with mark-fed logging
- Normalized Prisma schema with indexes and relational seed data

## Core Entities

- User
- Animal
- Species
- Zone
- FeedingSchedule
- FoodItem
- Ticket
- TicketZone
- DayPlan
- DayPlanZone
- HealthRecord
- FeedingLog
- AuditLog
- Authority
- Caregiver
- FoodSupplier

## Database Design Notes

The schema is normalized so repeated descriptive data is stored once and referenced by foreign keys. `Species`, `Zone`, and `FoodItem` are separate tables because many animals share the same species profile, many animals live in the same zone, and many feeding schedules reuse the same food definitions. This avoids duplicated diet, habitat, zone, and unit text across animal and feeding rows.

`DayPlanZone` is a join table instead of a raw `planned_zones` array. That design works cleanly across PostgreSQL and Prisma, lets each zone keep a `visit_order`, supports foreign key integrity, and allows joins such as "which plans include Aviary Garden?"

Useful indexes were added for common lookups:

- `User.email` is unique for login.
- `Animal.name` supports animal search.
- `Animal.species_id` and `Animal.zone_id` support filtering and joins.
- `Ticket.visit_date` supports visit-day reporting.
- Additional indexes support feed logs, day plans, and audit lookups.

Joins are used throughout the app: animal details join `Animal -> Species -> Zone`, feeding views join `FeedingSchedule -> Animal -> FoodItem`, and ticket history joins `Ticket -> User` plus optional `TicketZone -> Zone`.

## Quick Local Tutorial

Use these steps to run the complete project on any local PC.

### 1. Install Required Software

Install:

- Node.js
- Git
- PostgreSQL
- pgAdmin, optional but recommended

After installing PostgreSQL, create a database named:

```text
dhaka_zoo
```

You can create it from pgAdmin:

1. Open pgAdmin.
2. Connect to your local PostgreSQL server.
3. Right-click `Databases`.
4. Click `Create > Database`.
5. Use the name `dhaka_zoo`.

### 2. Clone the Repository

```bash
git clone https://github.com/nuraia/Dhaka-Zoo-Management-System.git
cd Dhaka-Zoo-Management-System
```

### 3. Configure Environment

Copy `.env.example` into `server/.env` and fill in values:

```powershell
Copy-Item .env.example server/.env
```

Example `server/.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/dhaka_zoo
JWT_SECRET=dhaka-zoo-local-secret-12345
PORT=5000
CLIENT_URL=http://localhost:5173
```

Replace `YOUR_PASSWORD` with the PostgreSQL password you set during installation.

### 4. Run Backend

```bash
cd server
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

If you are using a disposable local database and do not need migration history, `npm run prisma:push` can be used instead of `npm run prisma:migrate`.

The backend runs at:

```text
http://localhost:5000
```

### 5. Run Frontend

Open a second terminal from the repository root:

```bash
cd client
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

The frontend expects the API at `http://localhost:5000/api` by default. You can override it with `VITE_API_URL`.

### 6. Demo Login

After running `npm run seed`, use these accounts locally:

```text
Visitor:
visitor@dhakazoo.local
Visitor12345
```

```text
Admin:
admin@dhakazoo.local
Admin12345
```

Demo accounts are rejected when `NODE_ENV=production`. Create a real visitor account on the deployed app instead.

## Deployment Notes

### Vercel Frontend

Import the repository in Vercel and configure:

```text
Root Directory: client
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Set the production environment variable:

```env
VITE_API_URL=https://dhaka-zoo-management-system.onrender.com/api
```

`client/vercel.json` provides React Router fallback routing and production security headers. Do not commit `.env` or `.env.production`; Vercel owns production environment configuration.

### Backend Deployment

Deploy the `server` folder to a Node.js host such as Render or Railway.

Recommended backend settings:

```text
Root Directory: server
Build Command: npm install && npm run prisma:generate && npx prisma migrate deploy
Start Command: npm start
```

Backend environment variables:

```env
DATABASE_URL=your_hosted_postgresql_connection_string
JWT_SECRET=your_secure_secret
PORT=5000
CLIENT_URL=https://dhaka-zoo-visitor-portal.vercel.app
```

Run the seed command once on the hosted backend/database:

```bash
npm run seed
```

## Seed Data

The seed script creates:

- 33 animals
- 12 species groups
- 7 zones
- 12 food items
- Feeding schedules for every seeded animal
- Health records
- One seeded admin account
- One demo visitor account with a sample ticket and day plan

Demo credentials for local development only:

- Admin: `admin@dhakazoo.local` / `Admin12345`
- Visitor: `visitor@dhakazoo.local` / `Visitor12345`

These credentials are blocked in production.

## API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Animals

- `GET /api/animals`
- `GET /api/animals/:id`
- `POST /api/animals`
- `PUT /api/animals/:id`

### Tickets

- `POST /api/tickets/book`
- `GET /api/tickets/my`
- `GET /api/tickets/:id`
- `POST /api/tickets/validate`

### Feeding

- `GET /api/feeding`
- `POST /api/feeding`
- `POST /api/feeding/:id/mark-fed`

### Other

- `GET /api/health`
- `GET /api/zones`
- `POST /api/day-plans`
- `GET /api/day-plans/:date`
- `PUT /api/day-plans/:id`
- `POST /api/enquiry`

## Screenshots

Add screenshots here after running the frontend locally:

- Home page
- Animal directory
- Ticket booking
- Auth pages

## Production Security Notes

- Vercel serves only the static Vite frontend and applies a restrictive Content Security Policy.
- Render accepts credentialed browser requests only from configured frontend origins.
- The ticket validation endpoint requires an authenticated admin or staff account.
- The public repository contains no production database password, JWT secret, or committed frontend environment file.
- If Google Safe Browsing displays a warning after a clean deployment, verify the site in Google Search Console, review **Security issues**, and request a review. Browser reputation warnings are removed by Google, not by Vercel or application code.

## Future Work

- ZooBot with Claude API
- Full day planner UI
- Health timeline UI
- Audit log viewer
- Database views for visitor and feeding summaries
- Stored procedure or trigger for ticket capacity enforcement
- Admin dashboard for animals, health records, and feeding operations
