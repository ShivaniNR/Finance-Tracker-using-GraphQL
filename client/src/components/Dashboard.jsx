import { useQuery, useMutation } from '@apollo/client';
import React, { useState, useEffect } from 'react';
import { GET_DASHBOARD, ADD_TRANSACTION } from '../graphql/finance-tracker';
import { Header } from './Header';
import { ChartsSection } from './ChartsSection';
import { RecentTransactions } from './recentTrasactions';
import { QuickAddModal } from './QuickModal';
import { PlusCircle, Mic, TrendingUp, TrendingDown, DollarSign, Calendar, Search, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useQuickModal } from '../hooks/useQuickModal';

export const Dashboard = ({dashboardData}) => {
    // const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // const [isVoiceMode, setIsVoiceMode] = useState(false);
    // const [editingTransaction, setEditingTransaction] = useState(null);
    const handleAddTransaction = async (transactionData) => {
        console.log('Adding transaction:', transactionData);
        try {
        await addSmartTransaction({
            variables: transactionData
        });
        } catch (err) {
            console.error('Error adding transaction:', err);
            alert('Error adding transaction. Please try again.');
        }
    };
    
    const {
    isOpen,
    openModal,
    closeModal,
    editingTransaction,
    isVoiceMode,
    setIsVoiceMode,
    onSubmitHandler,
  } = useQuickModal(handleAddTransaction);

    
    const [addSmartTransaction] = useMutation(ADD_TRANSACTION, {
        refetchQueries: [{ query: GET_DASHBOARD }]
        // onCompleted: () => {
        // // Data will be refreshed by parent component
        // window.location.reload(); // Simple refresh for now
        // }
    });

    

    if (!dashboardData) return <div>Loading dashboard...</div>;
    

    return(
        <div className="dashboard">
            <Header
                totalBalance={dashboardData.totalBalance}
                monthlyIncome={dashboardData.monthlyIncome}
                monthlyExpenses={dashboardData.monthlyExpenses}
            />

            <ChartsSection 
                categorySummary={dashboardData.categorySummary}
                monthlyStats={dashboardData.monthlyStats}
            />

            <RecentTransactions transactions={dashboardData.recentTransactions} />

            {/* Floating Action Button */}
            <button 
                className="fab"
                onClick={() => openModal()}
                title="Add Transaction"
            >
                <PlusCircle size={24} />
            </button>
            
            <QuickAddModal 
                isOpen={isOpen}
                onClose={closeModal}
                onSubmit={onSubmitHandler}
                isVoiceMode={isVoiceMode}
                setIsVoiceMode={setIsVoiceMode}
                editingTransaction={editingTransaction}
            />
        </div>
    )
}