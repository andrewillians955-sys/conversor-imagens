from pathlib import Path

root = Path(__file__).resolve().parent.parent
base = "https://andrewillians955-sys.github.io/conversor-imagens"
for p in sorted(root.glob("*.html")):
    t = p.read_text(encoding="utf-8")
    assert 'rel="canonical"' in t, p.name
    assert 'hreflang="pt-BR"' in t, p.name
    assert base in t, p.name
print("OK: todos os HTML têm canonical e hreflang absolutos.")
