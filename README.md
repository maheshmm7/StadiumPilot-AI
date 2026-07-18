# StadiumPilot AI 🏟️🤖

<div align="center">
  <img src="https://placehold.co/1200x300/1e1e2f/9333ea/png?text=StadiumPilot+AI" alt="StadiumPilot Hero" width="100%" style="border-radius: 12px; margin-bottom: 20px;"/>
  <br/>
  <h3>An intelligent, AI-powered copilot for modern stadium operations and fan experience.</h3>
</div>

---

## 📖 What is StadiumPilot AI?

StadiumPilot AI is a comprehensive, full-stack application designed to revolutionize how massive venues (like stadiums for the FIFA World Cup) manage crowds, route attendees, and streamline operations. 

Navigating a massive stadium can be chaotic for fans and overwhelming for staff. StadiumPilot solves this by combining **interactive, real-time venue mapping** with **Generative AI** to provide instant, dynamic answers to operational questions.

### 🎯 Chosen Vertical
**Smart City / Event Management & Infrastructure**

### 🧠 Approach and Logic
The logic revolves around real-time spatial awareness combined with Generative AI reasoning. Rather than hard-coding static routes, the system feeds live contextual data (crowd levels at specific gates, maintenance incidents, weather conditions) directly to a Large Language Model (Gemini Pro). The AI then dynamically evaluates these parameters against the user's constraints (e.g., needing step-free accessible routing) to produce the most logical, safest, and fastest route.

### 🌟 Explicit Personas & The Core Problem It Solves

#### Persona 1: The Match Attendee (Fan)
**Goal:** Reach their seat efficiently, find amenities (food/restrooms), and enjoy the event without getting lost or stuck in massive crowds.
**Solution:** StadiumPilot provides real-time, AI-generated routing to their specific gate, bypassing congested areas, and dynamically recalculating if an incident occurs.

#### Persona 2: The Stadium Operations Director (Staff)
**Goal:** Maintain safety, prevent bottlenecks, respond to incidents instantly, and optimize crowd flow across the entire venue.
**Solution:** StadiumPilot provides an Operations Digest powered by GenAI that instantly flags critical alerts (e.g., medical incidents or high crowd density) and gives actionable recommendations to deploy resources effectively.

#### Persona 3: Accessibility-Required Visitor (Wheelchair User)
**Goal:** Navigate the stadium safely without encountering stairs, steep inclines, or blocked paths.
**Solution:** StadiumPilot specifically factors in a `needsWheelchair` parameter, generating step-free, accessible routes and ensuring the visitor does not get routed through stair-only concourses.

### 📋 Assumptions Made
- **Connectivity:** Assumes attendees and staff have active internet connections to receive live route updates.
- **Sensor Data:** Assumes stadium gates and zones are equipped with crowd-counting sensors (simulated in our SQLite database) that feed real-time density data to the backend.
- **Scale:** The SVG map is a simplified representation of a massive complex. Real-world implementation would require multi-floor pathing arrays.

---

## 🚀 How It Works

StadiumPilot AI is built on a decoupled **Monorepo Architecture**, separating the visual interface from the AI processing engine.

### 1. The Interactive Frontend (React + Vite)
- The user interface features a massive, interactive SVG map of a stadium.
- Users can click on specific zones (e.g., "Main Entrance", "Medical Tent", "VIP Lounge").
- The UI dynamically renders **Framer Motion** powered routes (animated lines) showing exactly how to get from point A to point B.

### 2. The AI Backend (Node + Express + Gemini)
- The backend serves as the brain of the operation. 
- It uses the **Google Gemini Pro AI** to act as a "Stadium Operations Director". 
- When a user asks a question or views a zone, the backend feeds real-time context (weather, gate capacity, current alerts) into the Gemini AI. The AI then generates a highly accurate, structured JSON response detailing recommendations, alerts, and crowd control measures.

---

## 🛠️ Tech Stack

- **Frontend:** Vite, React 19, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend:** Node.js, Express, Prisma (SQLite Database), Google `@google/genai` SDK.
- **Validation & Quality:** Zod (Schema Validation), Vitest (Testing), Oxlint.

---

## 💻 How to Run the Project Locally

Because this is a decoupled architecture, you must run both the backend API and the frontend UI concurrently.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Google Gemini API Key

### Step 1: Start the Backend (AI Engine)
Open a terminal and run the following commands:
```bash
cd backend
npm install
```
Next, rename the `.env.example` file to `.env` and insert your Gemini API Key:
```env
PORT=3001
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your_actual_api_key_here"
```
Start the backend server:
```bash
npm run dev
```
*(The backend will now be listening on http://localhost:3001)*

### Step 2: Start the Frontend (User Interface)
Open a **second, separate terminal** and run the following commands:
```bash
cd frontend
npm install
```
Rename the `.env.example` file to `.env`. It is already configured to point to your local backend:
```env
VITE_API_URL="http://localhost:3001/api"
```
Start the frontend interface:
```bash
npm run dev
```
*(The frontend will now be running on http://localhost:5173 or 5174)*

**You can now open your browser to the frontend URL and interact with the stadium map!**

---

## 🔒 Security & Contribution
- Please review our [SECURITY.md](SECURITY.md) for vulnerability reporting.
- Please review our [CONTRIBUTING.md](CONTRIBUTING.md) if you wish to fork and add features.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
