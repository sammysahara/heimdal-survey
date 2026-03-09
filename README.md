# SEG3125 – Lab 6 – Group 05

In general, this lab is about using lab1's survey, and create an analytical page for the surveys
This time around, the contributions will be all in the PDF file, because the README file is needed as communication method among the team and whoever will run this project
---

## Project structure
```
SEG3125-lab6-Group05/
├── index.html          client view
├── analyst.html        analyst view
├── style.css           this stylesheet is shared by both html documents
├── scripts.js          survey form logic (validation + POST to API)
├── analyst.js          dashboard logic (fetch stats, render charts, delete)
├── images/             
└── backend/
    ├── server.js       entry point – starts the HTTP server on port 3000
    ├── app.js          express app - middleware, REST API routes
    ├── package.json    npm manifest (do not chagne anything in this file)
    └── data/
        └── responses.json   all the submitted survey responses (auto-created)
```

---

## How to run
You need **Node.js** installed on your local machine.
Open the project in your code editor, then open a terminal.

> ⚠️ **Important:** always open the pages through `http://localhost:3000/…`, NOT by double-clicking the HTML files.
> Opening via `file://` will break the API calls.

**1. Install dependencies (only needed once)**
```bash
cd backend
npm install
```

**2. Start the backend server**
```bash
npm start
```

You should see:
```
─────────────────────────────────────────────────────
  SEG3125 Lab 6 – Survey Backend
─────────────────────────────────────────────────────
  Survey form  → http://localhost:3000/index.html
  Analyst view → http://localhost:3000/analyst.html
  REST API     → http://localhost:3000/api/survey
─────────────────────────────────────────────────────
```

**3. Open the pages in your browser**
| Page | URL |
|---|---|
| Survey form (client view) | http://localhost:3000/index.html |
| Analyst dashboard (server view) | http://localhost:3000/analyst.html |

## Contributors

Salma Ahmed, Steven Feng Peng, and Sahara Sammy – University of Ottawa, SEG 3125 Winter 2026

