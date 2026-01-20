import os

class Settings:
    # Default to a local JSON file for the registry
    IDENTITIES_FILE = os.getenv("REGULAYER_IDENTITIES_FILE", "identities.json")

settings = Settings()
