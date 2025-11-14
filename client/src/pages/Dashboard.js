import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { commonStyles, buttonHandlers } from '../styles/sharedStyles';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';


function Dashboard() {
    const navigate = useNavigate();
    const [health, setHealth] = useState(null);
    const [hardwareSets, setHardwareSets] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : null;

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

    const handleLogout = () => {
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('user');
        setDropdownOpen(false);
        navigate('/login');
    };

    useEffect(() => {
        checkHealth();
        // Only load hardware details if user is logged in
        if (user) {
            loadHardwareDetails();
        }
    }, [user]);

    const checkHealth = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/health`);
            setHealth(response.data);
        } catch (error) {
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
        // Error loading hardware details
        }
    };
    
    return (
        <div style={commonStyles.pageContainer}>
            <nav style={commonStyles.navBar}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Momentum SWELAB</h2>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <button
                                onClick={() => navigate('/portal')}
                                style={commonStyles.primaryButtonSmall}
                                onMouseEnter={buttonHandlers.primaryHover}
                                onMouseLeave={buttonHandlers.primaryLeave}
                                aria-label="Go to portal"
                            >
                                Portal
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
                                    <span>{user.username}</span>
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
                                            onClick={handleLogout}
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
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/login')}
                                style={commonStyles.secondaryButton}
                                onMouseEnter={buttonHandlers.secondaryHover}
                                onMouseLeave={buttonHandlers.secondaryLeave}
                                aria-label="Login"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                style={commonStyles.tertiaryButton}
                                onMouseEnter={buttonHandlers.tertiaryHover}
                                onMouseLeave={buttonHandlers.tertiaryLeave}
                                aria-label="Register"
                            >
                                Register
                            </button>
                        </>
                    )}
                </div>
            </nav>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px' }}>
                {/* Hero Section */}
                <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '48px 32px',
                    border: '1px solid #333',
                    marginBottom: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 600, color: '#fff' }}>Welcome to Momentum SWELAB</h1>
                        <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#888' }}>Manage and track hardware resources for collaborative projects</p>
                    </div>
                    {!user && (
                        <button
                            onClick={() => navigate('/register')}
                            style={{ ...commonStyles.primaryButton, marginTop: '16px', width: 'fit-content' }}
                            onMouseEnter={buttonHandlers.primaryHover}
                            onMouseLeave={buttonHandlers.primaryLeave}
                            aria-label="Get started"
                        >
                            Get Started
                        </button>
                    )}
                </div>

                {/* System Status */}
                <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '24px 32px',
                    border: '1px solid #333',
                    marginBottom: '32px'
                }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: 600, color: '#fff' }}>System Status</h3>
                    {health ? (
                        <div style={{ display: 'flex', gap: '48px' }}>
                            <div>
                                <div style={{ fontSize: '13px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Server</div>
                                <div style={{ color: health.status === 'healthy' ? '#6bff6b' : '#ff6b6b', fontSize: '14px', fontWeight: 500 }}>
                                    {'●'} {health.status === 'healthy' ? 'Online' : 'Offline'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '13px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Database</div>
                                <div style={{ color: health.mongodb_connected ? '#6bff6b' : '#ff6b6b', fontSize: '14px', fontWeight: 500 }}>
                                    {'●'} {health.mongodb_connected ? 'Connected' : 'Disconnected'}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Checking system status...</p>
                    )}
                </div>

                {/* Available Hardware - Only visible to logged-in users */}
                {user && (
                    <div>
                        <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: 600, color: '#fff' }}>Available Hardware</h3>
                        {hardwareSets.length > 0 ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '20px'
                            }}>
                                {hardwareSets.map((hw, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '24px',
                                            backgroundColor: '#1a1a1a',
                                            border: '1px solid #333',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '16px'
                                        }}
                                    >
                                        <h4 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: 600 }}>{hw.hwSetName}</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                                <span style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Capacity</span>
                                                <span style={{ color: '#fff', fontWeight: 500 }}>{hw.capacity}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                                <span style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available</span>
                                                <span style={{ color: hw.availability > 0 ? '#6bff6b' : '#ff6b6b', fontWeight: 600 }}>
                                                    {hw.availability}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ backgroundColor: '#1a1a1a', padding: '24px', border: '1px solid #333', color: '#888', fontSize: '14px' }}>
                                No hardware sets available at the moment.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;