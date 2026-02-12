// Auth service – handles register, login, password reset API calls
// Solves Req 1 (account creation), Req 2 (login), Req 3 (password reset)
import api from './api';

export const registerUser = (email, password) =>
  api.post('/auth/register', { email, password });

export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = (token, newPassword) =>
  api.post('/auth/reset-password', { token, newPassword });
