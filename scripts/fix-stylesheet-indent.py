from pathlib import Path

root = Path(__file__).resolve().parent.parent
for p in root.glob("*.html"):
    t = p.read_text(encoding="utf-8")
    t2 = t.replace("\n<link rel=\"stylesheet\"", "\n  <link rel=\"stylesheet\"", 1)
    if t != t2:
        p.write_text(t2, encoding="utf-8")
        print("fixed", p.name)
