import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
export const Header = ({ totalBalance, monthlyIncome, monthlyExpenses }) => (
  <div className="header">
    <div className="welcome-section">
      <h1>Track, Save, and Grow Your Wealth</h1>
      {/* <p>Here's your financial overview</p> */}
    </div>
    
    <div className="balance-cards">
      <div className="balance-card main-balance">
        <div className="card-icon">
          <DollarSign size={24} />
        </div>
        <div className="card-content">
          <h3>Total Balance</h3>
          <div className={`balance-amount ${totalBalance >= 0 ? 'positive' : 'negative'}`}>
            ${Math.abs(totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
      
      <div className="balance-card income-card">
        <div className="card-icon income">
          <TrendingUp size={20} />
        </div>
        <div className="card-content">
          <h4>This Month Income</h4>
          <div className="amount">+${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>
      
      <div className="balance-card expense-card">
        <div className="card-icon expense">
          <TrendingDown size={20} />
        </div>
        <div className="card-content">
          <h4>This Month Expenses</h4>
          <div className="amount">-${monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>
    </div>
  </div>
);