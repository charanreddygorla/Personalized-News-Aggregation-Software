import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line
} from "recharts";

const COLORS = ["#1E88E5", "#00C49F", "#FFC107", "#FF6B6B", "#9C27B0"];

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [timeRange, setTimeRange] = useState("weekly");
  const [graphStatus, setGraphStatus] = useState("whole");
  const [filteredData, setFilteredData] = useState([]);
  const [usageData, setUsageData] = useState([]);

  // Generate mock data based on time range
  const generateMockData = (timeRange) => {
    const categories = ["Politics", "Technology", "Sports", "Entertainment", "Business"];
    return categories.map(category => ({
      category,
      views: Math.floor(Math.random() * (timeRange === "daily" ? 1000 : timeRange === "weekly" ? 5000 : timeRange === "monthly" ? 20000 : 100000)),
    }));
  };

  // Generate usage data based on time range
  const generateUsageData = (timeRange) => {
    const hours = timeRange === "daily" ? 24 : timeRange === "weekly" ? 7 : timeRange === "monthly" ? 30 : 365;
    return Array.from({ length: hours }, (_, i) => ({
      hour: i + 1,
      usage: Math.floor(Math.random() * 200) + 50,
    }));
  };

  // Update data when time range or graph status changes
  useEffect(() => {
    const mockData = generateMockData(timeRange);
    const usageData = generateUsageData(timeRange);

    // Adjust data for "user" status
    if (graphStatus === "user") {
      const adjustedMockData = mockData.map(item => ({
        ...item,
        views: Math.floor(item.views * 0.1), // Reduce stats to 10% for a single user
      }));
      const adjustedUsageData = usageData.map(item => ({
        ...item,
        usage: Math.floor(item.usage * 0.1), // Reduce stats to 10% for a single user
      }));
      setFilteredData(adjustedMockData);
      setUsageData(adjustedUsageData);
    } else {
      setFilteredData(mockData);
      setUsageData(usageData);
    }
  }, [timeRange, graphStatus]);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard">
        <div className="header-card">
          <h1>User Activity Dashboard</h1>
          <div className="filters">
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <select value={graphStatus} onChange={(e) => setGraphStatus(e.target.value)}>
              <option value="whole">Whole</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-row">
            <div className="chart-card">
              <h2>Most Watched Categories</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredData}>
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h2>Category Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={filteredData} dataKey="views" nameKey="category" cx="50%" cy="50%" outerRadius={100} label>
                    {filteredData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h2>Usage Timing Analysis</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <XAxis dataKey="hour" label={{ value: 'Hours', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Usage', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="usage" stroke="#e63946" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <style jsx>{`
        .dashboard-wrapper {
          width: 100vw;
          min-height: 100vh;
          background-color: #f0f2f5;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .dashboard {
          width: 100%;
          max-width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .header-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header-card h1 {
          font-size: 24px;
          font-weight: 600;
          color: #333;
        }

        .filters {
          display: flex;
          gap: 10px;
        }

        select {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 16px;
          background: white;
          border: 1px solid #ddd;
        }

        .charts-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .chart-row {
          display: flex;
          gap: 20px;
          justify-content: space-between;
        }

        .chart-card {
          flex: 1;
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 1024px) {
          .chart-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;