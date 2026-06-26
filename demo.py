import sqlite3
from datetime import datetime, timezone

from flask import Flask, g, jsonify, request

app = Flask(__name__)
DATABASE = "data.db"


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_db():
    """Return a per-request SQLite connection stored on Flask's g object."""
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE, detect_types=sqlite3.PARSE_DECLTYPES)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    """Close the database connection at the end of each request."""
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    """Create the items table if it does not already exist."""
    db = get_db()
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS items (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            description TEXT,
            created_at  TEXT    NOT NULL
        )
        """
    )
    db.commit()


def row_to_dict(row):
    """Convert a sqlite3.Row to a plain dict."""
    return {key: row[key] for key in row.keys()}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/items", methods=["GET"])
def get_items():
    """Return all items."""
    db = get_db()
    rows = db.execute("SELECT * FROM items ORDER BY id").fetchall()
    return jsonify([row_to_dict(r) for r in rows]), 200


@app.route("/items/<int:item_id>", methods=["GET"])
def get_item(item_id):
    """Return a single item by id."""
    db = get_db()
    row = db.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
    if row is None:
        return jsonify({"error": "Item not found"}), 404
    return jsonify(row_to_dict(row)), 200


@app.route("/items", methods=["POST"])
def create_item():
    """Create a new item."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Field 'name' is required and must be non-empty"}), 400

    description = data.get("description", "")
    created_at = datetime.now(timezone.utc).isoformat()

    db = get_db()
    cursor = db.execute(
        "INSERT INTO items (name, description, created_at) VALUES (?, ?, ?)",
        (name, description, created_at),
    )
    db.commit()

    new_row = db.execute(
        "SELECT * FROM items WHERE id = ?", (cursor.lastrowid,)
    ).fetchone()
    return jsonify(row_to_dict(new_row)), 201


@app.route("/items/<int:item_id>", methods=["PUT"])
def update_item(item_id):
    """Update an existing item."""
    db = get_db()
    row = db.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
    if row is None:
        return jsonify({"error": "Item not found"}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    name = data.get("name", row["name"]).strip()
    if not name:
        return jsonify({"error": "Field 'name' must be non-empty"}), 400

    description = data.get("description", row["description"])

    db.execute(
        "UPDATE items SET name = ?, description = ? WHERE id = ?",
        (name, description, item_id),
    )
    db.commit()

    updated_row = db.execute(
        "SELECT * FROM items WHERE id = ?", (item_id,)
    ).fetchone()
    return jsonify(row_to_dict(updated_row)), 200


@app.route("/items/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    """Delete an item by id."""
    db = get_db()
    row = db.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
    if row is None:
        return jsonify({"error": "Item not found"}), 404

    db.execute("DELETE FROM items WHERE id = ?", (item_id,))
    db.commit()
    return jsonify({"message": f"Item {item_id} deleted successfully"}), 200


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    with app.app_context():
        init_db()
    app.run(debug=True)
