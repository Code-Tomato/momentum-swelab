# Import necessary libraries and modules
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Import custom modules for database interactions
import usersDatabase
import projectsDatabase
import hardwareDatabase
import db_utils

# Initialize a new Flask web application
app = Flask(__name__, static_folder='../client/build', static_url_path='/')

# Configure CORS to allow GitHub Pages and local development
CORS(app, resources={
    r"/*": {
        "origins": "*"  # For now, allow all. Update to specific origins for production security
    }
})

# Serve React App
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')

# Health check route
@app.route('/health', methods=['GET'])
def health_check():
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
    data = request.get_json()
    username = data.get('username')
    userId = data.get('userId')  # Optional - for backward compatibility
    password = data.get('password')

    # Validate required fields
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password are required'})

    # Attempt to log in the user using the usersDatabase module
    result = usersDatabase.login(client, username, userId, password)
    return jsonify(result)

# Route for the main page (Work in progress)
@app.route('/main')
@db_utils.with_db_connection
def mainPage(client):
    userId = request.args.get('userId')
    
    # Fetch user projects using the usersDatabase module
    result = usersDatabase.getUserProjectsList(client, userId)
    return jsonify(result)

# Route for joining a project
@app.route('/join_project', methods=['POST'])
@db_utils.with_db_connection
def join_project(client):
    data = request.get_json()
    userId = data.get('userId')
    projectId = data.get('projectId')

    # Attempt to join the project using the usersDatabase module
    user_result = usersDatabase.joinProject(client, userId, projectId)
    if user_result['success']:
        # Also add user to project in projects collection
        project_result = projectsDatabase.addUser(client, projectId, userId)
        if project_result['success']:
            return jsonify({'success': True, 'message': 'Successfully joined project'})
        else:
            return jsonify(project_result)
    else:
        return jsonify(user_result)

# Route for user registration (frontend uses this)
@app.route('/register', methods=['POST'])
@db_utils.with_db_connection
def register(client):
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Validate required fields
    if not username or not email or not password:
        return jsonify({'success': False, 'message': 'Username, email, and password are required'})

    # Use email as userId (or you could generate a unique ID)
    userId = email.split('@')[0]  # Use email prefix as userId, or use email itself
    
    # Attempt to add the user using the usersDatabase module
    result = usersDatabase.addUser(client, username, userId, password)
    return jsonify(result)

# Route for adding a new user (legacy/API endpoint)
@app.route('/add_user', methods=['POST'])
@db_utils.with_db_connection
def add_user(client):
    data = request.get_json()
    username = data.get('username')
    userId = data.get('userId')
    password = data.get('password')

    # Attempt to add the user using the usersDatabase module
    result = usersDatabase.addUser(client, username, userId, password)
    return jsonify(result)

# Route for getting the list of user projects
@app.route('/get_user_projects_list', methods=['POST'])
@db_utils.with_db_connection
def get_user_projects_list(client):
    data = request.get_json()
    userId = data.get('userId')

    # Fetch the user's projects using the usersDatabase module
    result = usersDatabase.getUserProjectsList(client, userId)
    return jsonify(result)

# Route for creating a new project
@app.route('/create_project', methods=['POST'])
@db_utils.with_db_connection
def create_project(client):
    data = request.get_json()
    projectName = data.get('projectName')
    projectId = data.get('projectId')
    description = data.get('description')

    # Attempt to create the project using the projectsDatabase module
    result = projectsDatabase.createProject(client, projectName, projectId, description)
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
    data = request.get_json()
    projectId = data.get('projectId')
    hwSetName = data.get('hwSetName')
    qty = data.get('qty')
    userId = data.get('userId')

    # Attempt to check out the hardware using the projectsDatabase module
    result = projectsDatabase.checkOutHW(client, projectId, hwSetName, qty, userId)
    return jsonify(result)

# Route for checking in hardware
@app.route('/check_in', methods=['POST'])
@db_utils.with_db_connection
def check_in(client):
    data = request.get_json()
    projectId = data.get('projectId')
    hwSetName = data.get('hwSetName')
    qty = data.get('qty')
    userId = data.get('userId')

    # Attempt to check in the hardware using the projectsDatabase module
    result = projectsDatabase.checkInHW(client, projectId, hwSetName, qty, userId)
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

# Main entry point for the application
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)