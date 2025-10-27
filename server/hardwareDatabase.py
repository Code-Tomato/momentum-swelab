# Import necessary libraries and modules
from pymongo import MongoClient

'''
Structure of Hardware Set entry:
HardwareSet = {
    'hwName': hwSetName,
    'capacity': initCapacity,
    'availability': initCapacity
}
'''

# Function to create a new hardware set
def createHardwareSet(client, hwSetName, initCapacity):
    # Create a new hardware set in the database
    db = client['momentum_swelab']
    hardware_collection = db['hardware_sets']
    
    # Check if hardware set already exists
    existing = hardware_collection.find_one({'hwName': hwSetName})
    if existing:
        return {'success': False, 'message': 'Hardware set already exists'}
    
    # Create new hardware set
    hardware_set = {
        'hwName': hwSetName,
        'capacity': initCapacity,
        'availability': initCapacity
    }
    
    result = hardware_collection.insert_one(hardware_set)
    return {'success': True, 'id': str(result.inserted_id)}

# Function to query a hardware set by its name
def queryHardwareSet(client, hwSetName):
    # Query and return a hardware set from the database
    db = client['momentum_swelab']
    hardware_collection = db['hardware_sets']
    
    hardware_set = hardware_collection.find_one({'hwName': hwSetName})
    if hardware_set:
        # Convert ObjectId to string for JSON serialization
        hardware_set['_id'] = str(hardware_set['_id'])
        return {'success': True, 'data': hardware_set}
    else:
        return {'success': False, 'message': 'Hardware set not found'}

# Function to update the availability of a hardware set
def updateAvailability(client, hwSetName, newAvailability):
    # Update the availability of an existing hardware set
    db = client['momentum_swelab']
    hardware_collection = db['hardware_sets']
    
    # Check if hardware set exists
    existing = hardware_collection.find_one({'hwName': hwSetName})
    if not existing:
        return {'success': False, 'message': 'Hardware set not found'}
    
    # Validate availability doesn't exceed capacity
    if newAvailability > existing['capacity']:
        return {'success': False, 'message': 'Availability cannot exceed capacity'}
    
    if newAvailability < 0:
        return {'success': False, 'message': 'Availability cannot be negative'}
    
    # Update availability
    result = hardware_collection.update_one(
        {'hwName': hwSetName},
        {'$set': {'availability': newAvailability}}
    )
    
    if result.modified_count > 0:
        return {'success': True, 'message': 'Availability updated successfully'}
    else:
        return {'success': False, 'message': 'Failed to update availability'}

# Function to request space from a hardware set
def requestSpace(client, hwSetName, amount):
    # Request a certain amount of hardware and update availability
    db = client['momentum_swelab']
    hardware_collection = db['hardware_sets']
    
    # Check if hardware set exists
    hardware_set = hardware_collection.find_one({'hwName': hwSetName})
    if not hardware_set:
        return {'success': False, 'message': 'Hardware set not found'}
    
    # Check if enough space is available
    if hardware_set['availability'] < amount:
        return {'success': False, 'message': 'Not enough hardware available'}
    
    # Validate amount is positive
    if amount <= 0:
        return {'success': False, 'message': 'Amount must be positive'}
    
    # Update availability by reducing it
    new_availability = hardware_set['availability'] - amount
    result = hardware_collection.update_one(
        {'hwName': hwSetName},
        {'$set': {'availability': new_availability}}
    )
    
    if result.modified_count > 0:
        return {'success': True, 'message': f'Successfully allocated {amount} units', 'new_availability': new_availability}
    else:
        return {'success': False, 'message': 'Failed to allocate hardware'}

# Function to get all hardware set names
def getAllHwNames(client):
    # Get and return a list of all hardware set names
    db = client['momentum_swelab']
    hardware_collection = db['hardware_sets']
    
    try:
        # Get all hardware sets and extract just the names
        hardware_sets = hardware_collection.find({}, {'hwName': 1, '_id': 0})
        names = [hw['hwName'] for hw in hardware_sets]
        return {'success': True, 'data': names}
    except Exception as e:
        return {'success': False, 'message': f'Error retrieving hardware names: {str(e)}'}

