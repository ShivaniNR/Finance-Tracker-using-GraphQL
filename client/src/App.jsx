import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import 'primereact/resources/themes/saga-blue/theme.css'; // or other theme
import 'primereact/resources/primereact.min.css'; 
import 'primeicons/primeicons.css'; 
import { Dashboard } from './components/Dashboard';
import { GET_DASHBOARD } from './graphql/finance-tracker';
import { TransactionsList } from './components/TransactionsList';
import { Analytics } from './components/Analytics';
import {Navigation} from './components/Navigation';
import { useQuery } from '@apollo/client';

// Main Content Component that handles data fetching
// Update your MainContent component to wrap in main-content div
const MainContent = ({ renderContent }) => {
  const { loading, error, data, refetch } = useQuery(GET_DASHBOARD, { 
    pollInterval: 30000 
  });

  if (loading) return (
    <div className="main-content">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your financial data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="main-content">
      <div className="error-container">
        <p>Error loading data: {error.message}</p>
        <button onClick={() => refetch()} className="retry-btn">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="main-content">
      {renderContent(data?.dashboard)}
    </div>
  );
};


// Main App Component with Navigation
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = (dashboardData) => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard dashboardData={dashboardData} />;
      case 'transactions':
        return <TransactionsList />;
      case 'analytics':
        return <Analytics dashboardData={dashboardData} />;
      default:
        return <Dashboard dashboardData={dashboardData} />;
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <MainContent renderContent={renderContent} />
      </div>
    </div>
  );
};

export default App;