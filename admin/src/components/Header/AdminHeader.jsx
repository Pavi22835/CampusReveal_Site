import './AdminHeader.css';
import { useAuth } from '../../context/AuthContext';

export default function AdminHeader() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="admin-header">
      <div>
        <h1>Admin Dashboard</h1>
        {user?.email && <p className="admin-subtitle">Signed in as {user.email}</p>}
      </div>
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </header>
  );
}