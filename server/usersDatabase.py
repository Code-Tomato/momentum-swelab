# Import necessary libraries and modules
from pymongo import MongoClient

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
    db = client['momentum_swelab']
    users_collection = db['users']
    
    # Check if user already exists
    existing = users_collection.find_one({'$or': [{'username': username}, {'userId': userId}]})
    if existing:
        return {'success': False, 'message': 'User already exists'}
    
    # Create new user
    user = {
        'username': username,
        'userId': userId,
        'password': password,  # In production, this should be hashed!
        'projects': []
    }
    
    result = users_collection.insert_one(user)
    return {'success': True, 'id': str(result.inserted_id)}

# Helper function to query a user by username and userId
def __queryUser(client, username, userId):
    # Query and return a user from the database
    db = client['momentum_swelab']
    users_collection = db['users']
    
    user = users_collection.find_one({'username': username, 'userId': userId})
    return user

# Function to log in a user
def login(client, username, userId, password):
    # Authenticate a user and return login status
    user = __queryUser(client, username, userId)
    if not user:
        return {'success': False, 'message': 'User not found'}
    
    if user['password'] == password:  # In production, use proper password hashing
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
    db = client['momentum_swelab']
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
    db = client['momentum_swelab']
    users_collection = db['users']
    
    user = users_collection.find_one({'userId': userId})
    if not user:
        return {'success': False, 'message': 'User not found'}
    
    return {'success': True, 'data': user['projects']}

