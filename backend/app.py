
from flask import Flask, render_template, request, redirect, session, g, jsonify
import sqlite3
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.secret_key = "supersecretkey"
DATABASE = "shopping_list.db"

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.before_first_request
def initialize_db():
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS lists (
                id INTEGER PRIMARY KEY,
                username TEXT,
                name TEXT,
                quantity INTEGER,
                value REAL
            )
        ''')
        db.commit()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if (username == 'user' and password == 'user123') or (username == 'adm' and password == 'adm123'):
        return jsonify({'success': True, 'username': username})
    return jsonify({'success': False}), 401

@app.route('/api/items', methods=['GET', 'POST', 'DELETE'])
def items():
    username = request.args.get('username')
    db = get_db()
    cursor = db.cursor()

    if request.method == 'POST':
        data = request.get_json()
        cursor.execute("INSERT INTO lists (username, name, quantity, value) VALUES (?, ?, ?, ?)",
                       (username, data['name'], data['quantity'], data['value']))
        db.commit()
        return jsonify({'success': True})

    if request.method == 'DELETE':
        item_id = request.args.get('id')
        cursor.execute("DELETE FROM lists WHERE id=?", (item_id,))
        db.commit()
        return jsonify({'success': True})

    if username == 'adm':
        cursor.execute("SELECT * FROM lists")
    else:
        cursor.execute("SELECT * FROM lists WHERE username=?", (username,))
    items = cursor.fetchall()
    item_list = [{
        'id': item[0],
        'username': item[1],
        'name': item[2],
        'quantity': item[3],
        'value': item[4],
        'total': item[3] * item[4]
    } for item in items]
    return jsonify({'items': item_list, 'total': sum(i['total'] for i in item_list)})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
