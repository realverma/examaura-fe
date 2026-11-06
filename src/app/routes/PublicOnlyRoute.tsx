import { Navigate, Outlet } from 'react-router';
import { useUser } from '../context/UserContext';

export default function PublicOnlyRoute() {
  const { isLoggedIn, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}