import { ResponsiveContainer, LineChart, CartesianGrid, Line, XAxis, YAxis, PieChart, Tooltip, Pie, Cell  } from "recharts";
// Color palette for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];


export const ChartsSection = ({ categorySummary, monthlyStats }) => (
  
  <div className="charts-section">
    <div className="chart-container">
      <h3>Monthly Trends</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={monthlyStats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
          <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} />
          <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    
    <div className="chart-container">
      <h3>Expense Categories</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={categorySummary}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="total"
            label={({category, percentage}) => `${category}: ${percentage.toFixed(1)}%`}
          >
            {categorySummary.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);