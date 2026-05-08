import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Users as UsersIcon, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Archive,
  RotateCcw,
  Mail,
  Calendar,
  Award
} from 'lucide-react';
import './Users.css';

const Users = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [trashedUsers, setTrashedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserData, setEditUserData] = useState({ name: '', email: '', role: '' });

  useEffect(() => {
    fetchUsers();
    fetchTrashedUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users, trashedUsers, activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await api.getAdminUsers(token);
      if (result.success) {
        const activeUsers = (result.data || []).filter(user => !user.isTrashed);
        setUsers(activeUsers);
      } else {
        setError(result.message || 'Failed to load users');
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setError('Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashedUsers = async () => {
    try {
      const result = await api.getTrashedUsers?.(token);
      if (result?.success) {
        setTrashedUsers(result.data || []);
      } else {
        const allResult = await api.getAdminUsers(token);
        if (allResult.success) {
          const trashed = (allResult.data || []).filter(user => user.isTrashed);
          setTrashedUsers(trashed);
        }
      }
    } catch (error) {
      console.error('Error fetching trashed users:', error);
      setTrashedUsers([]);
    }
  };

  const filterUsers = () => {
    const currentList = activeTab === 'all' ? users : trashedUsers;
    let filtered = [...currentList];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditUserData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || ''
    });
    setShowEditModal(true);
  };

  const handleSoftDelete = async (userId) => {
    if (window.confirm('Move this user to trash? You can restore them later.')) {
      try {
        const result = await api.softDeleteUser?.(userId, token);
        if (result?.success) {
          fetchUsers();
          fetchTrashedUsers();
          alert('User moved to trash successfully');
        } else {
          const movedUser = users.find(user => user.id === userId);
          if (movedUser) {
            setUsers(prev => prev.filter(user => user.id !== userId));
            setTrashedUsers(prev => [{ ...movedUser, isTrashed: true }, ...prev]);
          }
        }
      } catch (err) {
        console.error('Soft delete error:', err);
        alert('Error moving user to trash');
      }
    }
  };

  const handleRestore = async (userId) => {
    if (window.confirm('Restore this user from trash?')) {
      try {
        const result = await api.restoreUser?.(userId, token);
        if (result?.success) {
          fetchUsers();
          fetchTrashedUsers();
          alert('User restored successfully');
        } else {
          const restoredUser = trashedUsers.find(user => user.id === userId);
          if (restoredUser) {
            setTrashedUsers(prev => prev.filter(user => user.id !== userId));
            setUsers(prev => [{ ...restoredUser, isTrashed: false }, ...prev]);
          }
        }
      } catch (err) {
        console.error('Restore error:', err);
        alert('Error restoring user');
      }
    }
  };

  const handlePermanentDelete = async (userId) => {
    if (window.confirm('Permanently delete this user? This action cannot be undone.')) {
      try {
        const result = await api.permanentDeleteUser(userId, token);
        if (result.success) {
          fetchTrashedUsers();
          alert('User permanently deleted');
        } else {
          alert('Failed to permanently delete user');
        }
      } catch (err) {
        console.error('Permanent delete error:', err);
        alert('Error deleting user');
      }
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const result = await api.updateUser(selectedUser.id, editUserData, token);
      if (result.success) {
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
        fetchTrashedUsers();
        alert('User updated successfully');
      } else {
        alert(result.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Update user error:', err);
      alert('Error updating user');
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const currentListCount = activeTab === 'all' ? users.length : trashedUsers.length;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // Mobile User Card Component
  const UserCard = ({ user }) => (
    <div className={`user-card ${user.isTrashed ? 'trashed-card' : ''}`}>
      <div className="card-header">
        <div className="card-title">
          <div className="user-avatar">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3>{user.name || 'N/A'}</h3>
            <span className={`role-badge ${user.role?.toLowerCase() === 'admin' ? 'admin' : 'user'}`}>
              {user.role || 'STUDENT'}
            </span>
          </div>
        </div>
        {user.isTrashed && <span className="trashed-badge">Trashed</span>}
      </div>
      
      <div className="card-details">
        <div className="detail-item">
          <Mail size={14} />
          <span>{user.email || 'N/A'}</span>
        </div>
        <div className="detail-item">
          <Award size={14} />
          <span>{user.major || user.program || 'N/A'}</span>
        </div>
        <div className="detail-item">
          <Calendar size={14} />
          <span>Grad: {user.graduationYear || user.classYear || 'N/A'}</span>
        </div>
        <div className="detail-item credits">
          <span className="credits-value">{user.credits ?? 0}</span>
          <span>Credits</span>
        </div>
      </div>
      
      <div className="card-actions">
        <button onClick={() => handleView(user)} className="action-btn view-btn" title="View">
          <Eye size={16} />
        </button>
        {!user.isTrashed && (
          <>
            <button onClick={() => handleEdit(user)} className="action-btn edit-btn" title="Edit">
              <Edit size={16} />
            </button>
            <button onClick={() => handleSoftDelete(user.id)} className="action-btn trash-btn" title="Move to Trash">
              <Archive size={16} />
            </button>
          </>
        )}
        {user.isTrashed && (
          <>
            <button onClick={() => handleRestore(user.id)} className="action-btn restore-btn" title="Restore">
              <RotateCcw size={16} />
            </button>
            <button onClick={() => handlePermanentDelete(user.id)} className="action-btn delete-permanent-btn" title="Permanently Delete">
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="users-page">
      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row"><strong>Name:</strong> {selectedUser.name || 'N/A'}</div>
              <div className="detail-row"><strong>Email:</strong> {selectedUser.email || 'N/A'}</div>
              <div className="detail-row"><strong>Role:</strong> {selectedUser.role || 'N/A'}</div>
              <div className="detail-row"><strong>Major:</strong> {selectedUser.major || selectedUser.program || 'N/A'}</div>
              <div className="detail-row"><strong>Graduation Year:</strong> {selectedUser.graduationYear || selectedUser.classYear || 'N/A'}</div>
              <div className="detail-row"><strong>Credits:</strong> {selectedUser.credits ?? 0}</div>
              <div className="detail-row"><strong>Created:</strong> {formatDate(selectedUser.createdAt)}</div>
            </div>
            <div className="modal-footer">
              <button className="modal-close-btn" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={editUserData.name} onChange={handleEditInputChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={editUserData.email} onChange={handleEditInputChange} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={editUserData.role} onChange={handleEditInputChange}>
                  <option value="STUDENT">STUDENT</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-save-btn" onClick={handleUpdateUser}>Save Changes</button>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>Manage platform users and their roles</p>
        </div>
        <div className="user-count-pill">
          <UsersIcon size={18} />
          <span>{currentListCount} {activeTab === 'all' ? 'users' : 'in trash'}</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="users-control-bar">
        <div className="users-tabs">
          <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            <UsersIcon size={16} />
            All Users
            <span className="tab-count">{users.length}</span>
          </button>
          <button className={`tab-btn ${activeTab === 'trash' ? 'active' : ''}`} onClick={() => setActiveTab('trash')}>
            <Archive size={16} />
            Trash
            <span className="tab-count trash-count">{trashedUsers.length}</span>
          </button>
        </div>

        <div className="search-bar-wrapper">
          <div className="search-bar-container">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button onClick={clearSearch} className="clear-search-btn">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchUsers}>Try Again</button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No users found</h3>
          <p>{searchTerm ? 'Try adjusting your search' : activeTab === 'all' ? 'Users will appear here' : 'Trash is empty'}</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="users-cards-view">
            {currentUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Major</th>
                  <th>Grad Year</th>
                  <th>Credits</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id} className={user.isTrashed ? 'trashed-row' : ''}>
                    <td className="user-name-cell">{user.name || 'N/A'}{user.isTrashed && <span className="trashed-badge">Trashed</span>}</td>
                    <td className="user-email-cell">{user.email || 'N/A'}</td>
                    <td className="user-role-cell">{user.role || 'STUDENT'}</td>
                    <td className="user-major-cell">{user.major || user.program || 'N/A'}</td>
                    <td className="grad-year-cell">{user.graduationYear || user.classYear || 'N/A'}</td>
                    <td className="credits-cell">{user.credits ?? 0}</td>
                    <td className="date-cell">{formatDate(user.createdAt)}</td>
                    <td className="actions-cell">
                      <button onClick={() => handleView(user)} className="view-btn"><Eye size={16} /></button>
                      {!user.isTrashed && (
                        <>
                          <button onClick={() => handleEdit(user)} className="edit-btn"><Edit size={16} /></button>
                          <button onClick={() => handleSoftDelete(user.id)} className="trash-btn"><Archive size={16} /></button>
                        </>
                      )}
                      {user.isTrashed && (
                        <>
                          <button onClick={() => handleRestore(user.id)} className="restore-btn"><RotateCcw size={16} /></button>
                          <button onClick={() => handlePermanentDelete(user.id)} className="delete-permanent-btn"><Trash2 size={16} /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
                <ChevronLeft size={16} /> Previous
              </button>
              <div className="pagination-numbers">
                {getPageNumbers().map((page, idx) => (
                  page === '...' ? (
                    <span key={`dots-${idx}`} className="page-dots">...</span>
                  ) : (
                    <button key={page} onClick={() => paginate(page)} className={`pagination-number ${currentPage === page ? 'active' : ''}`}>{page}</button>
                  )
                ))}
              </div>
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
          
          {/* Results Info */}
          {filteredUsers.length > 0 && (
            <div className="results-info">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Users;