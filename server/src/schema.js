//to create schema for the graphql
const gql = require('graphql-tag');

const typeDefs = gql`
    scalar Date

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
            id: ID!,
            amount: Float,
            description: String,
            category: String,
            date: Date,
            type: TransactionType
        ): Transaction!

        # Delete a transaction
        deleteTransaction(id: ID!): Boolean!
    }

    


    "A transaction for a user"
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

    type CategorySummary {
        category: String!
        total: Float!
        count: Int!
        percentage: Float!
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
        name: String!
        type: TransactionType!
        transactionCount: Int!
    }
    
`

module.exports = typeDefs;