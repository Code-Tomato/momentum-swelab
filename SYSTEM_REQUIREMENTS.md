# System Requirements

## Functional Requirements

### User Management (FR-1)
- **FR-1.1**: Users can register with username, email, and password
- **FR-1.2**: Users can log in with username and password
- **FR-1.3**: Users can reset forgotten passwords
- **FR-1.4**: User sessions are maintained during active use
- **FR-1.5**: Users can log out

### Project Management (FR-2)
- **FR-2.1**: Users can create new projects with ID, name, and description
- **FR-2.2**: Users can join existing projects by project ID
- **FR-2.3**: Users can leave projects
- **FR-2.4**: Users can view all projects they belong to
- **FR-2.5**: Users are automatically added to projects they create

### Hardware Management (FR-3)
- **FR-3.1**: System displays available hardware sets (HWSet1, HWSet2)
- **FR-3.2**: System displays total capacity for each hardware set
- **FR-3.3**: Users can checkout hardware for their projects
- **FR-3.4**: Users can check-in hardware back to the system
- **FR-3.5**: System prevents checkout if insufficient availability
- **FR-3.6**: System prevents check-in of more than checked out
- **FR-3.7**: Hardware availability updates in real-time
- **FR-3.8**: System tracks hardware usage per project

### User Interface (FR-4)
- **FR-4.1**: Dashboard displays system status
- **FR-4.2**: Dashboard shows hardware availability (logged-in users only)
- **FR-4.3**: User portal displays user's projects
- **FR-4.4**: User portal displays hardware inventory
- **FR-4.5**: Forms provide validation feedback
- **FR-4.6**: Success/error messages are clearly displayed
- **FR-4.7**: Loading states indicate async operations

### Security (FR-5)
- **FR-5.1**: Passwords are encrypted before storage
- **FR-5.2**: Hardware data only visible to authenticated users
- **FR-5.3**: API endpoints validate user authorization
- **FR-5.4**: CORS is restricted to allowed origins
- **FR-5.5**: Input validation prevents malicious data

### Accessibility (FR-6)
- **FR-6.1**: Forms have ARIA labels
- **FR-6.2**: Error messages are associated with inputs
- **FR-6.3**: Keyboard navigation is supported
- **FR-6.4**: Color indicators have text alternatives

## Non-Functional Requirements

### Performance (NFR-1)
- **NFR-1.1**: Page load time < 2 seconds
- **NFR-1.2**: API response time < 500ms
- **NFR-1.3**: System supports concurrent users

### Reliability (NFR-2)
- **NFR-2.1**: System handles database connection failures gracefully
- **NFR-2.2**: Error messages guide users to resolution
- **NFR-2.3**: System validates data before database operations

### Usability (NFR-3)
- **NFR-3.1**: Interface is intuitive and easy to navigate
- **NFR-3.2**: Forms provide clear validation feedback
- **NFR-3.3**: Error messages are user-friendly
- **NFR-3.4**: Loading indicators show operation status

### Scalability (NFR-4)
- **NFR-4.1**: System can handle multiple hardware sets (not just 2)
- **NFR-4.2**: Database can scale horizontally
- **NFR-4.3**: Frontend can be served via CDN

### Security (NFR-5)
- **NFR-5.1**: Passwords are never stored in plain text
- **NFR-5.2**: API endpoints require authentication where needed
- **NFR-5.3**: CORS prevents unauthorized access
- **NFR-5.4**: Input sanitization prevents injection attacks

## System Constraints

### Technical Constraints
- **TC-1**: Frontend must work in modern browsers (Chrome, Firefox, Safari)
- **TC-2**: Backend requires Python 3.11+
- **TC-3**: Database requires MongoDB
- **TC-4**: Deployment uses GitHub Pages (frontend) and Render (backend)

### Business Constraints
- **BC-1**: System must be free/low-cost to host
- **BC-2**: System must be maintainable by small team
- **BC-3**: System must support existing hardware sets (HWSet1, HWSet2)
