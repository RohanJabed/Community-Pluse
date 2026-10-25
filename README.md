# CommunityPulse — Community Event & Volunteer Management Platform

> Built for the **Programming Hero Technical Instructor Assessment**. Designed as a clean, production-grade, full-stack Next.js application to empower community organizations in organizing civic initiatives, managing volunteer rosters, and tracking participation with a live **MongoDB Atlas** database.

---

## 🌟 Project Overview

**CommunityPulse** is a modern, responsive web application engineered to bridge the gap between grassroots community organizers and civic-minded volunteers. Organizers can publish events, define volunteer requirements and capacity limits, track registrations, and monitor check-ins with digital QR passes. Volunteers can discover opportunities, filter events, reserve shifts, and manage their participation history.

---

## 🗄️ MongoDB Atlas Integration

The application is connected directly to your **MongoDB Atlas** cluster:
- **Connection URI**: `mongodb+srv://Events:xG2DGkbM1s9piLed@cluster0.vyryoss.mongodb.net/communitypulse?retryWrites=true&w=majority`
- **Database Name**: `communitypulse`
- **Driver**: Official `mongodb` native client with global connection pooling singleton pattern for optimal Next.js serverless and server performance.

### Collections:
1. `users`: Stores organizer and volunteer accounts, credentials, profiles, skills, and bio.
2. `events`: Stores all community events, categories, capacities, registration counts, deadlines, and status (`published`, `closed`, `completed`, `draft`).
3. `registrations`: Stores volunteer registrations, selected skills, emergency contacts, notes, status (`Registered`, `Confirmed`, `Attended`, `Cancelled`), and QR code tokens.

---

## 🚀 Key Features

### 1. Organizer Studio
- **Event Creation & Publishing**: Create events with Title, Description, Date & Time, End Time, Location, Category, Max Capacity, Required Skills, and Registration Deadlines.
- **AI Event Description Assistant**: Transforms a one-sentence prompt (e.g., *"We want to organize a tree plantation program"*) into a full event title, inspiring description, suggested roles, required skills, and promotional copy.
- **Roster & Volunteer Management**: View all registered volunteers for an event, see their selected skills/notes, and update their participation status (**Registered**, **Confirmed**, **Attended**, **Cancelled**).
- **Check-in Desk & QR Scanner**: Verify volunteer digital passes on-site by entering ticket IDs or tokens, automatically updating their status to `Attended`.
- **Event Capacity Controls**: Automatically disables registration when capacity reaches zero and allows manual registration closures.
- **Organizer Dashboard**: Live metric counters for Total Events, Upcoming Events, Total Volunteers, Available Slots, and Completed Events with live capacity progress bars.
- **Interactive Analytics**: Visual charts powered by Recharts (Registrations vs Capacity Bar Chart, Events by Category Donut Chart, and Participation Status Breakdown).

### 2. Volunteer Experience
- **Discover & Filter Events**: Search events by title, keyword, or skills. Filter by category (Environment, Food Security, Education, etc.), timeframe (Upcoming, All, Past), and open slots.
- **Instant Shift Registration**: Select preferred role/skill from the event's requirements, provide optional notes/emergency contacts, and receive immediate registration confirmation with confetti celebration.
- **Registration Constraints**: Prevents duplicate registrations, registrations after the deadline, or signups when an event is full.
- **My Events & Passes**: Dedicated dashboard with Upcoming vs Past tabs, real-time status badges, and digital QR passes.
- **Self-Service Cancellation**: Volunteers can cancel registrations before the event starts, instantly freeing up slots for others in real-time.
- **Volunteer Profile**: Showcase bio, capabilities, causes, and civic achievement badges (**Eco Guardian**, **Hunger Hero**, **Reliable Star**).

### 3. Bonus Challenges (All 6 Implemented!)
1. **Event Favorites**: Volunteers can bookmark favorite events with persistent storage and filter by favorites.
2. **Event Reminder**: Automated approaching-event warning banners (*"Starting in X days"*) on event details and volunteer dashboard.
3. **Volunteer Profile**: Personalized profiles with bio, skills, interests, and participation history badges.
4. **Event Sharing**: Share modal supporting one-click clipboard copying, X (Twitter), WhatsApp, LinkedIn, and Email sharing.
5. **Registration QR Code**: Generates real digital pass QR codes (`qrcode.react`) with unique ticket tokens and provides an organizer check-in verification station.
6. **Dark / Light Theme**: Seamless dark mode toggle with persistent state and custom Tailwind CSS theme styling.

---

## 🔑 Demo Credentials

For quick evaluation, CommunityPulse includes **1-click demo login buttons** in the navbar and login page:

| Role | Name | Email | Password |
|---|---|---|---|
| **Organizer** | Sarah Jenkins | `organizer@communitypulse.org` | `admin123` |
| **Volunteer** | Alex Rivera | `alex.volunteer@gmail.com` | `volunteer123` |

You can also create a new custom account with any role on the **Join Us** page (`/register`).

---

## 🛡️ Authentication Strategy & Role-Based Authorization

### Authentication
- Implemented via secure HTTP session cookies (`cp_session_user`).
- Passwords and session identities are handled through `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, and `/api/auth/logout`.
- Client-side auth state is managed reactively via `AuthContext`.

### Route & Action Protection
- **Role Isolation**:
  - Volunteers attempting to access organizer routes (`/organizer/*`) are blocked by `OrganizerLayout` with an informative warning banner.
  - Organizers attempting to register as volunteers are prevented by API and client validation (*"Organizers cannot register as volunteers. Please switch to a volunteer account"*).
  - Only the volunteer who created a registration (or an organizer) can cancel it.
  - Only organizers can access full volunteer contact rosters and update participation statuses.

---

## 🤖 AI Implementation (Smart Element)

The **AI Event Description Assistant** assists organizers in generating complete event proposals from a simple concept prompt:

### How It Works
1. **Organizer Input**: The organizer opens the assistant from the Create Event page and enters an idea (e.g., *"We want to organize a weekend food box packaging and distribution program"*).
2. **Backend Processing (`/api/ai/generate-event`)**:
   - **Live LLM Integration**: If a `GEMINI_API_KEY` is present in `.env.local`, the endpoint makes a live generation call to Google Gemini (`gemini-1.5-flash`), formatting the response into structured JSON.
   - **Semantic Fallback Synthesizer**: If no API key is configured, a built-in semantic NLP generator clusters keywords (environment, hunger, youth tech, animal care, disaster relief, health) and outputs rich titles, descriptions, roles, skills, and promotional copy. This ensures **100% reliable functionality out-of-the-box**.
3. **Form Auto-Population**: The organizer reviews the synthesized proposal, can copy the promotional tweet, and clicks **"Apply to Event Form"** to fill all fields automatically.

---

## 📊 Analytics Implementation

The organizer analytics dashboard (`/organizer/analytics`) uses **Recharts** to render:
1. **Volunteer Registrations vs Capacity Bar Chart**: Compares active registered volunteers against maximum capacities across community events.
2. **Events by Category Donut Chart**: Visualizes the proportional distribution of initiatives (Environment, Education, Food Security, etc.).
3. **Volunteer Status Breakdown Donut Chart**: Tracks volunteers categorized by `Registered`, `Confirmed`, `Attended`, and `Cancelled`.
4. **Capacity Utilization Metric Card**: Displays the live aggregate percentage of filled volunteer slots across the platform.

---

## ⚙️ Environment Variables

The project uses `.env.local` configured with your MongoDB Atlas database:

```bash
# MongoDB Atlas Database Connection
MONGODB_URI=mongodb+srv://Events:xG2DGkbM1s9piLed@cluster0.vyryoss.mongodb.net/communitypulse?retryWrites=true&w=majority
MONGODB_DB=communitypulse

# Optional: Google Gemini API Key for live AI generation
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Next.js Port (Default 3000)
PORT=3000
```

---

## 💻 Local Setup Instructions

### Prerequisites
- Node.js version 18.x or higher (tested on Node v24)
- npm version 9.x or higher

### Steps
1. Navigate to the project root directory:
   ```bash
   cd /Users/user/Desktop/Projects/vendor
   ```
2. Install all dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.
5. Use the **Demo: Organizer** or **Demo: Volunteer** buttons in the navigation bar to test either role.

---

## 🏗️ Production Build & Verification

To run a production build and verify type safety:
```bash
npm run build
npm run start
```

---

## 📁 Architecture & File Structure

```
src/
├── app/
│   ├── api/                     # 13 RESTful API Endpoints connected to MongoDB
│   │   ├── auth/                # Login, Register, Me, Logout
│   │   ├── events/              # Event CRUD, Status, and Volunteer Roster
│   │   ├── volunteers/          # Volunteer Registrations, Status, Cancellation
│   │   ├── ai/generate-event/   # AI Event Assistant
│   │   ├── analytics/           # Organizer Metrics & Chart Datasets
│   │   └── checkin/             # QR Pass Verification Endpoint
│   ├── (auth)/                  # /login and /register
│   ├── events/                  # Public Event Directory & /events/[id] Details
│   ├── organizer/               # Dashboard, Manage, Create, Volunteers, Analytics
│   ├── volunteer/               # Dashboard, My Events, Profile
│   ├── globals.css              # Theme Variables & Glassmorphism
│   └── layout.tsx               # Root Layout with Theme, Toast, & Auth Providers
├── components/                  # Navbar, Footer, EventCard, Filters, Modals
├── context/                     # AuthContext, ThemeContext, ToastContext
├── lib/                         # types.ts, db.ts, auth.ts, ai-assistant.ts, mongodb.ts
└── data/
    └── db.json                  # Initial seed data reference
```

---

## 📝 License
Built for educational and community evaluation purposes.
