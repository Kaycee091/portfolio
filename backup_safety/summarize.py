import json

with open('backup_safety/dump_portfolio_db.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("DATABASE INVENTORY IN portfolio.db:")
print("=" * 60)
for table, val in data.items():
    print(f"Table: {table:22} | Count: {val['count']}")
    if val['count'] > 0:
        for i, row in enumerate(val['rows']):
            ident = row.get('name') or row.get('title') or row.get('full_name') or row.get('platform') or row.get('portfolio_title') or f"Row {i+1}"
            print(f"   -> [{i+1}] {ident}")
print("=" * 60)
