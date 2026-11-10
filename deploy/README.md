# Thinkcat Labs Termius / Nginx deployment

This package contains the current static export in `out/`, two deployment scripts and an Nginx example.

## Important: current build is a preview build

The bundled `out/` was built without `NEXT_PUBLIC_SITE_URL`. It works as a site, but it is intentionally `noindex` and has no production canonical, hreflang or sitemap entries.

- For an IP or staging smoke test, use this package as-is.
- For a public production domain, rebuild from the project source with the real HTTPS origin:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example npm run build
```

Then replace `out/` in this package with the new export before running `deploy.sh`. Do not hand-edit canonical tags in the generated HTML.

## Package contents

```text
Thinkcat-Labs-V5.4-deploy/
  out/                       static site; deploy this
  deploy.sh                  release deploy + atomic symlink switch
  rollback.sh                switch to the previous release
  nginx-thinkcat.conf        example Nginx vhost
  README-DEPLOY.md           this file
  PACKAGE-MANIFEST.md        build and boundary details
  VERSION                    package version
```

## First deployment

The target is a Linux server with Nginx installed. The scripts assume `/var/www/thinkcat-labs`, which can be changed with `WEB_ROOT`.

### 1. Upload through Termius

Upload the archive to `/tmp`, then:

```bash
cd /tmp
tar -xzf Thinkcat-Labs-V5.4-deploy.tar.gz
cd Thinkcat-Labs-V5.4-deploy
```

If using the zip archive instead:

```bash
unzip Thinkcat-Labs-V5.4-deploy.zip
cd Thinkcat-Labs-V5.4-deploy
```

### 2. Install the Nginx vhost

On Debian/Ubuntu:

```bash
sudo cp nginx-thinkcat.conf /etc/nginx/sites-available/thinkcat-labs.conf
sudo ln -sfn /etc/nginx/sites-available/thinkcat-labs.conf /etc/nginx/sites-enabled/thinkcat-labs.conf
sudo nano /etc/nginx/sites-available/thinkcat-labs.conf
```

Replace `server_name _;` with the real domain, or leave it as `_` for a default server smoke test.

Then:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

On RHEL/CentOS, place the server block under `/etc/nginx/conf.d/` instead.

### 3. Deploy the release

```bash
sudo bash deploy.sh
```

The script:

- creates `/var/www/thinkcat-labs/releases/<timestamp>/`;
- copies `out/` into it;
- atomically switches `/var/www/thinkcat-labs/current`;
- runs `nginx -t` and reloads Nginx when available;
- keeps the five latest releases.

Use a different root if needed:

```bash
sudo WEB_ROOT=/srv/thinkcat-labs bash deploy.sh
```

### 4. Smoke test

```bash
curl -I http://SERVER_IP/
curl -I http://SERVER_IP/zh/
curl -I http://SERVER_IP/en/
curl -I http://SERVER_IP/_next/static/
```

Open the site in a browser and check `/zh/`, `/en/`, Products, Playground and API Docs.

## Rollback

```bash
sudo bash rollback.sh
```

This switches `current` to the previous release and reloads Nginx when available.

## HTTPS

After the domain points at the server, for example with Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.example -d www.your-domain.example
```

Do not enable HSTS until HTTPS and all subdomains are verified.

## Nginx notes

- `root /var/www/thinkcat-labs/current` follows the atomic release symlink.
- `_next/static/` is served with a one-year immutable cache because filenames are content-hashed.
- HTML uses `no-cache`, so a deploy becomes visible immediately.
- `try_files $uri $uri/ =404` works with the exported trailing-slash routes.
- `404.html` is included in the export.
- If you see 403, check that the release directory is readable by the Nginx worker:

```bash
sudo chmod -R a+rX /var/www/thinkcat-labs/releases
```

## Boundaries

This is a static frontend only.

- No backend, FastAPI, GPU worker or inference API.
- Playground runs a local browser demo and labels results as Demo.
- API Docs are a front-end Draft.
- Model links and contact details remain pending until verified.
- The build may be `noindex` until rebuilt with the production origin.
