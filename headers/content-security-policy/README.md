# Purpose

The `Content-Security-Policy` (CSP) HTTP response header allows a website to define **which sources of content the browser is allowed to load or execute**. It is one of the most powerful browser-side security controls available and is primarily designed to **mitigate JavaScript (JS) injection attacks**.

Browsers normally load resources such as scripts, images, stylesheets, iframes, fonts, AJAX requests, and media from any origin the page references. If an attacker manages to inject HTML or JS into a vulnerable page, the browser will execute it unless additional protections exist. CSP changes this by enforcing a **strict allowlist model**: the server declares what sources are trusted (e.g., `'self'`, a specific CDN, or a nonce-based inline script), and **everything else is blocked by default**. With a well-designed CSP, even successful HTML injection does *not* lead to script execution, because the malicious inline `<script>` or `<img onerror=...>` fails CSP validation.

CSP effectively replaces several legacy security headers:
- The most important example is `X-Frame-Options`, which is deprecated and fully replaced by the CSP directive `frame-ancestors`, giving finer control over which origins may embed a page.
- The old `X-XSS-Protection` header is also deprecated (and disabled in Chrome/Edge) because CSP offers significantly stronger XSS protection through `script-src` restrictions, nonces, and blocking inline scripts. CSP can also take over the role of `<base>` restrictions and some URL sanitization patterns through `navigate-to`.

While not replacements in the strict sense, CSP directives like `object-src`, `media-src`, and `script-src` also deprecate the need for plugin-control headers like `X-Content-Security-Policy` (old IE) and reduce reliance on some legacy HTML-based mitigations.

| Legacy Header | Status | CSP Directive | Notes |
| --- | --- | --- | --- |
| `X-Frame-Options` | ❌ Deprecated | **`frame-ancestors`** | CSP replacement is more flexible: supports multiple origins, wildcards, and `'none'`. |
| `X-XSS-Protection` | ❌ Deprecated / ignored | **`script-src`**, nonces, hashes, `'unsafe-inline'` blocking | Modern browsers disable XXP entirely; CSP is the recommended XSS defense. |
| `X-Content-Security-Policy` (old Firefox/IE CSP draft) | ❌ Obsolete | CSP standard header | This was an old prototype; modern CSP fully replaces it. |

# Values

A CSP header is composed of **directives**, each controlling a different type of content:

| Directive | Meaning / use |
| --- | --- |
| `default-src 'self'` | Fallback policy for all resource types (if no more specific directive exists) |
| `script-src 'self'` | Allowed JavaScript sources; blocks inline JS unless using `nonce-...` or `sha256-...` |
| `style-src 'self' 'unsafe-inline'` | Allowed CSS sources; inline styles must be explicitly allowed |
| `img-src 'self' data:` | Allowed image sources; `data:` enables base64-embedded images |
| `connect-src 'self'` | Allowed destinations for XHR, `fetch()`, WebSocket, etc. |
| `frame-ancestors 'none'` | Controls which sites may embed this page (modern replacement for `X-Frame-Options`) |
| `object-src 'none'` | Disables Flash/Java applet/legacy plugins |

Useful keywords:

| Keyword | Meaning |
| --- | --- |
| `'self'` | Same origin only |
| `'none'` | Nothing allowed |
| `'unsafe-inline'` | Allows inline `<script>` or `onclick=` handlers |
| `'unsafe-eval'` | Allows `eval()` and similar mechanisms |
| `'nonce-<value>'` | Allows inline scripts with a server-generated nonce attribute |
| `'strict-dynamic'` | Allows dynamically inserted scripts *only if* they originate from trusted scripts |

A simple but effective CSP example:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
```

This configuration blocks inline JavaScript, event handlers, remote scripts, plugin content, and most common XSS payloads.

# References

- [Content-Security-Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Google CSP Evaluator](https://csp-evaluator.withgoogle.com/)

# PoCs

This set of PoCs demonstrates a variety of real-world misuse cases of CSP — how it can block dangerous behavior, and where it’s most helpful.

| **Mode**            | **What It Demonstrates**                              | **CSP Used**                         | **Outcome**               |
| ------------------- | ----------------------------------------------------- | ------------------------------------ | ------------------------- |
| **no-csp**          | Baseline vulnerable mode                              | No CSP                               | Attacks work
| **reflected-xss**   | Reflected XSS                                         | `script-src 'self'`                  | Attack JS fails to run    |
| **dom-xss**         | DOM-based sink exploitation                           | `script-src 'self'`                  | Inline `<script>` blocked |
| **unsafe-inline**   | Why `'unsafe-inline'` is dangerous                    | `script-src 'self' 'unsafe-inline'`  | Attacker JS **executes**  |
| **script-nonce**    | Nonce-based script whitelisting                       | `script-src 'nonce-XYZ'`             | Only `nonce` scripts run  |
| **clickjacking**    | Iframe embedding                                      | `frame-ancestors 'none'`             | Page cannot be framed     |
| **xhr-restriction** | Restricting fetch/XHR destinations                    | `connect-src 'self' api.example.com` | Requests to others fail   |

## Reflected-XSS

In this demo, the page takes user input from the URL query (`?q=…`) and reflects it into the page using `innerHTML`, which is vulnerable to injected HTML (e.g. `<img onerror=…>`). With the CSP set to `script-src 'self'`, the browser will block inline or injected scripts that are not from your own domain. You should observe the payload being sanitized or not running, and a CSP violation message in the console.

> Reflected-XSS abuses the server, not the browser!

Start the server and inspect the headers to confirm that CSP is not set:

```bash
$ CSP_MODE=none node server.js

[CSP PoC] Running mode: none
[CSP PoC] No CSP header applied (CSP_MODE=none)

[CSP PoC] Server listening on http://localhost:3000
```

![reflected-xss-1a.png](images/reflected-xss-1a.png)

Restart the server with the CSP set:

```bash
$ CSP_MODE=reflected-xss node server.js

[CSP PoC] Running mode: reflected-xss
[CSP PoC] Using CSP header:
script-src 'self'

[CSP PoC] Server listening on http://localhost:3000
```

![reflected-xss-1b.png](images/reflected-xss-1b.png)

![reflected-xss-1c.png](images/reflected-xss-1c.png)

## Dom-XSS

Here, the vulnerability is entirely client-side: the script reads `window.location.hash` (the `#…` part of the URL) and executes it using `eval()`. This is a classic DOM-based XSS vector. When CSP is enabled, any JS constructed in this way is blocked if it violates the policy, showing how CSP protects even against purely client-side code injection.

> DOM-based XSS abuses insecure client-side JavaScript (within the browser), not the server!

Start the server and confirm the CSP is not set:

```bash
$ CSP_MODE=none node server.js

[CSP PoC] Running mode: none
[CSP PoC] No CSP header applied (CSP_MODE=none)

[CSP PoC] Server listening on http://localhost:3000
```

![dom-xss-1a.png](images/dom-xss-1a.png)

Restart the server with CSP set:

```bash
$ CSP_MODE=dom-xss node server.js

[CSP PoC] Running mode: dom-xss
[CSP PoC] Using CSP header:
script-src 'self'

[CSP PoC] Server listening on http://localhost:3000
```

![dom-xss-1b.png](images/dom-xss-1b.png)

![dom-xss-1c.png](images/dom-xss-1c.png)

## Unsafe-Inline

This mode allows `unsafe-inline` in the `script-src` directive. It demonstrates why inline scripts are dangerous: because CSP gives permission for inline script execution, any script injected via HTML or event handlers will run. This illustrates the trade-off between flexibility and security.

Start the server with CSP set:

```bash
$ CSP_MODE=unsafe-inline node server.js

[CSP PoC] Running mode: unsafe-inline
[CSP PoC] Using CSP header:
script-src 'self' 'unsafe-inline'

[CSP PoC] Server listening on http://localhost:3000
```

![unsafe-inline-1a.png](images/unsafe-inline-1a.png)

## Script-Nonce

In this PoC, the page uses a server-generated nonce in both the CSP header and the `<script>` tag. Only scripts carrying the correct nonce are allowed to execute. This is considered a strong and modern CSP approach: even if an attacker manages to inject a `<script>` tag, it won’t run without the matching nonce.

Start the server with CSP set:

```bash
$ CSP_MODE=script-nonce node server.js

[CSP PoC] Running mode: script-nonce
[CSP PoC] Using CSP header:
script-src 'nonce-random123'

[CSP PoC] Server listening on http://localhost:3000
```

If the page include a valid nonce script, it will run:

![script-nonce-1a.png](images/script-nonce-1a.png)

If an attacker attempt to inject an inline `<script>alert(1)</script>` without a valid nonce, it will be blocked:

![script-nonce-1b.png](images/script-nonce-1b.png)

## Clickjacking

The `frame-ancestors 'none'` directive is used here: this prevents any other page (even same-origin) from embedding our page in an `<iframe>`. While our PoC page itself remains accessible when opened directly, if we try to iframe it from another page, the browser will block it. That protects you against clickjacking, where malicious pages could trick users into clicking disguised buttons.

Start the server with CSP set:

```bash
$ CSP_MODE=clickjacking node server.js

[CSP PoC] Mode: clickjacking
[CSP PoC] CSP Header:
frame-ancestors 'none'

[CSP PoC] HTTPS server: https://localhost:3443
```

![clickjacking-1a.png](images/clickjacking-1a.png)

Try to embed the page into another page:

```bash
$ ls -l clickjacking-attacker.html
-rwxrwxrwx 1 x7331 x7331 154 Nov 18 09:09 clickjacking-attacker.html

$ python3 -m http.server 4000
Serving HTTP on 0.0.0.0 port 4000 (http://0.0.0.0:4000/) ...
```

![clickjacking-1b.png](images/clickjacking-1b.png)

![clickjacking-1c.png](images/clickjacking-1c.png)

## XHR-Restriction

This PoC shows how CSP can block unauthorized network requests. Via `connect-src 'self' https://allowed.example.com`, only specific destinations are allowed for fetch/XHR/WebSocket. In the example, trying to fetch `https://google.com` fails. This demonstrates how CSP can limit data exfiltration or communication to only trusted endpoints.

Start the server with CSP set:

```bash
$ CSP_MODE=xhr-restriction node server.js

[CSP PoC] Mode: xhr-restriction
[CSP PoC] CSP Header:
connect-src 'self' https://allowed.example.com

[CSP PoC] HTTPS server: https://localhost:3443
```

![xhr-1a.png](images/xhr-1a.png)

When we click *Allowed Fetch* the page tries to request `/api/data` which is a [localhost](http://localhost) URL and, thus, allowed to be fetched:

![xhr-1b.png](images/xhr-1b.png)

However, when we click *Blocked Fetch* the page tries to request `https://google.com`, which is not allowed based on the CSP and, therefore, is blocked:

![xhr-1c.png](images/xhr-1c.png)

![xhr-1d.png](images/xhr-1d.png)