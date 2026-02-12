// useAuth hook – convenient access to AuthContext
// Solves Req 2, Req 8
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default useAuth;
