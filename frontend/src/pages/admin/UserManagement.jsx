import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal } from 'react-bootstrap';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: 'active'
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers(filters);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await adminAPI.deleteUser(selectedUser._id);
      setUsers(users.filter(user => user._id !== selectedUser._id));
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await adminAPI.updateUser(userId, { status: newStatus });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
      toast.success('User status updated successfully');
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'success',
      inactive: 'secondary',
      suspended: 'danger'
    };
    return <Badge bg={colors[status]}>{status}</Badge>;
  };

  const getTypeBadge = (type) => {
    const colors = {
      admin: 'danger',
      teacher: 'warning',
      student: 'info'
    };
    return <Badge bg={colors[type]}>{type}</Badge>;
  };

  if (loading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  return (
    <>
      <Helmet>
        <title>User Management - Online Learning Platform</title>
      </Helmet>

      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <h1 className="display-5 fw-bold mb-2">User Management</h1>
            <p className="lead text-muted">
              Manage platform users, view profiles, and control access
            </p>
          </Col>
        </Row>

        {/* Filters */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Search Users</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Search by name or email..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>User Type</Form.Label>
                      <Form.Select
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="">All Types</option>
                        <option value="admin">Admin</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button
                      variant="outline-secondary"
                      onClick={() => setFilters({ search: '', type: '', status: '' })}
                      className="w-100"
                    >
                      <i className="fas fa-times me-2"></i>
                      Clear
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Users Table */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="fw-bold mb-0">Users ({users.length})</h4>
                  <Button variant="primary" size="sm">
                    <i className="fas fa-download me-2"></i>
                    Export
                  </Button>
                </div>

                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                <i className="fas fa-user text-primary"></i>
                              </div>
                              <div>
                                <div className="fw-bold">{user.name}</div>
                                <small className="text-muted">ID: {user._id.slice(-8)}</small>
                              </div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>{getTypeBadge(user.type)}</td>
                          <td>{getStatusBadge(user.status)}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleStatusChange(user._id, user.status === 'active' ? 'inactive' : 'active')}
                              >
                                <i className="fas fa-toggle-on"></i>
                              </Button>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleStatusChange(user._id, 'suspended')}
                              >
                                <i className="fas fa-ban"></i>
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {users.length === 0 && (
                  <div className="text-center py-5">
                    <i className="fas fa-users text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                    <h5>No users found</h5>
                    <p className="text-muted">Try adjusting your search criteria</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete user <strong>{selectedUser?.name}</strong>? 
            This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default UserManagement; 