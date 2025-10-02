const { getSheet } = require('./database');
const { getCached, setCache, clearCache } = require('./cache');

// Data access functions
async function getAllTransactions(){
    let transactions = getCached('all_transactions');

    if (!transactions) {
        const doc = await getSheet();
        const sheet = doc.sheetsByTitle['Transactions'];
        const rows = await sheet.getRows();

        transactions = rows.map(row => ({
            id: row.get('id'),
            amount: parseFloat(row.get('amount')),
            category: row.get('category'),
            description: row.get('description'),
            date: row.get('date'),
            type: row.get('type')
        })).sort((a, b) => new Date(b.date) - new Date(a.date));
            
        setCache('all_transactions', transactions);
    }
    return transactions;
}

function calculateDashboardData(transactions){
    const currentMonth = new Date().toISOString().slice(0,7); // 'YYYY-MM'
    const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));

    // Calculate totals
    const totalBalance = transactions.reduce((sum, t) => t.type === 'INCOME' ? sum + t.amount : sum - t.amount, 0);

    const monthlyIncome = currentMonthTransactions.filter(t => t.type === 'INCOME').reduce((sum, t)=> sum + t.amount, 0);

    const monthlyExpenses = currentMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t)=> sum + t.amount, 0);

    // Category summary
    const categoryTotals = {};
    const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE');

    expenseTransactions.forEach(t => {
        if (!categoryTotals[t.category]){
            categoryTotals[t.category] = { total: 0, count: 0 };
        }
        categoryTotals[t.category].total += t.amount;
        categoryTotals[t.category].count += 1;
    })

    const totalExpenses = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.total, 0);
  
    const categorySummary = Object.entries(categoryTotals).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0
    })).sort((a, b) => b.total - a.total);

    // Monthly stats (last 6 months)
    const monthlyStats = [];
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = date.toISOString().substr(0, 7);
        months.push(monthStr);
    }

    months.forEach(month => {
        const monthTransactions = transactions.filter(t => t.date.startsWith(month));
        const income = monthTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
        
        const [year, month_no] = month.split("-");

        monthlyStats.push({
        month: new Date(year, month_no-1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), //new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income,
        expenses,
        balance: income - expenses
        });
    });

    return {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        categorySummary,
        monthlyStats,
        recentTransactions: transactions.slice(0, 10)
    };
}

async function getUserCategories() {
  const transactions = await getAllTransactions();
  
  const categoryMap = new Map();
  
  transactions.forEach(transaction => {
    const { category, type } = transaction;
    const key = `${category}-${type}`;
    
    if (categoryMap.has(key)) {
      categoryMap.get(key).transactionCount++;
    } else {
      categoryMap.set(key, {
        name: category,
        type: type,
        transactionCount: 1
      });
    }
  });
  
  // Convert to array and sort by transaction count (most used first)
  return Array.from(categoryMap.values())
    .sort((a, b) => b.transactionCount - a.transactionCount);
}

async function addTransaction(transactionData) {
    const doc = await getSheet();
    const sheet = doc.sheetsByTitle['Transactions'];
    const id = Date.now().toString();
    const transaction = {
        id,
        amount: transactionData.amount,
        category: transactionData.category,
        description: transactionData.description,
        date: new Date().toISOString().split('T')[0], // 'YYYY-MM-DD'
        type: transactionData.type
    };

    await sheet.addRow({
        id: transaction.id,
        amount: parseFloat(transaction.amount),
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
        type: transaction.type
    });
    
    // Clear cache
    clearCache('all_transactions');
    clearCache('dashboard_data');
    
    return transaction;
}

async function updateTransaction(id, updatedData) {
    const doc = await getSheet();
    const sheet = doc.sheetsByTitle['Transactions'];
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);

    if (!row) {
        throw new Error('Transaction not found');
    }

    if (row) {
        if (updatedData.amount !== undefined) row.set('amount', updatedData.amount.toString());
        if (updatedData.description !== undefined) row.set('description', updatedData.description);
        if (updatedData.category !== undefined) row.set('category', updatedData.category);
        if (updatedData.type !== undefined) row.set('type', updatedData.type);
        if (updatedData.date !== undefined) row.set('date', updatedData.date);

        await row.save();

        // Clear cache
        clearCache('all_transactions');
        clearCache('dashboard_data');

        // Return the updated transaction
        return {
            id,
            amount: parseFloat(row.get('amount')),
            category: row.get('category'),
            description: row.get('description'),
            date: row.get('date'),
            type: row.get('type')
        };
    }
}

async function deleteTransaction(id) {
    const doc = await getSheet();
    const sheet = doc.sheetsByTitle['Transactions'];
    const rows = await sheet.getRows();
    const rowIndex = rows.findIndex(r => r.get('id') === id);
    if (rowIndex === -1) {
        return false; // Not found
    }
    
    await rows[rowIndex].delete();
    clearCache('all_transactions');
    clearCache('dashboard_data');
    return true;


}

module.exports = {
    getAllTransactions,
    calculateDashboardData,
    getUserCategories,
    addTransaction,
    updateTransaction,
    deleteTransaction
};