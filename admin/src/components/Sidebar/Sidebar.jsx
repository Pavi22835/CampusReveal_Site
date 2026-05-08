import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">CampusReveal Admin</div>
      <nav className="sidebar-nav">
        <a href="#">Dashboard</a>
        <a href="#">Universities</a>
        <a href="#">Reviews</a>
        <a href="#">Users</a>
      </nav>
    </aside>
  );
}
