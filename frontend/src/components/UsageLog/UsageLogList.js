// UsageLogList component – displays user's logged AI interactions
// Solves Req 6 (data filtering by course, task type, and time period)
// Solves Req 8 (only shows own data)
import React, { useState, useEffect, useCallback } from 'react';
import { getMyUsageLogs } from '../../services/usageLogService';

const UsageLogList = ({ refreshKey }) => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    course_code: '',
    task_type: '',
    ai_tool: '',
    from: '',
    to: '',
  });

  const fetchLogs = useCallback(async () => {
    const params = {};
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params[key] = val;
    });
    try {
      const { data } = await getMyUsageLogs(params);
      setLogs(data);
    } catch {
      // silent
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, refreshKey]);

  const handleChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <div className="usage-log-list">
      <h3>My Usage Logs</h3>
      {/* Solves Req 6 – filtering controls */}
      <div className="filters">
        <input
          name="course_code"
          placeholder="Course code"
          value={filters.course_code}
          onChange={handleChange}
        />
        <input
          name="task_type"
          placeholder="Task type"
          value={filters.task_type}
          onChange={handleChange}
        />
        <input
          name="ai_tool"
          placeholder="AI tool"
          value={filters.ai_tool}
          onChange={handleChange}
        />
        <label>From</label>
        <input
          name="from"
          type="date"
          value={filters.from}
          onChange={handleChange}
        />
        <label>To</label>
        <input
          name="to"
          type="date"
          value={filters.to}
          onChange={handleChange}
        />
        <button onClick={fetchLogs}>Apply Filters</button>
      </div>
      {logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>AI Tool</th>
              <th>Task Type</th>
              <th>Tokens</th>
              <th>Context</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.created_at).toLocaleDateString()}</td>
                <td>{l.course_code}</td>
                <td>{l.ai_tool}</td>
                <td>{l.task_type}</td>
                <td>{l.tokens ?? '—'}</td>
                <td>{l.context_text || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UsageLogList;
