"""
Start Flask app and expose publicly via ngrok
"""
import subprocess
import time
from pyngrok import ngrok

# Start Flask app in background
print("Starting Flask app...")
flask_process = subprocess.Popen(['python', 'app.py'])

# Give it time to start
time.sleep(3)

# Connect ngrok
print("Connecting ngrok...")
public_url = ngrok.connect(5000)
print("\n" + "="*60)
print("✅ YOUR WEBSITE IS NOW ONLINE!")
print("="*60)
print(f"\n📱 Share this link with anyone:\n   {public_url}\n")
print("="*60)
print("\nPress CTRL+C to stop the server\n")

# Keep ngrok tunnel open
ngrok_process = ngrok.get_ngrok_process()
ngrok_process.proc.wait()
