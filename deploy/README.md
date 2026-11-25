# Thinkcat Labs Termius / Nginx deployment

This package contains the current static export in `out/`, two deployment scripts and an Nginx example.

## Important: current build is a preview build

The bundled `out/` was built without `NEXT_PUBLIC_SITE_URL`. It works as a site, but it is intentionally `noindex` and has no production canonical, hreflang or sitemap entries.

- For an IP or staging smoke test, use this package as-is.
- For a public production domain, rebuild from the project source with the real HTTPS origin:

```bash
NEXT_PUBLIC_SITE_URL=https://thinkcatlabs.ai npm run build
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
sudo certbot --nginx -d thinkcatlabs.ai -d www.thinkcatlabs.ai
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

- The static export requires a separately running service for each live prediction endpoint.
- Playground calls the existing same-origin `POST /api/kumo/predict` route. Deployment must provide that route for live inference; the synthetic input sample is labelled, and prediction results come from the remote response.
- API Docs are a front-end Draft.
- Model links and contact details remain pending until verified.
- The build may be `noindex` until rebuilt with the production origin.

## Existing inference gateway

### Playground XGBoost

XGBoost trains and predicts in a dedicated browser worker for built-in examples and uploaded CSVs.
Deploy the complete static export including `workers/` and `vendor/`. Tabular data stays in the browser during XGBoost runs.
The bundled @wlearn/xgboost 0.3.0 includes XGBoost 3.4.1 compiled to WebAssembly and its license notices.
Training uses 50 CPU boosting rounds. Only the primary model can replay example recordings.

To regenerate the recordings, install `numpy` and `xgboost` (tested with XGBoost 3.2.0)
in your Python environment and run one of these commands from the repository root:

```bash
python scripts/generate-playground-benchmarks.py
python scripts/generate-playground-benchmarks.py --api-url https://thinkcatlabs.ai/api/kumo/predict
```

The first command records a local five-neighbor CPU baseline in the primary slot.
The second records the GPU response, using its reported elapsed time when available
and the measured request time otherwise. Both commands train XGBoost on each dataset's
support rows. The JSON is replaced after all 21 runs validate. Rebuild and deploy
`out/` to publish refreshed results.

Set `NEXT_PUBLIC_USE_LIVE_API=1` before building to enable live primary-model predictions,
including uploads. Only the primary model uses recorded examples on service failure.
For a local live preview, also set the variable when starting the preview, configure
`KUMO_INFERENCE_URL`, and run `npm run preview -- --kumo`. Set `PYTHON` in the shell
or in `.env.xgboost.local` to select an interpreter with the CPU dependencies.

The Nginx file is a static-site example, not a replacement for an existing production vhost. Preserve the deployed `/api/kumo/predict` location and its upstream configuration. The deploy script now rejects incomplete localized exports and invalid Nginx configuration before switching releases. Post-switch HTTP/inference smoke testing and recovery still require the operator; the printed smoke-test command is not an automated health check.
