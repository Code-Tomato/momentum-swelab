# Import necessary libraries and modules
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from itsdangerous import URLSafeTimedSerializer
import smtplib
from email.mime.text import MIMEText

# Import custom modules for database interactions
import usersDatabase
import projectsDatabase
import hardwareDatabase
import db_utils

# Initialize a new Flask web application
# Determine static folder path - works for both local dev and Render deployment
static_folder_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'client', 'build')
if not os.path.exists(static_folder_path):
    # Fallback: try relative path from server directory
    static_folder_path = '../client/build'

app = Flask(__name__, static_folder=static_folder_path, static_url_path='/')

# Configure CORS to allow GitHub Pages and local development
# Get allowed origins from environment or use defaults
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', 
    'http://localhost:3000,http://localhost:5000,https://Code-Tomato.github.io'
).split(',')

CORS(app, resources={
    r"/*": {
        "origins": [origin.strip() for origin in ALLOWED_ORIGINS],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.errorhandler(404)
def not_found(e):
    # Serve index.html for 404s so React Router can handle client-side routing
    if os.path.exists(app.static_folder) and os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    return jsonify({'error': 'Not found', 'message': 'The requested resource was not found.'}), 404

# Health check route
@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    
    Returns:
        JSON response with system status and MongoDB connection status.
        
    Example Response:
        {
            "status": "healthy",
            "mongodb_connected": true,
            "message": "All systems operational"
        }
    """
    mongo_status = db_utils.test_mongodb_connection()
    return jsonify({
        'status': 'healthy',
        'mongodb_connected': mongo_status,
        'message': 'MongoDB connection required for full functionality' if not mongo_status else 'All systems operational'
    })

# Route for user login
@app.route('/login', methods=['POST'])
@db_utils.with_db_connection
def login(client):
    """
    Authenticate a user and establish a session.
    
    Request Body:
        {
            "username": str (required),
            "password": str (required)
        }
    
    Returns:
        JSON response with success status and user information.
        
    Example Request:
        {
            "username": "johndoe",
            "password": "securepassword123"
        }
        
    Example Response:
        {
            "success": true,
            "message": "Login successful",
            "user_data": {
                "username": "john",
                "email": "john@example.com",
                "projects": []
            }
        }
        
    Status Codes:
        200 OK - Login successful
        401 Unauthorized - Invalid credentials
        400 Bad Request - Missing required fields
    """
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Validate required fields
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password are required'})

    # Attempt to log in the user using the usersDatabase module
    result = usersDatabase.login(client, username, password)
    return jsonify(result)

# Route for the main page (Work in progress)
@app.route('/main')
@db_utils.with_db_connection
def mainPage(client):
    username = request.args.get('username')
    
    # Fetch user projects using the usersDatabase module
    result = usersDatabase.getUserProjectsList(client, username)
    return jsonify(result)

# Route for joining a project
@app.route('/join_project', methods=['POST'])
@db_utils.with_db_connection
def join_project(client):
    data = request.get_json()
    username = data.get('username')
    projectId = data.get('projectId')

    # Validate required fields
    if not username or not projectId:
        return jsonify({'success': False, 'message': 'username and projectId are required'})

    # Attempt to join the project using the usersDatabase module
    user_result = usersDatabase.joinProject(client, username, projectId)
    if user_result['success']:
        # Also add user to project in projects collection
        project_result = projectsDatabase.addUser(client, projectId, username)
        if project_result['success']:
            return jsonify({'success': True, 'message': 'Successfully joined project'})
        else:
            # Rollback: remove user from user's project list if project add failed
            usersDatabase.leaveProject(client, username, projectId)
            return jsonify(project_result)
    else:
        return jsonify(user_result)
    
# remove_user_from_project
@app.route('/remove_user_from_project', methods=['POST'])
@db_utils.with_db_connection
def remove_user_from_project(client):
    data = request.get_json()
    username = data.get('username')
    projectId = data.get('projectId')
    
    # Validate required fields
    if not username or not projectId:
        return jsonify({'success': False, 'message': 'username and projectId are required'})
    
    # remove user from both user and project collections
    user_result = usersDatabase.leaveProject(client, username, projectId)
    project_result = projectsDatabase.removeUser(client, projectId, username)
    
    # Check if both operations succeeded
    if user_result['success'] and project_result['success']:
        return jsonify({'success': True, 'message': 'User left project'})
    elif not user_result['success']:
        return jsonify(user_result)
    else:
        return jsonify(project_result)


# Route for user registration (frontend uses this)
@app.route('/register', methods=['POST'])
@db_utils.with_db_connection
def register(client):
    """
    Register a new user account.
    
    Request Body:
        {
            "username": str (required),
            "email": str (required),
            "password": str (required)
        }
    
    Returns:
        JSON response with success status.
        
    Example Request:
        {
            "username": "johndoe",
            "email": "john@example.com",
            "password": "securepassword123"
        }
        
    Example Response:
        {
            "success": true,
            "message": "User registered successfully"
        }
        
    Status Codes:
        200 OK - Registration successful
        400 Bad Request - Missing required fields or validation error
    """
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Validate required fields
    if not username or not email or not password:
        return jsonify({'success': False, 'message': 'Username, email, and password are required'})

    # Basic email format validation
    if '@' not in email or '.' not in email.split('@')[1]:
        return jsonify({'success': False, 'message': 'Invalid email format'})

    # Username validation
    if len(username) < 3:
        return jsonify({'success': False, 'message': 'Username must be at least 3 characters long'})
    
    # Attempt to add the user using the usersDatabase module
    # Database will check for username uniqueness
    result = usersDatabase.addUser(client, username, email, password)
    return jsonify(result)

# Route for adding a new user (legacy/API endpoint)
@app.route('/add_user', methods=['POST'])
@db_utils.with_db_connection
def add_user(client):
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Validate required fields
    if not username or not email or not password:
        return jsonify({'success': False, 'message': 'Username, email, and password are required'})

    # Attempt to add the user using the usersDatabase module
    result = usersDatabase.addUser(client, username, email, password)
    return jsonify(result)

# Route for getting the list of user projects
@app.route('/get_user_projects_list', methods=['POST'])
@db_utils.with_db_connection
def get_user_projects_list(client):
    data = request.get_json()
    username = data.get('username')

    # Validate required fields
    if not username:
        return jsonify({'success': False, 'message': 'username is required'})

    # Fetch the user's projects using the usersDatabase module
    result = usersDatabase.getUserProjectsList(client, username)
    return jsonify(result)

# Route for creating a new project
@app.route('/create_project', methods=['POST'])
@db_utils.with_db_connection
def create_project(client):
    """
    Create a new project.
    
    Request Body:
        {
            "projectName": str (required),
            "projectId": str (required),
            "description": str (optional)
        }
    
    Returns:
        JSON response with success status.
        
    Example Request:
        {
            "projectName": "Machine Learning Research",
            "projectId": "ML-2024-001",
            "description": "Research project on neural networks"
        }
        
    Example Response:
        {
            "success": true,
            "message": "Project created successfully"
        }
        
    Status Codes:
        200 OK - Project created successfully
        400 Bad Request - Missing required fields or project ID already exists
    """
    data = request.get_json()
    projectName = data.get('projectName')
    projectId = data.get('projectId')
    description = data.get('description', '')
    username = data.get('username')  # Get username for project owner

    # Validate required fields
    if not projectName or not projectId:
        return jsonify({'success': False, 'message': 'projectName and projectId are required'})

    # Attempt to create the project using the projectsDatabase module
    result = projectsDatabase.createProject(client, projectName, projectId, description, owner=username)
    return jsonify(result)

# Route for getting project information
@app.route('/get_project_info', methods=['POST'])
@db_utils.with_db_connection
def get_project_info(client):
    data = request.get_json()
    projectId = data.get('projectId')

    # Fetch project information using the projectsDatabase module
    result = projectsDatabase.queryProject(client, projectId)
    return jsonify(result)

# Route for deleting a project
@app.route('/delete_project', methods=['POST'])
@db_utils.with_db_connection
def delete_project(client):
    """
    Delete a project (only owner can delete).
    
    Request Body:
        {
            "projectId": str (required),
            "username": str (required)
        }
    
    Returns:
        JSON response with success status.
    """
    data = request.get_json()
    projectId = data.get('projectId')
    username = data.get('username')

    # Validate required fields
    if not projectId or not username:
        return jsonify({'success': False, 'message': 'projectId and username are required'})

    # Attempt to delete the project using the projectsDatabase module
    result = projectsDatabase.deleteProject(client, projectId, username)
    return jsonify(result)

# Route for getting all hardware sets with details
@app.route('/get_all_hardware', methods=['GET'])
@db_utils.with_db_connection
def get_all_hardware(client):
    # Fetch all hardware sets with full details using the hardwareDatabase module
    result = hardwareDatabase.getAllHardwareSets(client)
    return jsonify(result)

# Route for getting all hardware names (legacy endpoint)
@app.route('/get_all_hw_names', methods=['GET'])
@db_utils.with_db_connection
def get_all_hw_names(client):
    # Fetch all hardware names using the hardwareDatabase module
    result = hardwareDatabase.getAllHwNames(client)
    return jsonify(result)

# Route for getting hardware information
@app.route('/get_hw_info', methods=['POST'])
@db_utils.with_db_connection
def get_hw_info(client):
    data = request.get_json()
    hwSetName = data.get('hwSetName')

    # Fetch hardware set information using the hardwareDatabase module
    result = hardwareDatabase.queryHardwareSet(client, hwSetName)
    return jsonify(result)

# Route for checking out hardware
@app.route('/check_out', methods=['POST'])
@db_utils.with_db_connection
def check_out(client):
    """
    Check out hardware from a hardware set for a project.
    
    Request Body:
        {
            "projectId": str (required),
            "hwSetName": str (required),
            "qty": int (required, must be positive),
            "username": str (required)
        }
    
    Returns:
        JSON response with success status and updated availability.
        
    Example Request:
        {
            "projectId": "ML-2024-001",
            "hwSetName": "HWSet1",
            "qty": 5,
            "username": "john"
        }
        
    Example Response:
        {
            "success": true,
            "message": "Hardware checked out successfully",
            "availability": 40
        }
        
    Status Codes:
        200 OK - Checkout successful
        400 Bad Request - Missing required fields, invalid quantity, or insufficient availability
    """
    data = request.get_json()
    projectId = data.get('projectId')
    hwSetName = data.get('hwSetName')
    qty = data.get('qty')
    username = data.get('username')

    # Validate required fields
    if not projectId or not hwSetName or qty is None or not username:
        return jsonify({'success': False, 'message': 'projectId, hwSetName, qty, and username are required'})
    
    # Validate qty is numeric and positive
    try:
        qty = int(qty)
        if qty <= 0:
            return jsonify({'success': False, 'message': 'qty must be a positive integer'})
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'qty must be a valid number'})

    # Attempt to check out the hardware using the projectsDatabase module
    result = projectsDatabase.checkOutHW(client, projectId, hwSetName, qty, username)
    return jsonify(result)

# Route for checking in hardware
@app.route('/check_in', methods=['POST'])
@db_utils.with_db_connection
def check_in(client):
    """
    Check in hardware back to a hardware set from a project.
    
    Request Body:
        {
            "projectId": str (required),
            "hwSetName": str (required),
            "qty": int (required, must be positive),
            "username": str (required)
        }
    
    Returns:
        JSON response with success status and updated availability.
        
    Example Request:
        {
            "projectId": "ML-2024-001",
            "hwSetName": "HWSet1",
            "qty": 3,
            "username": "john"
        }
        
    Example Response:
        {
            "success": true,
            "message": "Hardware checked in successfully",
            "availability": 48
        }
        
    Status Codes:
        200 OK - Check-in successful
        400 Bad Request - Missing required fields, invalid quantity, or attempting to check in more than checked out
    """
    data = request.get_json()
    projectId = data.get('projectId')
    hwSetName = data.get('hwSetName')
    qty = data.get('qty')
    username = data.get('username')

    # Validate required fields
    if not projectId or not hwSetName or qty is None or not username:
        return jsonify({'success': False, 'message': 'projectId, hwSetName, qty, and username are required'})
    
    # Validate qty is numeric and positive
    try:
        qty = int(qty)
        if qty <= 0:
            return jsonify({'success': False, 'message': 'qty must be a positive integer'})
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'qty must be a valid number'})

    # Attempt to check in the hardware using the projectsDatabase module
    result = projectsDatabase.checkInHW(client, projectId, hwSetName, qty, username)
    return jsonify(result)

# Route for creating a new hardware set
@app.route('/create_hardware_set', methods=['POST'])
@db_utils.with_db_connection
def create_hardware_set(client):
    data = request.get_json()
    hwSetName = data.get('hwSetName')
    initCapacity = data.get('initCapacity')

    # Attempt to create the hardware set using the hardwareDatabase module
    result = hardwareDatabase.createHardwareSet(client, hwSetName, initCapacity)
    return jsonify(result)

# Route for checking the inventory of projects
@app.route('/api/inventory', methods=['GET'])
@db_utils.with_db_connection
def check_inventory(client):
    # Fetch all projects from the projects collection
    db = db_utils.get_database(client)
    projects_collection = db['projects']
    projects = list(projects_collection.find({}))
    
    # Convert ObjectId to string for JSON serialization
    for project in projects:
        project['_id'] = str(project['_id'])
    
    return jsonify({'success': True, 'data': projects})


serializer = URLSafeTimedSerializer(os.environ.get("SECRET_KEY", "default-secret"))

# forgot my password section
def send_reset_email(email, token):
    reset_link = f"{os.environ.get('FRONTEND_URL')}/reset-password/{token}"

    msg = MIMEText(f"""
        You requested a password reset.

        Click the link below to reset your password:
        {reset_link}

        This link expires in 30 minutes.
    """)
    msg['Subject'] = 'Password Reset'
    msg['From'] = os.environ['EMAIL_USER']
    msg['To'] = email

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login(os.environ['EMAIL_USER'], os.environ['EMAIL_PASS'])
        smtp.send_message(msg)


@app.route('/forgot-password', methods=['POST'])
@db_utils.with_db_connection
def forgot_password(client):
    data = request.get_json()
    email = data.get('email')

    # Validate required fields
    if not email:
        return jsonify({'success': False, 'message': 'Email is required'})

    # Basic email format validation
    if '@' not in email or '.' not in email.split('@')[1]:
        return jsonify({'success': False, 'message': 'Invalid email format'})

    # Check if email exists in DB
    user = usersDatabase.getUserByEmail(client, email)
    if not user:
        return jsonify({'success': True, 'message': 'If the email exists, a reset link has been sent.'})

    # Create token
    token = serializer.dumps(email)

    # Send email
    try:
        send_reset_email(email, token)
        return jsonify({'success': True, 'message': 'Reset link sent to your email.'})
    except Exception as e:
        print("Email error:", e)
        return jsonify({'success': False, 'message': 'Failed to send email.'})
    

@app.route('/reset-password', methods=['POST'])
@db_utils.with_db_connection
def reset_password(client):
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')

    # Validate required fields
    if not token:
        return jsonify({'success': False, 'message': 'Token is required'})
    
    if not new_password:
        return jsonify({'success': False, 'message': 'Password is required'})

    try:
        email = serializer.loads(token, max_age=1800)  # token expires in 30 minutes
    except Exception:
        return jsonify({'success': False, 'message': 'Invalid or expired token'})

    # Update password in DB
    result = usersDatabase.updatePassword(client, email, new_password)
    return jsonify(result)

# Route for dropping userId index (admin utility)
@app.route('/admin/drop_userid_index', methods=['POST'])
@db_utils.with_db_connection
def drop_userid_index_route(client):
    """
    Drop the userId unique index from the users collection.
    This is a one-time operation to fix the duplicate key error.
    """
    result = db_utils.drop_userId_index()
    return jsonify(result)

# Route for deleting a user account
@app.route('/delete_account', methods=['POST'])
@db_utils.with_db_connection
def delete_account(client):
    """
    Delete a user account.
    
    Request Body:
        {
            "username": str (required),
            "password": str (required)
        }
    
    Returns:
        JSON response with success status.
    """
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Validate required fields
    if not username or not password:
        return jsonify({'success': False, 'message': 'username and password are required'})

    # Attempt to delete the account using the usersDatabase module
    result = usersDatabase.deleteUser(client, username, password)
    return jsonify(result)

# Serve React App - catch all routes that aren't API routes
# This must be LAST so API routes are matched first
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # For all frontend routes, serve index.html so React Router can handle routing
    if not os.path.exists(app.static_folder) or not os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return jsonify({
            'error': 'Frontend not built',
            'message': 'The React app build folder is missing. Please ensure the frontend is built before deployment.',
            'static_folder': app.static_folder
        }), 503
    
    return send_from_directory(app.static_folder, 'index.html')

# Main entry point for the application
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)