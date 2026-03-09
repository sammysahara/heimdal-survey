/**
 * analyst.js – Client-side JavaScript for the Analyst Dashboard (analyst.html)
 *
 * This script is ONLY loaded by the analyst page.  It fetches survey data from
 * the Express REST API and renders:
 *   - Summary stat cards (total responses, most-recent submission date)
 *   - Bar charts for each aggregated question (Q2, Q3, Q4, Q5)
 *   - Individual response cards with a delete button each
 *
 * The backend must be running (npm start inside backend/) for this page to work
 */

/*Base URL for the survey API*/
const API_BASE = 'http://localhost:3000/api/survey'

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap: run after the DOM is fully parsed
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadDashboard()

  const refreshBtn = document.getElementById('btn-refresh')
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadDashboard)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Main loader – calls the two API endpoints in parallel
// ─────────────────────────────────────────────────────────────────────────────

// Fetch both endpoints concurrently
async function loadDashboard() {
  try {
    const [allResponses, statsData] = await Promise.all([
      fetchJSON(API_BASE),
      fetchJSON(`${API_BASE}/stats`),
    ])

    renderSummaryCards(allResponses)
    renderCharts(statsData.stats, statsData.totalResponses)
    renderResponseCards(allResponses.data)
  } catch (err) {
    showResponsesError(
      'Could not load data.  ' +
        'Please make sure the backend server is running: ' +
        'open a terminal, cd into the backend/ folder, and run "npm start".',
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch a URL and parse the response as JSON
 * @param {string} url - The URL to GET.
 * @returns {Promise<Object>} Parsed JSON body.
 */
async function fetchJSON(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`API error ${response.status} for ${url}`)
  }
  return response.json()
}

/**
 * translation of timestamp string into a human-readable local date and time.
 * @param {string} iso - ISO timestamp
 * @returns {string}
 */
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Section renderers
// ─────────────────────────────────────────────────────────────────────────────

/*We want to populate the summary stat cards at the top of the analyst page*/
function renderSummaryCards({ count, data }) {
  const totalEl = document.getElementById('total-count')
  const latestEl = document.getElementById('latest-date')

  if (totalEl) totalEl.textContent = count ?? 0

  if (latestEl) {
    if (!data || data.length === 0) {
      latestEl.textContent = 'No responses yet'
    } else {
      // Sort descending by timestamp to find the most recent submission
      const latest = [...data].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      )[0]
      latestEl.textContent = formatDate(latest.timestamp)
    }
  }
}

/**
 * For now, we will have bar charts for every aggregated question.
 * Each chart is a set of labelled bars scaled as a percentage of the maximum
 * value in that question's dataset.
 *
 * @param {Object} stats
 * @param {number} totalResponses - Total response count
 */
function renderCharts(stats, totalResponses) {
  if (!stats) return

  // Maps each chart container ID to its stats key
  const chartConfig = [
    {
      barContainerId: 'bars-readability',
      pieContainerId: 'pie-readability',
      dataKey: 'readability',
    },
    {
      barContainerId: 'bars-aesthetics',
      pieContainerId: 'pie-aesthetics',
      dataKey: 'aesthetics',
    },
    {
      barContainerId: 'bars-uiAspects',
      pieContainerId: 'pie-uiAspects',
      dataKey: 'uiAspects',
    },
    {
      barContainerId: 'bars-heimdalPromise',
      pieContainerId: 'pie-heimdalPromise',
      dataKey: 'heimdalPromise',
    },
  ];

  chartConfig.forEach(({ barContainerId, pieContainerId, dataKey }) => {
    const barContainer = document.getElementById(barContainerId);
    const pieContainer = document.getElementById(pieContainerId);
    const data = stats[dataKey] || {};

    if (barContainer) {
      renderBarChart(barContainer, data, totalResponses);
    }

    if (pieContainer) {
      renderPieChart(pieContainer, data, totalResponses);
    }
  });
}

/**
 * Render a horizontal bar chart inside a given container element
 * Each entry in the `data` object becomes one bar row
 *
 * @param {HTMLElement} container     - The DOM node to render bars into.
 * @param {Object}data
 * @param {number}totalResponses      - Used to display percentage tooltips
 */
function renderBarChart(container, data, totalResponses) {
  container.innerHTML = '' // Clear previous render
  const entries = Object.entries(data)

  if (entries.length === 0) {
    container.innerHTML = '<p class="no-data">No data yet.</p>'
    return
  }

  const maxValue = Math.max(...entries.map(([, v]) => v))

  entries.forEach(([label, count]) => {
    const widthPct = maxValue > 0 ? (count / maxValue) * 100 : 0
    const pct =
      totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0

    const row = document.createElement('div')
    row.className = 'bar-row'
    row.innerHTML = `
      <span class="bar-label">${escapeHtml(label)}</span>
      <div class="bar-track" title="${count} response(s) – ${pct}%">
        <div class="bar-fill" style="width: ${widthPct}%"></div>
      </div>
      <span class="bar-count">${count} (${pct}%)</span>
    `
    container.appendChild(row)
  })
}



/**
 * Render individual response cards in the responses-container element
 * Each card shows:
 *  - Submission timestamp and UUID
 *  - All six question answers
 *  - A delete button that calls the DELETE /api/survey/:id endpoint
 * @param {Array<Object>} responses
 */
function renderResponseCards(responses) {
  const container = document.getElementById('responses-container')
  const loadingEl = document.getElementById('responses-loading')
  const errorEl = document.getElementById('responses-error')

  if (!container) return

  if (loadingEl) loadingEl.style.display = 'none'
  if (errorEl) errorEl.style.display = 'none'

  container.innerHTML = '' // Clear stale cards on refresh

  if (!responses || responses.length === 0) {
    container.innerHTML =
      '<p class="no-data">No survey responses have been submitted yet.</p>'
    return
  }

  // Sort newest-first
  const sorted = [...responses].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  )

  sorted.forEach((resp) => {
    const card = buildResponseCard(resp)
    container.appendChild(card)
  })
}

/**
 * Build a single DOM card element for one survey response.
 * @param {Object} resp - A single response object from the API
 * @returns {HTMLElement} The fully-constructed card element
 */
function buildResponseCard(resp) {
  const card = document.createElement('div')
  card.className = 'response-card'
  card.dataset.id = resp.id

  const uiAspectsText =
    resp.uiAspects && resp.uiAspects.length
      ? resp.uiAspects.join(', ')
      : 'None selected'

  const promiseText =
    resp.heimdalPromise && resp.heimdalPromise.length
      ? resp.heimdalPromise.map(capitalize).join(', ')
      : 'None selected'

  card.innerHTML = `
    <div class="response-card-header">
      <div>
        <span class="response-date">${formatDate(resp.timestamp)}</span>
        <span class="response-id" title="Response UUID">#${escapeHtml(resp.id.slice(0, 8))}…</span>
      </div>
      <button class="delete-btn" data-id="${escapeHtml(resp.id)}" title="Delete this response">
        ✕ Delete
      </button>
    </div>
    <div class="response-body">
      <div class="response-field">
        <span class="field-label">Q1 – Predictability</span>
        <span class="field-value">${escapeHtml(resp.predictability || '—')}</span>
      </div>
      <div class="response-field">
        <span class="field-label">Q2 – Readability</span>
        <span class="field-value field-badge">${escapeHtml(capitalize(resp.readability || '—'))}</span>
      </div>
      <div class="response-field">
        <span class="field-label">Q3 – Aesthetics</span>
        <span class="field-value field-badge">${escapeHtml(capitalize(resp.aesthetics || '—'))}</span>
      </div>
      <div class="response-field">
        <span class="field-label">Q4 – UI Aspects</span>
        <span class="field-value">${escapeHtml(uiAspectsText)}</span>
      </div>
      <div class="response-field">
        <span class="field-label">Q5 – Heimdal Promise</span>
        <span class="field-value">${escapeHtml(promiseText)}</span>
      </div>
      ${
        resp.comments
          ? `
      <div class="response-field">
        <span class="field-label">Q6 – Comments</span>
        <span class="field-value">${escapeHtml(resp.comments)}</span>
      </div>`
          : ''
      }
    </div>
  `

  card.querySelector('.delete-btn').addEventListener('click', () => {
    handleDeleteResponse(resp.id, card)
  })

  return card
}

// DONE [CHARTS] Add a renderPieChart(container, data, totalResponses) function here.
//   It should read the same `data` object as renderBarChart (e.g. { excellent: 3, good: 5 })
//   and draw a pie/doughnut chart.
//   Option A (no library): use a CSS conic-gradient on a single <div>.
function renderPieChart(container, data, totalResponses) {
  container.innerHTML = '';
  const entries = Object.entries(data);

  const totalSelections = entries.reduce(
    (sum, [, count]) => sum + count,
    0
  );
  
  if (entries.length === 0 || totalResponses === 0) {
    container.innerHTML = '<p class="pie-chart-empty">No data yet.</p>';
    return;
  }

  const colors = [
    '#3b82f6',
    '#60a5fa',
    '#93c5fd',
    '#2563eb',
    '#1d4ed8',
    '#38bdf8',
    '#0ea5e9',
    '#818cf8',
  ];

  let currentDeg = 0;
  const segments = entries.map(([label, count], index) => {
    const sliceDeg = (count / totalSelections) * 360;
    const start = currentDeg;
    const end = currentDeg + sliceDeg;
    currentDeg = end;
    return `${colors[index % colors.length]} ${start}deg ${end}deg`;
  });

  const chart = document.createElement('div');
  chart.className = 'pie-chart-visual';
  chart.style.background = `conic-gradient(${segments.join(', ')})`;
  chart.setAttribute(
    'aria-label',
    entries
      .map(([label, count]) => {
        const pct = Math.round((count / totalResponses) * 100);
        return `${label}: ${count} responses (${pct}%)`;
      })
      .join(', ')
  );

  container.appendChild(chart);
}

/**
 * Send a DELETE request to the API and remove the card from the DOM on success.
 * Shows a confirmation dialog before proceeding to prevent accidental deletions.
 *
 * @param {string}      id   - UUID of the response to delete.
 * @param {HTMLElement} card - The card element to remove after deletion.
 */
async function handleDeleteResponse(id, card) {
  // Confirm before deleting – this action cannot be undone
  const confirmed = window.confirm(
    `Delete response #${id.slice(0, 8)}…?\nThis action cannot be undone.`,
  )
  if (!confirmed) return

  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })

    const data = await response.json()

    if (response.ok && data.success) {
      // Animate the card out before removing it from the DOM.
      card.classList.add('response-card--deleting')
      card.addEventListener('transitionend', () => card.remove(), {
        once: true,
      })

      // After a short delay, refresh the summary cards so totals stay accurate.
      setTimeout(loadDashboard, 400)
    } else {
      alert(`Could not delete: ${data.message}`)
    }
  } catch {
    alert('Network error – could not reach the server.')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Error display helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Show an error message in the responses area and hide the loading indicator.
 * @param {string} message
 */
function showResponsesError(message) {
  const loadingEl = document.getElementById('responses-loading')
  const errorEl = document.getElementById('responses-error')

  if (loadingEl) loadingEl.style.display = 'none'
  if (errorEl) {
    errorEl.textContent = message
    errorEl.style.display = ''
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// XSS defence helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escape user-supplied strings before inserting them into innerHTML to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
