# **SecHeaders**

SecHeaders is an educational project designed to **teach and demonstrate HTTP Security Headers** through **live, isolated Proofs of Concept (PoCs)**. Each PoC shows:
* What protection the header is supposed to provide
* What happens when the header is missing or misconfigured

The project includes a **unified Express application** that loads all PoCs dynamically and provides a clean UI where users can explore each header interactively. Each header has its own folder under `headers/`, containing:

* `manifest.json` (metadata used by the dashboard)
* `index.html` (README viewer)
* `README.md` (explanations, PoC notes, screenshots)
* PoC-specific scripts (e.g., `server.js`, demo HTML files, assets)

---

## **Project Structure**

```
SecHeaders/
├── headers/
│   ├── content-security-policy/
│   │   ├── index.html
│   │   ├── README.md
│   │   ├── manifest.json
│   │   └── (PoC files...)
│   ├── content-type/
│   ├── referrer-policy/
│   ├── strict-transport-security/
│   ├── x-content-type-options/
│   ├── x-frame-options/
│   ├── x-xss-protection/
│   ├── style.css   ← shared UI styling
│
├── app/
│   ├── index.js            ← creates the unified UI
│   ├── routerFactory.js     ← mounts each PoC dynamically
│
├── unified-app.js     ← main entry point
├── package.json
└── README.md          ← (you are here)
```
---

## **Running the App**

Clone and enter the project:

```bash
git clone https://github.com/CSpanias/SecHeaders.git
cd SecHeaders
```

Install dependencies:

```bash
npm install
```

Start the unified learning dashboard:

```bash
node unified-app.js
```

Then visit:

```
http://localhost:3000
```

You’ll see a dashboard listing all PoCs, each with its own description and link.

---

## **Running Individual PoCs**

Each PoC can still be run standalone if you prefer testing them directly.

Example:

```bash
cd headers/referrer-policy
node server.js
```

Then visit the URLs described in that PoC’s README.

---

## **PoCs Included**

* **Content-Security-Policy**
* **Content-Type**
* **Referrer-Policy**
* **Strict-Transport-Security**
* **X-Content-Type-Options**
* **X-Frame-Options**
* **X-XSS-Protection**

Each PoC demonstrates real browser behavior, including:

* blocked scripts
* MIME sniffing
* referer leakage
* HSTS caching
* clickjacking protections
* legacy XSS filter behaviors

---

## **Disclaimer**

This project is for **educational purposes only** and the PoCs intentionally use insecure settings — **do not run them on production systems**. Always test in controlled local or containerized environments.