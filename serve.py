import http.server
import os
import sys

PORT = 5173
os.chdir("dist")

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Serve actual files if they exist, otherwise serve index.html (SPA fallback)
        path = self.path.split("?")[0]
        if path != "/" and os.path.exists("." + path):
            return super().do_GET()
        self.path = "/index.html"
        return super().do_GET()

print(f"Serving on http://localhost:{PORT}")
http.server.HTTPServer(("", PORT), SPAHandler).serve_forever()
