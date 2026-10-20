import sqlite3
import json

db_path = 'backup_safety/portfolio.db'
conn = sqlite3.connect(f'file:{db_path}?mode=ro', uri=True)
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cursor.fetchall()]
print(f"Total tables found: {len(tables)}")
print(f"Tables list: {tables}")

results = {}
for t in tables:
    cursor.execute(f'SELECT count(*) FROM "{t}"')
    cnt = cursor.fetchone()[0]
    cursor.execute(f'PRAGMA table_info("{t}")')
    cols = [col[1] for col in cursor.fetchall()]
    cursor.execute(f'SELECT * FROM "{t}"')
    rows = cursor.fetchall()
    row_dicts = [dict(zip(cols, r)) for r in rows]
    results[t] = {
        'count': cnt,
        'columns': cols,
        'rows': row_dicts
    }
    print(f"\n==================== TABLE: {t} ({cnt} rows) ====================")
    for r in row_dicts:
        print(json.dumps(r, indent=2, default=str))

with open('backup_safety/dump_portfolio_db.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, default=str)

print("\nSaved full dump to backup_safety/dump_portfolio_db.json")
conn.close()
