import { useAppSelector } from '@/lib/hooks';

export const useAuth = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const error = useAppSelector((state) => state.auth.error);

  return {
    user,
    isAuthenticated,
    isLoading,
    error
  };
};