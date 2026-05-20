import json
import os
import re
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

ROOT_DIR = Path(__file__).resolve().parent
MOVIES_FILE = ROOT_DIR / 'data' / 'movies.json'
MOVIES = json.loads(MOVIES_FILE.read_text(encoding='utf-8'))

class MovieHandler(SimpleHTTPRequestHandler):
    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_download(self, movie):
        filename = re.sub(r'[^a-z0-9]+', '-', movie['title'].lower()).strip('-') + '.mp4'
        content = (
            f"Placeholder movie file for {movie['title']}\n"
            "This demo server does not include a real movie asset. "
            "Replace the download endpoint with real storage content."
        ).encode('utf-8')

        self.send_response(200)
        self.send_header('Content-Type', 'application/octet-stream')
        self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
        self.send_header('Content-Length', str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/api/movies':
            movies = [
                {**movie, 'downloadUrl': f'/download/{movie["id"]}'}
                for movie in MOVIES
            ]
            return self.send_json(movies)

        if path.startswith('/api/justwatch'):
            # Proxy search to the unofficial JustWatch content API
            qs = parse_qs(parsed.query)
            query = qs.get('query', [''])[0]
            country = qs.get('country', ['en_US'])[0]
            api_url = f'https://apis.justwatch.com/content/titles/{country}/popular'
            body = json.dumps({
                'query': query,
                'page': 1,
                'page_size': 12,
                'content_types': ['movie', 'show']
            }).encode('utf-8')
            req = Request(api_url, data=body, headers={
                'Content-Type': 'application/json',
                'User-Agent': 'MovieZone/1.0'
            }, method='POST')
            try:
                with urlopen(req, timeout=12) as resp:
                    payload = json.loads(resp.read().decode('utf-8'))
            except Exception as e:
                import traceback
                traceback.print_exc()
                return self.send_json({'results': [], 'note': f'Could not fetch JustWatch data: {e}'}, status=200)

            items = payload.get('items', []) if isinstance(payload, dict) else []
            results = []
            for item in items:
                poster = ''
                images = item.get('poster') or item.get('images') or {}
                if isinstance(images, dict):
                    poster = images.get('standard') or images.get('poster') or ''

                results.append({
                    'id': item.get('jw_entity_id') or item.get('id'),
                    'title': item.get('title'),
                    'year': item.get('original_release_year') or item.get('original_release_date'),
                    'genre': (item.get('genre') or (item.get('object_type') or '')).strip(),
                    'description': item.get('short_description') or item.get('localized_release_date') or '',
                    'poster': poster,
                    'offers': item.get('offers', [])
                })

            return self.send_json({'results': results})

        if path.startswith('/api/movies/'):
            movie_id = path.split('/')[-1]
            if not movie_id.isdigit():
                return self.send_json({'error': 'Invalid movie ID'}, status=400)

            movie = next((m for m in MOVIES if m['id'] == int(movie_id)), None)
            if movie is None:
                return self.send_json({'error': 'Movie not found'}, status=404)

            return self.send_json({**movie, 'downloadUrl': f'/download/{movie["id"]}'})

        if path.startswith('/download/'):
            movie_id = path.split('/')[-1]
            if not movie_id.isdigit():
                self.send_error(400, 'Invalid movie ID')
                return

            movie = next((m for m in MOVIES if m['id'] == int(movie_id)), None)
            if movie is None:
                self.send_error(404, 'Movie not found')
                return

            return self.send_download(movie)

        return super().do_GET()


def run_server(host='0.0.0.0', port=3000):
    os.chdir(ROOT_DIR)
    address = (host, port)
    with HTTPServer(address, MovieHandler) as httpd:
        print(f"Serving on http://{host if host != '0.0.0.0' else 'localhost'}:{port}")
        httpd.serve_forever()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '3000'))
    host = os.environ.get('HOST', '0.0.0.0')
    run_server(host, port)
