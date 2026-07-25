# Innnova

Innnova is a single-page autonomous personal assistant demo that accepts a high-level instruction, plans the work into subtasks, executes simulated tool calls, and reports a structured summary of the result.

## What it does

- Parses trip-booking and dining/calendar instructions
- Generates an ordered plan before execution starts
- Orchestrates simulated tool calls such as flight/hotel/restaurant search and booking
- Retries transient failures and degrades gracefully when a tool fails
- Persists task state server-side so the run survives page refreshes
- Displays a live action log and a final summary card in the UI

## Tech stack

- Frontend: React + Tailwind
- Backend: Node.js + Express
- State: in-memory session store on the server
- Data: mock fixtures only, no real payments or bookings

## Run locally

1. Start the backend
   ```bash
   cd backend
   npm install
   npm start
   ```

2. Start the frontend for local development
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. Open http://localhost:3000

### Production-style deployment

Build the frontend and serve it from the backend together:

```bash
cd frontend
npm install
npm run build
cd ../backend
npm install
npm start
```

Then open the app at `http://localhost:3001`.

Alternatively, from the backend folder use:

```bash
cd backend
npm run start:prod
```

## Deploying on Vercel

This repo can be deployed to Vercel as a monorepo with the frontend static site and backend API function.

1. Create a new Vercel project and point it at this repository.
2. Add `vercel.json` to the repository root (already included).
3. Deploy from Vercel. The frontend will be served as a static React app, and `/api/*` will be routed to the backend function.

If you want a custom Vercel configuration, the root `vercel.json` file already contains the required builds and routes.

## Demo scenarios

- Trip booking: "Find and book the cheapest flight and hotel combo for Mumbai next weekend under ₹40,000."
- Dining + calendar: "Book a table for 4 at a highly-rated Italian restaurant this Saturday evening and add it to my calendar."

## Verification

The app includes a backend regression test:

```bash
cd backend
npm test
```
