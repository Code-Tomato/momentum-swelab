# Database utility functions for centralized connection and database access
import os
from pymongo import MongoClient
from functools import wraps
from flask import jsonify

# Database configuration constants
MONGODB_SERVER = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/')
DATABASE_NAME = 'momentum_swelab'

# Global connection pool (reused across requests)
_client = None

def get_mongo_client():
    """Get or create MongoDB client with connection pooling."""
    global _client
    if _client is None:
        _client = MongoClient(MONGODB_SERVER)
    return _client

def get_database(client=None):
    """Get database instance. Uses provided client or gets default."""
    if client is None:
        client = get_mongo_client()
    return client[DATABASE_NAME]

def test_mongodb_connection():
    """Test MongoDB connection."""
    try:
        client = MongoClient(MONGODB_SERVER, serverSelectionTimeoutMS=10000)
        client.server_info()
        client.close()
        return True
    except Exception as e:
        print(f"MongoDB connection error: {str(e)}")
        return False

def with_db_connection(f):
    """Decorator to handle MongoDB connection for Flask routes."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        client = get_mongo_client()
        try:
            return f(client, *args, **kwargs)
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error: {str(e)}'})
        # Note: We don't close the client here as it's reused via connection pooling
    
    return decorated_function

def drop_userId_index():
    """Drop the userId unique index from the users collection."""
    try:
        client = get_mongo_client()
        db = get_database(client)
        users_collection = db['users']
        
        # Try to drop the userId index
        try:
            users_collection.drop_index('userId_1')
            return {'success': True, 'message': 'Successfully dropped userId index'}
        except Exception as e:
            if 'index not found' in str(e).lower():
                return {'success': True, 'message': 'userId index does not exist (already removed)'}
            raise
    except Exception as e:
        return {'success': False, 'message': f'Error dropping index: {str(e)}'}

