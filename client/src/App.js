import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [health, setHealth] = useState(null);
  const [hardwareNames, setHardwareNames] = useState([]);
  const [hardwareSets, setHardwareSets] = useState([]);
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);

  // Load initial data
  useEffect(() => {
    checkHealth();
    loadHardwareNames();
    
    // Check if user is already logged in (persists across page refreshes)
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Load hardware details when user logs in
  useEffect(() => {
    if (user) {
      loadHardwareDetails();
      loadUserProjects();
    }
  }, [user]);

  // Load project-specific data when project changes
  useEffect(() => {
    if (currentProject) {
      loadHardwareDetails();
    }
  }, [currentProject]);

  const checkHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      setHealth(response.data);
    } catch (error) {
      console.error('Error checking health:', error);
      setHealth({ status: 'error', message: 'Cannot connect to server' });
    }
  };

  // Load all hardware names
  const loadHardwareNames = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_all_hw_names`);
      if (response.data.success) {
        setHardwareNames(response.data.data);
      }
    } catch (error) {
      console.error('Error loading hardware names:', error);
    }
  };

  // Load all hardware details
  const loadHardwareDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_all_hardware`);
      if (response.data.success) {
        setHardwareSets(response.data.data);
      }
    } catch (error) {
      console.error('Error loading hardware details:', error);
    }
  };

  // Load projects for the logged-in user
  const loadUserProjects = async () => {
    if (!user) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/get_user_projects`, {
        userId: user.userId
      });
      if (response.data.success) {
        setProjects(response.data.projects || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  // User Authentication Handlers
  const handleSignup = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
      username: formData.get('username'),
      userId: formData.get('userId'),
      password: formData.get('password')
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/add_user`, userData);
      if (response.data.success) {
        alert('User created successfully! Please login.');
        e.target.reset();
      } else {
        alert('Signup failed: ' + response.data.message);
      }
    } catch (error) {
      alert('Signup error: ' + error.message);
    }
  };

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const loginData = {
      username: formData.get('username'),
      userId: formData.get('userId'),
      password: formData.get('password')
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, loginData);
      if (response.data.success) {
        const userData = response.data.user_data;
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        alert('Login successful!');
        e.target.reset();
      } else {
        alert('Login failed: ' + response.data.message);
      }
    } catch (error) {
      alert('Login error: ' + error.message);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setUser(null);
    setCurrentProject(null);
    setProjects([]);
    sessionStorage.removeItem('user');
    alert('Logged out successfully!');
  };

  // Project Handlers
  const handleCreateProject = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const projectData = {
      projectId: formData.get('projectId'),
      projectName: formData.get('projectName'),
      description: formData.get('description'),
      userId: user.userId
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/create_project`, projectData);
      if (response.data.success) {
        alert('Project created successfully!');
        e.target.reset();
        loadUserProjects();
      } else {
        alert('Project creation failed: ' + response.data.message);
      }
    } catch (error) {
      alert('Project creation error: ' + error.message);
    }
  };

  // Join Project Handler
  const handleJoinProject = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const projectId = formData.get('projectId');

    try {
      const response = await axios.post(`${API_BASE_URL}/join_project`, {
        projectId: projectId,
        userId: user.userId
      });
      if (response.data.success) {
        alert('Joined project successfully!');
        e.target.reset();
        loadUserProjects();
      } else {
        alert('Join project failed: ' + response.data.message);
      }
    } catch (error) {
      alert('Join project error: ' + error.message);
    }
  };

  //  Select Project Handler
  const handleSelectProject = (project) => {
    setCurrentProject(project);
  };

  // Hardware Checkout/Checkin Handlers
  const handleCheckout = async (hwSetName) => {
    if (!currentProject) {
      alert('Please select a project first!');
      return;
    }

    const qty = prompt(`Enter quantity to checkout for ${hwSetName}:`);
    if (!qty || isNaN(qty) || parseInt(qty) <= 0) {
      alert('Invalid quantity!');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/checkout_hardware`, {
        hwSetName: hwSetName,
        qty: parseInt(qty),
        projectId: currentProject.projectId,
        userId: user.userId
      });
      if (response.data.success) {
        alert('Hardware checked out successfully!');
        loadHardwareDetails();
      } else {
        alert('Checkout failed: ' + response.data.message);
      }
    } catch (error) {
      alert('Checkout error: ' + error.message);
    }
  };

  const handleCheckin = async (hwSetName) => {
    if (!currentProject) {
      alert('Please select a project first!');
      return;
    }

    const qty = prompt(`Enter quantity to check in for ${hwSetName}:`);
    if (!qty || isNaN(qty) || parseInt(qty) <= 0) {
      alert('Invalid quantity!');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/checkin_hardware`, {
        hwSetName: hwSetName,
        qty: parseInt(qty),
        projectId: currentProject.projectId,
        userId: user.userId
      });
      if (response.data.success) {
        alert('Hardware checked in successfully!');
        loadHardwareDetails();
      } else {
        alert('Check-in failed: ' + response.data.message);
      }
    } catch (error) {
      alert('Check-in error: ' + error.message);
    }
  };

  // Create Hardware Set Handler (Admin Function)
  const handleCreateHardware = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const hardwareData = {
      hwSetName: formData.get('hwSetName'),
      initCapacity: parseInt(formData.get('initCapacity'))
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/create_hardware_set`, hardwareData);
      if (response.data.success) {
        alert('Hardware set created successfully!');
        e.target.reset();
        loadHardwareNames();
        loadHardwareDetails();
      } else {
        alert('Hardware creation failed: ' + response.data.message);
      }
    } catch (error) {
      alert('Hardware creation error: ' + error.message);
    }
  };

  // Main Render
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <header style={{ 
        backgroundColor: '#282c34', 
        color: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h1>Momentum SWELAB - Hardware Management</h1>
        {user && (
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Logged in as: <strong>{user.username}</strong> (ID: {user.userId})</span>
            <button 
              onClick={handleLogout}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#dc3545', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Server Health Status */}
      <div style={{ 
        margin: '20px 0', 
        padding: '15px', 
        backgroundColor: 'white',
        border: '1px solid #ddd', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0 }}>Server Status</h3>
        {health ? (
          <div>
            <p><strong>Status:</strong> <span style={{ color: health.status === 'healthy' ? 'green' : 'red' }}>{health.status}</span></p>
            <p><strong>MongoDB:</strong> {health.mongodb_connected ? '✓ Connected' : '✗ Disconnected'}</p>
            <p><strong>Message:</strong> {health.message}</p>
          </div>
        ) : (
          <p>Checking server status...</p>
        )}
      </div>

      {!user ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Sign Up */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'white',
            border: '1px solid #ddd', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0 }}>Sign Up </h3>
            <form onSubmit={handleSignup}>
              <input 
                name="username" 
                placeholder="Username" 
                required 
                style={{ 
                  width: '100%', 
                  margin: '8px 0', 
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }} 
              />
              <input 
                name="userId" 
                placeholder="User ID" 
                required 
                style={{ 
                  width: '100%', 
                  margin: '8px 0', 
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }} 
              />
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                required 
                style={{ 
                  width: '100%', 
                  margin: '8px 0', 
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }} 
              />
              <button 
                type="submit" 
                style={{ 
                  width: '100%',
                  margin: '8px 0', 
                  padding: '10px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Sign Up
              </button>
            </form>
          </div>

          {/* Login */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'white',
            border: '1px solid #ddd', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0 }}>Login </h3>
            <form onSubmit={handleLogin}>
              <input 
                name="username" 
                placeholder="Username" 
                required 
                style={{ 
                  width: '100%', 
                  margin: '8px 0', 
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }} 
              />
              <input 
                name="userId" 
                placeholder="User ID" 
                required 
                style={{ 
                  width: '100%', 
                  margin: '8px 0', 
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }} 
              />
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                required 
                style={{ 
                  width: '100%', 
                  margin: '8px 0', 
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }} 
              />
              <button 
                type="submit" 
                style={{ 
                  width: '100%',
                  margin: '8px 0', 
                  padding: '10px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Login
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div>
          {/* Project Management */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            {/* Create Project */}
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'white',
              border: '1px solid #ddd', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0 }}>Create New Project </h3>
              <form onSubmit={handleCreateProject}>
                <input 
                  name="projectId" 
                  placeholder="Project ID" 
                  required 
                  style={{ 
                    width: '100%', 
                    margin: '8px 0', 
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }} 
                />
                <input 
                  name="projectName" 
                  placeholder="Project Name" 
                  required 
                  style={{ 
                    width: '100%', 
                    margin: '8px 0', 
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }} 
                />
                <input 
                  name="description" 
                  placeholder="Description" 
                  style={{ 
                    width: '100%', 
                    margin: '8px 0', 
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }} 
                />
                <button 
                  type="submit" 
                  style={{ 
                    width: '100%',
                    margin: '8px 0', 
                    padding: '10px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Create Project
                </button>
              </form>
            </div>

            {/* Join Project */}
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'white',
              border: '1px solid #ddd', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0 }}>Join Existing Project </h3>
              <form onSubmit={handleJoinProject}>
                <input 
                  name="projectId" 
                  placeholder="Project ID" 
                  required 
                  style={{ 
                    width: '100%', 
                    margin: '8px 0', 
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }} 
                />
                <button 
                  type="submit" 
                  style={{ 
                    width: '100%',
                    margin: '8px 0', 
                    padding: '10px',
                    backgroundColor: '#ffc107',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Join Project
                </button>
              </form>
            </div>
          </div>

          {/* My Projects */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'white',
            border: '1px solid #ddd', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginTop: 0 }}>My Projects</h3>
            {currentProject && (
              <div style={{ 
                padding: '10px', 
                backgroundColor: '#e7f3ff', 
                borderRadius: '4px',
                marginBottom: '15px'
              }}>
                <strong>Current Project:</strong> {currentProject.projectName} (ID: {currentProject.projectId})
              </div>
            )}
            {projects.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                {projects.map((project, index) => (
                  <div 
                    key={index}
                    onClick={() => handleSelectProject(project)}
                    style={{ 
                      padding: '15px', 
                      border: currentProject?.projectId === project.projectId ? '2px solid #007bff' : '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: currentProject?.projectId === project.projectId ? '#e7f3ff' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <strong>{project.projectName}</strong>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>ID: {project.projectId}</p>
                    {project.description && (
                      <p style={{ margin: '5px 0', fontSize: '12px', color: '#888' }}>{project.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No projects yet. Create or join a project to get started!</p>
            )}
          </div>

          {/* Hardware Management */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'white',
            border: '1px solid #ddd', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginTop: 0 }}>Hardware Sets </h3>
            {!currentProject && (
              <div style={{ 
                padding: '10px', 
                backgroundColor: '#fff3cd', 
                borderRadius: '4px',
                marginBottom: '15px',
                color: '#856404'
              }}>
                ⚠️ Please select a project to checkout/checkin hardware
              </div>
            )}
            {hardwareSets.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                {hardwareSets.map((hw, index) => (
                  <div 
                    key={index}
                    style={{ 
                      padding: '15px', 
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: '#f9f9f9'
                    }}
                  >
                    <h4 style={{ marginTop: 0 }}>{hw.hwSetName}</h4>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Capacity:</strong> {hw.capacity}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Available:</strong> <span style={{ 
                        color: hw.availability > 0 ? 'green' : 'red',
                        fontWeight: 'bold'
                      }}>{hw.availability}</span>
                    </p>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleCheckout(hw.hwSetName)}
                        disabled={!currentProject || hw.availability === 0}
                        style={{ 
                          flex: 1,
                          padding: '8px',
                          backgroundColor: currentProject && hw.availability > 0 ? '#28a745' : '#ccc',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: currentProject && hw.availability > 0 ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Checkout
                      </button>
                      <button
                        onClick={() => handleCheckin(hw.hwSetName)}
                        disabled={!currentProject}
                        style={{ 
                          flex: 1,
                          padding: '8px',
                          backgroundColor: currentProject ? '#007bff' : '#ccc',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: currentProject ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Check In
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hardware sets available. Create one below!</p>
            )}
          </div>

          {/* Create Hardware Set - Admin Function */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'white',
            border: '1px solid #ddd', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0 }}>Create Hardware Set (Admin)</h3>
            <form onSubmit={handleCreateHardware}>
              <input 
                name="hwSetName" 
                placeholder="Hardware Set Name (e.g., HWSet1, HWSet2)" 
                required 
                style={{ 
                  width: 'calc(50% - 10px)', 
                  margin: '8px 5px', 
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }} 
              />
              <input 
                name="initCapacity" 
                type="number" 
                placeholder="Initial Capacity" 
                required 
                min="1"
                style={{ 
                  width: 'calc(50% - 10px)', 
                  margin: '8px 5px', 
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }} 
              />
              <button 
                type="submit" 
                style={{ 
                  margin: '8px 5px', 
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Create Hardware Set
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;