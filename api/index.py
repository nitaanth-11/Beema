import sys
import os

# Ensure the repository root is in sys.path so 'src' packages can be resolved in Vercel Serverless
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from src.api.main import app

