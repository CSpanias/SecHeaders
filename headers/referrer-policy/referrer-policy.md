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

You can find a PoC walkthrough [here](https://cloudjourneys.notion.site/Referrer-Policy-29c53fc56d2680f998c5f6466b200f57).
