import random
import base64

key = random.randbytes(32)

apiKey = base64.urlsafe_b64encode(key)

print(apiKey)