# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack personal finance tracker with React frontend, Apollo GraphQL server, and Google Sheets as the database. Features AI-powered voice input via Chrome's experimental Prompt API.

## Development Commands

### Client (React + Vite)
```bash
cd client
npm run dev       # Dev server at http://localhost:5173
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Server (Node.js + Apollo)
```bash
cd server
npm start         # Apollo Server at http://localhost:4000 (with nodemon)
```

Both must run simultaneously. The client Apollo Client points to `http://localhost:4000/`.

## Architecture

### Data Flow
```
React Components → Apollo Client → Apollo Server → Services Layer → Google Sheets API
```

### Backend (`server/`)
- `src/index.js` — Apollo Server setup with Express and CORS
- `src/schema.js` — GraphQL type definitions (Transaction, DashboardData, CategorySummary, MonthlyStats)
- `src/resolvers.js` — GraphQL resolvers delegating to services
- `services/database.js` — Google Sheets connection using JWT service account auth
- `services/transactions.js` — All business logic: CRUD, aggregations, dashboard calculations
- `services/cache.js` — In-memory cache with 5-minute TTL (keys: `all_transactions`, `dashboard_data`)

### Frontend (`client/src/`)
- `main.jsx` — Apollo Client setup (InMemoryCache, ApolloProvider) and React Router
- `App.jsx` — Tab-based routing: Dashboard / Transactions / Analytics
- `components/` — UI components; `QuickModal.jsx` handles add/edit with voice input
- `hooks/usePromptAPI.js` — Parses natural language voice input using Chrome's Prompt API
- `hooks/useQuickModal.js` — Modal open/close state management
- `graphql/finance-tracker` — All GraphQL query and mutation definitions

### GraphQL Operations
- Queries: `GetDashboard`, `GetTransactions`, `GetUserCategories`, `GetTransactionsByCategory`
- Mutations: `AddTransaction`, `UpdateTransaction`, `DeleteTransaction`
- Dashboard query polls every 30 seconds (`pollInterval: 30000`)
- Mutations use `refetchQueries` to keep UI in sync

### Google Sheets Database
- Single sheet named "Transactions" with columns: `id`, `amount`, `category`, `description`, `date` (YYYY-MM-DD), `type`
- `type` is either `INCOME` or `EXPENSE`
- Transaction `id` is a timestamp string
- Credentials in `server/.env`: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SPREADSHEET_ID`

### Voice Input
- Uses `webkitSpeechRecognition` to capture speech, then passes transcript to Chrome's Prompt API
- Requires enabling `chrome://flags/#prompt-api-for-gemini-nano` in Chromium browsers
- Configured via system prompt in `usePromptAPI.js` to extract transaction fields from natural language
