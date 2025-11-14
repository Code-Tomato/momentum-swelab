# Password hashing utilities using bcrypt for secure password storage
import bcrypt

def validate_password_input(inputText: str):
    """Validate password input"""
    if not isinstance(inputText, str):
        raise TypeError("Password must be a string")
    if len(inputText) == 0:
        raise ValueError("Password cannot be empty")
    if len(inputText) < 4:
        raise ValueError("Password must be at least 4 characters long")

def encrypt_password(password: str) -> str:
    """
    Hash a password using bcrypt with automatic salt generation.
    Each call produces a different hash even for the same password.
    Returns the hashed password string (includes salt).
    """
    validate_password_input(password)
    
    # Generate salt and hash password
    # bcrypt automatically generates a unique salt for each password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    # Return as string (bcrypt hash includes the salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify if a plain password matches a bcrypt hashed password.
    Returns True if they match, False otherwise.
    """
    try:
        # bcrypt.checkpw handles the salt automatically
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except (TypeError, ValueError, AttributeError):
        # If password validation fails or hash is invalid, return False
        return False

# Additional utility functions
def is_valid_password(password: str) -> bool:
    """
    Check if a password meets basic requirements
    Returns True if valid, False otherwise
    """
    try:
        validate_password_input(password)
        return True
    except (TypeError, ValueError):
        return False

def get_password_requirements() -> str:
    """
    Return a string describing password requirements
    """
    return "Password must be at least 4 characters long."

# Legacy function for backward compatibility (deprecated - passwords are now hashed, not encrypted)
def decrypt_password(encrypted_password: str) -> str:
    """
    DEPRECATED: Passwords are now hashed with bcrypt and cannot be decrypted.
    This function is kept for backward compatibility but will raise an error.
    """
    raise NotImplementedError("Password decryption is not supported. Passwords are hashed, not encrypted.")
