import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, PieChart as PieChartIcon } from 'lucide-react';
import './Analytics.css';

export const Analytics = ({ dashboardData }) => {
  const [timeRange, setTimeRange] = useState('6months');
  const [viewType, setViewType] = useState('overview');

  if (!dashboardData) return <div>Loading analytics...</div>;

  const { categorySummary, monthlyStats } = dashboardData;

  // Calculate trends
  const latestMonth = monthlyStats[monthlyStats.length - 1];
  const previousMonth = monthlyStats[monthlyStats.length - 2];
  const incomeChange = previousMonth ? 
    ((latestMonth.income - previousMonth.income) / previousMonth.income * 100).toFixed(1) : 0;
  const expenseChange = previousMonth ? 
    ((latestMonth.expenses - previousMonth.expenses) / previousMonth.expenses * 100).toFixed(1) : 0;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics & Insights</h1>
        <p>Detailed analysis of your spending patterns</p>
      </div>

      {/* Time Range Selector */}
      <div className="analytics-controls">
        <div className="time-range-selector">
          <Calendar size={16} />
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>

        <div className="view-type-selector">
          <button 
            className={viewType === 'overview' ? 'active' : ''}
            onClick={() => setViewType('overview')}
          >
            Overview
          </button>
          <button 
            className={viewType === 'categories' ? 'active' : ''}
            onClick={() => setViewType('categories')}
          >
            Categories
          </button>
          <button 
            className={viewType === 'trends' ? 'active' : ''}
            onClick={() => setViewType('trends')}
          >
            Trends
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="analytics-metrics">
        <div className="metric-card">
          <div className="metric-icon income">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3>Income Trend</h3>
            <div className="metric-value">
              <span className={incomeChange >= 0 ? 'positive' : 'negative'}>
                {incomeChange >= 0 ? '+' : ''}{incomeChange}%
              </span>
              <span className="metric-label">vs last month</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon expense">
            <TrendingDown size={24} />
          </div>
          <div className="metric-content">
            <h3>Expense Trend</h3>
            <div className="metric-value">
              <span className={expenseChange <= 0 ? 'positive' : 'negative'}>
                {expenseChange >= 0 ? '+' : ''}{expenseChange}%
              </span>
              <span className="metric-label">vs last month</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <PieChartIcon size={24} />
          </div>
          <div className="metric-content">
            <h3>Top Category</h3>
            <div className="metric-value">
              <span>{categorySummary[0]?.category || 'N/A'}</span>
              <span className="metric-label">${categorySummary[0]?.total.toLocaleString() || '0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="analytics-charts">
        {viewType === 'overview' && (
          <div className="chart-container large">
            <h3>Income vs Expenses Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {viewType === 'categories' && (
          <div className="chart-container large">
            <h3>Spending by Category</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categorySummary.slice(0, 8)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={100} />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Bar dataKey="total" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="insights-section">
        <h3>Smart Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>💡 Spending Pattern</h4>
            <p>You spend most on {categorySummary[0]?.category || 'various categories'}, averaging ${((categorySummary[0]?.total || 0) / (categorySummary[0]?.count || 1)).toFixed(2)} per transaction.</p>
          </div>
          
          <div className="insight-card">
            <h4>📈 Monthly Trend</h4>
            <p>Your {incomeChange >= 0 ? 'income increased' : 'income decreased'} by {Math.abs(incomeChange)}% compared to last month. Keep up the good work!</p>
          </div>
          
          <div className="insight-card">
            <h4>🎯 Saving Opportunity</h4>
            <p>By reducing spending in your top 3 categories by just 10%, you could save ${(categorySummary.slice(0, 3).reduce((sum, cat) => sum + cat.total, 0) * 0.1).toFixed(2)} monthly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};