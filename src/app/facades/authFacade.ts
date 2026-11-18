import { useAuth } from '../context/AuthContext';

export function useCurrentUser() {
  const { user, login, logout, register } = useAuth();
  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    register,
  };
}
