# Import necessary libraries and modules
from pymongo import MongoClient
from decryptEncrypt import encrypt_password, verify_password
import db_utils

# Note: Import projectsDatabase when needed to avoid circular imports

'''
Structure of User entry:
User = {
    'username': username,
    'userId': userId,
    'password': encrypted_password,  # Password is encrypted using encryptDecrypt module
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
    
    # Encrypt the password before storing
    try:
        encrypted_password = encrypt_password(password)
    except (ValueError, TypeError) as e:
        return {'success': False, 'message': f'Password validation failed: {str(e)}'}
    
    # Create new user with encrypted password
    user = {
        'username': username,
        'userId': userId,
        'password': encrypted_password,  # Store encrypted password
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
    
    # Verify password using the encrypted password stored in database
    if verify_password(password, user['password']):
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


# function to leave a project 
def leaveProject(client, userId, projectId):
    # Remove a project from a user's project list
    db = db_utils.get_database(client)
    users_collection = db['users']

    result = users_collection.update_one(
        {'userId': userId},
        {'$pull': {'projects': projectId}}
    )

    if result.modified_count > 0:
        return {'success': True, 'message': 'Project removed from user list'}
    else:
        return {'success': False, 'message': 'User not found or not in project'}


# Function to get the list of projects for a user
# Fixing project naming the names weren't correctly being displayed on the front end
def getUserProjectsList(client, userId):
    db = db_utils.get_database(client)
    users = db['users']
    projects = db['projects']

    user = users.find_one({'userId': userId})
    if not user:
        return {'success': False, 'message': 'User not found'}

    project_ids = user.get("projects", [])

    project_list = []
    for pid in project_ids:
        proj = projects.find_one({'projectId': pid})
        if proj:
            project_list.append({
                "projectId": proj.get("projectId"),
                "projectName": proj.get("projectName"),
                "description": proj.get("description", ""),
                "hwSets": proj.get("hwSets", {})   # shows the hardware sets
            })

    return {"success": True, "projects": project_list}

# Function to handle forgot password request
def forgotPassword(client, email):
    """
    Handle forgot password request.
    In a production system, this would send an email with a reset link.
    For now, it verifies the user exists and returns a success message.
    """
    db = db_utils.get_database(client)
    users_collection = db['users']
    
    # Extract email prefix to match userId format used in registration
    # Registration uses: userId = email.split('@')[0]
    email_prefix = email.split('@')[0] if '@' in email else email
    
    # Try to find user by userId (email prefix) or username
    user = users_collection.find_one({
        '$or': [
            {'userId': email_prefix},
            {'username': email_prefix}
        ]
    })
    
    if not user:
        # Don't reveal if user exists or not for security
        return {'success': True, 'message': 'If an account exists with this email, password reset instructions have been sent.'}
    
    # In production, here you would:
    # 1. Generate a secure reset token
    # 2. Store token with expiration in database
    # 3. Send email with reset link
    # For now, return success message
    return {'success': True, 'message': 'If an account exists with this email, password reset instructions have been sent.'}
