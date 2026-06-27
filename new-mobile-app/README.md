# New Mobile App

A lightweight, mobile-first web application built with plain HTML, CSS, and JavaScript.

---

## Overview

This project is a mobile-first web app scaffolded according to a strict design spec. It uses no external frameworks — just semantic HTML, BEM-style CSS, and vanilla JavaScript. The design tokens (colours, typography) are defined once in `styles.css` and shared across every page via the same base HTML shell.

**Design tokens**

| Token       | Value     | Usage            |
|-------------|-----------|------------------|
| Primary     | `#4F46E5` | Indigo accent    |
| Background  | `#F9FAFB` | Page background  |
| Text        | `#111827` | Body copy        |
| Font        | `system-ui, sans-serif` | All text |

---

## Folder Structure

```
new mobile app/
├── index.html   # Main HTML entry point — base shell shared by all pages
├── styles.css   # Global stylesheet — mobile-first, BEM class naming
├── index.js     # Main JavaScript entry point — app initialisation & logic
└── README.md    # This file
```

---

## Setup

No build step or package manager is required.

1. **Clone or download** this folder to your machine.
2. **Open `index.html`** directly in a modern browser, or serve the folder with any static file server:

   ```bash
   # Python 3
   python -m http.server 8080

   # Node (npx)
   npx serve .
   ```

3. Navigate to `http://localhost:8080` (or the port shown in your terminal).

---

## Naming Conventions

- **CSS classes** follow BEM: block (`app`), element (`app__header`, `app__content`), modifier (`app__button--primary`).
- **Files** use lowercase with no spaces: `index.html`, `styles.css`, `index.js`.
- Every HTML page must include `<link rel="stylesheet" href="styles.css">` and `<script src="index.js" defer></script>` so all pages share the same base styles and initialisation logic.

---

## Browser Support

Targets all evergreen browsers (Chrome, Firefox, Safari, Edge). Uses `system-ui` for native-feeling typography on every platform with no web-font requests.
