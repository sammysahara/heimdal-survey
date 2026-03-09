/**
 * scripts.js – Client-side JavaScript for the survey form (index.html).
 *
 * Responsibilities:
 *  1. Image behaviour: single-click to zoom, double-click to open the website.
 *  2. Survey form validation: ensure required questions are answered before sending.
 *  3. Survey form submission: POST the answers as JSON to the backend REST API
 *     and display a success or error message to the user.
 */

/**
 * Base URL for the survey REST API.
 * Using an absolute URL ensures the fetch() call always reaches the Express
 * backend at localhost:3000, whether the HTML file is opened directly from
 * disk (file://) or served through the backend itself.
 */
const SURVEY_API = 'http://localhost:3000/api/survey';

document.addEventListener('DOMContentLoaded', function () {

  // ─── Image zoom & navigation ─────────────────────────────────────────────

  // .ourimage-link only exists on the survey page, not the analyst page
  const imageLink = document.querySelector('.ourimage-link');

  if (imageLink) {
    const linkUrl = imageLink.href;

    const container = document.createElement('div');
    container.className = 'zoom-container';
    imageLink.parentNode.insertBefore(container, imageLink);
    container.appendChild(imageLink);

    const img = imageLink.querySelector('img');

    // Update transform-origin to the cursor position for a cursor-centred zoom
    container.addEventListener('mousemove', function (e) {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      img.style.transformOrigin = `${x}% ${y}%`;
    });

    // Prevent default so single-click only toggles zoom, not navigation
    imageLink.addEventListener('click', function (e) {
      e.preventDefault();
      container.classList.toggle('zoomed');
    });

    // noopener + noreferrer prevents the new tab from accessing window.opener
    imageLink.addEventListener('dblclick', function () {
      window.open(linkUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // ─── Survey form submission ──────────────────────────────────────────────

  const form       = document.getElementById('survey-form');
  const submitBtn  = document.getElementById('submit-btn');
  const messageDiv = document.getElementById('form-message');

  // survey-form only exists on index.html, not on analyst.html
  if (!form) return;

  const backBtn = document.getElementById('btn-back');
  const nextBtn = document.getElementById('btn-next');
  const stepIndicator = document.getElementById('step-indicator');
  const steps = Array.from(document.querySelectorAll('.form-step'));

  let currentStep = 1;
  const totalSteps = steps.length;

  function showStep(stepNumber) {
    currentStep = stepNumber;

    steps.forEach((stepEl, index) => {
      const isActive = index + 1 === stepNumber;
      stepEl.hidden = !isActive;
    });

    if (stepIndicator) {
      stepIndicator.textContent = `Step ${stepNumber} of ${totalSteps}`;
    }

    if (backBtn) {
      backBtn.style.display = stepNumber === 1 ? 'none' : 'inline-block';
    }

    if (nextBtn) {
      nextBtn.style.display = stepNumber === totalSteps ? 'none' : 'inline-block';
    }

    if (submitBtn) {
      submitBtn.style.display = stepNumber === totalSteps ? 'inline-block' : 'none';
    }
  }

  function validateStep(stepNumber, payload) {
    if (stepNumber === 1) {
      if (!payload.predictability.trim()) {
        return 'Please answer Question 1 before continuing.';
      }
      if (!payload.readability) {
        return 'Please select a readability rating for Question 2.';
      }
    }

    if (stepNumber === 2) {
      if (!payload.aesthetics) {
        return 'Please select an aesthetics rating for Question 3.';
      }
    }

    return null;
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      showMessage('', '');
      const payload = collectFormData();
      const validationError = validateStep(currentStep, payload);

      if (validationError) {
        showMessage(validationError, 'error');
        return;
      }

      if (currentStep < totalSteps) {
        showStep(currentStep + 1);
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      showMessage('', '');
      if (currentStep > 1) {
        showStep(currentStep - 1);
      }
    });
  }

  showStep(1);
  
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    showMessage('', '');
    const payload = collectFormData();
    const validationError = validatePayload(payload);
    if (validationError) {
      showMessage(validationError, 'error');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(SURVEY_API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showMessage(
          '✓ Thank you! Your response has been submitted successfully.',
          'success'
        );
        form.reset();
        document.querySelectorAll('.icon-tile').forEach((tile) => {
          tile.classList.remove('selected');
        });
      } else {
        showMessage(data.message || 'Submission failed. Please try again.', 'error');
      }
    } catch (err) {
      // Network error – server is likely not running
      showMessage(
        '⚠ Could not reach the server. ' +
        'Please make sure the backend is running: ' +
        'open a terminal, cd into the backend/ folder, and run "npm start".',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  });

  // ─── Helper functions ───────────────────────────────────────────────────────

  /**
   * Read all form field values and return them as a plain object ready to POST.
   *
   * FormData.getAll() is used for multi-select fields (checkboxes) so that
   * every checked value is captured in an array.
   *
   * @returns {{ predictability: string, readability: string, aesthetics: string,
   *             uiAspects: string[], heimdalPromise: string[], comments: string }}
   */
  function collectFormData() {
    const fd = new FormData(form);
    return {
      predictability: fd.get('predictability') || '',
      readability:    fd.get('readability')    || '',
      aesthetics:     fd.get('aesthetics')     || '',
      uiAspects:      fd.getAll('ui-aspects'),       // multi-select checkboxes
      heimdalPromise: fd.getAll('heimdal_promise[]'), // icon checkboxes
      comments:       fd.get('comments')       || '',
    };
  }

  /**
   * Validate the collected payload before sending it to the server.
   * Returns a human-readable error string if invalid, or null if everything is OK.
   *
   * @param {Object} payload - The object returned by collectFormData().
   * @returns {string|null}  Error message, or null if validation passes.
   */
  function validatePayload(payload) {
    if (!payload.predictability.trim()) {
      return 'Please answer Question 1 before submitting.';
    }
    if (!payload.readability) {
      return 'Please select a readability rating for Question 2.';
    }
    if (!payload.aesthetics) {
      return 'Please select an aesthetics rating for Question 3.';
    }
    return null;
  }

  /**
   * Display a feedback message in the form-message element.
   * Passing an empty string for both arguments clears the message.
   *
   * @param {string} text - The message text to show (plain text, not HTML).
   * @param {string} type - CSS modifier: 'success', 'error', or '' to clear.
   */
  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className   = 'form-message';
    if (type) {
      messageDiv.classList.add(`form-message--${type}`);
    }
  }

  /**
   * Enable or disable the submit button and update its visible label
   * to give the user feedback that a network request is in progress.
   *
   * @param {boolean} isSubmitting - True while the fetch is pending.
   */
  function setSubmitting(isSubmitting) {
    submitBtn.disabled   = isSubmitting;
    submitBtn.textContent = isSubmitting ? 'Submitting…' : 'Submit My Answers';
  }
});
