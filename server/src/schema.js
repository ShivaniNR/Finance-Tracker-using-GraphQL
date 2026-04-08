const gql = require('graphql-tag');

const typeDefs = gql`
  scalar Date

  type Query {
    "Get all transactions for the authenticated user"
    transactions(limit: Int, offset: Int): [Transaction!]!

    "Get dashboard data (summary, charts, recent transactions)"
    dashboard: DashboardData!

    "Get transactions filtered by category name"
    transactionsByCategory(category: String!): [Transaction!]!

    "Search transactions by description"
    searchTransactions(query: String!): [Transaction!]!

    "Get all categories for the authenticated user"
    getUserCategories: [Category!]!
  }

  type Mutation {
    "Add a new transaction"
    addTransaction(
      amount: Float!
      description: String!
      category: String!
      type: TransactionType!
      date: Date
    ): Transaction!

    "Update an existing transaction"
    updateTransaction(
      id: ID!
      amount: Float
      description: String
      category: String
      date: Date
      type: TransactionType
    ): Transaction!

    "Delete a transaction"
    deleteTransaction(id: ID!): Boolean!
  }

  "A financial transaction"
  type Transaction {
    id: ID!
    category: String!
    amount: Float!
    type: TransactionType!
    description: String
    date: Date!
    categoryIcon: String
    categoryColor: String
  }

  enum TransactionType {
    INCOME
    EXPENSE
  }

  type CategorySummary {
    category: String!
    total: Float!
    count: Int!
    percentage: Float!
    icon: String
    color: String
  }

  type MonthlyStats {
    month: String!
    income: Float!
    expenses: Float!
    balance: Float!
  }

  type DashboardData {
    totalBalance: Float!
    monthlyIncome: Float!
    monthlyExpenses: Float!
    categorySummary: [CategorySummary!]!
    monthlyStats: [MonthlyStats!]!
    recentTransactions: [Transaction!]!
  }

  type Category {
    id: ID!
    name: String!
    type: String!
    icon: String
    color: String
    isSystem: Boolean!
    transactionCount: Int!
  }
`;

module.exports = typeDefs;
