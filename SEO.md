# SEO técnico (Search Console)

## Origem do site (`SITE_ORIGIN`)

Os arquivos HTML usam URLs **absolutas** para:

- `<link rel="canonical">`
- `<link rel="alternate" hreflang="...">`

**Domínio canônico atual:** `https://conversor.convertflash.com`

Para alterar no futuro:

1. Edite `SITE_ORIGIN` em `scripts/apply-seo-meta.py` e rode:  
   `python scripts/apply-seo-meta.py`
2. Edite o mesmo valor em `scripts/generate-sitemap.py` e rode:  
   `python scripts/generate-sitemap.py`
3. Atualize `robots.txt` (linha `Sitemap:`).

## Redirecionamentos (sem loop)

- **`vercel.json`**: `/index.html` → `/` (301), uma única regra.
- **`_redirects`** (Netlify): mesma regra.
- **`.htaccess`** (Apache): mesma ideia; em **subpasta** descomente `RewriteBase` e ajuste o caminho.

Não configure, no mesmo host, uma regra que mande `/` → `/index.html` **e** outra `/index.html` → `/` — isso gera **loop**.

**GitHub Pages** (hospedagem estática) não aplica `.htaccess` nem `_redirects`. A consolidação principal é o **canonical** na home apontando para `https://conversor.convertflash.com/` (sem `index.html`).

## Google Search Console

- Cadastre a propriedade com prefixo de URL: `https://conversor.convertflash.com/`
- Envie o sitemap: `https://conversor.convertflash.com/sitemap.xml`
- O `x-default` das páginas principais aponta para a versão em inglês (`en.html`), alinhado ao conjunto hreflang existente.
