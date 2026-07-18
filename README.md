# StadiumPilot 2026

![StadiumPilot Banner](https://via.placeholder.com/1200x400/2563eb/ffffff?text=StadiumPilot+2026)

> An intelligent, AI-powered copilot for FIFA World Cup 2026 stadium operations.

StadiumPilot 2026 is a web application that leverages advanced AI to provide real-time, domain-specific operations assistance, optimal routing, and crowd intelligence for stadium staff and fans.

## Features

- **🗺️ Interactive Map Navigation**: Real-time visual routing across stadium sections with accessibility-aware paths.
- **👥 Crowd Intelligence**: Congestion monitoring and real-time wait time updates.
- **🤖 GenAI Operations Digest**: Predictive operational insights powered by Google Gemini.
- **♿ Accessibility Assistant**: Specialized mapping for wheelchairs and accessible routes.

## Architecture

StadiumPilot is structured as a monorepo containing a decoupled frontend and backend:

- **Frontend**: A lightning-fast React Single Page Application (SPA) built with Vite and styled with Tailwind CSS. It features complex interactive SVG stadium maps and fluid animations via Framer Motion.
- **Backend**: A robust Node.js API built with Express, featuring Prisma for database management (SQLite) and Zod for strict payload validation.
- **AI Integration**: The backend integrates the `@google/genai` SDK to dynamically calculate routes and generate operational digests based on live stadium context.

## Tech Stack

- **Frontend**: Vite, React 19, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, Prisma (SQLite), `@google/genai`
- **Validation**: Zod
- **Testing**: Vitest
- **Typing**: Strict TypeScript

## Getting Started

The project requires running both the backend and frontend concurrently.

### Backend Setup
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and add your `GEMINI_API_KEY`.
4. `npm run dev` (Runs the API on port 3001)

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Copy `.env.example` to `.env` (Sets `VITE_API_URL` to point to the backend).
4. `npm run dev` (Runs the UI on port 5173/5174)

## License

MIT License © 2026 StadiumPilot AI
