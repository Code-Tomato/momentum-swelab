# Password encryption utilities using shift cipher approach
# Based on the cipher.py implementation but adapted for password security

ASCII_START = 34
ASCII_END = 126
ALPHABET_LEN = ASCII_END - ASCII_START + 1

# Fixed encryption parameters for consistent password hashing
PASSWORD_SHIFT_N = 7  # Fixed shift amount
PASSWORD_SHIFT_D = 1  # Fixed direction (right shift)

def validate_password_input(inputText: str):
    """Validate password input for encryption"""
    if not isinstance(inputText, str):
        raise TypeError("Password must be a string")
    if len(inputText) == 0:
        raise ValueError("Password cannot be empty")
    
    # Check for invalid characters (space and exclamation mark)
    for ch in inputText:
        code = ord(ch)
        if code == 32 or code == 33:
            raise ValueError("Password cannot contain space or '!' characters")
        if code < ASCII_START or code > ASCII_END:
            raise ValueError("Password must use ASCII printable characters 34-126")

def shift_char(ch: str, shift: int) -> str:
    """Shift a character by the given amount within the valid ASCII range"""
    idx = ord(ch) - ASCII_START
    new_idx = (idx + shift) % ALPHABET_LEN
    return chr(ASCII_START + new_idx)

def encrypt_password(password: str) -> str:
    """
    Encrypt a password using the shift cipher approach
    Returns the encrypted password string
    """
    validate_password_input(password)
    
    # Reverse the password first, then apply shift
    reversed_password = password[::-1]
    shift = PASSWORD_SHIFT_N * PASSWORD_SHIFT_D
    
    encrypted = ''.join(shift_char(ch, shift) for ch in reversed_password)
    return encrypted

def decrypt_password(encrypted_password: str) -> str:
    """
    Decrypt an encrypted password back to original
    Returns the original password string
    """
    # Apply reverse shift first, then reverse the string
    shift = -PASSWORD_SHIFT_N * PASSWORD_SHIFT_D
    shifted = ''.join(shift_char(ch, shift) for ch in encrypted_password)
    return shifted[::-1]

def verify_password(plain_password: str, encrypted_password: str) -> bool:
    """
    Verify if a plain password matches an encrypted password
    Returns True if they match, False otherwise
    """
    try:
        # Encrypt the plain password and compare
        encrypted_plain = encrypt_password(plain_password)
        return encrypted_plain == encrypted_password
    except (TypeError, ValueError):
        # If password validation fails, return False
        return False

# Additional utility functions
def is_valid_password(password: str) -> bool:
    """
    Check if a password meets basic requirements
    Returns True if valid, False otherwise
    """
    try:
        validate_password_input(password)
        return len(password) >= 4  # Minimum length requirement
    except (TypeError, ValueError):
        return False

def get_password_requirements() -> str:
    """
    Return a string describing password requirements
    """
    return "Password must be at least 4 characters long and use ASCII printable characters (34-126), excluding space and '!' characters."
