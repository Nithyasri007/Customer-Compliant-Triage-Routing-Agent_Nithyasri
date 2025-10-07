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
    print("Server starting on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
