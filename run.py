"""
Run the FastAPI application
"""
import sys
import os

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Add the script directory to Python path
if script_dir not in sys.path:
    sys.path.insert(0, script_dir)

# Change to script directory to ensure relative imports work
os.chdir(script_dir)

if __name__ == "__main__":
    import uvicorn
    print(f"Starting server from: {os.getcwd()}")
    print(f"Python path: {sys.path[:3]}")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

