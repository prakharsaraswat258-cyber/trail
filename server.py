import http.server
import socketserver
import os
import urllib.parse

PORT = int(os.environ.get('PORT', 3001))
PUBLIC_DIR = os.path.dirname(os.path.abspath(__file__))

MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
}

class PengaHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        pathname = parsed.path

        if pathname in ('/my-posts', '/my-posts/') or pathname.startswith('/my-posts'):
            filepath = os.path.join(PUBLIC_DIR, 'my-posts.html')
        elif pathname in ('/', '/search', '/search/', '/lost', '/lost/') or pathname.startswith('/search') or pathname.startswith('/lost'):
            filepath = os.path.join(PUBLIC_DIR, 'index.html')
        else:
            rel_path = pathname.lstrip('/')
            filepath = os.path.join(PUBLIC_DIR, rel_path)
            if not os.path.isfile(filepath):
                filepath = os.path.join(PUBLIC_DIR, 'index.html')

        if not os.path.isfile(filepath):
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"404 Not Found")
            return

        ext = os.path.splitext(filepath)[1].lower()
        content_type = MIME_TYPES.get(ext, 'application/octet-stream')

        try:
            with open(filepath, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))

    def log_message(self, format, *args):
        # Silent clean logging
        pass

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('0.0.0.0', PORT), PengaHTTPRequestHandler) as httpd:
        print("\n==================================================", flush=True)
        print(f"Penga Lost & Found Search Portal is LIVE on Port {PORT}!", flush=True)
        print(f"Search Portal: http://localhost:{PORT}/search", flush=True)
        print(f"My Posts:      http://localhost:{PORT}/my-posts", flush=True)
        print("==================================================\n", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
