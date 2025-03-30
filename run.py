import subprocess
import time

# Start the backend
backend_process = subprocess.Popen(["python", "./backend/app.py"])
time.sleep(3)  # Give the backend some time to start

# Start the frontend
frontend_process = subprocess.Popen(["python", "-m", "http.server", "8080"], cwd="frontend")

# Keep both processes running
try:
    backend_process.wait()
    frontend_process.wait()
except KeyboardInterrupt:
    backend_process.terminate()
    frontend_process.terminate()
