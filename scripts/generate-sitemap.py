#!/usr/bin/env python3
"""Gera sitemap.xml SPA bilíngue com hreflang xhtml."""
from pathlib import Path

SITE_ORIGIN = "https://conversor.convertflash.com"


def main():
    root = Path(__file__).resolve().parent.parent
    xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>{SITE_ORIGIN}/</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="{SITE_ORIGIN}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="{SITE_ORIGIN}/en.html"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="{SITE_ORIGIN}/en.html"/>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>{SITE_ORIGIN}/en.html</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="{SITE_ORIGIN}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="{SITE_ORIGIN}/en.html"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="{SITE_ORIGIN}/en.html"/>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
'''
    (root / "sitemap.xml").write_text(xml, encoding="utf-8")
    print("Wrote sitemap.xml")


if __name__ == "__main__":
    main()