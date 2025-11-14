// Shared style objects to reduce duplication across components

export const commonStyles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  
  card: {
    backgroundColor: '#1a1a1a',
    padding: '48px',
    border: '1px solid #333',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  
  cardSmall: {
    backgroundColor: '#1a1a1a',
    padding: '24px',
    border: '1px solid #333'
  },
  
  heading: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: 600,
    color: '#fff'
  },
  
  headingSmall: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff'
  },
  
  subheading: {
    margin: 0,
    fontSize: '14px',
    color: '#888'
  },
  
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#bbb',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  
  input: {
    padding: '10px 12px',
    backgroundColor: '#252525',
    border: '1px solid #333',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  
  inputSmall: {
    padding: '8px 12px',
    backgroundColor: '#252525',
    border: '1px solid #333',
    color: '#fff',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  
  textarea: {
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
  },
  
  primaryButton: {
    padding: '10px 16px',
    backgroundColor: '#00d9ff',
    color: '#0a0a0a',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '8px'
  },
  
  primaryButtonSmall: {
    padding: '8px 12px',
    backgroundColor: '#00d9ff',
    color: '#0a0a0a',
    border: 'none',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  
  secondaryButton: {
    padding: '10px 16px',
    backgroundColor: 'transparent',
    color: '#00d9ff',
    border: '1px solid #00d9ff',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  
  tertiaryButton: {
    padding: '10px 16px',
    backgroundColor: 'transparent',
    color: '#888',
    border: '1px solid #333',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  
  dangerButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#ff6b6b',
    border: '1px solid #5a2a2a',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  
  dangerButtonSmall: {
    padding: '6px 10px',
    backgroundColor: 'transparent',
    color: '#ff6b6b',
    border: '1px solid #5a2a2a',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  },
  
  messageSuccess: {
    padding: '12px',
    backgroundColor: '#1a2a1a',
    border: '1px solid #2a5a2a',
    color: '#6bff6b',
    fontSize: '13px',
    borderRadius: '2px'
  },
  
  messageError: {
    padding: '12px',
    backgroundColor: '#2a1a1a',
    border: '1px solid #5a2a2a',
    color: '#ff6b6b',
    fontSize: '13px',
    borderRadius: '2px'
  },
  
  divider: {
    borderTop: '1px solid #333',
    paddingTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  header: {
    backgroundColor: '#1a1a1a',
    padding: '20px 32px',
    borderBottom: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  headerTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#fff'
  },
  
  navBar: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #333'
  }
};

// Event handlers for interactive elements
export const inputHandlers = {
  onFocus: (e) => {
    e.target.style.borderColor = '#00d9ff';
  },
  onBlur: (e) => {
    e.target.style.borderColor = '#333';
  }
};

export const buttonHandlers = {
  primaryHover: (e) => {
    e.target.style.backgroundColor = '#00c4e0';
  },
  primaryLeave: (e) => {
    e.target.style.backgroundColor = '#00d9ff';
  },
  secondaryHover: (e) => {
    e.target.style.backgroundColor = '#00d9ff';
    e.target.style.color = '#0a0a0a';
  },
  secondaryLeave: (e) => {
    e.target.style.backgroundColor = 'transparent';
    e.target.style.color = '#00d9ff';
  },
  tertiaryHover: (e) => {
    e.target.style.borderColor = '#00d9ff';
    e.target.style.color = '#00d9ff';
  },
  tertiaryLeave: (e) => {
    e.target.style.borderColor = '#333';
    e.target.style.color = '#888';
  },
  dangerHover: (e) => {
    e.target.style.borderColor = '#ff6b6b';
    e.target.style.backgroundColor = '#2a1a1a';
  },
  dangerLeave: (e) => {
    e.target.style.borderColor = '#5a2a2a';
    e.target.style.backgroundColor = 'transparent';
  },
  dangerSmallHover: (e) => {
    e.target.style.borderColor = '#ff6b6b';
    e.target.style.backgroundColor = '#2a1a1a';
  },
  dangerSmallLeave: (e) => {
    e.target.style.borderColor = '#5a2a2a';
    e.target.style.backgroundColor = 'transparent';
  }
};

