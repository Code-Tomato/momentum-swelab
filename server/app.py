# Import necessary libraries and modules
import os
from bson.objectid import ObjectId
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient

# Import custom modules for database interactions
import usersDatabase
import projectsDatabase
import hardwareDatabase

# Define the MongoDB connection string
# Use environment variable for production (Heroku) or fallback to local
MONGODB_SERVER = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/')

# Test MongoDB connection function
def test_mongodb_connection():
    try:
        # Increase timeout for cloud connections
        client = MongoClient(MONGODB_SERVER, serverSelectionTimeoutMS=10000)
        # Force connection attempt
        client.server_info()
        client.close()
        return True
    except Exception as e:
        print(f"MongoDB connection error: {str(e)}")
        return False

# Initialize a new Flask web application
app = Flask(__name__, static_folder='../client/build', static_url_path='/')
CORS(app)  # Enable CORS for all routes

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
    mongo_status = test_mongodb_connection()
    return jsonify({
        'status': 'healthy',
        'mongodb_connected': mongo_status,
        'message': 'MongoDB connection required for full functionality' if not mongo_status else 'All systems operational'
    })

# Route for user login
@app.route('/login', methods=['POST'])
def login():
    # Extract data from request
    data = request.get_json()
    username = data.get('username')
    userId = data.get('userId')
    password = data.get('password')

    # Connect to MongoDB
    client = MongoClient(MONGODB_SERVER)

    try:
        # Attempt to log in the user using the usersDatabase module
        result = usersDatabase.login(client, username, userId, password)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    finally:
        # Close the MongoDB connection
        client.close()

# Route for the main page (Work in progress)
@app.route('/main')
def mainPage():
    # Extract data from request
    userId = request.args.get('userId')

    # Connect to MongoDB
    client = MongoClient(MONGODB_SERVER)

    try:
        # Fetch user projects using the usersDatabase module
        result = usersDatabase.getUserProjectsList(client, userId)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    finally:
        # Close the MongoDB connection
        client.close()

# Route for joining a project
@app.route('/join_project', methods=['POST'])
def join_project():
    # Extract data from request
    data = request.get_json()
    userId = data.get('userId')
    projectId = data.get('projectId')

    # Connect to MongoDB
    client = MongoClient(MONGODB_SERVER)

    try:
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
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    finally:
        # Close the MongoDB connection
        client.close()

# Route for adding a new user
@app.route('/add_user', methods=['POST'])
def add_user():
    # Extract data from request
    data = request.get_json()
    username = data.get('username')
    userId = data.get('userId')
    password = data.get('password')

    # Connect to MongoDB
    client = MongoClient(MONGODB_SERVER)

    try:
        # Attempt to add the user using the usersDatabase module
        result = usersDatabase.addUser(client, username, userId, password)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    finally:
        # Close the MongoDB connection
        client.close()

# Route for getting the list of user projects
@app.route('/get_user_projects_list', methods=['POST'])
def get_user_projects_list():
    # Extract data from request
    data = request.get_json()
    userId = data.get('userId')

    # Connect to MongoDB
    client = MongoClient(MONGODB_SERVER)

    try:
        # Fetch the user's projects using the usersDatabase module
        result = usersDatabase.getUserProjectsList(client, userId)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    finally:
        # Close the MongoDB connection
        client.close()

# Route for creating a new project
@app.route('/create_project', methods=['POST'])
def create_project():
    # Extract data from request
    data = request.get_json()
    projectName = data.get('projectName')
    projectId = data.get('projectId')
    description = data.get('description')

    # Connect to MongoDB
    client = MongoClient(MONGODB_SERVER)

    try:
        # Attempt to create the project using the projectsDatabase module
        result = projectsDatabase.createProject(client, projectName, projectId, description)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    finally:
        # Close the MongoDB connection
        client.close()

# Route for getting project information
@app.route('/get_project_info', methods=['POST'])
def get_project_info():
    # Extract data from request
    data = request.get_json()
    projectId = data.get('projectId')

    # Connect to MongoDB
    client = MongoClient(MONGODB_SERVER)

    try:
        # Fetch project information using the projectsDatabase module
        result = projectsDatabase.queryProject(client, projectId)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    finally:
        # Close the MongoDB connection
        client.close()

# Route for getting all hardware names
@app.route('/get_all_hw_names', methods=['GET'])
def get_all_hw_names():
    # Connect to MongoDB
    client = MongoClient(MONGODB_SERVER)

    try:
        # Fetch all hardware names using the hardwareDatabase module
        result = hardwareDatabase.getAllHwNames(client)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    finally:
        # Close the MongoDB connection
        client.close()

# Route for getting hardware information
@app.route('/get_hw_info', methods=['POST'])
def get_hw_info():
    # Extract data from request
    data = request.get_json()
    hwSetName = data.get('hwSetName')

    # Connect to MongoDB
    client = MongoClient(MONGODB_SERVER)

    try:
        # Fetch hardware set information using the hardwareDatabase module
        result = hardwareDatabase.queryHardwareSet(client, hwSetName)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    finally:
        # Close the MongoDB connection
        client.close()

# Route for checking out hardware
@app.route('/check_out', methods=['POST'])
def check_out():
    # Extract data from request
    data = request.get_json()
    projectId = data.get('projectId')
    hwSetName = data.get('hwSetName')
    qty = data.get('qty')
    userId = data.get('userId')

    # Connect to MongoDB
    client = MongoClient(MONGODB_SERVER)

    try:
        # Attempt to check out the hardware using the projectsDatabase module
        result = projectsDatabase.checkOutHW(client, projectId, hwSetName, qty, userId)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    finally:
        # Close the MongoDB connection
        client.close()

# Route for checking in hardware
@app.route('/check_in', methods=['POST'])
def check_in():
    # Extract data from request
    data = request.get_json()
    projectId = data.get('projectId')
    hwSetName = data.get('hwSetName')
    qty = data.get('qty')
    userId = data.get('userId')

    # Connect to MongoDB
    client = MongoClient(MONGODB_SERVER)

    try:
        # Attempt to check in the hardware using the projectsDatabase module
        result = projectsDatabase.checkInHW(client, projectId, hwSetName, qty, userId)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    finally:
        # Close the MongoDB connection
        client.close()

# Route for creating a new hardware set
@app.route('/create_hardware_set', methods=['POST'])
def create_hardware_set():
    # Extract data from request
    data = request.get_json()
    hwSetName = data.get('hwSetName')
    initCapacity = data.get('initCapacity')

    # Connect to MongoDB
    client = MongoClient(MONGODB_SERVER)

    try:
        # Attempt to create the hardware set using the hardwareDatabase module
        result = hardwareDatabase.createHardwareSet(client, hwSetName, initCapacity)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    finally:
        # Close the MongoDB connection
        client.close()

# Route for checking the inventory of projects
@app.route('/api/inventory', methods=['GET'])
def check_inventory():
    # Connect to MongoDB
    client = MongoClient(MONGODB_SERVER)

    try:
        # Fetch all projects from the projects collection
        db = client['momentum_swelab']
        projects_collection = db['projects']
        projects = list(projects_collection.find({}))
        
        # Convert ObjectId to string for JSON serialization
        for project in projects:
            project['_id'] = str(project['_id'])
        
        return jsonify({'success': True, 'data': projects})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})
    finally:
        # Close the MongoDB connection
        client.close()

# Main entry point for the application
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)

