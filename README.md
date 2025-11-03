# SecHeaders (Referrer-Policy demo integrated)

## Quickstart

1. Install dependencies:

```bash
npm install
```

2. Run (no header set):

```bash
REFERRER=NONE npm start
```

3. Open:
- Explanation: `http://localhost:3000/headers/referrer-policy`
- PoC victim: `http://localhost:3000/poc/referrer-policy/victim.html?secret=LEAKME`
- Click links and watch the server console — the leak endpoint logs the Referer header.

4. Toggle behavior:
- Global default: `REFERRER=STRICT npm start`
- Per-request: append `?mode=NO_REFERRER` (or other mode) to PoC URLs.