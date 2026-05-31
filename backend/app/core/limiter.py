from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialize slowapi Limiter
# Using the remote IP address of the requester to rate-limit requests.
limiter = Limiter(key_func=get_remote_address)
