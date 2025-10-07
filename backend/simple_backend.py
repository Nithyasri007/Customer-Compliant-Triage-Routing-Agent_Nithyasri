#!/usr/bin/env python3
import sys
print("Python version:", sys.version)
print("Starting Flask server...")

try:
    from flask import Flask, jsonify
    from flask_cors import CORS
    print("Flask and CORS imported successfully")
except ImportError as e:
    print(f"Import error: {e}")
    sys.exit(1)

app = Flask(__name__)
CORS(app)

@app.route('/api/health')
def health():
    print("Health check endpoint called")
    return jsonify({"success": True, "data": {"status": "ok"}})

@app.route('/api/dashboard/stats')
def stats():
    print("Dashboard stats endpoint called")
    return jsonify({
        "success": True,
        "data": {
            "total_complaints": 25,
            "pending_complaints": 8,
            "total_complaints_today": 3
        }
    })

if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5000")
    try:
        app.run(host='127.0.0.1', port=5000, debug=True)
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)
