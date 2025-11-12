# Import necessary libraries and modules
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import db_utils

# Note: Import projectsDatabase when needed to avoid circular imports

'''
Structure of User entry:
User = {
    'username': username,
    'userId': userId,
    'password': password,
    'projects': [project1_ID, project2_ID, ...]
}
'''

# Function to add a new user
def addUser(client, username, userId, password):
    # Add a new user to the database
    db = db_utils.get_database(client)
    users_collection = db['users']
    
    # Check if user already exists
    existing = users_collection.find_one({'$or': [{'username': username}, {'userId': userId}]})
    if existing:
        return {'success': False, 'message': 'User already exists'}
    
    # Create new user with hashed password
    user = {
        'username': username,
        'userId': userId,
        'password': generate_password_hash(password),  # Hash password for security
        'projects': []
    }
    
    result = users_collection.insert_one(user)
    return {'success': True, 'id': str(result.inserted_id)}

# Helper function to query a user by username and userId
def __queryUser(client, username, userId=None):
    # Query and return a user from the database
    # If userId is not provided, query by username only
    db = db_utils.get_database(client)
    users_collection = db['users']
    
    if userId:
        user = users_collection.find_one({'username': username, 'userId': userId})
    else:
        # Query by username only (for login when userId not provided)
        user = users_collection.find_one({'username': username})
    return user

# Function to log in a user
def login(client, username, userId=None, password=None):
    # Authenticate a user and return login status
    # userId is optional - if not provided, will query by username only
    user = __queryUser(client, username, userId)
    if not user:
        return {'success': False, 'message': 'User not found'}
    
    # Check password using werkzeug's secure password checking
    if check_password_hash(user['password'], password):
        return {'success': True, 'message': 'Login successful', 'user_data': {
            'username': user['username'],
            'userId': user['userId'],
            'projects': user['projects']
        }}
    else:
        return {'success': False, 'message': 'Invalid password'}

# Function to add a user to a project
def joinProject(client, userId, projectId):
    # Add a user to a specified project
    db = db_utils.get_database(client)
    users_collection = db['users']
    
    # Check if user exists
    user = users_collection.find_one({'userId': userId})
    if not user:
        return {'success': False, 'message': 'User not found'}
    
    # Check if user is already in the project
    if projectId in user['projects']:
        return {'success': False, 'message': 'User already in project'}
    
    # Add project to user's projects list
    result = users_collection.update_one(
        {'userId': userId},
        {'$push': {'projects': projectId}}
    )
    
    if result.modified_count > 0:
        return {'success': True, 'message': 'Successfully joined project'}
    else:
        return {'success': False, 'message': 'Failed to join project'}

# Function to get the list of projects for a user
def getUserProjectsList(client, userId):
    # Get and return the list of projects a user is part of
    db = db_utils.get_database(client)
    users_collection = db['users']
    
    user = users_collection.find_one({'userId': userId})
    if not user:
        return {'success': False, 'message': 'User not found'}
    
    return {'success': True, 'data': user['projects']}

