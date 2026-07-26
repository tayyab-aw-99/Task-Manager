import sqlite3
from datetime import datetime

# Database se connect
conn = sqlite3.connect("task.db", check_same_thread=False)

# SQL commands chalane ke liye cursor
cursor = conn.cursor()

# Table create karo agar pehle se na ho
cursor.execute("""
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# Add date column to existing tables if it doesn't exist
try:
    cursor.execute("ALTER TABLE tasks ADD COLUMN created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
except:
    pass

# Update NULL dates with current timestamp
try:
    cursor.execute("UPDATE tasks SET created_date = CURRENT_TIMESTAMP WHERE created_date IS NULL")
except:
    pass

# Changes save karo
conn.commit()