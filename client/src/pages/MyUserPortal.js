import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { commonStyles, inputHandlers, buttonHandlers } from '../styles/sharedStyles';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function MyUserPortal() {
  const navigate = useNavigate();
  const username = sessionStorage.getItem('username');

  const [projects, setProjects] = useState([]);
  const [globalHW, setGlobalHW] = useState({ HWSet1: { capacity: 0, available: 0 }, HWSet2: { capacity: 0, available: 0 } });
  const [createForm, setCreateForm] = useState({ projectId: '', projectName: '', description: '' });
  const [joinProjectId, setJoinProjectId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [checkoutRequest, setCheckoutRequest] = useState({});
  const [checkinRequest, setCheckinRequest] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState({ projects: false, hardware: false, create: false, join: false, checkout: false, checkin: false });

  // Fetch user's projects
  const fetchProjects = useCallback(async () => {
    setLoading(prev => ({ ...prev, projects: true }));
    try {
      const res = await fetch(`${API_BASE}/get_user_projects_list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      
      // Populate projects list
      if (data.success) {
        const list = (data.projects || []).map((p) => ({
          projectId: p.projectId,
          projectName: p.projectName,
          description: p.description || '',
          hwSets: p.hwSets || {},
          owner: p.owner || null
        }));
        setProjects(list);
      } else {
        setProjects([]);
        if (data.message) setMessage(data.message);
      }
    } catch (err) {
      setProjects([]);
      setMessage('Error loading projects. Please refresh.');
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  }, [username]);

  async function fetchHardware() {
    setLoading(prev => ({ ...prev, hardware: true }));
    try {
      const res = await fetch(`${API_BASE}/get_all_hardware`);
      const data = await res.json();
      
      if (data.success && data.data) {
        const hw = {};
        data.data.forEach((h) => {
          hw[h.hwSetName] = { capacity: h.capacity, available: h.availability };
        });
        setGlobalHW(hw);
      }
    } catch (err) {
      setMessage('Error loading hardware inventory.');
    } finally {
      setLoading(prev => ({ ...prev, hardware: false }));
    }
  }

  useEffect(() => {
    if (!username) return;
    fetchProjects();
    fetchHardware();
    
    // Poll for hardware updates every 5 minutes (when page is open)
    const hardwareInterval = setInterval(() => {
      fetchHardware();
    }, 300000); // 5 minutes = 300000 milliseconds
    
    // Poll for project updates every 5 minutes
    const projectsInterval = setInterval(() => {
      fetchProjects();
    }, 300000); // 5 minutes = 300000 milliseconds
    
    return () => {
      clearInterval(hardwareInterval);
      clearInterval(projectsInterval);
    };
  }, [username, fetchProjects]);
  
  // Update checkout/checkin forms when hardware sets change (dynamic hardware support)
  useEffect(() => {
    const hwKeys = Object.keys(globalHW);
    if (hwKeys.length > 0) {
      setCheckoutRequest(prev => {
        const updated = { ...prev };
        hwKeys.forEach(hw => {
          if (!(hw in updated)) updated[hw] = 0;
        });
        return updated;
      });
      setCheckinRequest(prev => {
        const updated = { ...prev };
        hwKeys.forEach(hw => {
          if (!(hw in updated)) updated[hw] = 0;
        });
        return updated;
      });
    }
  }, [globalHW]);

  async function handleCreateProject(e) {
    e.preventDefault();
    setMessage('');
    const { projectId, projectName, description } = createForm;
    if (!projectId || !projectName) {
      setMessage('Project ID and Name required');
      return;
    }
    setLoading(prev => ({ ...prev, create: true }));
    try {
      const res = await fetch(`${API_BASE}/create_project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, projectName, description, username }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Project ${projectName} created. Joining project...`);
        setCreateForm({ projectId: '', projectName: '', description: '' });
        
        // Auto-join the newly created project
        const joinRes = await fetch(`${API_BASE}/join_project`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, projectId }),
        });
        const joinData = await joinRes.json();
        if (joinData.success) {
          setMessage(`Project ${projectName} created and joined successfully.`);
        } else {
          setMessage(`Project created but failed to join: ${joinData.message || 'Unknown error'}`);
        }
        await fetchProjects();
      } else {
        setMessage(data.message || 'Error creating project');
      }
    } catch (err) {
      setMessage('Server error creating project. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  }

  // Join existing project
  async function handleJoinProject(e) {
    e.preventDefault();
    setMessage('');
    if (!joinProjectId.trim()) {
      setMessage('Enter a project ID');
      return;
    }
    setLoading(prev => ({ ...prev, join: true }));
    try {
      const res = await fetch(`${API_BASE}/join_project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, projectId: joinProjectId.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Joined project successfully');
        setJoinProjectId('');
        await fetchProjects();
      } else {
        setMessage(data.message || 'Error joining project');
      }
    } catch (err) {
      setMessage('Server error joining project. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, join: false }));
    }
  }

  // Leave project
  async function handleLeaveProject(projectId) {
    try {
      const res = await fetch(`${API_BASE}/remove_user_from_project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, projectId }),
      });
      const data = await res.json();
      if (data.success) {
        if (selectedProjectId === projectId) {
          setSelectedProjectId(null);
        }
        // ensures that when user leaves the project also leaves the page
        setMessage(`Left project ${projectId}`);
        await fetchProjects();
      } else {
        setMessage(data.message || 'Error leaving project');
      }
    } catch (err) {
      setMessage('Server error leaving project');
    }
  }

  // Delete project (only for owners)
  async function handleDeleteProject(projectId, projectName) {
    if (!window.confirm(`Are you sure you want to delete project "${projectName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/delete_project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, projectId }),
      });
      const data = await res.json();
      if (data.success) {
        if (selectedProjectId === projectId) {
          setSelectedProjectId(null);
        }
        setMessage(`Project "${projectName}" deleted successfully`);
        await fetchProjects();
      } else {
        setMessage(data.message || 'Error deleting project');
      }
    } catch (err) {
      setMessage('Server error deleting project');
    }
  }


  async function handleCheckout(e) {
    e.preventDefault();
    if (!selectedProjectId) return setMessage('Select a project');
    await checkoutOrCheckin('check_out', checkoutRequest);
  }

  async function handleCheckin(e) {
    e.preventDefault();
    if (!selectedProjectId) return setMessage('Select a project');
    await checkoutOrCheckin('check_in', checkinRequest);
  }

  async function checkoutOrCheckin(endpoint, requests) {
    const loadingKey = endpoint === 'check_out' ? 'checkout' : 'checkin';
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const results = [];
      // Process all hardware sets dynamically
      for (const [hwName, qty] of Object.entries(requests)) {
        const quantity = Number(qty || 0);
        if (quantity > 0) {
          const res = await fetch(`${API_BASE}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: selectedProjectId, hwSetName: hwName, qty: quantity, username }),
          });
          const data = await res.json();
          results.push({ hw: hwName, success: data.success, message: data.message });
        }
      }
      
      if (results.length === 0) {
        setMessage('Please enter quantities to checkout/check-in');
        setLoading(prev => ({ ...prev, [loadingKey]: false }));
        return;
      }
      
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        setMessage(`Some operations failed: ${failed.map(f => `${f.hw}: ${f.message}`).join(', ')}`);
      } else {
        setMessage(endpoint === 'check_out' ? 'Checkout successful' : 'Check-in successful');
        // Clear the request forms
        const clearedRequests = {};
        Object.keys(requests).forEach(key => { clearedRequests[key] = 0; });
        if (endpoint === 'check_out') {
          setCheckoutRequest(clearedRequests);
        } else {
          setCheckinRequest(clearedRequests);
        }
      }
      await Promise.all([fetchHardware(), fetchProjects()]);
    } catch (err) {
      setMessage('Error processing request. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }

  function logout() {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('user');
    navigate('/login');
  }

  if (!username) return <Navigate to="/login" replace />;

  return (
    <div style={commonStyles.pageContainer}>
      {/* Header */}
      <div style={commonStyles.header}>
        <h1 style={commonStyles.headerTitle}>Portal</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#bbb' }}>Signed in as <strong>{username}</strong></span>
          <button
            onClick={() => navigate('/account-settings')}
            style={commonStyles.secondaryButton}
            onMouseEnter={buttonHandlers.secondaryHover}
            onMouseLeave={buttonHandlers.secondaryLeave}
            aria-label="Account settings"
          >
            Account
          </button>
          <button
            onClick={logout}
            style={commonStyles.dangerButton}
            onMouseEnter={buttonHandlers.dangerHover}
            onMouseLeave={buttonHandlers.dangerLeave}
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Create Project */}
          <div style={commonStyles.cardSmall}>
            <h2 style={commonStyles.headingSmall}>Create Project</h2>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }} htmlFor="create-project-id">Project ID</label>
                <input
                  id="create-project-id"
                  placeholder="unique-id"
                  value={createForm.projectId}
                  onChange={(e) => setCreateForm({ ...createForm, projectId: e.target.value })}
                  style={commonStyles.inputSmall}
                  onFocus={inputHandlers.onFocus}
                  onBlur={inputHandlers.onBlur}
                  aria-label="Project ID"
                  disabled={loading.create}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }} htmlFor="create-project-name">Project Name</label>
                <input
                  id="create-project-name"
                  placeholder="Project name"
                  value={createForm.projectName}
                  onChange={(e) => setCreateForm({ ...createForm, projectName: e.target.value })}
                  style={commonStyles.inputSmall}
                  onFocus={inputHandlers.onFocus}
                  onBlur={inputHandlers.onBlur}
                  aria-label="Project Name"
                  disabled={loading.create}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }} htmlFor="create-project-desc">Description</label>
                <textarea
                  id="create-project-desc"
                  placeholder="Project description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  style={commonStyles.textarea}
                  onFocus={inputHandlers.onFocus}
                  onBlur={inputHandlers.onBlur}
                  aria-label="Project Description"
                  disabled={loading.create}
                />
              </div>
              <button
                type="submit"
                style={commonStyles.primaryButtonSmall}
                onMouseEnter={buttonHandlers.primaryHover}
                onMouseLeave={buttonHandlers.primaryLeave}
                disabled={loading.create}
                aria-label="Create project"
              >
                {loading.create ? 'Creating...' : 'Create'}
              </button>
            </form>

            <div style={{ borderTop: '1px solid #333', margin: '16px 0', paddingTop: '16px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#fff' }}>Join Project</h3>
              <form onSubmit={handleJoinProject} style={{ display: 'flex', gap: '8px' }}>
                <input
                  placeholder="Project ID"
                  value={joinProjectId}
                  onChange={(e) => setJoinProjectId(e.target.value)}
                  style={{ ...commonStyles.inputSmall, flex: 1 }}
                  onFocus={inputHandlers.onFocus}
                  onBlur={inputHandlers.onBlur}
                  aria-label="Project ID to join"
                  disabled={loading.join}
                />
                <button
                  type="submit"
                  style={commonStyles.primaryButtonSmall}
                  onMouseEnter={buttonHandlers.primaryHover}
                  onMouseLeave={buttonHandlers.primaryLeave}
                  disabled={loading.join}
                  aria-label="Join project"
                >
                  {loading.join ? 'Joining...' : 'Join'}
                </button>
              </form>
            </div>

            {message && (
              <div style={{
                marginTop: '16px',
                ...(message.includes('Error') || message.includes('failed') ? commonStyles.messageError : commonStyles.messageSuccess),
                fontSize: '12px'
              }} role="alert">
                {message}
              </div>
            )}
          </div>

          {/* Hardware Sets */}
          <div style={commonStyles.cardSmall}>
            <h2 style={commonStyles.headingSmall}>Hardware Inventory</h2>
            {loading.hardware ? (
              <div style={{ fontSize: '13px', color: '#888', textAlign: 'center', padding: '20px' }}>Loading...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.keys(globalHW).map((hw) => (
                  <div key={hw} style={{
                    padding: '12px',
                    backgroundColor: '#252525',
                    border: '1px solid #333'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ color: '#fff', fontSize: '14px' }}>{hw}</strong>
                      <span style={{ color: '#888', fontSize: '12px' }}>Cap: {globalHW[hw].capacity}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#888' }}>Available</span>
                      <span style={{ color: globalHW[hw].available > 0 ? '#6bff6b' : '#ff6b6b', fontWeight: 600 }}>{globalHW[hw].available}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects List */}
          <div style={commonStyles.cardSmall}>
            <h2 style={commonStyles.headingSmall}>Your Projects</h2>
            {loading.projects ? (
              <div style={{ fontSize: '13px', color: '#888', textAlign: 'center', padding: '20px' }}>Loading...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                {projects.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#888' }}>No projects yet.</div>
                ) : (
                  projects.map((p) => (
                    <div
                      key={p.projectId}
                      onClick={() => setSelectedProjectId(p.projectId)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedProjectId(p.projectId);
                        }
                      }}
                      style={{
                        padding: '12px',
                        backgroundColor: selectedProjectId === p.projectId ? '#252525' : 'transparent',
                        border: `1px solid ${selectedProjectId === p.projectId ? '#00d9ff' : '#333'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedProjectId !== p.projectId) {
                          e.currentTarget.style.borderColor = '#555';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedProjectId !== p.projectId) {
                          e.currentTarget.style.borderColor = '#333';
                        }
                      }}
                      aria-label={`Select project ${p.projectName}`}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px', marginBottom: '4px' }}>
                          {p.projectName}
                          <div style={{ fontSize: '11px', color: '#888', fontWeight: 400, marginTop: '2px' }}>
                            ID: {p.projectId}
                            {p.owner && (
                              <span style={{ marginLeft: '8px', color: p.owner === username ? '#00d9ff' : '#888' }}>
                                {p.owner === username ? '● Owner' : `Owner: ${p.owner}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                          {p.description}
                        </div>
                        {p.hwSets && Object.entries(p.hwSets).filter(([_, amount]) => amount > 0).length > 0 && (
                          <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                            {Object.entries(p.hwSets)
                              .filter(([_, amount]) => amount > 0)
                              .map(([hwName, amount]) => (
                              <div key={hwName}>{hwName}: {amount}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        {p.owner === username && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(p.projectId, p.projectName);
                            }}
                            style={{
                              ...commonStyles.dangerButtonSmall,
                              backgroundColor: '#8b0000',
                              fontSize: '11px',
                              padding: '4px 8px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#a00000';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#8b0000';
                            }}
                            aria-label={`Delete project ${p.projectName}`}
                          >
                            Delete
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLeaveProject(p.projectId);
                          }}
                          style={commonStyles.dangerButtonSmall}
                          onMouseEnter={buttonHandlers.dangerSmallHover}
                          onMouseLeave={buttonHandlers.dangerSmallLeave}
                          aria-label={`Leave project ${p.projectName}`}
                        >
                          Leave
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Checkout / Check-in */}
        <div style={commonStyles.cardSmall}>
          <h2 style={commonStyles.headingSmall}>Hardware Operations</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#888' }}>Selected: <strong>{selectedProjectId || 'None'}</strong></p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <form onSubmit={handleCheckout} style={{
              padding: '20px',
              backgroundColor: '#252525',
              border: '1px solid #333'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: '#fff' }}>Checkout Hardware</h3>
              {Object.keys(globalHW).map((hw) => (
                <div key={hw} style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }} htmlFor={`checkout-${hw}`}>{hw}</label>
                  <input
                    id={`checkout-${hw}`}
                    type="number"
                    min="0"
                    value={checkoutRequest[hw] || 0}
                    onChange={(e) => setCheckoutRequest({ ...checkoutRequest, [hw]: e.target.value })}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      color: '#fff',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={inputHandlers.onFocus}
                    onBlur={inputHandlers.onBlur}
                    aria-label={`Checkout quantity for ${hw}`}
                    disabled={loading.checkout || !selectedProjectId}
                  />
                </div>
              ))}
              <button
                type="submit"
                style={{ ...commonStyles.primaryButtonSmall, width: '100%' }}
                onMouseEnter={buttonHandlers.primaryHover}
                onMouseLeave={buttonHandlers.primaryLeave}
                disabled={loading.checkout || !selectedProjectId}
                aria-label="Checkout hardware"
              >
                {loading.checkout ? 'Processing...' : 'Checkout'}
              </button>
            </form>

            <form onSubmit={handleCheckin} style={{
              padding: '20px',
              backgroundColor: '#252525',
              border: '1px solid #333'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: '#fff' }}>Check-in Hardware</h3>
              {Object.keys(globalHW).map((hw) => (
                <div key={hw} style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }} htmlFor={`checkin-${hw}`}>{hw}</label>
                  <input
                    id={`checkin-${hw}`}
                    type="number"
                    min="0"
                    value={checkinRequest[hw] || 0}
                    onChange={(e) => setCheckinRequest({ ...checkinRequest, [hw]: e.target.value })}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      color: '#fff',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={inputHandlers.onFocus}
                    onBlur={inputHandlers.onBlur}
                    aria-label={`Check-in quantity for ${hw}`}
                    disabled={loading.checkin || !selectedProjectId}
                  />
                </div>
              ))}
              <button
                type="submit"
                style={{ ...commonStyles.primaryButtonSmall, width: '100%' }}
                onMouseEnter={buttonHandlers.primaryHover}
                onMouseLeave={buttonHandlers.primaryLeave}
                disabled={loading.checkin || !selectedProjectId}
                aria-label="Check-in hardware"
              >
                {loading.checkin ? 'Processing...' : 'Check-in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyUserPortal;


