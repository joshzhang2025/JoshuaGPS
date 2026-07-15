"""Local static server WITH HTTP Range support.

Python's built-in `python -m http.server` ignores the `Range` header and always
returns the whole file (200 OK). Browsers need `206 Partial Content` responses to
seek/scrub inside <video>, so with the built-in server you can only play/pause.

This server adds Range handling so video seeking works locally, matching how
Netlify serves the deployed site. Usage:

    python serve.py            # serves this folder on http://127.0.0.1:10001
    python serve.py 8080       # custom port
"""
import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler


class RangeRequestHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        rng = self.headers.get("Range")
        if rng is None:
            return super().send_head()

        path = self.translate_path(self.path)
        # Directories and missing files fall back to the default handling.
        if os.path.isdir(path) or not os.path.exists(path):
            return super().send_head()

        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        try:
            file_size = os.fstat(f.fileno()).st_size
            start, end = self._parse_range(rng, file_size)
            if start is None:
                # Unsatisfiable range.
                f.close()
                self.send_response(416, "Requested Range Not Satisfiable")
                self.send_header("Content-Range", f"bytes */{file_size}")
                self.end_headers()
                return None

            length = end - start + 1
            self.send_response(206, "Partial Content")
            self.send_header("Content-Type", self.guess_type(path))
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
            self.send_header("Content-Length", str(length))
            self.send_header("Last-Modified", self.date_time_string(os.fstat(f.fileno()).st_mtime))
            self.end_headers()
            f.seek(start)
            return _RangeReader(f, length)
        except Exception:
            f.close()
            raise

    @staticmethod
    def _parse_range(rng, file_size):
        # Only a single "bytes=start-end" range is supported (enough for media seeking).
        if not rng.startswith("bytes="):
            return None, None
        spec = rng[len("bytes="):].split(",")[0].strip()
        if "-" not in spec:
            return None, None
        start_s, _, end_s = spec.partition("-")
        try:
            if start_s == "":
                # Suffix range: last N bytes.
                n = int(end_s)
                if n == 0:
                    return None, None
                start = max(0, file_size - n)
                end = file_size - 1
            else:
                start = int(start_s)
                end = int(end_s) if end_s else file_size - 1
        except ValueError:
            return None, None
        end = min(end, file_size - 1)
        if start > end or start >= file_size:
            return None, None
        return start, end


class _RangeReader:
    """Wraps an open file so copyfile() streams only the requested slice."""

    def __init__(self, fileobj, length):
        self._f = fileobj
        self._remaining = length

    def read(self, amt=-1):
        if self._remaining <= 0:
            return b""
        if amt < 0 or amt > self._remaining:
            amt = self._remaining
        data = self._f.read(amt)
        self._remaining -= len(data)
        return data

    def close(self):
        self._f.close()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 10001
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = HTTPServer(("127.0.0.1", port), RangeRequestHandler)
    print(f"Serving with Range support on http://127.0.0.1:{port}  (Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
