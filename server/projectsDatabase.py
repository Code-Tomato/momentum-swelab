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
    'users': [user1, user2, ...]
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
def createProject(client, projectName, projectId, description):
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
        'hwSets': {'HWSet:' : 0, 'HWSet2': 0},  # Dictionary to store hardware usage
        'users': []    # List of user IDs
    }
    
    projects_collection.insert_one(project)
    return {'success': True, 'message': 'Project created', 'project': project}

# Function to add a user to a project
def addUser(client, projectId, userId):
    # Add a user to the specified project
    db = db_utils.get_database(client)
    projects_collection = db['projects']
    
    # Check if project exists
    project = projects_collection.find_one({'projectId': projectId})
    if not project:
        return {'success': False, 'message': 'Project not found'}
    
    # Check if user is already in the project
    if userId in project['users']:
        return {'success': False, 'message': 'User already in project'}
    
    # Add user to project
    result = projects_collection.update_one(
        {'projectId': projectId},
        {'$push': {'users': userId}}
    )
    
    if result.modified_count > 0:
        return {'success': True, 'message': 'User added to project successfully'}
    else:
        return {'success': False, 'message': 'Failed to add user to project'}

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
def checkOutHW(client, projectId, hwSetName, qty, userId):
    # Check out hardware for the specified project and update availability
    import hardwareDatabase
    
    db = db_utils.get_database(client)
    projects_collection = db['projects']
    
    # Check if project exists
    project = projects_collection.find_one({'projectId': projectId})
    if not project:
        return {'success': False, 'message': 'Project not found'}
    
    # Check if user is part of the project
    if userId not in project['users']:
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
def checkInHW(client, projectId, hwSetName, qty, userId):
    # Check in hardware for the specified project and update availability
    import hardwareDatabase
    
    db = db_utils.get_database(client)
    projects_collection = db['projects']
    
    # Check if project exists
    project = projects_collection.find_one({'projectId': projectId})
    if not project:
        return {'success': False, 'message': 'Project not found'}
    
    # Check if user is part of the project
    if userId not in project['users']:
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

