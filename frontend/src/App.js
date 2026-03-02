import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { FiHome, FiUsers, FiBriefcase, FiCheckSquare, FiUserPlus, FiLogOut, FiPlus, FiEdit, FiTrash2, FiEye, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';

// API Configuration
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await API.get('/auth/me');
        setUser(response.data.data);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    const { token, ...userData } = response.data.data;
    localStorage.setItem('token', token);
    setUser(userData);
    toast.success('Login successful!');
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

// Sidebar Component
const Sidebar = ({ currentView, setCurrentView }) => {
  const { user, logout, isAdmin } = useAuth();

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome /> },
    { id: 'clients', label: 'Clients', icon: <FiUsers /> },
    { id: 'employees', label: 'Employees', icon: <FiUserPlus /> },
    { id: 'projects', label: 'Projects', icon: <FiBriefcase /> },
    { id: 'tasks', label: 'Tasks', icon: <FiCheckSquare /> },
  ];

  const employeeMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome /> },
    { id: 'tasks', label: 'My Tasks', icon: <FiCheckSquare /> },
  ];

  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;

  return (
    <div style={{
      width: '280px',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      color: 'white',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
    }}>
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.75rem',
          fontWeight: 900,
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #bbe1fa 0%, #3282b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>ClientFlow</h2>
        <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Management System</p>
      </div>

      <div style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            style={{
              padding: '1rem 1.25rem',
              margin: '0.5rem 0',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.2s',
              background: currentView === item.id ? 'rgba(50, 130, 184, 0.2)' : 'transparent',
              borderLeft: currentView === item.id ? '4px solid #3282b8' : '4px solid transparent',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(50, 130, 184, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = currentView === item.id ? 'rgba(50, 130, 184, 0.2)' : 'transparent'}
          >
            <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
            <span style={{ fontWeight: 600 }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{
        padding: '1.5rem',
        borderTop: '2px solid rgba(255,255,255,0.1)',
        marginTop: '2rem',
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.25rem' }}>Logged in as</p>
          <p style={{ fontWeight: 700 }}>{user?.name}</p>
          <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>{user?.role}</p>
        </div>
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'rgba(220, 53, 69, 0.2)',
            border: '2px solid #dc3545',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#dc3545'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(220, 53, 69, 0.2)'}
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
};

// Login Component
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '450px',
        width: '90%',
      }}>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '2.5rem',
          marginBottom: '0.5rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>ClientFlow</h1>
        <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '2rem' }}>
          Client Management System
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#495057',
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #e9ecef',
                borderRadius: '10px',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#495057',
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #e9ecef',
                borderRadius: '10px',
                fontSize: '1rem',
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.1rem',
            }}
          >
            Login
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '10px',
          fontSize: '0.85rem',
          color: '#6c757d',
        }}>
          <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Demo Credentials:</p>
          <p><strong>Admin:</strong> admin@example.com / admin123</p>
          <p><strong>Employee:</strong> employee@example.com / employee123</p>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await API.get('/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  const taskData = stats?.taskDistribution ? [
    { name: 'Pending', value: stats.taskDistribution.pending, color: '#adb5bd' },
    { name: 'In Progress', value: stats.taskDistribution.inProgress, color: '#3282b8' },
    { name: 'Completed', value: stats.taskDistribution.completed, color: '#28a745' },
  ] : [];

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>

      {isAdmin ? (
        <>
          <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-value">{stats?.totalClients || 0}</div>
              <div className="stat-label">Total Clients</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.totalProjects || 0}</div>
              <div className="stat-label">Total Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.ongoingProjects || 0}</div>
              <div className="stat-label">Ongoing Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.totalEmployees || 0}</div>
              <div className="stat-label">Total Employees</div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Task Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Recent Projects</h3>
              {stats?.recentProjects?.length > 0 ? (
                <div>
                  {stats.recentProjects.map((project) => (
                    <div key={project._id} style={{
                      padding: '1rem',
                      borderBottom: '1px solid #e9ecef',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{project.title}</p>
                        <p style={{ fontSize: '0.85rem', color: '#6c757d' }}>{project.client?.company}</p>
                      </div>
                      <span className={`badge status-${project.status.toLowerCase().replace(' ', '-')}`}>
                        {project.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6c757d', textAlign: 'center', padding: '2rem' }}>No recent projects</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-value">{stats?.totalAssignedTasks || 0}</div>
              <div className="stat-label">Assigned Tasks</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.inProgressTasks || 0}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.completedTasks || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Task Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Recent Tasks</h3>
              {stats?.recentTasks?.length > 0 ? (
                <div>
                  {stats.recentTasks.map((task) => (
                    <div key={task._id} style={{
                      padding: '1rem',
                      borderBottom: '1px solid #e9ecef',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{task.title}</p>
                        <p style={{ fontSize: '0.85rem', color: '#6c757d' }}>{task.project?.title}</p>
                      </div>
                      <span className={`badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6c757d', textAlign: 'center', padding: '2rem' }}>No recent tasks</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Clients Component
const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await API.get('/clients');
      setClients(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await API.put(`/clients/${editingClient._id}`, formData);
        toast.success('Client updated successfully');
      } else {
        await API.post('/clients', formData);
        toast.success('Client created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await API.delete(`/clients/${id}`);
        toast.success('Client deleted successfully');
        fetchClients();
      } catch (error) {
        toast.error('Failed to delete client');
      }
    }
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone || '',
      address: client.address || '',
      notes: client.notes || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', company: '', email: '', phone: '', address: '', notes: '' });
    setEditingClient(null);
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="fade-in">
      <div className="card-header">
        <h1>Clients</h1>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary">
          <FiPlus /> Add Client
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client._id}>
                    <td>{client.name}</td>
                    <td>{client.company}</td>
                    <td>{client.email}</td>
                    <td>{client.phone || 'N/A'}</td>
                    <td>
                      <button onClick={() => openEditModal(client)} className="btn btn-sm btn-secondary" style={{ marginRight: '0.5rem' }}>
                        <FiEdit />
                      </button>
                      <button onClick={() => handleDelete(client._id)} className="btn btn-sm btn-danger">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                    No clients found. Add your first client!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  className="form-textarea"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingClient ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Tasks Component (simplified for space)
const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await API.get('/tasks');
      setTasks(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task status updated');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '2rem' }}>Tasks</h1>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                {isAdmin && <th>Assigned To</th>}
                <th>Due Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task._id}>
                    <td>{task.title}</td>
                    <td>{task.project?.title}</td>
                    {isAdmin && <td>{task.assignedTo?.name}</td>}
                    <td>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</td>
                    <td>
                      <span className={`badge priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={task.status}
                        onChange={(e) => updateStatus(task._id, e.target.value)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '2px solid #e9ecef',
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? "7" : "6"} style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                    No tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Simplified Employees and Projects components would go here...

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'clients': return <Clients />;
      case 'tasks': return <Tasks />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="main-content">
        {renderView()}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default Root;
