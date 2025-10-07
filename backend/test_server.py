from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/health')
def health():
    return jsonify({"success": True, "data": {"status": "ok"}})

@app.route('/api/dashboard/stats')
def stats():
    return jsonify({
        "success": True,
        "data": {
            "total_complaints": 25,
            "pending_complaints": 8,
            "total_complaints_today": 3
        }
    })

if __name__ == '__main__':
    print("Starting Flask server...")
    print("Server will be available at: http://localhost:5000")
    print("Health check: http://localhost:5000/api/health")
    print("Dashboard stats: http://localhost:5000/api/dashboard/stats")
    print("Press Ctrl+C to stop the server")
    app.run(host='127.0.0.1', port=5000, debug=True)