# Purpose

`Referrer-Policy` controls how much information the browser sends in the `Referer` HTTP header when navigating from one page to another (links, forms, images, scripts, redirects, etc.). Without a strict policy, URLs — including **query parameters that may contain sensitive data** — can be leaked to **third-party websites**. For example:

1. A user visits [`https://example.com/account?token=abcd1234`](https://example.com/account?token=abcd1234).
2. They then click to a link to `https://attacker.com/collect`.
3. If `Referrer-Policy` is **not** set or too permissive, the browser will send `Referer: https://example.com/account?token=abcd1234`.

This leaks internal paths, user identifiers, search terms, or even session tokens depending on poor app design. A strict `Referrer-Policy` prevents this kind of data leakage.

# Values

| Value | Behavior (when navigating) |
| --- | --- |
| `no-referrer` | Sends **no** `Referer` header, ever. |
| `same-origin` | Sends full referrer **only** to same origin; strips completely on cross-origin. |
| `strict-origin` | Sends only the origin (`https://example.com`) to HTTPS sites, **no path/query**, and sends nothing to HTTP. |
| `strict-origin-when-cross-origin` (Recommended) | Sends full URL **for same-origin**, origin only for cross-origin (and nothing on HTTP downgrade). |
| `no-referrer-when-downgrade`  | Sends full URL except when going from HTTPS → HTTP. Not privacy-friendly. |

# References

- [Referrer-Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)
- [Referrer Policy Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#referrer-policy)
- [Referrer Policy specification (W3C)](https://w3c.github.io/webappsec-referrer-policy/)

# PoC

The goal of this PoC is to demonstrate that without a policy, full URLs (including query parameters) are leaked to an external site, whereas with a strict policy, only the origin is leaked.

1. Start the server, confirm that the target header is not set, and visit the links:
    
    ```bash
    # Launch the server
    $ REFERRER=NONE node server.js
    Starting server on http://localhost:3000
    Referrer-Policy mode: NONE (no header set)
    Server ready.
    Try:
      curl -I "http://localhost:3000/victim.html?secret=LEAKME"
      Open: http://localhost:3000/victim.html?secret=LEAKME
    Change referrer mode with: REFERRER=NO_REFERRER node server.js
    ```
    
    ![referrer-policy-1a.png](/images/referrer-policy-1a.png)
    
    On the same-origin link (`leak.html`) the full `secret` should be leaked:
    
    ![referrer-policy-1b.png](/images/referrer-policy-1b.png)
    
    However, on the cross-origin link (`example.html`) only the origin is present. This happens because `strict-origin-when-cross-origin` is [the default value when no policy is specified](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy#strict-origin-when-cross-origin_2) according to MDN’s documentation:
    
    ![referrer-policy-1c.png](/images/referrer-policy-1c.png)
    
    ![referrer-policy-1d.png](a/images/referrer-policy-1d.png)
    
2. We can confirm the above default behavior by restarting the server with the target header explicitly set to `strict-origin-when-cross-origin`: 
    
    ```bash
    $ REFERRER=STRICT node server.js
    Starting server on http://localhost:3000
    Referrer-Policy mode: STRICT -> strict-origin-when-cross-origin
    Server ready.
    Try:
      curl -I "http://localhost:3000/victim.html?secret=LEAKME"
      Open: http://localhost:3000/victim.html?secret=LEAKME
    Change referrer mode with: REFERRER=NO_REFERRER node server.js
    ```
    
    ![referrer-policy2.png](attachment:c78c5f8d-6ac1-44d1-9b85-aa0cb199aa2e:referrer-policy2.png)
    
    As before, the secret will be leaked on same-origin request (`leak.html`):
    
    ![referrer-policy2a.png](attachment:71a721b3-dc88-4716-ba9b-3911da6939b9:referrer-policy2a.png)
    
    But not on cross-origin requests (`example.com`):
    
    ![referrer-policy2b.png](attachment:e2e6eee2-96b2-48f3-aca3-5cb35b24736d:referrer-policy2b.png)
    
3. Next, restart the server and set the permissive value of `no_referrer_when_downgrade`:
    
    ```bash
    $ REFERRER=NO_REFERRER_WHEN_DOWNGRADE node server.js
    Starting server on http://localhost:3000
    Referrer-Policy mode: NO_REFERRER_WHEN_DOWNGRADE -> no-referrer-when-downgrade
    Server ready.
    Try:
      curl -I "http://localhost:3000/victim.html?secret=LEAKME"
      Open: http://localhost:3000/victim.html?secret=LEAKME
    Change referrer mode with: REFERRER=NO_REFERRER node server.js
    ```
    
    ![referrer-policy3a.png](attachment:44728782-c093-4519-b618-ab0df410d7d9:referrer-policy3a.png)
    
    The `secret` should leak in both the same-origin (`leak.html`) and cross-origin (`example.com`) requests:
    
    ![referrer-policy3b.png](attachment:df06e664-f206-45bc-91c1-dc590c8cad7a:referrer-policy3b.png)
    
    ![referrer-policy3c.png](attachment:abdc1518-ff97-4479-a782-39e1b72dbd26:referrer-policy3c.png)
    

5. Finally, restart the server and set the header value to `no-referrer`:

```bash
$ REFERRER=NO_REFERRER node server.js
Starting server on http://localhost:3000
Referrer-Policy mode: NO_REFERRER -> no-referrer
Server ready.
Try:
  curl -I "http://localhost:3000/victim.html?secret=LEAKME"
  Open: http://localhost:3000/victim.html?secret=LEAKME
Change referrer mode with: REFERRER=NO_REFERRER node server.js
Referer received: (none)
Referer received: (none)
```

![referrer-policy4.png](attachment:d4ca80f4-2d45-4889-9ed1-2c58b97f57cd:referrer-policy4.png)

The header should not exist at all in both the same-origin (`leak.html`) and cross-origin requests (`example.com`):
