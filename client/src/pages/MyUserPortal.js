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

  async function fetchProjects() {
    try {
      const res = await fetch(`${API_BASE}/get_user_projects_list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchHardware() {
    try {
      const res = await fetch(`${API_BASE}/get_all_hardware`);
      const data = await res.json();
      if (data.success && data.data) {
        const hw = {};
        data.data.forEach((h) => {
          hw[h.hwSetName] = { capacity: h.capacity, available: h.available };
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
  }

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
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">User Portal — Secondary Dashboard</h1>
        <div>
          <span className="mr-4">Signed in as <strong>{userId}</strong></span>
          <button onClick={logout} className="px-3 py-1 border rounded">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Create Project</h2>
          <form onSubmit={handleCreateProject} className="space-y-2">
            <input placeholder="Project ID" value={createForm.projectId} onChange={(e) => setCreateForm({ ...createForm, projectId: e.target.value })} className="w-full p-2 border rounded" />
            <input placeholder="Project Name" value={createForm.projectName} onChange={(e) => setCreateForm({ ...createForm, projectName: e.target.value })} className="w-full p-2 border rounded" />
            <textarea placeholder="Description" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className="w-full p-2 border rounded" />
            <button type="submit" className="px-3 py-1 border rounded">Create</button>
          </form>

          <hr className="my-4" />

          <h2 className="font-semibold mb-2">Join Project</h2>
          <form onSubmit={handleJoinProject} className="flex gap-2">
            <input placeholder="Existing Project ID" value={joinProjectId} onChange={(e) => setJoinProjectId(e.target.value)} className="flex-1 p-2 border rounded" />
            <button type="submit" className="px-3 py-1 border rounded">Join</button>
          </form>

          {message && <div className="mt-3 p-2 bg-gray-100 rounded">{message}</div>}
        </div>

        <div className="col-span-1 bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Hardware Sets</h2>
          <div className="space-y-3">
            {Object.keys(globalHW).map((hw) => (
              <div key={hw} className="p-2 border rounded">
                <div className="flex justify-between"><strong>{hw}</strong><span>Capacity: {globalHW[hw].capacity}</span></div>
                <div className="flex justify-between"><span>Available:</span><span>{globalHW[hw].available}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-1 bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Projects</h2>
          <div className="space-y-3 max-h-96 overflow-auto">
            {projects.length === 0 && <div className="text-sm text-gray-500">No projects yet.</div>}
            {projects.map((p) => (
              <div key={p.projectId} onClick={() => setSelectedProjectId(p.projectId)} className={`p-2 border rounded cursor-pointer ${selectedProjectId === p.projectId ? 'bg-green-100' : ''}`}>
                <div className="font-medium">{p.projectName} <small>({p.projectId})</small></div>
                <div className="text-sm text-gray-600">{p.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-2">Checkout / Check-in</h2>
        <div className="text-sm mb-2">Selected project: <strong>{selectedProjectId || 'None'}</strong></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form onSubmit={handleCheckout} className="p-3 border rounded">
            <h3 className="font-medium mb-2">Checkout</h3>
            {['HWSet1', 'HWSet2'].map((hw) => (
              <div key={hw} className="mb-2">
                <label className="block text-sm">{hw}</label>
                <input type="number" min="0" value={checkoutRequest[hw]} onChange={(e) => setCheckoutRequest({ ...checkoutRequest, [hw]: e.target.value })} className="w-full p-2 border rounded" />
              </div>
            ))}
            <button type="submit" className="px-3 py-1 border rounded">Checkout</button>
          </form>

          <form onSubmit={handleCheckin} className="p-3 border rounded">
            <h3 className="font-medium mb-2">Check-in</h3>
            {['HWSet1', 'HWSet2'].map((hw) => (
              <div key={hw} className="mb-2">
                <label className="block text-sm">{hw}</label>
                <input type="number" min="0" value={checkinRequest[hw]} onChange={(e) => setCheckinRequest({ ...checkinRequest, [hw]: e.target.value })} className="w-full p-2 border rounded" />
              </div>
            ))}
            <button type="submit" className="px-3 py-1 border rounded">Check-in</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MyUserPortal;
