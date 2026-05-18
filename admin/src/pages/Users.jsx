// frontend/src/pages/Users.jsx
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
import EmptyState from '../components/EmptyState';
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
  }, []);

  useEffect(() => {
    if (activeTab === 'trash') {
      fetchTrashedUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users, trashedUsers, activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await api.getAdminUsers(token);
      if (result.success && result.data) {
        const activeUsers = result.data.filter(user => !user.isTrashed);
        setUsers(activeUsers);
      } else {
        setUsers([]);
        setError(result.message || 'No Data Available');
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setError('Unable to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashedUsers = async () => {
    try {
      if (!api.getTrashedUsers) {
        setTrashedUsers([]);
        return;
      }
      
      const result = await api.getTrashedUsers(token);
      if (result?.success && result?.data) {
        setTrashedUsers(result.data);
      } else {
        setTrashedUsers([]);
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
    if (!api.softDeleteUser) {
      setError('Soft delete feature is not available');
      return;
    }
    
    if (window.confirm('Move this user to trash? You can restore them later.')) {
      try {
        const result = await api.softDeleteUser(userId, token);
        if (result?.success) {
          await fetchUsers();
          await fetchTrashedUsers();
        } else {
          setError(result?.message || 'Failed to move user to trash');
        }
      } catch (err) {
        console.error('Soft delete error:', err);
        setError('Error moving user to trash');
      }
    }
  };

  const handleRestore = async (userId) => {
    if (!api.restoreUser) {
      setError('Restore feature is not available');
      return;
    }
    
    if (window.confirm('Restore this user from trash?')) {
      try {
        const result = await api.restoreUser(userId, token);
        if (result?.success) {
          await fetchUsers();
          await fetchTrashedUsers();
        } else {
          setError(result?.message || 'Failed to restore user');
        }
      } catch (err) {
        console.error('Restore error:', err);
        setError('Error restoring user');
      }
    }
  };

  const handlePermanentDelete = async (userId) => {
    if (!api.permanentDeleteUser) {
      setError('Permanent delete feature is not available');
      return;
    }
    
    if (window.confirm('Permanently delete this user? This action cannot be undone.')) {
      try {
        const result = await api.permanentDeleteUser(userId, token);
        if (result.success) {
          await fetchTrashedUsers();
        } else {
          setError(result.message || 'Failed to permanently delete user');
        }
      } catch (err) {
        console.error('Permanent delete error:', err);
        setError('Error deleting user');
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
    
    if (!editUserData.name?.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!editUserData.email?.trim()) {
      setError('Email is required');
      return;
    }

    try {
      const result = await api.updateUser(selectedUser.id, editUserData, token);
      if (result.success) {
        setShowEditModal(false);
        setSelectedUser(null);
        await fetchUsers();
        await fetchTrashedUsers();
      } else {
        setError(result.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Update user error:', err);
      setError('Error updating user');
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
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch {
      return null;
    }
  };

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

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

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
              {selectedUser.name && (
                <div className="detail-row">
                  <strong>Name:</strong> {selectedUser.name}
                </div>
              )}
              {selectedUser.email && (
                <div className="detail-row">
                  <strong>Email:</strong> {selectedUser.email}
                </div>
              )}
              {selectedUser.role && (
                <div className="detail-row">
                  <strong>Role:</strong> {selectedUser.role}
                </div>
              )}
              {(selectedUser.major || selectedUser.program) && (
                <div className="detail-row">
                  <strong>Major/Program:</strong> {selectedUser.major || selectedUser.program}
                </div>
              )}
              {(selectedUser.graduationYear || selectedUser.classYear) && (
                <div className="detail-row">
                  <strong>Graduation Year:</strong> {selectedUser.graduationYear || selectedUser.classYear}
                </div>
              )}
              {selectedUser.credits !== undefined && selectedUser.credits !== null && (
                <div className="detail-row">
                  <strong>Credits:</strong> {selectedUser.credits}
                </div>
              )}
              {selectedUser.createdAt && (
                <div className="detail-row">
                  <strong>Created:</strong> {formatDate(selectedUser.createdAt)}
                </div>
              )}
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
                <label>Name <span className="required">*</span></label>
                <input type="text" name="name" value={editUserData.name} onChange={handleEditInputChange} required />
              </div>
              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input type="email" name="email" value={editUserData.email} onChange={handleEditInputChange} required />
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
        {currentListCount > 0 && (
          <div className="user-count-pill">
            <UsersIcon size={18} />
            <span>{currentListCount} {activeTab === 'all' ? 'users' : 'in trash'}</span>
          </div>
        )}
      </div>

      <div className="users-control-bar">
        <div className="users-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} 
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
              setSearchTerm('');
            }}
          >
            <UsersIcon size={16} />
            All Users
            {users.length > 0 && <span className="tab-count">{users.length}</span>}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'trash' ? 'active' : ''}`} 
            onClick={() => {
              setActiveTab('trash');
              setCurrentPage(1);
              setSearchTerm('');
              fetchTrashedUsers();
            }}
          >
            <Archive size={16} />
            Trash
            {trashedUsers.length > 0 && <span className="tab-count trash-count">{trashedUsers.length}</span>}
          </button>
        </div>

        <div className="search-bar-wrapper">
          <div className="search-bar-container">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
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

      {error ? (
        <EmptyState 
          title="Error" 
          message={error}
        />
      ) : filteredUsers.length === 0 ? (
        <EmptyState 
          title="No Users Available"
          message={searchTerm ? 'No users match your search criteria' : activeTab === 'all' ? 'No users have registered yet' : 'Trash is empty'}
          icon="👥"
        />
      ) : (
        <>
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
                    <td className="user-name-cell">
                      {user.name || 'Unknown'}
                      {user.isTrashed && <span className="trashed-badge">Trashed</span>}
                    </td>
                    <td className="user-email-cell">{user.email || 'No email'}</td>
                    <td className="user-role-cell">{user.role || 'STUDENT'}</td>
                    <td className="user-major-cell">{user.major || user.program || null}</td>
                    <td className="grad-year-cell">{user.graduationYear || user.classYear || null}</td>
                    <td className="credits-cell">{user.credits ?? null}</td>
                    <td className="date-cell">{formatDate(user.createdAt) || null}</td>
                    <td className="actions-cell">
                      <button onClick={() => handleView(user)} className="view-btn" title="View">
                        <Eye size={16} />
                      </button>
                      {!user.isTrashed && (
                        <>
                          <button onClick={() => handleEdit(user)} className="edit-btn" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleSoftDelete(user.id)} className="trash-btn" title="Move to Trash">
                            <Archive size={16} />
                          </button>
                        </>
                      )}
                      {user.isTrashed && (
                        <>
                          <button onClick={() => handleRestore(user.id)} className="restore-btn" title="Restore">
                            <RotateCcw size={16} />
                          </button>
                          <button onClick={() => handlePermanentDelete(user.id)} className="delete-permanent-btn" title="Permanently Delete">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1} 
                className="pagination-btn"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <div className="pagination-numbers">
                {getPageNumbers().map((page, idx) => (
                  page === '...' ? (
                    <span key={`dots-${idx}`} className="page-dots">...</span>
                  ) : (
                    <button 
                      key={page} 
                      onClick={() => paginate(page)} 
                      className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages} 
                className="pagination-btn"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
          
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