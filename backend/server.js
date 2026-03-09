/*server.js – Entry point. Imports app.js and starts the HTTP server*/
const app = require('./app');

/** Defaults to 3000 if the PORT environment variable is not set */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('─────────────────────────────────────────────────────');
  console.log(`  SEG3125 Lab 6 – Survey Backend`);
  console.log('─────────────────────────────────────────────────────');
  console.log(`  Survey form  → http://localhost:${PORT}/index.html`);
  console.log(`  Analyst view → http://localhost:${PORT}/analyst.html`);
  console.log(`  REST API     → http://localhost:${PORT}/api/survey`);
  console.log('─────────────────────────────────────────────────────');
});
