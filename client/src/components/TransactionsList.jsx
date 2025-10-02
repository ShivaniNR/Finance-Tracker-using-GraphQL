import React, { useState } from 'react';
import { Search, Filter, Calendar, ArrowUpDown, Edit3, Trash2 } from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_DASHBOARD, DELETE_TRANSACTION, UPDATE_TRANSACTION } from '../graphql/finance-tracker';
import './TransactionsList.css';
import { useQuickModal } from '../hooks/useQuickModal';
import { QuickAddModal } from './QuickModal';

export const TransactionsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Handle transaction update
  const [updateTransaction] = useMutation(UPDATE_TRANSACTION, {
          refetchQueries: [{ query: GET_DASHBOARD }]
      });

  const handleUpdateTransaction = async (transactionData) => {
    try {
      await updateTransaction({
        variables: transactionData
      });
      console.log('Transaction updated successfully');
    } catch (err) {
      console.error('Error updating transaction:', err);
      alert('Error updating transaction. Please try again.');
    }
  };

  // Modal state
  const {
      isOpen,
      openModal,
      closeModal,
      editingTransaction,
      isVoiceMode,
      setIsVoiceMode,
      onSubmitHandler,
    } = useQuickModal(handleUpdateTransaction);

  // Add mutation for updating transactions
  // const [updateTransaction] = useMutation(UPDATE_TRANSACTION, {
  //   refetchQueries: [{ query: GET_DASHBOARD }]
  // });

  const { loading, error, data, refetch } = useQuery(GET_DASHBOARD);
//   const [deleteTransaction] = useMutation(DELETE_TRANSACTION, {
//     onCompleted: () => refetch()
//   });

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">Error loading transactions</div>;

  const transactions = data?.dashboard?.recentTransactions || [];
  
  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const categories = [...new Set(transactions.map(t => t.category))];

  const [deleteTransaction] = useMutation(DELETE_TRANSACTION, {
          refetchQueries: [{ query: GET_DASHBOARD }]
      });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction({ variables: { id } });
      } catch (err) {
        alert('Error deleting transaction');
      }
    }
  };

  

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>All Transactions</h1>
        <p>Manage and view all your financial transactions</p>
      </div>

      {/* Filters and Search */}
      <div className="transactions-controls">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="sort-group">
            <ArrowUpDown size={16} />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Grid */}
      <div className="transactions-grid">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions found</p>
            <button className="add-first-btn">Add Your First Transaction</button>
          </div>
        ) : (
          filteredTransactions.map(transaction => (
            <div key={transaction.id} className="transaction-card">
              <div className="transaction-main">
                <div className="transaction-info">
                  <h3>{transaction.description}</h3>
                  <div className="transaction-meta">
                    <span className="category-tag">{transaction.category}</span>
                    <span className="date">{new Date(transaction.date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="transaction-amount-section">
                  <div className={`amount ${transaction.type.toLowerCase()}`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </div>
                  <div className="transaction-actions">
                    <button className="edit-btn" title="Edit"
                      onClick={() =>openModal(transaction)}>
                      <Edit3 size={16} />
                    </button>
                    <button 
                      className="delete-btn" 
                      title="Delete"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="transactions-summary">
        <div className="summary-item">
          <span className="label">Total Transactions</span>
          <span className="value">{filteredTransactions.length}</span>
        </div>
        <div className="summary-item">
          <span className="label">Total Income</span>
          <span className="value income">
            +${filteredTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
          </span>
        </div>
        <div className="summary-item">
          <span className="label">Total Expenses</span>
          <span className="value expense">
            -${filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
          </span>
        </div>
      </div>

      <QuickAddModal 
          isOpen={isOpen}
          onClose={closeModal}
          onSubmit={onSubmitHandler}
          isVoiceMode={isVoiceMode}
          setIsVoiceMode={setIsVoiceMode}
          editingTransaction={editingTransaction}
      />
    </div>
  );
};