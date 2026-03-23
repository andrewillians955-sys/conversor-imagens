#!/usr/bin/env python3
"""Atualiza canonical + hreflang com URLs absolutas. Edite SITE_ORIGIN se usar domínio próprio."""
import re
from pathlib import Path

SITE_ORIGIN = "https://conversor.convertflash.com"

FILES = [
    ("index.html", "/"),
    ("en.html", "/en.html"),
    ("es.html", "/es.html"),
    ("sobre.html", "/sobre.html"),
    ("sobre-en.html", "/sobre-en.html"),
    ("sobre-es.html", "/sobre-es.html"),
    ("privacidade.html", "/privacidade.html"),
    ("privacidade-en.html", "/privacidade-en.html"),
    ("privacidade-es.html", "/privacidade-es.html"),
    ("cookies.html", "/cookies.html"),
    ("cookies-en.html", "/cookies-en.html"),
    ("cookies-es.html", "/cookies-es.html"),
    ("faq.html", "/faq.html"),
    ("faq-en.html", "/faq-en.html"),
    ("faq-es.html", "/faq-es.html"),
    ("dmca.html", "/dmca.html"),
    ("dmca-en.html", "/dmca-en.html"),
    ("dmca-es.html", "/dmca-es.html"),
    ("termos.html", "/termos.html"),
    ("termos-en.html", "/termos-en.html"),
    ("termos-es.html", "/termos-es.html"),
    ("lgpd.html", "/lgpd.html"),
    ("lgpd-en.html", "/lgpd-en.html"),
    ("lgpd-es.html", "/lgpd-es.html"),
]

CLUSTERS = {
    "main": {
        "pt-BR": "/",
        "en": "/en.html",
        "es": "/es.html",
        "x-default": "/en.html",
    },
    "sobre": {
        "pt-BR": "/sobre.html",
        "en": "/sobre-en.html",
        "es": "/sobre-es.html",
        "x-default": "/sobre-en.html",
    },
    "privacidade": {
        "pt-BR": "/privacidade.html",
        "en": "/privacidade-en.html",
        "es": "/privacidade-es.html",
        "x-default": "/privacidade-en.html",
    },
    "cookies": {
        "pt-BR": "/cookies.html",
        "en": "/cookies-en.html",
        "es": "/cookies-es.html",
        "x-default": "/cookies-en.html",
    },
    "faq": {
        "pt-BR": "/faq.html",
        "en": "/faq-en.html",
        "es": "/faq-es.html",
        "x-default": "/faq-en.html",
    },
    "dmca": {
        "pt-BR": "/dmca.html",
        "en": "/dmca-en.html",
        "es": "/dmca-es.html",
        "x-default": "/dmca-en.html",
    },
    "termos": {
        "pt-BR": "/termos.html",
        "en": "/termos-en.html",
        "es": "/termos-es.html",
        "x-default": "/termos-en.html",
    },
    "lgpd": {
        "pt-BR": "/lgpd.html",
        "en": "/lgpd-en.html",
        "es": "/lgpd-es.html",
        "x-default": "/lgpd-en.html",
    },
}

FILE_CLUSTER = {
    "index.html": "main",
    "en.html": "main",
    "es.html": "main",
}
for stem, key in [
    ("sobre", "sobre"),
    ("privacidade", "privacidade"),
    ("cookies", "cookies"),
    ("faq", "faq"),
    ("dmca", "dmca"),
    ("termos", "termos"),
    ("lgpd", "lgpd"),
]:
    FILE_CLUSTER[f"{stem}.html"] = key
    FILE_CLUSTER[f"{stem}-en.html"] = key
    FILE_CLUSTER[f"{stem}-es.html"] = key


def abs_url(path: str) -> str:
    if path == "/":
        return SITE_ORIGIN + "/"
    return SITE_ORIGIN + path


def build_hreflang_block(cluster: str) -> str:
    c = CLUSTERS[cluster]
    lines = []
    for lang in ("pt-BR", "en", "es", "x-default"):
        lines.append(
            f'  <link rel="alternate" hreflang="{lang}" href="{abs_url(c[lang])}">'
        )
    return "\n".join(lines)


def main():
    root = Path(__file__).resolve().parent.parent
    pattern = re.compile(
        r"(  <link rel=\"canonical\" href=\"[^\"]+\">\s*)?"
        r"  <link rel=\"alternate\" hreflang=\"pt-BR\" href=\"[^\"]+\">\s*"
        r"  <link rel=\"alternate\" hreflang=\"en\" href=\"[^\"]+\">\s*"
        r"  <link rel=\"alternate\" hreflang=\"es\" href=\"[^\"]+\">\s*"
        r"  <link rel=\"alternate\" hreflang=\"x-default\" href=\"[^\"]+\">\s*",
        re.MULTILINE,
    )
    for filename, canon in FILES:
        cluster = FILE_CLUSTER[filename]
        path = root / filename
        text = path.read_text(encoding="utf-8")
        canon_url = abs_url(canon)
        new_block = (
            f'  <link rel="canonical" href="{canon_url}">\n'
            f"{build_hreflang_block(cluster)}\n"
        )
        new_text, n = pattern.subn(new_block, text, count=1)
        if n != 1:
            raise SystemExit(f"Substituição falhou em {filename} (matches={n})")
        path.write_text(new_text, encoding="utf-8")
        print("OK", filename)


if __name__ == "__main__":
    main()
