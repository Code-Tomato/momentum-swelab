# Import necessary libraries and modules
from pymongo import MongoClient
from decryptEncrypt import encrypt_password, verify_password
import db_utils

# Note: Import projectsDatabase when needed to avoid circular imports

'''
Structure of User entry:
User = {
    'username': username,
    'email': email,
    'password': encrypted_password,  # Password is encrypted using encryptDecrypt module
    'projects': [project1_ID, project2_ID, ...]
}
'''

# Function to add a new user
def addUser(client, username, email, password):
    # Add a new user to the database
    db = db_utils.get_database(client)
    users_collection = db['users']
    
    # Check if username already exists
    existing_username = users_collection.find_one({'username': username})
    if existing_username:
        return {'success': False, 'message': 'Username already exists'}
    
    # Check if email already exists
    existing_email = users_collection.find_one({'email': email})
    if existing_email:
        return {'success': False, 'message': 'Email already registered'}
    
    # Encrypt the password before storing
    try:
        encrypted_password = encrypt_password(password)
    except (ValueError, TypeError) as e:
        return {'success': False, 'message': f'Password validation failed: {str(e)}'}
    
    # Create new user with encrypted password
    user = {
        'username': username,
        'email': email,
        'password': encrypted_password,  # Store encrypted password
        'projects': []
    }
    
    try:
        result = users_collection.insert_one(user)
        return {'success': True, 'id': str(result.inserted_id)}
    except Exception as e:
        # Check if it's a duplicate key error on userId index
        if 'E11000' in str(e) and 'userId' in str(e):
            return {'success': False, 'message': 'Database configuration error: Please remove the unique index on userId field. Contact administrator.'}
        raise

# Helper function to query a user by username
def __queryUserByUsername(client, username):
    # Query and return a user from the database by username
    db = db_utils.get_database(client)
    users_collection = db['users']
    # Query by username
    user = users_collection.find_one({'username': username})
    return user

# Function to log in a user
def login(client, username, password=None):
    # Authenticate a user by username and return login status
    user = __queryUserByUsername(client, username)
    if not user:
        return {'success': False, 'message': 'User not found'}
    
    # Verify password using the encrypted password stored in database
    if verify_password(password, user['password']):
        return {'success': True, 'message': 'Login successful', 'user_data': {
            'username': user['username'],
            'email': user.get('email', ''),
            'projects': user['projects']
        }}
    else:
        return {'success': False, 'message': 'Invalid password'}

# Function to add a user to a project
def joinProject(client, username, projectId):
    # Add a user to a specified project
    import projectsDatabase
    db = db_utils.get_database(client)
    users_collection = db['users']
    projects_collection = db['projects']
    
    # Check if user exists
    user = users_collection.find_one({'username': username})
    if not user:
        return {'success': False, 'message': 'User not found'}
    
    # Check if project exists
    project = projects_collection.find_one({'projectId': projectId})
    if not project:
        return {'success': False, 'message': 'Project not found'}
    
    # Check if user is already in the project (in user's projects list)
    if projectId in user.get('projects', []):
        return {'success': False, 'message': 'User already in project'}
    
    # Check for orphaned reference: user is in project's users list but not in user's projects list
    if username in project.get('users', []):
        # Sync the orphaned reference by adding project to user's projects list
        result = users_collection.update_one(
            {'username': username},
            {'$push': {'projects': projectId}}
        )
        if result.modified_count > 0:
            return {'success': True, 'message': 'Successfully synced orphaned project reference'}
        else:
            return {'success': False, 'message': 'Failed to sync orphaned project reference'}
    
    # Normal case: user is not in project, add them
    # Add project to user's projects list
    result = users_collection.update_one(
        {'username': username},
        {'$push': {'projects': projectId}}
    )
    
    if result.modified_count > 0:
        return {'success': True, 'message': 'Successfully joined project'}
    else:
        return {'success': False, 'message': 'Failed to join project'}


# function to leave a project 
def leaveProject(client, username, projectId):
    # Remove a project from a user's project list
    db = db_utils.get_database(client)
    users_collection = db['users']

    result = users_collection.update_one(
        {'username': username},
        {'$pull': {'projects': projectId}}
    )

    if result.modified_count > 0:
        return {'success': True, 'message': 'Project removed from user list'}
    else:
        return {'success': False, 'message': 'User not found or not in project'}


# Function to get the list of projects for a user
# Fixing project naming the names weren't correctly being displayed on the front end
def getUserProjectsList(client, username):
    db = db_utils.get_database(client)
    users = db['users']
    projects = db['projects']

    user = users.find_one({'username': username})
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
                "hwSets": proj.get("hwSets", {}),   # shows the hardware sets
                "owner": proj.get("owner")  # shows the project owner
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
    
    # Try to find user by email
    user = users_collection.find_one({'email': email})
    
    if not user:
        # Don't reveal if user exists or not for security
        return {'success': True, 'message': 'If an account exists with this email, password reset instructions have been sent.'}
    
    # In production, here you would:
    # 1. Generate a secure reset token
    # 2. Store token with expiration in database
    # 3. Send email with reset link
    # For now, return success message
    return {'success': True, 'message': 'If an account exists with this email, password reset instructions have been sent.'}

def getUserByEmail(client, email):
    """Get user by email address."""
    db = db_utils.get_database(client)
    users_collection = db['users']
    return users_collection.find_one({'email': email})

def updatePassword(client, email, new_password):
    """Update user password. Password will be encrypted before storing."""
    db = db_utils.get_database(client)
    users_collection = db['users']

    # Validate password input
    try:
        encrypted_password = encrypt_password(new_password)
    except (ValueError, TypeError) as e:
        return {'success': False, 'message': f'Password validation failed: {str(e)}'}

    # Check if user exists
    user = users_collection.find_one({'email': email})
    if not user:
        return {'success': False, 'message': 'User not found'}

    # Update password with encrypted version
    result = users_collection.update_one(
        {'email': email},
        {'$set': {'password': encrypted_password}}
    )

    if result.modified_count == 1:
        return {'success': True, 'message': 'Password updated successfully'}
    return {'success': False, 'message': 'Failed to update password'}

# Function to delete a user account
def deleteUser(client, username, password):
    # Delete a user account and all associated data
    import projectsDatabase
    db = db_utils.get_database(client)
    users_collection = db['users']
    projects_collection = db['projects']
    
    # Check if user exists and verify password
    user = users_collection.find_one({'username': username})
    if not user:
        return {'success': False, 'message': 'User not found'}
    
    # Verify password
    if not verify_password(password, user['password']):
        return {'success': False, 'message': 'Invalid password'}
    
    # Get all projects where user is owner
    user_projects = projects_collection.find({'owner': username})
    owned_project_ids = [p['projectId'] for p in user_projects]
    
    # Delete all projects owned by the user
    for project_id in owned_project_ids:
        projectsDatabase.deleteProject(client, project_id, username)
    
    # Get all projects the user is a member of (but not owner)
    user_project_list = user.get('projects', [])
    member_projects = [pid for pid in user_project_list if pid not in owned_project_ids]
    
    # Remove user from all projects they're a member of (but not owner)
    # This removes the user from the project's users list
    for project_id in member_projects:
        projectsDatabase.removeUser(client, project_id, username)
    
    # Delete the user document
    result = users_collection.delete_one({'username': username})
    
    if result.deleted_count > 0:
        return {'success': True, 'message': 'Account deleted successfully'}
    else:
        return {'success': False, 'message': 'Failed to delete account'}
