
from flask import Flask, render_template, request, redirect, session, g
import sqlite3
import os

app = Flask(__name__)
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

@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if (username == 'user' and password == 'user123') or (username == 'adm' and password == 'adm123'):
            session['username'] = username
            return redirect('/dashboard')
    return render_template('login.html')

@app.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    if 'username' not in session:
        return redirect('/')
    
    db = get_db()
    cursor = db.cursor()

    if request.method == 'POST':
        if 'add' in request.form:
            name = request.form['name']
            quantity = int(request.form['quantity'])
            value = float(request.form['value'])
            cursor.execute("INSERT INTO lists (username, name, quantity, value) VALUES (?, ?, ?, ?)", (session['username'], name, quantity, value))
            db.commit()
        elif 'delete' in request.form:
            cursor.execute("DELETE FROM lists WHERE id=?", (request.form['delete'],))
            db.commit()
    
    if session['username'] == 'adm':
        cursor.execute("SELECT * FROM lists")
    else:
        cursor.execute("SELECT * FROM lists WHERE username=?", (session['username'],))
    
    items = cursor.fetchall()
    total = sum(item[3] * item[4] for item in items)
    return render_template('dashboard.html', items=items, total=total, is_admin=session['username']=='adm')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect('/')

if __name__ == "__main__":
    app.run(debug=True)
