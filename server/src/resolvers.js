const { getAllTransactions, addTransaction, updateTransaction, deleteTransaction, calculateDashboardData, getUserCategories } = require('../services/transactions');
const { getCached, setCache } = require('../services/cache');


const resolvers = {
  Query: {
    transactions: async () => {
      return await getAllTransactions();
    },

    dashboard: async () => {
      let dashboardData = getCached('dashboard_data');
      if (!dashboardData) {
        const transactions = await getAllTransactions();
        dashboardData = calculateDashboardData(transactions);
        setCache('dashboard_data', dashboardData);
      }
      return dashboardData;
    },

    transactionsByCategory: async (_, { category }) => {
      const transactions = await getAllTransactions();
      return transactions.filter(t => t.category === category);
    },

    getUserCategories: async () => {
      return await getUserCategories();
    }
    // getCategorySpending: async (_, { userID, startDate, endDate  }, { pool }) => {
    //   //const query = `SELECT category_id, SUM(amount) as total FROM transactions WHERE user_id = $1 GROUP BY category_id`;
    //   const query = `select sum(t.amount) as total, c.name as category_name from transactions t join categories c on t.category_id = c.id where t.user_id = $1 and t.type = 'expense' and t.date between $2 and $3 group by c.name`
    //   try {
    //     const { rows } = await pool.query(query, [userID, startDate, endDate ]);
    //     return rows;
    //   } catch (err) {
    //     console.error('DB query error:', err);
    //     throw new Error('Failed to fetch transactions');
    //   }
    // },

    // getCategoryIncome: async (_, { userID, startDate, endDate  }, { pool }) => {
    //   //const query = `SELECT category_id, SUM(amount) as total FROM transactions WHERE user_id = $1 GROUP BY category_id`;
    //   const query = `select sum(t.amount) as total, c.name as category_name from transactions t join categories c on t.category_id = c.id where t.user_id = $1 and t.type = 'income' and t.date between $2 and $3 group by c.name`
    //   try {
    //     const { rows } = await pool.query(query, [userID, startDate, endDate ]);
    //     return rows;
    //   } catch (err) {
    //     console.error('DB query error:', err);
    //     throw new Error('Failed to fetch transactions');
    //   }
    // },

    // getTotalAmountAcrossTypes: async (_, {userID, startDate, endDate}, {pool}) => {
    //   const query = `select type, sum(amount) as total from transactions where user_id = $1 and date between $2 and $3 group by type`;
    //   try {
    //     const { rows } = await pool.query(query, [userID, startDate, endDate]);
    //     return rows;
    //   } catch (err) {
    //     console.error('DB query error:', err);
    //     throw new Error('Failed to fetch transactions');
    //   }
    // },

    // getMonthsDataAcrossTypes: async (_, { userID, startDate, endDate }, { pool }) => {
    //   const query = `select extract('MONTH' from date) as month, type, sum(amount) as total from transactions where user_id = $1 and date between $2 and $3 group by month, type`;
    //   try {
    //     const { rows } = await pool.query(query, [userID, startDate, endDate]);
    //     return rows;
    //   } catch (err) {
    //     console.error('DB query error:', err);
    //     throw new Error('Failed to fetch transactions');
    //   }
    // },

    // getCategorySpendingComparison: async (_, { userID, startDate, endDate  }, { pool }) => {
    //   const query = `select extract('MONTH' from t.date) as month, c.name as category_name, sum(t.amount) as total from transactions as t join categories as c on t.category_id = c.id  where t.user_id = $1 and t.type = 'expense' and t.date between $2 and $3 group by c.name, month`;
    //   try {
    //     const { rows } = await pool.query(query, [userID, startDate, endDate ]);
    //     return rows;
    //   } catch (err) {
    //     console.error('DB query error:', err);
    //     throw new Error('Failed to fetch transactions');
    //   }
    // },
  },

  Mutation: {
    addTransaction: async(_, transactionData) =>{
      const transaction = await addTransaction(transactionData);

      const transactions = await getAllTransactions();
      const dashboardData = calculateDashboardData(transactions);

      return transaction;
    },

    updateTransaction: async(_, { id, amount, description, category, date, type }) => {
      const transaction = await updateTransaction(id, { amount, description, category, date, type });
      
      const transactions = await getAllTransactions();
      const dashboardData = calculateDashboardData(transactions);

      return transaction;
    },
    deleteTransaction: async(_, { id }) => {
      const success = await deleteTransaction(id);
      if (!success) {
        throw new Error('Failed to delete transaction');
      }
      const transactions = await getAllTransactions();
      const dashboardData = calculateDashboardData(transactions);
      return success;
    }
  }
};

module.exports = resolvers;