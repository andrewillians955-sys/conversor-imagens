#!/usr/bin/env python3
"""Gera sitemap.xml com a mesma origem dos metadados SEO."""
from pathlib import Path
from xml.sax.saxutils import escape

SITE_ORIGIN = "https://conversor.convertflash.com"

PATHS = [
    "/",
    "/en.html",
    "/es.html",
    "/sobre.html",
    "/sobre-en.html",
    "/sobre-es.html",
    "/privacidade.html",
    "/privacidade-en.html",
    "/privacidade-es.html",
    "/cookies.html",
    "/cookies-en.html",
    "/cookies-es.html",
    "/faq.html",
    "/faq-en.html",
    "/faq-es.html",
    "/dmca.html",
    "/dmca-en.html",
    "/dmca-es.html",
    "/termos.html",
    "/termos-en.html",
    "/termos-es.html",
    "/lgpd.html",
    "/lgpd-en.html",
    "/lgpd-es.html",
]


def main():
    root = Path(__file__).resolve().parent.parent
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for p in PATHS:
        loc = SITE_ORIGIN.rstrip("/") + p if p != "/" else SITE_ORIGIN + "/"
        lines.append("  <url>")
        lines.append(f"    <loc>{escape(loc)}</loc>")
        lines.append("  </url>")
    lines.append("</urlset>")
    (root / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("Wrote sitemap.xml")


if __name__ == "__main__":
    main()
