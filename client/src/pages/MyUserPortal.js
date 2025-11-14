import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { commonStyles, inputHandlers, buttonHandlers } from '../styles/sharedStyles';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function MyUserPortal() {
  const navigate = useNavigate();
  const username = sessionStorage.getItem('username');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [globalHW, setGlobalHW] = useState({ HWSet1: { capacity: 0, available: 0 }, HWSet2: { capacity: 0, available: 0 } });
  const [createForm, setCreateForm] = useState({ projectId: '', projectName: '', description: '' });
  const [joinProjectId, setJoinProjectId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
  const [usageHistory, setUsageHistory] = useState([]);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingId, setEditingId] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [checkoutRequest, setCheckoutRequest] = useState({});
  const [checkinRequest, setCheckinRequest] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState({ projects: false, hardware: false, create: false, join: false, checkout: false, checkin: false, projectDetails: false, updateDescription: false, updateName: false, updateId: false, invite: false, history: false });

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

  const fetchProjectDetails = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(prev => ({ ...prev, projectDetails: true }));
    try {
      const res = await fetch(`${API_BASE}/get_project_info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProjectId }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedProjectDetails(data.data);
        setNewDescription(data.data.description || '');
        setNewProjectName(data.data.projectName || '');
        setNewProjectId(data.data.projectId || '');
      }
    } catch (err) {
      setMessage('Error loading project details.');
    } finally {
      setLoading(prev => ({ ...prev, projectDetails: false }));
    }
  }, [selectedProjectId]);

  const fetchUsageHistory = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(prev => ({ ...prev, history: true }));
    try {
      const res = await fetch(`${API_BASE}/get_project_usage_history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProjectId, limit: 20 }),
      });
      const data = await res.json();
      if (data.success && data.history) {
        setUsageHistory(data.history);
      }
    } catch (err) {
      // Silently fail for history - not critical
    } finally {
      setLoading(prev => ({ ...prev, history: false }));
    }
  }, [selectedProjectId]);

  // Fetch project details and history when selected project changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectDetails();
      fetchUsageHistory();
    } else {
      setSelectedProjectDetails(null);
      setUsageHistory([]);
    }
  }, [selectedProjectId, fetchProjectDetails, fetchUsageHistory]);

  async function handleUpdateDescription(e) {
    e.preventDefault();
    if (!selectedProjectId || !selectedProjectDetails) return;
    setLoading(prev => ({ ...prev, updateDescription: true }));
    try {
      const res = await fetch(`${API_BASE}/update_project_description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProjectId, description: newDescription, username }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Description updated successfully');
        setEditingDescription(false);
        await fetchProjectDetails();
        await fetchProjects();
      } else {
        setMessage(data.message || 'Error updating description');
      }
    } catch (err) {
      setMessage('Server error updating description.');
    } finally {
      setLoading(prev => ({ ...prev, updateDescription: false }));
    }
  }

  async function handleUpdateName(e) {
    e.preventDefault();
    if (!selectedProjectId || !selectedProjectDetails) return;
    if (!newProjectName.trim()) {
      setMessage('Project name cannot be empty');
      return;
    }
    setLoading(prev => ({ ...prev, updateName: true }));
    try {
      const res = await fetch(`${API_BASE}/update_project_name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProjectId, projectName: newProjectName.trim(), username }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Project name updated successfully');
        setEditingName(false);
        await fetchProjectDetails();
        await fetchProjects();
      } else {
        setMessage(data.message || 'Error updating project name');
      }
    } catch (err) {
      setMessage('Server error updating project name.');
    } finally {
      setLoading(prev => ({ ...prev, updateName: false }));
    }
  }

  async function handleUpdateId(e) {
    e.preventDefault();
    if (!selectedProjectId || !selectedProjectDetails) return;
    if (!newProjectId.trim()) {
      setMessage('Project ID cannot be empty');
      return;
    }
    if (newProjectId.trim() === selectedProjectId) {
      setMessage('Project ID unchanged');
      setEditingId(false);
      return;
    }
    setLoading(prev => ({ ...prev, updateId: true }));
    try {
      const res = await fetch(`${API_BASE}/update_project_id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldProjectId: selectedProjectId, newProjectId: newProjectId.trim(), username }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Project ID updated successfully');
        setEditingId(false);
        setSelectedProjectId(data.newProjectId || newProjectId.trim());
        await fetchProjectDetails();
        await fetchProjects();
      } else {
        setMessage(data.message || 'Error updating project ID');
      }
    } catch (err) {
      setMessage('Server error updating project ID.');
    } finally {
      setLoading(prev => ({ ...prev, updateId: false }));
    }
  }

  async function handleInviteUser(e) {
    e.preventDefault();
    if (!selectedProjectId || !inviteUsername.trim()) {
      setMessage('Enter a username to invite');
      return;
    }
    setLoading(prev => ({ ...prev, invite: true }));
    try {
      const res = await fetch(`${API_BASE}/invite_user_to_project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProjectId, inviteeUsername: inviteUsername.trim(), inviterUsername: username }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Successfully invited ${inviteUsername}`);
        setInviteUsername('');
        await fetchProjectDetails();
        await fetchProjects();
      } else {
        setMessage(data.message || 'Error inviting user');
      }
    } catch (err) {
      setMessage('Server error inviting user.');
    } finally {
      setLoading(prev => ({ ...prev, invite: false }));
    }
  }
  
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
      await Promise.all([fetchHardware(), fetchProjects(), fetchProjectDetails(), fetchUsageHistory()]);
    } catch (err) {
      setMessage('Error processing request. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  function logout() {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('user');
    setDropdownOpen(false);
    navigate('/login');
  }

  if (!username) return <Navigate to="/login" replace />;

  return (
    <div style={commonStyles.pageContainer}>
      {/* Header */}
      <div style={commonStyles.header}>
        <h1 style={commonStyles.headerTitle}>Portal</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/')}
            style={commonStyles.primaryButtonSmall}
            onMouseEnter={buttonHandlers.primaryHover}
            onMouseLeave={buttonHandlers.primaryLeave}
            aria-label="Go to home"
          >
            Home
          </button>
          <div 
            ref={dropdownRef}
            style={{ position: 'relative', display: 'inline-block' }}
          >
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#252525',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#555';
                e.currentTarget.style.backgroundColor = '#2a2a2a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.backgroundColor = '#252525';
              }}
              aria-label="User menu"
              aria-expanded={dropdownOpen}
            >
              <span>{username}</span>
              <span style={{ fontSize: '10px' }}>▼</span>
            </button>
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  minWidth: '180px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => {
                    navigate('/account-settings');
                    setDropdownOpen(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    color: '#fff',
                    border: 'none',
                    borderBottom: '1px solid #333',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#252525';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  aria-label="Account settings"
                >
                  ⚙️ Settings
                </button>
                <button
                  onClick={logout}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    color: '#ff6b6b',
                    border: 'none',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2a1a1a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  aria-label="Logout"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
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

            {/* Project Details Panel */}
            <div style={{
              padding: '20px',
              backgroundColor: '#252525',
              border: '1px solid #333',
              minHeight: '300px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: '#fff' }}>Project Details</h3>
              {loading.projectDetails ? (
                <div style={{ fontSize: '13px', color: '#888', textAlign: 'center', padding: '20px' }}>Loading...</div>
              ) : selectedProjectDetails ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project Name</div>
                      {selectedProjectDetails.owner === username && (
                        <button
                          onClick={() => {
                            setEditingName(!editingName);
                            if (editingName) {
                              setNewProjectName(selectedProjectDetails.projectName || '');
                            }
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: 'transparent',
                            color: '#00d9ff',
                            border: '1px solid #00d9ff',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          aria-label={editingName ? 'Cancel edit' : 'Edit name'}
                        >
                          {editingName ? 'Cancel' : 'Edit'}
                        </button>
                      )}
                    </div>
                    {editingName && selectedProjectDetails.owner === username ? (
                      <form onSubmit={handleUpdateName} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="text"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          style={{
                            ...commonStyles.inputSmall,
                            fontSize: '14px'
                          }}
                          onFocus={inputHandlers.onFocus}
                          onBlur={inputHandlers.onBlur}
                          aria-label="Project name"
                          disabled={loading.updateName}
                          required
                        />
                        <button
                          type="submit"
                          style={{ ...commonStyles.primaryButtonSmall, width: '100%' }}
                          onMouseEnter={buttonHandlers.primaryHover}
                          onMouseLeave={buttonHandlers.primaryLeave}
                          disabled={loading.updateName}
                          aria-label="Save name"
                        >
                          {loading.updateName ? 'Saving...' : 'Save'}
                        </button>
                      </form>
                    ) : (
                      <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{selectedProjectDetails.projectName}</div>
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project ID</div>
                      {selectedProjectDetails.owner === username && (
                        <button
                          onClick={() => {
                            setEditingId(!editingId);
                            if (editingId) {
                              setNewProjectId(selectedProjectDetails.projectId || '');
                            }
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: 'transparent',
                            color: '#00d9ff',
                            border: '1px solid #00d9ff',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          aria-label={editingId ? 'Cancel edit' : 'Edit ID'}
                        >
                          {editingId ? 'Cancel' : 'Edit'}
                        </button>
                      )}
                    </div>
                    {editingId && selectedProjectDetails.owner === username ? (
                      <form onSubmit={handleUpdateId} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="text"
                          value={newProjectId}
                          onChange={(e) => setNewProjectId(e.target.value)}
                          style={{
                            ...commonStyles.inputSmall,
                            fontSize: '13px'
                          }}
                          onFocus={inputHandlers.onFocus}
                          onBlur={inputHandlers.onBlur}
                          aria-label="Project ID"
                          disabled={loading.updateId}
                          required
                        />
                        <button
                          type="submit"
                          style={{ ...commonStyles.primaryButtonSmall, width: '100%' }}
                          onMouseEnter={buttonHandlers.primaryHover}
                          onMouseLeave={buttonHandlers.primaryLeave}
                          disabled={loading.updateId}
                          aria-label="Save ID"
                        >
                          {loading.updateId ? 'Saving...' : 'Save'}
                        </button>
                      </form>
                    ) : (
                      <div style={{ fontSize: '13px', color: '#888' }}>{selectedProjectDetails.projectId}</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Owner</div>
                    <div style={{ fontSize: '13px', color: '#888' }}>{selectedProjectDetails.owner || 'Unknown'}</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</div>
                      {selectedProjectDetails.owner === username && (
                        <button
                          onClick={() => {
                            setEditingDescription(!editingDescription);
                            if (editingDescription) {
                              setNewDescription(selectedProjectDetails.description || '');
                            }
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: 'transparent',
                            color: '#00d9ff',
                            border: '1px solid #00d9ff',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          aria-label={editingDescription ? 'Cancel edit' : 'Edit description'}
                        >
                          {editingDescription ? 'Cancel' : 'Edit'}
                        </button>
                      )}
                    </div>
                    {editingDescription && selectedProjectDetails.owner === username ? (
                      <form onSubmit={handleUpdateDescription} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <textarea
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          style={{
                            ...commonStyles.textarea,
                            fontSize: '13px',
                            minHeight: '60px',
                            padding: '8px'
                          }}
                          onFocus={inputHandlers.onFocus}
                          onBlur={inputHandlers.onBlur}
                          aria-label="Project description"
                          disabled={loading.updateDescription}
                        />
                        <button
                          type="submit"
                          style={{ ...commonStyles.primaryButtonSmall, width: '100%' }}
                          onMouseEnter={buttonHandlers.primaryHover}
                          onMouseLeave={buttonHandlers.primaryLeave}
                          disabled={loading.updateDescription}
                          aria-label="Save description"
                        >
                          {loading.updateDescription ? 'Saving...' : 'Save'}
                        </button>
                      </form>
                    ) : (
                      <div style={{ fontSize: '13px', color: '#888', fontStyle: selectedProjectDetails.description ? 'normal' : 'italic' }}>
                        {selectedProjectDetails.description || 'No description'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Members ({selectedProjectDetails.users?.length || 0})</div>
                    <div style={{ fontSize: '13px', color: '#888', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {selectedProjectDetails.users && selectedProjectDetails.users.length > 0 ? (
                        selectedProjectDetails.users.map((user, idx) => (
                          <span key={idx} style={{ padding: '2px 6px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>{user}</span>
                        ))
                      ) : (
                        <span>No members</span>
                      )}
                    </div>
                  </div>
                  {selectedProjectDetails.owner === username && (
                    <div style={{ borderTop: '1px solid #333', paddingTop: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Invite User</div>
                      <form onSubmit={handleInviteUser} style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Username"
                          value={inviteUsername}
                          onChange={(e) => setInviteUsername(e.target.value)}
                          style={{
                            ...commonStyles.inputSmall,
                            flex: 1
                          }}
                          onFocus={inputHandlers.onFocus}
                          onBlur={inputHandlers.onBlur}
                          aria-label="Username to invite"
                          disabled={loading.invite}
                        />
                        <button
                          type="submit"
                          style={commonStyles.primaryButtonSmall}
                          onMouseEnter={buttonHandlers.primaryHover}
                          onMouseLeave={buttonHandlers.primaryLeave}
                          disabled={loading.invite}
                          aria-label="Invite user"
                        >
                          {loading.invite ? '...' : 'Invite'}
                        </button>
                      </form>
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid #333', paddingTop: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Recent Usage History</div>
                    {loading.history ? (
                      <div style={{ fontSize: '12px', color: '#888' }}>Loading...</div>
                    ) : usageHistory.length > 0 ? (
                      <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {usageHistory.slice(0, 10).map((entry, idx) => (
                          <div key={idx} style={{ fontSize: '11px', color: '#888', padding: '4px 8px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: entry.action === 'checkout' ? '#6bff6b' : '#ff6b6b', fontWeight: 600 }}>
                                {entry.action === 'checkout' ? '✓' : '↩'} {entry.qty} {entry.hwSetName}
                              </span>
                              <span style={{ fontSize: '10px' }}>{entry.username}</span>
                            </div>
                            {entry.timestamp && (
                              <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                                {new Date(entry.timestamp).toLocaleString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#888' }}>No usage history</div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#888', textAlign: 'center', padding: '20px' }}>Select a project to view details</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyUserPortal;


