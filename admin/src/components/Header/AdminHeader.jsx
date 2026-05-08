import './AdminHeader.css';
import { useAuth } from '../../context/AuthContext';

export default function AdminHeader() {
  const { user, setUser } = useAuth();

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <header className="admin-header">
      <div>
        <h1>Admin Dashboard</h1>
        {user && <p className="admin-subtitle">Signed in as {user.email}</p>}
      </div>
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </header>
  );
}
