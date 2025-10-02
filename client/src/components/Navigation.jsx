import React from 'react';
import { Home, BarChart3, CreditCard, Settings, TrendingUp } from 'lucide-react';
import './Navigation.css';

export const Navigation = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'transactions', icon: CreditCard, label: 'Transactions' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <div className="brand-icon">💰</div>
        <span className="brand-text">FinanceTracker</span>
      </div>
      
      <div className="nav-items">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
