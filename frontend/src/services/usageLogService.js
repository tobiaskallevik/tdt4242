// UsageLog service – CRUD and analytics API calls
// Solves Req 4 (frequency), Req 5 (breakdown), Req 6 (filtering)
import api from './api';

export const createUsageLog = (data) => api.post('/usage-logs', data);

export const getMyUsageLogs = (params) => api.get('/usage-logs', { params });

export const getFrequencyOverTime = (params) =>
  api.get('/usage-logs/analytics/frequency', { params });

export const getBreakdownByTool = (params) =>
  api.get('/usage-logs/analytics/by-tool', { params });

export const getBreakdownByTaskType = (params) =>
  api.get('/usage-logs/analytics/by-task', { params });
