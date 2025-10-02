# Finance Tracker with GraphQL

A modern finance tracking application built with React, GraphQL, and AI-powered voice input capabilities.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Architecture](#project-architecture)
- [Component Diagram](#component-diagram)
- [Sequence Diagram](#sequence-diagram)
- [GraphQL Implementation](#graphql-implementation)
- [PromptAPI Integration](#promptapi-integration)
- [Getting Started](#getting-started)
- [Usage](#usage)

## Overview

This Finance Tracker is a full-stack web application that helps users manage their financial transactions, track spending patterns, and gain insights into their financial health. The application is built using a modern tech stack with a React frontend and a GraphQL API backend, featuring real-time data updates and interactive visualizations.

Key technologies used:

- **Frontend**: React, Apollo Client, Recharts
- **Backend**: Node.js, Apollo Server
- **API**: GraphQL
- **Database**: Google Spreadsheet
- **Voice Input**: PromptAPI (AI-powered speech-to-text)
- **Data Visualization**: Recharts

## Features

- **Dashboard with Financial Overview**

  - Total balance, monthly income, and expense summaries
  - Interactive charts for category spending and monthly trends
  - Recent transactions list

- **Transaction Management**

  - Add, edit, and delete financial transactions
  - Categorize transactions (Income, Expense)
  - Add detailed descriptions and assign specific categories

- **Voice Input for Transactions**

  - Speech-to-text functionality using PromptAPI
  - AI-powered parsing of transaction details from natural language
  - Automatic extraction of amount, category, description, and transaction type

- **Financial Analytics**

  - Category-based spending analysis
  - Monthly financial trends and comparisons
  - Interactive charts for data visualization

- **Responsive Design**
  - Mobile-friendly interface
  - Intuitive navigation between different views

## Project Architecture

The application follows a client-server architecture with clear separation of concerns:

### Client-Side Architecture

The frontend is built with React and uses Apollo Client to communicate with the GraphQL API. The UI is component-based with a modular structure for easy maintenance and extension.

- **Apollo Client**: Manages GraphQL queries, mutations, and caching
- **React Hooks**: Custom hooks for state management and business logic
- **Component Structure**: Modular components for different parts of the UI
- **Recharts**: For interactive data visualization components

### Server-Side Architecture

The backend is built with Node.js and Apollo Server, providing a GraphQL API for the client. It includes services for data processing, caching, and database interactions.

- **Apollo Server**: Handles GraphQL schema, resolvers, and queries
- **Google Spreadsheet Integration**: Uses Google Sheets as a database
- **Data Services**: Functions for database operations and business logic
- **Caching Layer**: Performance optimization for frequently accessed data
- **Schema Definition**: Type definitions for the GraphQL API

### Data Flow

1. Client makes GraphQL queries/mutations to the server
2. Server processes requests through resolvers
3. Data is fetched/updated in the database
4. Results are returned to the client
5. Apollo Client updates the UI with new data

## Component Diagram

```
+------------------------+       +------------------------+
|                        |       |                        |
|     Apollo Client      |<----->|      Apollo Server     |
|                        |       |                        |
+------------------------+       +------------------------+
           ^                               ^
           |                               |
           v                               v
+------------------------+       +------------------------+
|                        |       |                        |
|     React Frontend     |       |    Database Service    |
|                        |       |                        |
+------------------------+       +------------------------+
     |            |
     |            |
     v            v
+--------+    +--------+
|        |    |        |
|  UI    |    |  Voice |
| Comps  |    |  API   |
|        |    |        |
+--------+    +--------+

Frontend Component Structure:
+-------------------+
|       App         |
+-------------------+
        |
        v
+-------------------+
|    Navigation     |
+-------------------+
        |
        +------------------------------+
        |              |              |
        v              v              v
+-------------+ +-------------+ +-------------+
|  Dashboard  | |Transactions | |  Analytics  |
+-------------+ +-------------+ +-------------+
    |     |          |              |
    |     |          |              |
    v     v          v              v
+-----+ +------+ +--------+    +--------+
|Chart| |Recent| |Trans.  |    |Category|
|Sect.| |Trans.| |List    |    |Charts  |
+-----+ +------+ +--------+    +--------+
              |
              v
        +------------+
        |QuickModal  |
        |(Add/Edit)  |
        +------------+
              |
              v
        +------------+
        | PromptAPI  |
        | Integration|
        +------------+
```

## Sequence Diagram

```
User Interaction with Voice Input:

+------+         +----------+         +---------+         +----------+         +-------+
| User |         | Frontend |         |PromptAPI|         |GraphQL API|        |Database|
+------+         +----------+         +---------+         +----------+         +-------+
   |                  |                   |                    |                   |
   | Click Add Button |                   |                    |                   |
   |----------------->|                   |                    |                   |
   |                  | Open QuickModal   |                    |                   |
   |                  |------------------>|                    |                   |
   |                  |                   |                    |                   |
   | Speak Transaction|                   |                    |                   |
   | Details          |                   |                    |                   |
   |----------------->|                   |                    |                   |
   |                  | Speech Recognition|                    |                   |
   |                  |------------------>|                    |                   |
   |                  |                   |                    |                   |
   |                  |     Parse Speech  |                    |                   |
   |                  |<------------------|                    |                   |
   |                  |                   |                    |                   |
   |                  | Mutation Request  |                    |                   |
   |                  |----------------------------------->|   |                   |
   |                  |                   |                    | Save Transaction  |
   |                  |                   |                    |------------------>|
   |                  |                   |                    |                   |
   |                  |                   |                    | Confirm Save      |
   |                  |                   |                    |<------------------|
   |                  |   Mutation Response                    |                   |
   |                  |<-----------------------------------|   |                   |
   |                  |                   |                    |                   |
   |                  | Query Dashboard   |                    |                   |
   |                  |----------------------------------->|   |                   |
   |                  |                   |                    | Fetch Data        |
   |                  |                   |                    |------------------>|
   |                  |                   |                    |                   |
   |                  |                   |                    | Return Data       |
   |                  |                   |                    |<------------------|
   |                  |    Updated Dashboard Data              |                   |
   |                  |<-----------------------------------|   |                   |
   |                  |                   |                    |                   |
   | View Updated UI  |                   |                    |                   |
   |<-----------------|                   |                    |                   |
   |                  |                   |                    |                   |
```

## GraphQL Implementation

The application uses GraphQL for efficient data fetching and mutations. GraphQL provides a flexible and powerful API that allows the client to request exactly the data it needs.

### GraphQL Schema

The GraphQL schema defines the types and operations available in the API:

```graphql
type Query {
  "Get all Transactions for particular user"
  transactions: [Transaction!]!

  # Get dashboard data (main view)
  dashboard: DashboardData!

  # Get transactions by category
  transactionsByCategory(category: String!): [Transaction!]!

  # Search transactions
  searchTransactions(query: String!): [Transaction!]!

  # Get all categories from existing transactions
  getUserCategories: [Category!]!
}

type Mutation {
  # Add a new transaction
  addTransaction(
    amount: Float!
    description: String!
    category: String!
    type: TransactionType!
  ): Transaction!

  # Update an existing transaction
  updateTransaction(
    id: ID!
    amount: Float
    description: String
    category: String
    date: Date
    type: TransactionType
  ): Transaction!

  # Delete a transaction
  deleteTransaction(id: ID!): Boolean!
}

type Transaction {
  id: ID!
  category: String!
  amount: Float!
  type: TransactionType!
  description: String
  date: Date!
}

enum TransactionType {
  INCOME
  EXPENSE
}

type DashboardData {
  totalBalance: Float!
  monthlyIncome: Float!
  monthlyExpenses: Float!
  categorySummary: [CategorySummary!]!
  monthlyStats: [MonthlyStats!]!
  recentTransactions: [Transaction!]!
}
```

### Resolvers

The GraphQL resolvers implement the business logic for each query and mutation, handling data fetching, updates, and transformations. Key features include:

- **Caching**: Dashboard data is cached for better performance
- **Data Aggregation**: Processing transaction data into meaningful summaries
- **Transaction Management**: Adding, updating, and deleting transactions

## Google Spreadsheet Integration

The application uses Google Spreadsheets as its database, providing a lightweight and flexible storage solution that's easy to maintain and view.

### How Google Spreadsheet is Implemented

1. **Data Structure**:

   - Transactions are stored in a sheet named 'Transactions'
   - Each row represents a single transaction with columns for id, amount, category, description, date, and type
   - The spreadsheet is accessed through the Google Sheets API

2. **CRUD Operations**:

   - Reading data: `getAllTransactions()` fetches all rows from the spreadsheet
   - Creating data: `addTransaction()` adds a new row to the spreadsheet
   - Updating data: `updateTransaction()` modifies an existing row
   - Deleting data: `deleteTransaction()` removes a row from the spreadsheet

3. **Performance Optimization**:
   - The application implements a caching layer to minimize API calls to Google Sheets
   - Dashboard calculations and frequently accessed data are cached
   - Cache is invalidated when data is modified

Using Google Spreadsheet as a database provides several advantages:

- Easy to visualize and manually edit data if needed
- No complex database setup required
- Familiar interface for non-technical users
- Built-in version history and collaboration features

## PromptAPI Integration

One of the standout features of this application is the integration with PromptAPI to enable voice input for adding transactions. This allows users to speak their transaction details in natural language and have the system automatically parse and extract the relevant information.

### How PromptAPI is Implemented

1. **Initialization**:
   The application initializes the PromptAPI.

2. **Speech Recognition**:
   The application uses the browser's WebkitSpeechRecognition API to capture user speech.

3. **Natural Language Processing**:
   The captured speech is then processed using PromptAPI to extract transaction details:

```javascript
const parseTransaction = async (speechText) => {
  if (!session) {
    throw new Error("Prompt API not ready");
  }

  try {
    const response = await session.prompt(speechText);
    console.log("Prompt API response:", response);
    const validJSON = formatResponseAsJSON(response);
    const parsed = JSON.parse(validJSON.trim());

    // Validate the response structure
    if (
      typeof parsed.amount !== "number" ||
      !parsed.description ||
      !parsed.category
    ) {
      throw new Error("Invalid response format");
    }

    return parsed;
  } catch (err) {
    console.error("Error parsing transaction:", err);
    throw new Error("Failed to parse transaction");
  }
};
```

4. **Form Population**:
   The parsed details are used to automatically populate the transaction form, which the user can then review and submit.

This implementation provides a smooth and intuitive way for users to add transactions using natural language, significantly enhancing the user experience.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository

```bash
git clone https://github.com/ShivaniNR/Finance-Tracker-using-GraphQL.git
cd finance-tracker
```

2. Install server dependencies

```bash
cd server
npm install
```

3. Install client dependencies

```bash
cd ../client
npm install
```

4. Start the server

```bash
cd ../server
npm start
```

5. Start the client

```bash
cd ../client
npm run dev
```

### Environment Configuration

Create a `.env` file in the server directory with the following variables:

```
PORT=4000
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
```

## Usage

1. **Dashboard View**:

   - View your financial summary and recent transactions
   - See visualizations of your spending patterns

2. **Adding Transactions**:

   - Click the "+" button to open the Quick Add modal
   - Either manually enter transaction details or use the voice input feature
   - For voice input, click the microphone icon and speak your transaction (e.g., "I spent 25 dollars on groceries at Walmart")

3. **Managing Transactions**:

   - View all transactions in the Transactions tab
   - Edit or delete transactions as needed

4. **Analytics**:
   - Explore detailed financial analytics in the Analytics tab
   - View category spending, monthly trends, and more

---

This finance tracker provides a comprehensive solution for managing personal finances with an intuitive interface and powerful features. The combination of GraphQL for efficient data operations and PromptAPI for natural language processing creates a unique and user-friendly experience.
