from flask import Flask, request, jsonify
import psycopg2
from psycopg2 import errors, errorcodes
from psycopg2.errors import IntegrityError
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Database connection settings
DB_HOST = "" # Your Postgres Host Name
DB_NAME = "" # Your Postgres Name
DB_USER = "" # Your Postgres User
DB_PASS = "" # Your Postgres Password

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )

from psycopg2 import errorcodes
from psycopg2.errors import IntegrityError

@app.route("/add_user", methods=['POST'])
def add_user():
    data = request.get_json()
    name = data.get('name')
    address = data.get('address')

    if not name or not address:
        return jsonify({"error": "Name and address are required"}), 400

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Check if name exists (case-insensitive)
        cur.execute("SELECT 1 FROM users WHERE LOWER(name) = LOWER(%s)", (name,))
        exists = cur.fetchone()
        if exists:
            return jsonify({"error": "Name already exists"}), 409

        # Insert user and return inserted id
        cur.execute(
            "INSERT INTO users (name, address) VALUES (%s, %s) RETURNING id;",
            (name, address)
        )
        inserted_id = cur.fetchone()[0]
        conn.commit()

        return jsonify({
            "message": "User added successfully",
            "id": inserted_id,
            "name": name,
            "address": address
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@app.route("/display_users", methods=["GET"])
def display_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id, name, address FROM users")
        rows = cursor.fetchall()

        users = [{"id": row[0], "name": row[1], "address": row[2]} for row in rows]

        cursor.close()
        conn.close()

        return jsonify({"users": users})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/search_users", methods=["GET"])
def search_users():
    query = request.args.get("query", "").strip()

    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Use ILIKE for case-insensitive search, match anywhere in name or address
        cur.execute(
            """
            SELECT id, name, address
            FROM users
            WHERE CAST(id AS TEXT) ILIKE %s
            OR name ILIKE %s
            OR address ILIKE %s
            """,
            (f"%{query}%", f"%{query}%", f"%{query}%")
        )
        rows = cur.fetchall()

        users = [{"id": row[0], "name": row[1], "address": row[2]} for row in rows]

        cur.close()
        conn.close()

        return jsonify({"users": users})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/edit_user/<int:user_id>", methods=["PUT"])
def edit_user(user_id):
    data = request.get_json()
    name = data.get('name')
    address = data.get('address')

    if not name or not address:
        return jsonify({"error": "Name and address are required"}), 400

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Check if name exists for a different user (case-insensitive)
        cur.execute(
            "SELECT id FROM users WHERE LOWER(name) = LOWER(%s) AND id != %s;",
            (name, user_id)
        )
        existing = cur.fetchone()
        if existing:
            return jsonify({"error": "Name already exists"}), 409

        # Proceed to update
        cur.execute(
            "UPDATE users SET name = %s, address = %s WHERE id = %s RETURNING id;",
            (name, address, user_id)
        )
        updated = cur.fetchone()

        if updated:
            conn.commit()
            return jsonify({"message": f"updated successfully"}), 200
        else:
            return jsonify({"error": "User not found"}), 404

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@app.route("/delete_user/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("DELETE FROM users WHERE id = %s RETURNING id;", (user_id,))
        deleted = cur.fetchone()

        if deleted:
            conn.commit()
            return jsonify({"message": f"deleted successfully"}), 200
        else:
            return jsonify({"error": "User not found"}), 404

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
