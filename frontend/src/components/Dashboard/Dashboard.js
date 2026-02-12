// Dashboard component – visualises AI usage frequency and breakdowns
// Solves Req 4 (frequency over time), Req 5 (breakdown by category and context),
// Req 6 (filtering by time period)
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';
import {
  getFrequencyOverTime,
  getBreakdownByTool,
  getBreakdownByTaskType,
} from '../../services/usageLogService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28AFF'];

const Dashboard = () => {
  const [frequency, setFrequency] = useState([]);
  const [byTool, setByTool] = useState([]);
  const [byTask, setByTask] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchData = async () => {
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const [freqRes, toolRes, taskRes] = await Promise.all([
        getFrequencyOverTime(params),
        getBreakdownByTool(),
        getBreakdownByTaskType(),
      ]);

      setFrequency(freqRes.data.map((d) => ({ ...d, count: Number(d.count) })));
      setByTool(toolRes.data.map((d) => ({ ...d, count: Number(d.count) })));
      setByTask(taskRes.data.map((d) => ({ ...d, count: Number(d.count) })));
    } catch {
      // handle quietly
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      {/* Solves Req 6 – time-period filter */}
      <div className="filters">
        <label>From</label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <label>To</label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button onClick={fetchData}>Apply</button>
      </div>

      {/* Solves Req 4 – AI prompt frequency over time */}
      <section>
        <h3>Prompt Frequency Over Time</h3>
        {frequency.length === 0 ? (
          <p>No data yet. Start logging your AI interactions!</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={frequency}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0088FE" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Solves Req 5 – Breakdown by AI tool category */}
      <section>
        <h3>Usage by AI Tool Category</h3>
        {byTool.length === 0 ? (
          <p>No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={byTool}
                dataKey="count"
                nameKey="ai_tool"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {byTool.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Solves Req 5 – Breakdown by task type / context */}
      <section>
        <h3>Usage by Task Type (Context)</h3>
        {byTask.length === 0 ? (
          <p>No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byTask}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="task_type" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
