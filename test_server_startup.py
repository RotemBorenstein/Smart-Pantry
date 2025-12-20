"""
Test server startup to find the issue
"""
import sys
import os

# Add current directory to path
script_dir = os.path.dirname(os.path.abspath(__file__))
if script_dir not in sys.path:
    sys.path.insert(0, script_dir)
os.chdir(script_dir)

print(f"Working directory: {os.getcwd()}")
print(f"Python path: {sys.path[0]}\n")

try:
    print("1. Testing config import...")
    from app.core.config import settings
    print("   ✓ Config loaded")
except Exception as e:
    print(f"   ✗ Config error: {e}")
    sys.exit(1)

try:
    print("2. Testing supabase client...")
    from app.db.supabase_client import get_supabase
    print("   ✓ Supabase client imported")
except Exception as e:
    print(f"   ✗ Supabase client error: {e}")
    sys.exit(1)

try:
    print("3. Testing API imports...")
    from app.api import inventory, products, receipts, shopping_lists, habits, predictor, stats
    print("   ✓ All API modules imported")
except Exception as e:
    print(f"   ✗ API import error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("4. Testing main app creation...")
    from app.main import app
    print("   ✓ Main app created successfully")
except Exception as e:
    print(f"   ✗ Main app error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n✓ All imports successful! Server should start correctly.")

