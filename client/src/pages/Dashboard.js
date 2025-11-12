import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';


function Dashboard() {
    const navigate = useNavigate();
    const [health, setHealth] = useState(null);
    const [hardwareSets, setHardwareSets] = useState([]);
    const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : null;

    useEffect(() => {
        checkHealth();
        loadHardwareDetails();
    }, []);

    const checkHealth = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/health`);
            setHealth(response.data);
        } catch (error) {
            console.error('Error checking health:', error);
            setHealth({ status: 'error', message: 'Cannot connect to server' });
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
    
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Navbar */}
            <nav style={{
                backgroundColor: '#282c34',
                color: 'white',
                padding: '15px 30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}>
                <h2 style={{ margin: 0 }}>Momentum SWELAB - Hardware Management</h2>
                <div style={{ display: 'flex', gap: '15px' }}></div>
                {user ? (
                    <>
                        <span style={{ alignSelf: 'center' }}>Welcome, {user.username}</span>
                        <button
                            onClick={() => navigate('/portal')}
                            style={{
                                padding: '8px 20px',
                                backgroundColor: '#17a2b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            User Portal
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '8px 20px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                padding: '8px 20px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Register
                        </button>
                    </>
                )}
            </nav>

            {/* Main Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                {/* Hero Section */}
                <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '8px',
                marginBottom: '30px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                <h1 style={{ marginTop: 0, color: '#282c34' }}>Welcome to Momentum SWELAB</h1>
                <p style={{ fontSize: '18px', color: '#666' }}>Manage and track hardware resources for collaborative projects
                </p>
                {!user && (
                    <button
                    onClick={() => navigate('/register')}
                    style={{
                        marginTop: '20px',
                        padding: '12px 30px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                    >
                    Get Started
                    </button>
                )}
                </div>

                {/* Server Status */}
                <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '30px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                <h3 style={{ marginTop: 0 }}>System Status</h3>
                {health ? (
                    <div style={{ display: 'flex', gap: '30px' }}>
                    <div>
                        <strong>Server:</strong>{' '}
                        <span style={{ color: health.status === 'healthy' ? 'green' : 'red' }}>
                        {health.status === 'healthy' ? 'Online' : 'Offline'}
                        </span>
                    </div>
                    <div>
                        <strong>Database:</strong>{' '}
                        <span style={{ color: health.mongodb_connected ? 'green' : 'red' }}>
                        {health.mongodb_connected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                    </div>
                ) : (
                    <p>Checking system status...</p>
                )}
                </div>

                {/* Available Hardware */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                <h3 style={{ marginTop: 0 }}>Available Hardware</h3>
                {hardwareSets.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '20px',
                        marginTop: '20px'
                    }}>
                    {hardwareSets.map((hw, index) => (
                        <div
                        key={index}
                        style={{
                            padding: '20px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            backgroundColor: '#f9f9f9'
                        }}
                        >
                        <h4 style={{ marginTop: 0, color: '#282c34' }}>{hw.hwSetName}</h4>
                        <div style={{ marginTop: '10px' }}>
                            <p style={{ margin: '5px 0' }}>
                            <strong>Total Capacity:</strong> {hw.capacity}
                            </p>
                            <p style={{ margin: '5px 0' }}>
                            <strong>Available:</strong>{' '}
                            <span style={{
                                color: hw.availability > 0 ? 'green' : 'red',
                                fontWeight: 'bold'
                            }}>
                                {hw.availability}
                            </span>
                            </p>
                        </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <p style={{ color: '#666' }}>No hardware sets available at the moment.</p>
                )}
            </div>
        </div>
    </div>
  );
}

export default Dashboard;