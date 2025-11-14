# Import necessary libraries and modules
from pymongo import MongoClient
import db_utils

# Note: Import hardwareDatabase when needed to avoid circular imports

'''
Structure of Project entry:
Project = {
    'projectName': projectName,
    'projectId': projectId,
    'description': description,
    'hwSets': {HW1: 0, HW2: 10, ...},
    'users': [user1, user2, ...],
    'owner': username  # Username of the project owner/creator
}
'''

# Function to query a project by its ID
def queryProject(client, projectId):
    # Query and return a project from the database
    db = db_utils.get_database(client)
    projects_collection = db['projects']
    
    project = projects_collection.find_one({'projectId': projectId})
    if project:
        # Convert ObjectId to string for JSON serialization
        project['_id'] = str(project['_id'])
        return {'success': True, 'data': project}
    else:
        return {'success': False, 'message': 'Project not found'}

# Function to create a new project
def createProject(client, projectName, projectId, description, owner=None):
    # Create a new project in the database
    db = db_utils.get_database(client)
    projects_collection = db['projects']
    
    # Check if project already exists
    existing = projects_collection.find_one({'projectId': projectId})
    if existing:
        return {'success': False, 'message': 'Project already exists'}
    
    # Create new project
    project = {
        'projectName': projectName,
        'projectId': projectId,
        'description': description,
        'hwSets': {'HWSet1': 0, 'HWSet2': 0},  # Dictionary to store hardware usage
        'users': [],    # List of user IDs
        'owner': owner  # Username of the project owner/creator
    }
    
    result = projects_collection.insert_one(project)
    # Retrieve the created project
    created = projects_collection.find_one({'_id': result.inserted_id})
    created['_id'] = str(created['_id'])
    return {'success': True, 'project': created, 'message': 'Project created successfully'}

# Function to add a user to a project
def addUser(client, projectId, username):
    # Add a user to the specified project
    db = db_utils.get_database(client)
    projects_collection = db['projects']
    
    # Check if project exists
    project = projects_collection.find_one({'projectId': projectId})
    if not project:
        return {'success': False, 'message': 'Project not found'}
    
    # Check if user is already in the project
    if username in project.get('users', []):
        # User is already in project's users list - this is fine, just return success
        # This handles the case where there was an orphaned reference that's being synced
        return {'success': True, 'message': 'User already in project'}
    
    # Add user to project
    result = projects_collection.update_one(
        {'projectId': projectId},
        {'$push': {'users': username}}
    )
    
    if result.modified_count > 0:
        return {'success': True, 'message': 'User added to project successfully'}
    else:
        return {'success': False, 'message': 'Failed to add user to project'}

# remove user from project
def removeUser(client, projectId, username):
    # Remove a user from the specified project
    db = db_utils.get_database(client)
    projects_collection = db['projects']
    
    result = projects_collection.update_one(
        {'projectId': projectId},
        {'$pull': {'users': username}}
    )
    
    if result.modified_count > 0:
        return {'success': True, 'message': 'User removed from project successfully'}
    else:
        return {'success': False, 'message': 'User not found or not in project'}

# Function to update hardware usage in a project
def updateUsage(client, projectId, hwSetName):
    # Update the usage of a hardware set in the specified project
    db = db_utils.get_database(client)
    projects_collection = db['projects']
    
    # Check if project exists
    project = projects_collection.find_one({'projectId': projectId})
    if not project:
        return {'success': False, 'message': 'Project not found'}
    
    # Initialize hardware set usage if not exists
    if hwSetName not in project['hwSets']:
        result = projects_collection.update_one(
            {'projectId': projectId},
            {'$set': {f'hwSets.{hwSetName}': 0}}
        )
        if result.modified_count > 0:
            return {'success': True, 'message': f'Hardware set {hwSetName} initialized for project'}
        else:
            return {'success': False, 'message': 'Failed to initialize hardware set'}
    
    return {'success': True, 'message': 'Hardware set already exists in project'}

# Function to check out hardware for a project
def checkOutHW(client, projectId, hwSetName, qty, username):
    # Check out hardware for the specified project and update availability
    import hardwareDatabase
    
    db = db_utils.get_database(client)
    projects_collection = db['projects']
    
    # Check if project exists
    project = projects_collection.find_one({'projectId': projectId})
    if not project:
        return {'success': False, 'message': 'Project not found'}
    
    # Check if user is part of the project
    if username not in project['users']:
        return {'success': False, 'message': 'User not authorized for this project'}
    
    # Try to request hardware from the hardware database
    hw_result = hardwareDatabase.requestSpace(client, hwSetName, qty)
    if not hw_result['success']:
        return hw_result
    
    # Update project's hardware usage
    current_usage = project['hwSets'].get(hwSetName, 0)
    new_usage = current_usage + qty
    
    result = projects_collection.update_one(
        {'projectId': projectId},
        {'$set': {f'hwSets.{hwSetName}': new_usage}}
    )
    
    if result.modified_count > 0:
        return {'success': True, 'message': f'Successfully checked out {qty} units of {hwSetName}'}
    else:
        # If project update failed, we should return the hardware
        hardwareDatabase.updateAvailability(client, hwSetName, hw_result['new_availability'] + qty)
        return {'success': False, 'message': 'Failed to update project hardware usage'}

# Function to check in hardware for a project
def checkInHW(client, projectId, hwSetName, qty, username):
    # Check in hardware for the specified project and update availability
    import hardwareDatabase
    
    db = db_utils.get_database(client)
    projects_collection = db['projects']
    
    # Check if project exists
    project = projects_collection.find_one({'projectId': projectId})
    if not project:
        return {'success': False, 'message': 'Project not found'}
    
    # Check if user is part of the project
    if username not in project['users']:
        return {'success': False, 'message': 'User not authorized for this project'}
    
    # Check if project has this hardware checked out
    current_usage = project['hwSets'].get(hwSetName, 0)
    if current_usage < qty:
        return {'success': False, 'message': 'Cannot check in more hardware than is checked out'}
    
    # Update project's hardware usage
    new_usage = current_usage - qty
    
    result = projects_collection.update_one(
        {'projectId': projectId},
        {'$set': {f'hwSets.{hwSetName}': new_usage}}
    )
    
    if result.modified_count > 0:
        # Update hardware availability
        hw_query = hardwareDatabase.queryHardwareSet(client, hwSetName)
        if hw_query['success']:
            current_availability = hw_query['data']['availability']
            new_availability = current_availability + qty
            hw_update = hardwareDatabase.updateAvailability(client, hwSetName, new_availability)
            if hw_update['success']:
                return {'success': True, 'message': f'Successfully checked in {qty} units of {hwSetName}'}
            else:
                return {'success': False, 'message': 'Failed to update hardware availability'}
        else:
            return {'success': False, 'message': 'Hardware set not found'}
    else:
        return {'success': False, 'message': 'Failed to update project hardware usage'}

# Function to delete a project
def deleteProject(client, projectId, username):
    # Delete a project (only owner can delete)
    db = db_utils.get_database(client)
    projects_collection = db['projects']
    users_collection = db['users']
    
    # Check if project exists
    project = projects_collection.find_one({'projectId': projectId})
    if not project:
        return {'success': False, 'message': 'Project not found'}
    
    # Check if user is the owner
    # Handle legacy projects without owner field - allow deletion if user is in project
    project_owner = project.get('owner')
    if project_owner:
        if project_owner != username:
            return {'success': False, 'message': 'Only project owner can delete the project'}
    else:
        # Legacy project: check if user is in the project
        if username not in project.get('users', []):
            return {'success': False, 'message': 'You are not authorized to delete this project'}
    
    # Get all users in the project to remove project from their lists
    project_users = project.get('users', [])
    
    # Remove project from all users' projects lists
    for user in project_users:
        users_collection.update_one(
            {'username': user},
            {'$pull': {'projects': projectId}}
        )
    
    # Check in any checked-out hardware before deleting
    import hardwareDatabase
    hw_sets = project.get('hwSets', {})
    for hw_set_name, checked_out_qty in hw_sets.items():
        if checked_out_qty > 0:
            # Check in the hardware
            hw_query = hardwareDatabase.queryHardwareSet(client, hw_set_name)
            if hw_query['success']:
                current_availability = hw_query['data']['availability']
                new_availability = current_availability + checked_out_qty
                hardwareDatabase.updateAvailability(client, hw_set_name, new_availability)
    
    # Delete the project
    result = projects_collection.delete_one({'projectId': projectId})
    
    if result.deleted_count > 0:
        return {'success': True, 'message': 'Project deleted successfully'}
    else:
        return {'success': False, 'message': 'Failed to delete project'}

