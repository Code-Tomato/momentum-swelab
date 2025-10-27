import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [health, setHealth] = useState(null);
  const [hardwareNames, setHardwareNames] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check server health
    axios.get(`${API_BASE_URL}/health`)
      .then(response => {
        setHealth(response.data);
      })
      .catch(error => {
        console.error('Error checking health:', error);
        setHealth({ status: 'error', message: 'Cannot connect to server' });
      });

    // Load hardware names
    axios.get(`${API_BASE_URL}/get_all_hw_names`)
      .then(response => {
        if (response.data.success) {
          setHardwareNames(response.data.data);
        }
      })
      .catch(error => {
        console.error('Error loading hardware names:', error);
      });
  }, []);

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
        setUser(response.data.user_data);
        alert('Login successful!');
      } else {
        alert('Login failed: ' + response.data.message);
      }
    } catch (error) {
      alert('Login error: ' + error.message);
    }
  };

  const handleCreateUser = async (e) => {
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
        alert('User created successfully!');
        e.target.reset();
      } else {
        alert('User creation failed: ' + response.data.message);
      }
    } catch (error) {
      alert('User creation error: ' + error.message);
    }
  };

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
        // Reload hardware names
        const namesResponse = await axios.get(`${API_BASE_URL}/get_all_hw_names`);
        if (namesResponse.data.success) {
          setHardwareNames(namesResponse.data.data);
        }
      } else {
        alert('Hardware creation failed: ' + response.data.message);
      }
    } catch (error) {
      alert('Hardware creation error: ' + error.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Momentum SWELAB - Hardware Management</h1>
        
        {/* Health Status */}
        <div style={{ margin: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Server Status</h3>
          {health ? (
            <div>
              <p>Status: {health.status}</p>
              <p>MongoDB Connected: {health.mongodb_connected ? 'Yes' : 'No'}</p>
              <p>Message: {health.message}</p>
            </div>
          ) : (
            <p>Checking server status...</p>
          )}
        </div>

        {/* User Login */}
        <div style={{ margin: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Login</h3>
          <form onSubmit={handleLogin}>
            <input name="username" placeholder="Username" required style={{ margin: '5px', padding: '5px' }} />
            <input name="userId" placeholder="User ID" required style={{ margin: '5px', padding: '5px' }} />
            <input name="password" type="password" placeholder="Password" required style={{ margin: '5px', padding: '5px' }} />
            <button type="submit" style={{ margin: '5px', padding: '5px 10px' }}>Login</button>
          </form>
          {user && (
            <div style={{ marginTop: '10px', color: 'green' }}>
              <p>Logged in as: {user.username} (ID: {user.userId})</p>
            </div>
          )}
        </div>

        {/* Create User */}
        <div style={{ margin: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Create New User</h3>
          <form onSubmit={handleCreateUser}>
            <input name="username" placeholder="Username" required style={{ margin: '5px', padding: '5px' }} />
            <input name="userId" placeholder="User ID" required style={{ margin: '5px', padding: '5px' }} />
            <input name="password" type="password" placeholder="Password" required style={{ margin: '5px', padding: '5px' }} />
            <button type="submit" style={{ margin: '5px', padding: '5px 10px' }}>Create User</button>
          </form>
        </div>

        {/* Create Hardware Set */}
        <div style={{ margin: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Create Hardware Set</h3>
          <form onSubmit={handleCreateHardware}>
            <input name="hwSetName" placeholder="Hardware Set Name" required style={{ margin: '5px', padding: '5px' }} />
            <input name="initCapacity" type="number" placeholder="Initial Capacity" required style={{ margin: '5px', padding: '5px' }} />
            <button type="submit" style={{ margin: '5px', padding: '5px 10px' }}>Create Hardware Set</button>
          </form>
        </div>

        {/* Hardware List */}
        <div style={{ margin: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Available Hardware Sets</h3>
          {hardwareNames.length > 0 ? (
            <ul>
              {hardwareNames.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          ) : (
            <p>No hardware sets available or server not connected.</p>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;