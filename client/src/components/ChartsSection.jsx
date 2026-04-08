import { 
  ResponsiveContainer, 
  LineChart, 
  CartesianGrid, 
  Line, 
  XAxis, 
  YAxis, 
  PieChart, 
  Tooltip, 
  Pie, 
  Cell,
  Legend 
} from "recharts";
import PropTypes from 'prop-types';
import { memo } from 'react';

// Color palette for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

// Common formatter for currency values
const currencyFormatter = (value) => `$${value.toLocaleString()}`;

/**
 * Monthly Trends Line Chart Component
 * Displays income and expenses over time
 */
const MonthlyTrendsChart = memo(({ data }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty-state">No monthly data available</div>;
  }

  return (
    <div className="chart-container">
      <h3>Monthly Trends</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }} 
            axisLine={{ stroke: '#e5e7eb' }} 
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={value => `$${value}`} 
          />
          <Tooltip formatter={currencyFormatter} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="income" 
            name="Income"
            stroke="#10B981" 
            strokeWidth={2}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
          <Line 
            type="monotone" 
            dataKey="expenses" 
            name="Expenses"
            stroke="#EF4444" 
            strokeWidth={2}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

MonthlyTrendsChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      income: PropTypes.number.isRequired,
      expenses: PropTypes.number.isRequired
    })
  ).isRequired
};

MonthlyTrendsChart.displayName = 'MonthlyTrendsChart';

/**
 * Expense Categories Pie Chart Component
 * Visualizes expense distribution by category
 */
const ExpenseCategoriesChart = memo(({ data }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty-state">No category data available</div>;
  }

  return (
    <div className="chart-container">
      <h3>Expense Categories</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            fill="#8884d8"
            dataKey="total"
            labelLine={true}
            label={({category, percentage}) => `${category}: ${percentage.toFixed(1)}%`}
            animationDuration={800}
            animationBegin={0}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={currencyFormatter} 
            contentStyle={{ borderRadius: '6px' }}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            formatter={(value, entry, index) => data[index]?.category || value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

ExpenseCategoriesChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired,
      percentage: PropTypes.number.isRequired
    })
  ).isRequired
};

ExpenseCategoriesChart.displayName = 'ExpenseCategoriesChart';

/**
 * Main ChartsSection component
 * Renders all financial charts
 */
export const ChartsSection = memo(({ categorySummary, monthlyStats }) => {
  return (
    <div className="charts-section" role="region" aria-label="Financial Charts">
      <MonthlyTrendsChart data={monthlyStats} />
      <ExpenseCategoriesChart data={categorySummary} />
    </div>
  );
});

ChartsSection.propTypes = {
  categorySummary: PropTypes.array.isRequired,
  monthlyStats: PropTypes.array.isRequired
};

ChartsSection.displayName = 'ChartsSection';
