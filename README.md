# SecHeaders

**SecHeaders** is a learning and demonstration project focused on **HTTP Security Headers** — what they are, why they matter, and how misconfiguration or absence can lead to real security risks. The goal is to provide **clear, isolated, and reproducible Proofs of Concept (PoCs)** that show:
- The *intended protection* each header offers.
- What happens when the header is *absent* or *misconfigured*.
- How browsers and servers behave differently depending on the configuration.

# Project Goals

- Build a collection of **self-contained demonstrations** for each HTTP security header.
- Learn **modern web security practices** by implementing headers in simple web apps.
- Gain hands-on experience with:
  - `Node.js` and `Express` web servers
  - `nginx` for reverse proxy and header control
  - `Docker` for safe, reproducible testing environments
  - `Markdown` for documentation and clear visual explanations

# Current Structure

```yaml
SecHeaders/
├── headers/
│ ├── referrer-policy/
│ │ ├── server.js
│ │ ├── victim.html
│ │ ├── leak.html
│ │ ├── images/
│ │ └── README.md
│ ├── (more headers to come...)
│
├── .gitignore
├── package.json
└── README.md ← (you are here)
```

Each subfolder in `headers/` contains:
- A standalone demo app (`server.js`, HTML files)
- Step-by-step usage guide (`README.md`)

# How to Run

Clone and enter the project:

```bash
git clone https://github.com/CSpanias/SecHeaders.git
cd SecHeaders
```

Run a specific header demo (example: Referrer-Policy):

```bash
cd headers/referrer-policy
REFERRER=NONE node server.js
```
Then open your browser to:

```bash
http://localhost:3000/victim.html?secret=LEAKME
```

# Planned Improvements
- Unified Express app that integrates all PoCs into a single web interface
- Docker Compose setup for isolated testing
- Interactive front-end with header toggles



# Disclaimer
This project is for educational purposes only. The examples intentionally demonstrate insecure configurations — do not use them in production. Use these PoCs in a controlled local or containerized environment.
