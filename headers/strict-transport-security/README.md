# Purpose

`Strict-Transport-Security` (HSTS) is an HTTP response header that tells browsers: **only access this site over HTTPS for a specified time**. Once a browser receives the header over a secure connection, it will automatically upgrade future `http://` requests for that host to `https://` and will refuse to connect to the site over plain HTTP — preventing downgrade attacks and cookie/session exposure over insecure channels. HSTS is a browser-enforced security control and only takes effect when initially received on a secure (HTTPS) connection.

# Values

| Directive | Meaning |
| --- | --- |
| `max-age=<seconds>` | Required. How long (in seconds) the browser should enforce HTTPS for the host. |
| `includeSubDomains` | Optional. Apply HSTS policy to all subdomains. Use with care. |
| `preload` | Optional. Request site be added to browser preload lists (site will be hardcoded in browsers as HTTPS-only). Read preload requirements before using. |

```bash
# Example header
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

# References

- [Strict-Transport-Security header (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security)
- [HTTP Strict Transport Security Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html)
- [HTTP Strict Transport Security (HSTS)](https://hstspreload.org/)

# PoC

This PoC shows how HSTS is sent and what effect it has on browsers. Important constraints:

- HSTS **only** applies when received over HTTPS. The header must be sent on an HTTPS response.
- To see automatic upgrades from `http://` to `https://` you should serve HTTPS on the standard port (443) or test with explicit hostnames/ports understanding how browsers treat ports. Using nonstandard ports complicates automatic upgrades (browsers normally upgrade the scheme and use default HTTPS port 443 unless the URL includes a port).
- For local testing, use `mkcert` (recommended) or a self-signed cert and accept it in your browser. You may need to run servers on privileged ports (80/443) which requires elevated permissions.

Below is a minimal Node PoC that runs an HTTPS server (port 443) and an HTTP server (port 80). The HTTPS server can be configured to send the HSTS header when `HSTS=1`. The victim HTML demonstrates the site; you’ll observe the header with `curl -I` and test the upgrade by visiting `http://example.test/` (mapped to localhost in `/etc/hosts`) — the browser will upgrade to HTTPS if HSTS previously received.

> Note: I use the hostname example.test to avoid issues with localhost and certs. Use mkcert to generate certs for example.test.

1. Generate a local certificate:

```bash
# Install mkcert
$ sudo apt install mkcert

# Install certutil
$ sudo apt install libnss3-tools

# Create a local Certificate Authority
$ mkcert -install
The local CA is already installed in the system trust store! 👍
ERROR: no Firefox and/or Chrome/Chromium security databases found

# Create a directory to store the certificate files
$ mkdir cert

# Generate a certificate for the example.test domain
$ mkcert -key-file cert/server.key -cert-file cert/server.crt example.test localhost 127.0.0.1 ::1
Note: the local CA is not installed in the Firefox and/or Chrome/Chromium trust store.
Run "mkcert -install" for certificates to be trusted automatically ⚠️

Created a new certificate valid for the following names 📜
 - "example.test"
 - "localhost"
 - "127.0.0.1"
 - "::1"

The certificate is at "cert/server.crt" and the key at "cert/server.key" ✅

It will expire on 1 February 2028 🗓

# Update the local DNS file
$ grep example.test /etc/hosts
127.0.0.1       localhost example.test
::1     ip6-localhost ip6-loopback example.test
```

2. Run the server without HSTS set and confirm that it’s not there:

```bash
$ HSTS=0 HOST=example.test node server.js
HTTPS server running: https://example.test:443/victim.html
HSTS is ENABLED -> max-age=31536000; includeSubDomains; preload
HTTP server running: http://example.test:80/victim.html

$ curl -I https://example.test
HTTP/1.1 200 OK
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Type: text/html; charset=utf-8
Date: Sat, 01 Nov 2025 10:51:09 GMT
Connection: keep-alive
Keep-Alive: timeout=5

$ curl -I http://example.test
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Date: Sat, 01 Nov 2025 10:51:13 GMT
Connection: keep-alive
Keep-Alive: timeout=
```

![strict-transport-security-1a.png](images/strict-transport-security-1a.png)

3. Run the server with HSTS and try again:

```bash
$ HSTS=1 HOST=example.test node server.js
HTTPS server running: https://example.test:443/victim.html
HSTS is ENABLED -> max-age=31536000; includeSubDomains; preload
HTTP server running: http://example.test:80/victim.html

$ curl -I https://example.test
HTTP/1.1 200 OK
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Type: text/html; charset=utf-8
Date: Sat, 01 Nov 2025 10:52:16 GMT
Connection: keep-alive
Keep-Alive: timeout=5

$ curl -I http://example.test
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Date: Sat, 01 Nov 2025 10:52:18 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

![strict-transport-security-1b.png](images/strict-transport-security-1b.png)

4. After visiting the `https://` protocol, the certificate would be stored in the browser. As a result, by visiting the `http://` version of the server the browser should automatically rewrite HTTP to HTTPS before the request leaves:

![strict-transport-security-1c.png](images/strict-transport-security-1c.png)

![strict-transport-security-1d.png](images/strict-transport-security-1d.png)