// UsageLogForm component – allows students to log an AI interaction
// Solves Req 4 (contributes data for frequency dashboard),
// Req 5 (captures category and context), Req 7 (data only collected after consent)
import React, { useState } from 'react';
import { createUsageLog } from '../../services/usageLogService';

const AI_TOOLS = ['LLM', 'Image Generation', 'Code Assistant'];
const TASK_TYPES = ['Debugging', 'Writing', 'Research'];

const UsageLogForm = ({ onCreated }) => {
  const [form, setForm] = useState({
    course_code: '',
    task_type: '',
    ai_tool: '',
    context_text: '',
    tokens: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...form,
        tokens: form.tokens ? Number(form.tokens) : undefined,
      };
      await createUsageLog(payload);
      setSuccess('Log created!');
      setForm({ course_code: '', task_type: '', ai_tool: '', context_text: '', tokens: '' });
      onCreated && onCreated();
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Failed to create log');
    }
  };

  return (
    <div className="usage-log-form">
      <h3>Log AI Interaction</h3>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <label>Course Code</label>
        <input
          name="course_code"
          value={form.course_code}
          onChange={handleChange}
          placeholder="e.g. TDT4242"
          required
        />

        {/* Solves Req 5 – category selection */}
        <label>AI Tool Category</label>
        <select name="ai_tool" value={form.ai_tool} onChange={handleChange} required>
          <option value="">Select…</option>
          {AI_TOOLS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Solves Req 5 – context / task type selection */}
        <label>Task Type (Context)</label>
        <select name="task_type" value={form.task_type} onChange={handleChange} required>
          <option value="">Select…</option>
          {TASK_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <label>Context / Description (optional)</label>
        <textarea
          name="context_text"
          value={form.context_text}
          onChange={handleChange}
          rows={3}
        />

        <label>Tokens Used (optional)</label>
        <input
          name="tokens"
          type="number"
          min="0"
          value={form.tokens}
          onChange={handleChange}
        />

        <button type="submit">Submit Log</button>
      </form>
    </div>
  );
};

export default UsageLogForm;
