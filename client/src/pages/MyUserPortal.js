import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function MyUserPortal() {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId');

  const [projects, setProjects] = useState([]);
  const [globalHW, setGlobalHW] = useState({ HWSet1: { capacity: 0, available: 0 }, HWSet2: { capacity: 0, available: 0 } });
  const [createForm, setCreateForm] = useState({ projectId: '', projectName: '', description: '' });
  const [joinProjectId, setJoinProjectId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [checkoutRequest, setCheckoutRequest] = useState({ HWSet1: 0, HWSet2: 0 });
  const [checkinRequest, setCheckinRequest] = useState({ HWSet1: 0, HWSet2: 0 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!userId) return;
    fetchProjects();
    fetchHardware();
  }, [userId]);

  // Fetch user's projects
  async function fetchProjects() {
  try {
    const res = await fetch(`${API_BASE}/get_user_projects_list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    console.log('Projects response:', data);
    
    // Populate projects list
    if (data.success) {
      const list = (data.projects || data.data || []).map((p) => ({
        projectId: p.projectId,
        projectName: p.projectName,
        description: p.description,
        hwSets: p.hwSets || {}
      }));
      setProjects(list);
    } else {
      setProjects([]);
    }
  } catch (err) {
    console.error('Error fetching projects:', err);
    setProjects([]);
  }
}


  async function fetchHardware() {
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
      console.error(err);
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    setMessage('');
    const { projectId, projectName, description } = createForm;
    if (!projectId || !projectName) {
      setMessage('Project ID and Name required');
      return;
    }
    const res = await fetch(`${API_BASE}/create_project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, projectName, description }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage(`Project ${projectName} created.`);
      fetchProjects();
    } else setMessage(data.message || 'Error creating project');
    
    // Auto-join the newly created project
    await fetch(`${API_BASE}/join_project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, projectId }),
    });
    fetchProjects();

  }

  // Join existing project
  async function handleJoinProject(e) {
    e.preventDefault();
    setMessage('');
    if (!joinProjectId) return setMessage('Enter a project ID');
    const res = await fetch(`${API_BASE}/join_project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, projectId: joinProjectId }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage('Joined project successfully');
      fetchProjects();
    } else setMessage(data.message || 'Error joining project');
  }

  // Leave project
  async function handleLeaveProject(projectId) {
  try {
    const res = await fetch(`${API_BASE}/remove_user_from_project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, projectId }),
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
    console.error(err);
    setMessage('Server error leaving project');
  }
}


  async function handleCheckout(e) {
    e.preventDefault();
    if (!selectedProjectId) return setMessage('Select a project');
    const r1 = Number(checkoutRequest.HWSet1 || 0);
    const r2 = Number(checkoutRequest.HWSet2 || 0);
    await checkoutOrCheckin('check_out', r1, r2);
  }

  async function handleCheckin(e) {
    e.preventDefault();
    if (!selectedProjectId) return setMessage('Select a project');
    const r1 = Number(checkinRequest.HWSet1 || 0);
    const r2 = Number(checkinRequest.HWSet2 || 0);
    await checkoutOrCheckin('check_in', r1, r2);
  }

  async function checkoutOrCheckin(endpoint, r1, r2) {
    try {
      const hwSets = [
        { name: 'HWSet1', qty: r1 },
        { name: 'HWSet2', qty: r2 },
      ];
      for (const hw of hwSets) {
        if (hw.qty > 0) {
          await fetch(`${API_BASE}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: selectedProjectId, hwSetName: hw.name, qty: hw.qty, userId }),
          });
        }
      }
      setMessage(endpoint === 'check_out' ? 'Checkout successful' : 'Check-in successful');
      fetchHardware();
      fetchProjects();
    } catch (err) {
      console.error(err);
      setMessage('Error processing request');
    }
  }

  function logout() {
    sessionStorage.removeItem('userId');
    navigate('/login');
  }

  if (!userId) return <Navigate to="/login" replace />;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '20px 32px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#fff' }}>Portal</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#bbb' }}>Signed in as <strong>{userId}</strong></span>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#ff6b6b',
              border: '1px solid #5a2a2a',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#ff6b6b';
              e.target.style.backgroundColor = '#2a1a1a';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#5a2a2a';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Create Project */}
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '24px',
            border: '1px solid #333'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#fff' }}>Create Project</h2>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project ID</label>
                <input
                  placeholder="unique-id"
                  value={createForm.projectId}
                  onChange={(e) => setCreateForm({ ...createForm, projectId: e.target.value })}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#252525',
                    border: '1px solid #333',
                    color: '#fff',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00d9ff'}
                  onBlur={(e) => e.target.style.borderColor = '#333'}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project Name</label>
                <input
                  placeholder="Project name"
                  value={createForm.projectName}
                  onChange={(e) => setCreateForm({ ...createForm, projectName: e.target.value })}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#252525',
                    border: '1px solid #333',
                    color: '#fff',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00d9ff'}
                  onBlur={(e) => e.target.style.borderColor = '#333'}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                <textarea
                  placeholder="Project description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#252525',
                    border: '1px solid #333',
                    color: '#fff',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00d9ff'}
                  onBlur={(e) => e.target.style.borderColor = '#333'}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#00d9ff',
                  color: '#0a0a0a',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#00c4e0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#00d9ff'}
              >
                Create
              </button>
            </form>

            <div style={{ borderTop: '1px solid #333', margin: '16px 0', paddingTop: '16px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#fff' }}>Join Project</h3>
              <form onSubmit={handleJoinProject} style={{ display: 'flex', gap: '8px' }}>
                <input
                  placeholder="Project ID"
                  value={joinProjectId}
                  onChange={(e) => setJoinProjectId(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    backgroundColor: '#252525',
                    border: '1px solid #333',
                    color: '#fff',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00d9ff'}
                  onBlur={(e) => e.target.style.borderColor = '#333'}
                />
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#00d9ff',
                    color: '#0a0a0a',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#00c4e0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#00d9ff'}
                >
                  Join
                </button>
              </form>
            </div>

            {message && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: message.includes('Error') || message.includes('failed') ? '#2a1a1a' : '#1a2a1a',
                border: `1px solid ${message.includes('Error') || message.includes('failed') ? '#5a2a2a' : '#2a5a2a'}`,
                color: message.includes('Error') || message.includes('failed') ? '#ff6b6b' : '#6bff6b',
                fontSize: '12px',
                borderRadius: '2px'
              }}>
                {message}
              </div>
            )}
          </div>

          {/* Hardware Sets */}
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '24px',
            border: '1px solid #333'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#fff' }}>Hardware Inventory</h2>
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
          </div>

          {/* Projects List */}
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '24px',
            border: '1px solid #333'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#fff' }}>Your Projects</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {projects.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#888' }}>No projects yet.</div>
              ) : (
                projects.map((p) => (
                  <div
                    key={p.projectId}
                    onClick={() => setSelectedProjectId(p.projectId)}
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
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px', marginBottom: '4px' }}>
                        {p.projectName}
                        <div style={{ fontSize: '11px', color: '#888', fontWeight: 400, marginTop: '2px' }}>ID: {p.projectId}</div>
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeaveProject(p.projectId);
                      }}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: 'transparent',
                        color: '#ff6b6b',
                        border: '1px solid #5a2a2a',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = '#ff6b6b';
                        e.target.style.backgroundColor = '#2a1a1a';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = '#5a2a2a';
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      Leave
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Checkout / Check-in */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '24px',
          border: '1px solid #333'
        }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#fff' }}>Hardware Operations</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#888' }}>Selected: <strong>{selectedProjectId || 'None'}</strong></p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <form onSubmit={handleCheckout} style={{
              padding: '20px',
              backgroundColor: '#252525',
              border: '1px solid #333'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: '#fff' }}>Checkout Hardware</h3>
              {['HWSet1', 'HWSet2'].map((hw) => (
                <div key={hw} style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{hw}</label>
                  <input
                    type="number"
                    min="0"
                    value={checkoutRequest[hw]}
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
                    onFocus={(e) => e.target.style.borderColor = '#00d9ff'}
                    onBlur={(e) => e.target.style.borderColor = '#333'}
                  />
                </div>
              ))}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#00d9ff',
                  color: '#0a0a0a',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#00c4e0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#00d9ff'}
              >
                Checkout
              </button>
            </form>

            <form onSubmit={handleCheckin} style={{
              padding: '20px',
              backgroundColor: '#252525',
              border: '1px solid #333'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: '#fff' }}>Check-in Hardware</h3>
              {['HWSet1', 'HWSet2'].map((hw) => (
                <div key={hw} style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{hw}</label>
                  <input
                    type="number"
                    min="0"
                    value={checkinRequest[hw]}
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
                    onFocus={(e) => e.target.style.borderColor = '#00d9ff'}
                    onBlur={(e) => e.target.style.borderColor = '#333'}
                  />
                </div>
              ))}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#00d9ff',
                  color: '#0a0a0a',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#00c4e0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#00d9ff'}
              >
                Check-in
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyUserPortal;

