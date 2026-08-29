import http.server
import socketserver
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        clean_path = self.path.split('?')[0].rstrip('/')
        if clean_path in ['', '/lost', '/lost-item']:
            self.path = '/index.html'
        elif clean_path in ['/my-posts', '/posts']:
            self.path = '/my-posts.html'
        elif clean_path.startswith('/lost/'):
            self.path = '/index.html'
        return super().do_GET()

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"Server started on http://localhost:{PORT}")
            sys.stdout.flush()
            httpd.serve_forever()
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.stdout.flush()
