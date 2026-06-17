import { Navigate, Outlet } from 'react-router';

export default function AdminGuard() {
  const isAuthed = sessionStorage.getItem('cb_admin') === '1';
  if (!isAuthed) return <Navigate to="/admin" replace />;
  return <Outlet />;
}
