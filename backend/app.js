/**
 * app.js – Express application and REST API routes.
 *
 * REST Endpoints
 * ──────────────
 *  POST   /api/survey        Save a new survey response → 201 Created
 *  GET    /api/survey        Retrieve all responses     → 200 OK
 *  GET    /api/survey/stats  Retrieve aggregate stats   → 200 OK
 *  DELETE /api/survey/:id    Delete one response by ID  → 200 OK | 404 Not Found
 */

const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

const app = express()

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────

// Enable CORS so the front-end can reach the API regardless of how the HTML is opened
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static front-end files from the project root
const PROJECT_ROOT = path.join(__dirname, '..')
app.use(express.static(PROJECT_ROOT))

// ─────────────────────────────────────────────────────────────────────────────
// Data file configuration
// ─────────────────────────────────────────────────────────────────────────────

/** Absolute path to the JSON file that persists all survey responses*/
const DATA_FILE = path.join(__dirname, 'data', 'responses.json')

/*Ensure the data/ directory exists at startup*/
const DATA_DIR = path.join(__dirname, 'data')
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// ─────────────────────────────────────────────────────────────────────────────
// Service helpers – read / write the backing JSON file
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Read all saved survey responses from the data file
 * Returns an empty array if the file does not exist or cannot be parsed
 */
function readResponses() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(raw)
  } catch {
    // File missing or malformed JSON – start with an empty list
    return []
  }
}

/**
 * Write (overwrite) the full array of responses to the data file
 * @param {Array<Object>} responses - The complete list of responses to save
 */
function writeResponses(responses) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(responses, null, 2), 'utf8')
}

// ─────────────────────────────────────────────────────────────────────────────
// Route: POST /api/survey
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Accept a new survey submission from the client-side survey form.
 *
 * our JSON body fields:
 *   predictability  {string}   Q1 – open-ended text answer
 *   readability     {string}   Q2 – one of: excellent | good | fair | poor
 *   aesthetics      {string}   Q3 – one of: excellent | good | fair | poor
 *   uiAspects       {string[]} Q4 – zero or more selected checkbox values
 *   heimdalPromise  {string[]} Q5 – zero or more icon checkbox values
 *   comments        {string}   Q6 – optional free-text comments
 *
 * responses:
 *   201 Created
 *   400 Bad Request
 */
app.post('/api/survey', (req, res) => {
  const {
    predictability,
    readability,
    aesthetics,
    uiAspects,
    heimdalPromise,
    comments,
  } = req.body

  // Basic validation: the three primary questions must have answers
  if (!predictability || !readability || !aesthetics) {
    return res.status(400).json({
      success: false,
      message: 'Please answer Questions 1, 2, and 3 before submitting.',
    })
  }

  const responses = readResponses()

  const newResponse = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    predictability: String(predictability).trim(),
    readability: String(readability),
    aesthetics: String(aesthetics),
    // Normalize to array: JSON arrays pass through as-is; plain strings are wrapped
    uiAspects: Array.isArray(uiAspects) ? uiAspects : uiAspects ? [uiAspects] : [],
    heimdalPromise: Array.isArray(heimdalPromise) ? heimdalPromise : heimdalPromise ? [heimdalPromise] : [],
    comments: String(comments || '').trim(),
  }

  responses.push(newResponse)
  writeResponses(responses)

  console.log(`[POST /api/survey] Saved response ${newResponse.id}`)
  return res.status(201).json({ success: true, id: newResponse.id })
})

// ─────────────────────────────────────────────────────────────────────────────
// Route: GET /api/survey/stats   (must be defined BEFORE /api/survey/:id)
// ─────────────────────────────────────────────────────────────────────────────

/*for now, the analyst page uses this endpoint to build bar charts*/
app.get('/api/survey/stats', (req, res) => {
  const responses = readResponses()
  const total = responses.length

  if (total === 0) {
    return res.status(200).json({ success: true, totalResponses: 0, stats: {} })
  }

  /**
   * countField – tally unique values for a single-value field
   * @param {string} field - Name of the response property to count
   * @returns {object}
   */
  const countField = (field) =>
    responses.reduce((acc, r) => {
      const val = r[field] || 'No answer'
      acc[val] = (acc[val] || 0) + 1
      return acc
    }, {})

  /**
   * countArrayField – tally occurrences across multi-select array fields
   * @param {string} field - Name of the array property to count
   * @returns {Object}
   */
  const countArrayField = (field) =>
    responses.reduce((acc, r) => {
      ;(r[field] || []).forEach((val) => {
        acc[val] = (acc[val] || 0) + 1
      })
      return acc
    }, {})

  const stats = {
    readability: countField('readability'),
    aesthetics: countField('aesthetics'),
    uiAspects: countArrayField('uiAspects'),
    heimdalPromise: countArrayField('heimdalPromise'),
  }

  return res.status(200).json({ success: true, totalResponses: total, stats })
})

// ─────────────────────────────────────────────────────────────────────────────
// Route: GET /api/survey
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return all stored survey responses
 * The analyst page calls this to render individual response cards
 */
app.get('/api/survey', (req, res) => {
  const responses = readResponses()
  console.log(`[GET /api/survey] Returning ${responses.length} response(s)`)
  return res.status(200).json({
    success: true,
    count: responses.length,
    data: responses,
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Route: DELETE /api/survey/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Delete a single survey response identified by its UUID.
 * The analyst page exposes a delete button for each response card
 */
app.delete('/api/survey/:id', (req, res) => {
  const { id } = req.params
  const responses = readResponses()
  const index = responses.findIndex((r) => r.id === id)

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `No response found with ID "${id}".`,
    })
  }

  responses.splice(index, 1)
  writeResponses(responses)

  console.log(`[DELETE /api/survey/${id}] Response removed`)
  return res.status(200).json({
    success: true,
    message: `Response "${id}" deleted successfully.`,
  })
})

module.exports = app
