# MovieZone

A movie website powered by a Node.js/Express server. This demo includes a hosted API, dynamic movie data, and download routes for a functional local application.

## Features

- Server-hosted movie catalog API
- Search, genre filtering, and sort functionality
- Movie details modal with trailer links
- Download routes for demo movie assets
- Watchlist persistence using `localStorage`
- AI-powered assistant for browsing preferences and movie recommendations

## Files

- `index.html` — main page structure
- `styles.css` — presentation and responsive layout styles
- `script.js` — browser logic that fetches from the server API
- `server.js` — Express server that hosts the site and API
- `server.py` — Python server alternative using only the standard library
- `data/movies.json` — movie catalog data
- `package.json` — project dependency and script settings
- `.gitignore` — ignores `node_modules` and log files

## Run locally with Python

1. Open a terminal in `movie-website`.
2. Start the Python server:

   ```bash
   python server.py
   ```

3. Open `http://localhost:3000` in your browser.

## Static GitHub Pages deployment

This version of MovieZone is now static and can be hosted on GitHub Pages without any backend.

1. Install Git if you have not already: https://git-scm.com/downloads
2. Push the repository to GitHub.
3. Enable GitHub Pages in the repository settings, using the `main` branch and `/` root.
4. Open the GitHub Pages URL shown in the repository settings.

## GitHub Pages automation

The repo includes a GitHub Actions workflow that deploys the site automatically when you push to `main`.

### Deploy using PowerShell

Run this once your GitHub repo exists:

```powershell
cd "C:\Users\HP G5 TOUCH\movie-website"
.\deploy_github.ps1 https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

If your repository already has a remote, you can omit the URL:

```powershell
.\deploy_github.ps1
```

If your repository is connected to GitHub, just push changes to `main` and the workflow will publish the static site.

## JustWatch availability (proxy)

This project includes a simple server-side proxy to query the unofficial JustWatch content API. Use it to check where titles are available.

Example request (search):

```bash
curl "http://localhost:3000/api/justwatch?query=inception&country=en_US"
```

The endpoint returns a JSON object with a `results` array. Each item contains `title`, `year`, `genre`, `description`, `poster`, and `offers` (when available).

Note: This uses an unofficial JustWatch endpoint. It is intended for demo and discovery purposes only. For production use, review JustWatch's terms and consider an official data provider or licensed feed.

If you deploy this site as static GitHub Pages, JustWatch availability will not be available because it requires a backend API.

## Deploy to Google Cloud Run

1. Install and authenticate the Google Cloud SDK: `gcloud auth login` and `gcloud config set project <PROJECT_ID>`.

2. Build and deploy using the helper script (make executable first):

```bash
chmod +x deploy_cloud_run.sh
./deploy_cloud_run.sh <PROJECT_ID> [region]
# example: ./deploy_cloud_run.sh my-gcp-project us-central1
```

Or use Cloud Build directly with the provided `cloudbuild.yaml`:

```bash
gcloud builds submit --config cloudbuild.yaml --substitutions _REGION=us-central1,_PORT=8080
```

After deployment, run:

```bash
gcloud run services describe moviezone --platform managed --region us-central1 --format "value(status.url)"
```

Use that URL for Google Search Console and to share with users.

> Or launch the site automatically with the bundled Windows launcher:
>
> ```bash
> launch.bat
> ```

## Optional Node.js setup

If you want to use the Node.js server instead, install dependencies:

```bash
npm install
```

Then start the Node server:

```bash
npm start
```

## Notes

- The download endpoints return placeholder demo files.
- Replace the `/download/:id` route with real movie file delivery or cloud storage to serve actual content.
- Use `PORT` and `HOST` environment variables to change the server host and port if needed.
