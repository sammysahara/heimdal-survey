/*services offered by the repair shop, each service includes: id, name, price, duration, description, image, and what's included*/
const services = [
    {
        id: 'brake-tune',
        name: 'Brake Tune & Fix',
        price: 45,
        duration: '30-45 mins',
        description: 'Complete brake system inspection and adjustment',
        image: 'photoss/braketuning.jpg',
        included: ['Brake pad inspection', 'Cable adjustment', 'Lever alignment', 'Safety test']
    },
    {
        id: 'flat-tire',
        name: 'Flat Tire Fix',
        price: 25,
        duration: '20-30 mins',
        description: 'Quick and reliable tire repair or replacement',
        image: 'photoss/flattire.jpg',
        included: ['Puncture repair', 'Tube replacement if needed', 'Tire pressure check', 'Wheel inspection']
    },
    {
        id: 'steering-fix',
        name: 'Steering Fix',
        price: 55,
        duration: '45-60 mins',
        description: 'Handlebar and headset repair and alignment',
        image: 'photoss/steeringfix.jpg',
        included: ['Headset adjustment', 'Handlebar alignment', 'Stem tightening', 'Steering smoothness test']
    },
    {
        id: 'upgrades',
        name: 'Upgrades',
        price: 75,
        duration: '60-90 mins',
        description: 'Component upgrades and performance enhancements',
        image: 'photoss/upgrading.jpg',
        included: ['Component installation', 'Gear tuning', 'Performance optimization', 'Test ride']
    },
    {
        id: 'replacements',
        name: 'Replacements',
        price: '100-200',
        duration: 'depends (1-7 days)',
        description: 'Part replacement and installation service',
        image: 'photoss/replacements.jpg',
        included: ['Old part removal', 'New part installation', 'Compatibility check', 'Functional testing']
    },
    {
        id: 'full-maintenance',
        name: 'Full Maintenance',
        price: 120,
        duration: '100-150 mins',
        description: 'Comprehensive tune-up and maintenance service',
        image: 'photoss/fullmaintenance.jpg',
        included: ['Complete inspection', 'Drivetrain cleaning', 'All adjustments', 'Lubrication', 'Safety check']
    }
];

/*staff members with their expertise and characteristics, each staff includes: id, name, role, experience, expertise, availability*/
const staff = [
    {
        id: 'sarah-m',
        name: 'Sarah Mitchell',
        role: 'Master Technician',
        experience: '12 years',
        expertise: ['Brake Systems', 'Full Maintenance', 'Steering'],
        specialty: 'Expert in hydraulic brake systems and precision tuning',
        availability: 'Mon-Fri'
    },
    {
        id: 'james-c',
        name: 'James Chen',
        role: 'Senior Technician',
        experience: '8 years',
        expertise: ['Upgrades', 'Replacements', 'Flat Tire'],
        specialty: 'Specializes in component upgrades and custom builds',
        availability: 'Tue-Sat'
    },
    {
        id: 'maria-r',
        name: 'Maria Rodriguez',
        role: 'Certified Mechanic',
        experience: '6 years',
        expertise: ['Full Maintenance', 'Flat Tire', 'Brake Systems'],
        specialty: 'Quick service specialist with attention to detail',
        availability: 'Mon-Sat'
    },
    {
        id: 'alex-k',
        name: 'Alex Kowalski',
        role: 'Bike Technician',
        experience: '5 years',
        expertise: ['Steering', 'Replacements', 'Upgrades'],
        specialty: 'Modern bike systems and electronic shifting expert',
        availability: 'Wed-Sun'
    },
    {
        id: 'david-l',
        name: 'David Lee',
        role: 'Junior Technician',
        experience: '3 years',
        expertise: ['Flat Tire', 'Brake Systems', 'Replacements'],
        specialty: 'Enthusiastic and detail-oriented with quick turnaround times',
        availability: 'Mon-Fri'
    },
    {
        id: 'emma-p',
        name: 'Emma Peterson',
        role: 'Expert Technician',
        experience: '10 years',
        expertise: ['Full Maintenance', 'Upgrades', 'Steering'],
        specialty: 'Specialized in high-end bikes and carbon fiber repairs',
        availability: 'Thu-Sun'
    }
];

// contact information for step 4
let contactInfo = {
    firstName:"",
    lastName:"",
    email:"",
    phone:"",
    notes:""
};

// payment info for step 5
let paymentInfo = {
  cardName: "",
  cardLast4: "",
  exp: "",
  postal: ""
};

// global state is set to keep track of selected service, staff, and current step in the booking process
let selectedService = null;
let selectedStaff = null;
let currentStep = 1;

// tracking steps the user has already completed (Visibility + Mapping)
const completedSteps = new Set();

/**
 * non-blocking toast notification instead of alert().
 * @param {string} message - The message to display
 * @param {'warning'|'error'|'success'|'info'} type - Visual style
 * @param {number} duration - Auto-dismiss delay in ms (0 = stay)
 */
function showToast(message, type = 'warning', duration = 4500) {
    const container = document.getElementById('toastContainer');
    if (!container) { console.warn(message); return; }

    const id = 'toast_' + Date.now() + Math.random();
    const icons = { warning: '⚠️', error: '❌', success: '✅', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `toast-notification toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <span class="toast-icon" aria-hidden="true">${icons[type] || 'ℹ️'}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Dismiss notification" onclick="document.getElementById('${id}').remove()">×</button>
    `;
    container.appendChild(toast);

    if (duration > 0) {
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('toast-fade-out');
                setTimeout(() => toast.remove(), 320);
            }
        }, duration);
    }
}

/**
 * ARIA live region announcement
 * @param {string} message
 */
function announceToScreenReader(message) {
    const live = document.getElementById('ariaLive');
    if (!live) return;
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = message; });
}

/**
 * flashing the hint text below a disabled button.
 * @param {string} hintId - id of the .btn-hint element
 */
function flashButtonHint(hintId) {
    const hint = document.getElementById(hintId);
    if (!hint) return;
    hint.classList.remove('visible');
    void hint.offsetWidth;
    hint.classList.add('visible');
    setTimeout(() => hint.classList.remove('visible'), 3500);
}

/**
 * as feedback and constraint... bootstrap is-valid / is-invalid state to a field
 * @param {HTMLElement} field - input element
 * @param {boolean|null} valid - true=valid, false=invalid, null=neutral
 * @param {string} message - error message shown when invalid
 * @param {string} feedbackId - id of the .invalid-feedback element
 */
function setFieldValidity(field, valid, message, feedbackId) {
    field.classList.remove('is-valid', 'is-invalid');
    const fb = document.getElementById(feedbackId);
    if (fb) fb.textContent = message || '';

    if (valid === true) {
        field.classList.add('is-valid');
    } else if (valid === false) {
        field.classList.add('is-invalid');
        if (fb) fb.style.display = 'block';
    }
}

function luhnCheck(numStr) {
  // basic Luhn algorithm for card numbers (client-side sanity check)
  let sum = 0;
  let shouldDouble = false;

  for (let i = numStr.length - 1; i >= 0; i--) {
    let digit = parseInt(numStr[i], 10);
    if (Number.isNaN(digit)) return false;

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return (sum % 10) === 0;
}

function normalizeDigits(s) {
  return (s || "").replace(/\D/g, "");
}

function formatCardNumberForDisplay(raw) {
  const digits = normalizeDigits(raw).slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function isValidExpiry(mmYY) {
  const v = (mmYY || "").trim();
  if (!/^\d{2}\/\d{2}$/.test(v)) return false;

  const mm = parseInt(v.slice(0, 2), 10);
  const yy = parseInt(v.slice(3, 5), 10);
  if (mm < 1 || mm > 12) return false;

  // interpret YY as 20YY (good enough for an assignment demo)
  const now = new Date();
  const currentYY = now.getFullYear() % 100;
  const currentMM = now.getMonth() + 1;

  if (yy < currentYY) return false;
  if (yy === currentYY && mm < currentMM) return false;

  return true;
}

function isValidPostalCA(postal) {
  // Canadian postal code: A1A1A1 (spaces optional)
  const v = (postal || "").trim().toUpperCase().replace(/\s/g, "");
  return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(v);
}

/*initialize the application when DOM is ready*/
document.addEventListener('DOMContentLoaded', function() {
    renderServices();
    initializeEventListeners();
    initializeTooltips();
    const h1 = document.getElementById('hint-nextToStep2');
    if (h1) h1.classList.add('visible');
});

/*rendering all the service cards*/
function renderServices() {
    const container = document.getElementById('serviceCards');
    container.innerHTML = '';
    
    services.forEach(service => {
        const card = createServiceCard(service);
        container.appendChild(card);
    });
}

function hookPaymentValidation(){
  const submitBtn = document.getElementById('submitBooking');
  const progressEl = document.getElementById('paymentFormProgress');

  const nameEl   = document.getElementById('cardName');
  const numEl    = document.getElementById('cardNumber');
  const expEl    = document.getElementById('cardExp');
  const cvvEl    = document.getElementById('cardCvv');
  const postalEl = document.getElementById('billingPostal');

  if (!submitBtn || !nameEl || !numEl || !expEl || !cvvEl || !postalEl) return;

  function validate(){
    const nameVal = nameEl.value.trim();
    const numDigits = normalizeDigits(numEl.value);
    const expVal = expEl.value.trim();
    const cvvDigits = normalizeDigits(cvvEl.value);
    const postalVal = postalEl.value.trim();

    const nameValid = nameVal.length >= 2;

    // allow 13-19 digits generally, but we format to 16 visually
    const numberLengthOk = numDigits.length >= 13 && numDigits.length <= 19;
    const numberValid = numberLengthOk && luhnCheck(numDigits);

    const expValid = isValidExpiry(expVal);

    // CVV 3 or 4 digits
    const cvvValid = /^\d{3,4}$/.test(cvvDigits);

    const postalValid = isValidPostalCA(postalVal);

    // per-field feedback
    if (nameEl.value !== '') {
      setFieldValidity(nameEl, nameValid, 'Name on card is required.', 'feedback-cardName');
    } else {
      nameEl.classList.remove('is-valid', 'is-invalid');
    }

    if (numEl.value !== '') {
      setFieldValidity(numEl, numberValid, 'Enter a valid card number.', 'feedback-cardNumber');
    } else {
      numEl.classList.remove('is-valid', 'is-invalid');
    }

    if (expEl.value !== '') {
      setFieldValidity(expEl, expValid, 'Use MM/YY and a future date.', 'feedback-cardExp');
    } else {
      expEl.classList.remove('is-valid', 'is-invalid');
    }

    if (cvvEl.value !== '') {
      setFieldValidity(cvvEl, cvvValid, 'CVV must be 3 or 4 digits.', 'feedback-cardCvv');
    } else {
      cvvEl.classList.remove('is-valid', 'is-invalid');
    }

    if (postalEl.value !== '') {
      setFieldValidity(postalEl, postalValid, 'Use Canadian format (e.g. K1A0B1).', 'feedback-billingPostal');
    } else {
      postalEl.classList.remove('is-valid', 'is-invalid');
    }

    const overallValid = nameValid && numberValid && expValid && cvvValid && postalValid;

    // don’t allow submit until payment is valid
    submitBtn.disabled = !overallValid;

    if (progressEl) {
      const missing = [];
      if (!nameValid) missing.push('name');
      if (!numberValid) missing.push('card number');
      if (!expValid) missing.push('expiry');
      if (!cvvValid) missing.push('CVV');
      if (!postalValid) missing.push('postal code');

      progressEl.innerHTML = (missing.length === 0)
        ? '<span style="color:var(--success-green)">✓ Payment info looks valid (still demo-only).</span>'
        : `Still needed: <strong>${missing.join(', ')}</strong>`;
    }

    if (overallValid) {
      paymentInfo = {
        cardName: nameVal,
        cardLast4: numDigits.slice(-4),
        exp: expVal,
        postal: postalVal.trim().toUpperCase().replace(/\s/g, "")
      };
    }
  }

  // Formatting constraints
  numEl.addEventListener('input', () => {
    numEl.value = formatCardNumberForDisplay(numEl.value);
    validate();
  });

  expEl.addEventListener('input', () => {
    const digits = normalizeDigits(expEl.value).slice(0, 4); // MMYY
    if (digits.length <= 2) expEl.value = digits;
    else expEl.value = digits.slice(0,2) + '/' + digits.slice(2);
    validate();
  });

  cvvEl.addEventListener('input', () => {
    cvvEl.value = normalizeDigits(cvvEl.value).slice(0, 4);
    validate();
  });

  postalEl.addEventListener('input', () => {
    postalEl.value = postalEl.value.toUpperCase().replace(/[^A-Z0-9\s]/g, '').slice(0, 7);
    validate();
  });

  [nameEl].forEach(el => {
    el.addEventListener('input', validate);
    el.addEventListener('change', validate);
  });

  validate();
}

/**
 * creating a single service card
 * @param {Object} service - Service object
 * @returns {HTMLElement} Card element
 */
function createServiceCard(service) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    
    col.innerHTML = `
        <div class="card service-card" 
             data-service-id="${service.id}" 
             tabindex="0" 
             role="button"
             aria-label="Select ${service.name} service">
            <i class="bi bi-check-circle-fill card-check"></i>
            <img src="${service.image}" 
                 class="card-img-top" 
                 alt="${service.name} - ${service.description}">
            <div class="card-body">
                <h5 class="card-title">
                    <i class="bi bi-tools"></i> ${service.name}
                </h5>
                <p class="card-text text-muted">${service.description}</p>
                
                <div class="mb-3">
                    <span class="price-badge">$${service.price}</span>
                    <span class="duration-badge ms-2">
                        <i class="bi bi-clock"></i> ${service.duration}
                    </span>
                </div>
                
                <p class="small mb-2"><strong>What's included:</strong></p>
                <ul class="service-details small">
                    ${service.included.map(item => `<li><i class="bi bi-check2"></i> ${item}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    return col;
}

/*rendering all staff cards*/
function renderStaff() {
    const container = document.getElementById('staffCards');
    container.innerHTML = '';
    
    // adding the filtering logic to show staff members based on the selected service's expertise requirements
    const relevantStaff = staff.filter(member => {
        if (!selectedService) return true;
        // our own checker to see if the staff expertise matches the selected service
        return member.expertise.some(exp => 
            selectedService.name.includes(exp) || exp.includes('Full Maintenance')
        );
    });
    
    // we show all staff if nothing specific is selected
    const staffToShow = relevantStaff.length > 0 ? relevantStaff : staff;
    
    staffToShow.forEach(member => {
        const card = createStaffCard(member);
        container.appendChild(card);
    });
}

/**
 * creating a single staff card
 * @param {Object} member - Staff member object
 * @returns {HTMLElement} Card element
 */
function createStaffCard(member) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-3';
    
    // extracting initials from staff name
    const initials = member.name.split(' ').map(n => n[0]).join('');

    // to determine if staff is a recommended match for the selected service
    const isRecommended = selectedService && member.expertise.some(exp =>
        selectedService.name.toLowerCase().includes(exp.toLowerCase()) ||
        exp.toLowerCase().includes(selectedService.name.toLowerCase().split(' ')[0])
    );
    
    col.innerHTML = `
        <div class="card staff-card${isRecommended ? ' recommended-match' : ''}" 
             data-staff-id="${member.id}" 
             tabindex="0" 
             role="button"
             aria-label="Select ${member.name}, ${member.role}${isRecommended ? ', recommended for your chosen service' : ''}">
            <i class="bi bi-check-circle-fill card-check" aria-hidden="true"></i>
            <div class="card-body text-center">
                ${isRecommended ? '<span class="recommended-badge">⭐ Recommended</span>' : ''}
                <div class="staff-initials">${initials}</div>
                <h5 class="card-title">${member.name}</h5>
                <p class="text-muted mb-2">${member.role}</p>
                
                <div class="mb-2">
                    <i class="bi bi-star-fill text-warning" aria-hidden="true"></i>
                    <small>${member.experience} experience</small>
                </div>
                
                <p class="small mb-2"><strong>Expertise:</strong></p>
                <div class="mb-2">
                    ${member.expertise.map(exp => 
                        `<span class="expertise-badge">${exp}</span>`
                    ).join('')}
                </div>
                
                <p class="small text-muted mb-2">
                    <i class="bi bi-info-circle" 
                       data-bs-toggle="tooltip" 
                       data-bs-placement="top" 
                       title="${member.specialty}"
                       aria-hidden="true"></i>
                    ${member.specialty}
                </p>
                
                <p class="small mb-0">
                    <i class="bi bi-calendar-check" aria-hidden="true"></i> Available: ${member.availability}
                </p>
            </div>
        </div>
    `;
    
    return col;
}

/*initializing all event listeners*/
function initializeEventListeners() {
    //service card selection
    document.getElementById('serviceCards').addEventListener('click', handleServiceSelection);
    document.getElementById('serviceCards').addEventListener('keypress', handleServiceKeyPress);
    
    //staff card selection
    document.getElementById('staffCards').addEventListener('click', handleStaffSelection);
    document.getElementById('staffCards').addEventListener('keypress', handleStaffKeyPress);
    
    //navigation buttons
    document.getElementById('nextToStep2').addEventListener('click', goToStep2);
    document.getElementById('nextToStep3').addEventListener('click', goToStep3);
    document.getElementById('nextToStep4').addEventListener('click', goToStep4);
    document.getElementById('nextToStep5').addEventListener('click', goToStep5);
    document.getElementById('backToStep1').addEventListener('click', goToStep1);
    document.getElementById('backToStep2').addEventListener('click', goToStep2);
    document.getElementById('backToStep3').addEventListener('click', goToStep3);
    document.getElementById('backToStep4').addEventListener('click', goToStep4);

    document.getElementById('submitBooking').addEventListener('click', submitBooking);

    // step 4 validation
    hookContactValidation();
    hookPaymentValidation();
}

function hookContactValidation(){
    const nextBtn = document.getElementById('nextToStep5'); 

    const first = document.getElementById('contactFirstName');
    const last  = document.getElementById('contactLastName');
    const email = document.getElementById('contactEmail');
    const phone = document.getElementById('contactPhone');
    const notes = document.getElementById('contactNotes');
    const progressEl = document.getElementById('contactFormProgress');

    // new constraint... strip non-digit characters from phone in real-time
    if (phone) {
        phone.addEventListener('input', () => {
            const digits = phone.value.replace(/\D/g, '').slice(0, 10);
            if (phone.value !== digits) phone.value = digits;
        });
    }

    function validate(){
        const firstVal   = first ? first.value.trim() : '';
        const lastVal    = last  ? last.value.trim()  : '';
        const emailVal   = email ? email.value.trim() : '';
        const phoneVal   = phone ? phone.value.trim() : '';

        const firstValid = firstVal.length > 0;
        const lastValid  = lastVal.length  > 0;
        const emailValid = emailVal.length > 0 && (email ? email.checkValidity() : false);
        const phoneValid = /^\d{10}$/.test(phoneVal);

        // the per-field validation feedback
        if (first && firstVal !== '') {
            setFieldValidity(first, firstValid,
                'First name is required.', 'feedback-firstName');
        } else if (first) {
            first.classList.remove('is-valid', 'is-invalid');
        }

        if (last && lastVal !== '') {
            setFieldValidity(last, lastValid,
                'Last name is required.', 'feedback-lastName');
        } else if (last) {
            last.classList.remove('is-valid', 'is-invalid');
        }

        if (email && emailVal !== '') {
            setFieldValidity(email, emailValid,
                'Please enter a valid email address.', 'feedback-email');
        } else if (email) {
            email.classList.remove('is-valid', 'is-invalid');
        }

        if (phone && phoneVal !== '') {
            setFieldValidity(phone, phoneValid,
                'Phone must be exactly 10 digits.', 'feedback-phone');
        } else if (phone) {
            phone.classList.remove('is-valid', 'is-invalid');
        }

        const overallValid = firstValid && lastValid && (emailValid || phoneValid);

        nextBtn.disabled = !overallValid;

        // live progress message so users know what remains
        if (progressEl) {
            const missing = [];
            if (!firstValid)  missing.push('first name');
            if (!lastValid)   missing.push('last name');
            if (!emailValid && !phoneValid) missing.push('email or phone number');

            if (missing.length === 0) {
                progressEl.innerHTML = '<span style="color:var(--success-green)">✓ All required fields are filled in.</span>';
            } else {
                progressEl.innerHTML = `Still needed: <strong>${missing.join(', ')}</strong>`;
            }
        }

        if (overallValid) {
            contactInfo = {
                firstName: firstVal,
                lastName:  lastVal,
                email:     emailVal,
                phone:     phoneVal,
                notes:     notes ? notes.value.trim() : ""
            };
            // we want to hide the persistent hint once form is valid
            const hint = document.getElementById('hint-nextToStep5');
            if (hint) hint.classList.remove('visible');
        }
    }

    // another feedback feature we will add... validate live on every keystroke
    [first, last, email, phone, notes].forEach(el => {
        if (!el) return;
        el.addEventListener('input', validate);
        el.addEventListener('change', validate);
    });

    validate();
}

// for step 5 
function populateFinalSummary(){
    const setText = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.textContent = txt ?? "";
    };

    setText('finalService', selectedService ? selectedService.name : "");
    setText('finalStaff', selectedStaff ? `${selectedStaff.name} (${selectedStaff.role})` : "");
    setText('finalPrice', selectedService ? `$${selectedService.price}` : "");
    setText('finalDuration', selectedService ? selectedService.duration : "");

    setText('finalDate', bookingDate ? ymd(bookingDate) : "");
    setText('finalTime', bookingTime || "");

    setText('finalName', `${contactInfo.firstName} ${contactInfo.lastName}`.trim());
    setText('finalEmail', contactInfo.email || "N/A");
    setText('finalPhone', contactInfo.phone || "N/A");
}

function submitBooking() {
    // stop if payment is not valid (defensive)
    const submitBtn = document.getElementById('submitBooking');
    if (submitBtn && submitBtn.disabled) {
    showToast('Please complete valid payment details before submitting (demo only).', 'warning');
    announceToScreenReader('Payment details are incomplete.');
    return;
    }
    const btn = document.getElementById('submitBooking');
    const box = document.getElementById('submitResult');
    if (!box) return;

    // more feedbac... we want to show loading state so user knows something is happening
    if (btn) {
        btn.classList.add('submitting');
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Confirming…';
        btn.disabled = true;
    }

    setTimeout(() => {
        completedSteps.add(5);

        box.style.display = 'block';
        box.className = 'alert alert-success';

        const when = bookingDate && bookingTime
            ? `${ymd(bookingDate)} at ${bookingTime}`
            : 'your selected time';

        box.innerHTML = `
            <strong>Booking confirmed.</strong><br>
            Appointment: ${when}<br>
            Service: ${selectedService ? selectedService.name : ''}<br>
            Technician: ${selectedStaff ? selectedStaff.name : ''}<br>
            Contact: ${contactInfo.email || contactInfo.phone}
        `;

        // hiding submit buttons, show only the confirmation
        if (btn) btn.style.display = 'none';
        const backBtn = document.getElementById('backToStep4');
        if (backBtn) backBtn.style.display = 'none';

        announceToScreenReader('Booking confirmed! Your appointment has been successfully submitted.');

        showToast('Your appointment has been booked successfully!', 'success', 6000);

        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 900);
}

/**
 * handling service card selection
 * @param {Event} event - Click event
 */
function handleServiceSelection(event) {
    const card = event.target.closest('.service-card');
    if (!card) return;
    
    const serviceId = card.dataset.serviceId;
    selectService(serviceId);
}

/**
 * handling keyboard navigation for service cards
 * @param {Event} event - this is for keypress event
 */
function handleServiceKeyPress(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleServiceSelection(event);
    }
}

/**
 * handling staff card selection
 * @param {Event} event - this one for click event
 */
function handleStaffSelection(event) {
    const card = event.target.closest('.staff-card');
    if (!card) return;
    
    const staffId = card.dataset.staffId;
    selectStaff(staffId);
}

/**
 * handling keyboard navigation for staff cards
 * @param {Event} event - keypress event once again
 */
function handleStaffKeyPress(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleStaffSelection(event);
    }
}

/**
 * selecting a service
 * @param {string} serviceId - we will use the service ID
 */
function selectService(serviceId) {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    //updating global state
    selectedService = service;
    
    //and updating the UI to reflect the selection
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected', 'just-selected');
    });
    
    const selectedCard = document.querySelector(`[data-service-id="${serviceId}"]`);
    selectedCard.classList.add('selected');
    // pulse animation on selection
    selectedCard.classList.add('just-selected');
    selectedCard.addEventListener('animationend', () => selectedCard.classList.remove('just-selected'), { once: true });
    
    //selection summary for the user to see what they selected
    document.getElementById('serviceSelectionSummary').style.display = 'block';
    document.getElementById('selectedServiceText').innerHTML = `
        <strong>${service.name}</strong> — $${service.price} (${service.duration})
    `;
    
    const hint = document.getElementById('hint-nextToStep2');
    if (hint) hint.classList.remove('visible');

    //we only enable the next button after a service is selected to guide the user through the process
    document.getElementById('nextToStep2').disabled = false;
    announceToScreenReader(`${service.name} selected. You can now continue to select a technician.`);
}

/**
 * selecting a staff member
 * @param {string} staffId - using the staff ID to find the staff member
 */
function selectStaff(staffId) {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return;
    
    //we update global state
    selectedStaff = staffMember;
    
    //and update the UI to show which staff member is selected
    document.querySelectorAll('.staff-card').forEach(card => {
        card.classList.remove('selected', 'just-selected');
    });
    
    const selectedCard = document.querySelector(`[data-staff-id="${staffId}"]`);
    selectedCard.classList.add('selected');
    selectedCard.classList.add('just-selected');
    selectedCard.addEventListener('animationend', () => selectedCard.classList.remove('just-selected'), { once: true });
    
    //selection summary once again
    document.getElementById('staffSelectionSummary').style.display = 'block';
    document.getElementById('summaryService').textContent = selectedService.name;
    document.getElementById('summaryStaff').textContent = `${staffMember.name} (${staffMember.role})`;
    document.getElementById('summaryPrice').textContent = `$${selectedService.price}`;
    document.getElementById('summaryDuration').textContent = selectedService.duration;

    const hint = document.getElementById('hint-nextToStep3');
    if (hint) hint.classList.remove('visible');
    
    //enabling next button for step 3 only after a staff member is selected
    document.getElementById('nextToStep3').disabled = false;
    announceToScreenReader(`${staffMember.name} selected. You can now continue to scheduling.`);
}

/*navigate to Step 1*/
function goToStep1() {
    currentStep = 1;
    updateStepDisplay();
    updateProgressBar();
}

/*navigate to Step 2*/
function goToStep2() {
    if (!selectedService && currentStep === 1) {
        // we need the inline toast instead of blocking alert()
        showToast('Please select a service before continuing.', 'warning');
        flashButtonHint('hint-nextToStep2');
        announceToScreenReader('Please select a service to continue.');
        return;
    }
    
    if (currentStep === 1) completedSteps.add(1);
    currentStep = 2;
    renderStaff();
    updateStepDisplay();
    updateProgressBar();
    initializeTooltips(); //using the tooltips
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // show persistent hint on step 2 next button if not yet selected
    if (!selectedStaff) {
        const h = document.getElementById('hint-nextToStep3');
        if (h) h.classList.add('visible');
    }
}

function goToStep3() {
    if (!selectedStaff) {
        showToast('Please select a technician before continuing.', 'warning');
        flashButtonHint('hint-nextToStep3');
        announceToScreenReader('Please select a technician to continue.');
        return;
    }
    
    if (currentStep === 2) completedSteps.add(2);
    currentStep = 3;
    updateStepDisplay();
    updateProgressBar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    initStep3Calendar();
}

function goToStep4() {
    if (!bookingDate || !bookingTime) {
        showToast('Please choose both a date and a time before continuing.', 'warning');
        flashButtonHint('hint-nextToStep4');
        announceToScreenReader('Please choose a date and time to continue.');
        return;
    }

    if (currentStep === 3) completedSteps.add(3);
    currentStep = 4;
    updateStepDisplay();
    updateProgressBar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToStep5() {
    const nextBtn = document.getElementById('nextToStep5');
    if (nextBtn && nextBtn.disabled) {
        showToast('Please enter your full name and at least one contact method (email or phone).', 'warning');
        flashButtonHint('hint-nextToStep5');
        announceToScreenReader('Please complete your contact information to continue.');
        return;
    }

    if (currentStep === 4) completedSteps.add(4);
    currentStep = 5;
    updateStepDisplay();
    updateProgressBar();
    populateFinalSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/*update which step section is visible*/
function updateStepDisplay() {
    document.getElementById('step1').style.display = currentStep === 1 ? 'block' : 'none';
    document.getElementById('step2').style.display = currentStep === 2 ? 'block' : 'none';
    document.getElementById('step3').style.display = currentStep === 3 ? 'block' : 'none';
    document.getElementById('step4').style.display = currentStep === 4 ? 'block' : 'none';
    document.getElementById('step5').style.display = currentStep === 5 ? 'block' : 'none';
    
    // we need to make sure step labels show if active, completed, and upcoming states. And allow clicking back to completed steps
    const stepGoFns = [null, goToStep1, goToStep2, goToStep3, goToStep4, goToStep5];
    for (let i = 1; i <= 5; i++) {
        const label = document.getElementById(`step${i}Label`);
        if (!label) continue;

        // remove all state classes
        label.className = '';
        // remove any previously-bound click handler via cloneNode trick
        const fresh = label.cloneNode(true);
        label.parentNode.replaceChild(fresh, label);
        const newLabel = document.getElementById(`step${i}Label`);

        if (i === currentStep) {
            newLabel.classList.add('step-active');
            newLabel.removeAttribute('role');
            newLabel.removeAttribute('tabindex');
        } else if (completedSteps.has(i)) {
            newLabel.classList.add('step-completed', 'step-clickable');
            newLabel.setAttribute('role', 'button');
            newLabel.setAttribute('tabindex', '0');
            newLabel.setAttribute('title', `Go back to step ${i}`);
            newLabel.addEventListener('click', stepGoFns[i]);
            newLabel.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stepGoFns[i](); }
            });
        } else {
            // unreached steps are greyed out
            newLabel.classList.add('step-upcoming');
            newLabel.removeAttribute('role');
            newLabel.removeAttribute('tabindex');
        }
    }
}

/*Update progress bar based on current step*/
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    const percentage = (currentStep / 5) * 100;
    
    progressBar.style.width = percentage + '%';
    progressBar.setAttribute('aria-valuenow', percentage);
    
    const stepTexts = [
        'Step 1: Select Service',
        'Step 2: Select Staff',
        'Step 3: Schedule & Details',
        'Step 4: Enter Contact',
        'Step 5: Confirm'
    ];
    
    progressBar.textContent = stepTexts[currentStep - 1];
}

/*initializing Bootstrap tooltips*/
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Get current booking data
 * This function can be called by Step 3+ to access the booking data
 * @returns {Object} Current booking information
 */
function getBookingData() {
    return {
        service: selectedService,
        staff: selectedStaff,
        step: currentStep
    };
}

/**
 *log current state for debugging purposes, this can be called from the console to see what's currently selected and which step the user is on
 */
function debugState() {
    console.log('=== Current Booking State ===');
    console.log('Current Step:', currentStep);
    console.log('Selected Service:', selectedService);
    console.log('Selected Staff:', selectedStaff);
    console.log('===========================');
}
let bookingDate = null; // Date object
let bookingTime = "";   // string like "10:30"

// Convert days to numbers
function dayNameToIndex(dayName) {
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[dayName] ?? null;
}

function parseAvailabilityToAllowedDays(availabilityStr) {
  const parts = availabilityStr.split('-').map(s => s.trim());
  if (parts.length !== 2) return new Set([0,1,2,3,4,5,6]);

  const start = dayNameToIndex(parts[0]);
  const end = dayNameToIndex(parts[1]);
  if (start === null || end === null) return new Set([0,1,2,3,4,5,6]);

  const allowed = new Set();
  let i = start;
  while (true) {
    allowed.add(i);
    if (i === end) break;
    i = (i + 1) % 7;
  }
  return allowed;
}

// Format date as YYYY-MM-DD
function ymd(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Month label like "February 2026"
function monthLabel(d) {
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

// Initialize calendar when entering Step 3
function initStep3Calendar() {
  const calDays = document.getElementById("calDays");
  const calMonthLabelEl = document.getElementById("calMonthLabel");
  const calPrev = document.getElementById("calPrev");
  const calNext = document.getElementById("calNext");

  const selectedDateText = document.getElementById("selectedDateText");
  const timeSelect = document.getElementById("timeSelect");
  const scheduleSummary = document.getElementById("scheduleSummary");
  const nextToStep4 = document.getElementById("nextToStep4");

  // Step 3 summary elements
  const step3BookingSummary = document.getElementById("step3BookingSummary");
  const step3SummaryService = document.getElementById("step3SummaryService");
  const step3SummaryStaff = document.getElementById("step3SummaryStaff");
  const step3SummaryPrice = document.getElementById("step3SummaryPrice");
  const step3SummaryDuration = document.getElementById("step3SummaryDuration");
  const step3SummaryDate = document.getElementById("step3SummaryDate");
  const step3SummaryTime = document.getElementById("step3SummaryTime");

  // Safety check
  if (!calDays || !calMonthLabelEl || !calPrev || !calNext) return;

  // Reset selection every time you enter step 3
  bookingDate = null;
  bookingTime = "";
  timeSelect.innerHTML = `<option value="" selected disabled>Select a time</option>`;
  timeSelect.disabled = true;
  nextToStep4.disabled = true;
  if (step3BookingSummary) step3BookingSummary.style.display = "none";

  const allowedDays = selectedStaff
    ? parseAvailabilityToAllowedDays(selectedStaff.availability)
    : new Set([0,1,2,3,4,5,6]);

  // Current month being displayed
  let view = new Date();
  view.setDate(1);
  view.setHours(0, 0, 0, 0);

  // Today (disable past)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function renderCalendar() {
    calMonthLabelEl.textContent = monthLabel(view);
    calDays.innerHTML = "";

    const year = view.getFullYear();
    const month = view.getMonth();

    // as another constraint feature... disable "prev" button if already showing the current month
    const todayForNav = new Date();
    const isCurrentMonth = (year === todayForNav.getFullYear() && month === todayForNav.getMonth());
    calPrev.disabled = isCurrentMonth;
    calPrev.setAttribute('aria-disabled', isCurrentMonth ? 'true' : 'false');

    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empty grid cells before day 1
    for (let i = 0; i < firstDow; i++) {
      const blank = document.createElement("div");
      blank.style.height = "3rem";
      calDays.appendChild(blank);
    }

    // Day buttons
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      d.setHours(0, 0, 0, 0);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn cal-btn";
      btn.textContent = day;

      const isPast = d < today;
      const isAllowed = allowedDays.has(d.getDay());
      if (isPast || !isAllowed) btn.disabled = true;

      if (bookingDate && ymd(d) === ymd(bookingDate)) {
        btn.classList.add("selected");
      }

      btn.addEventListener("click", () => {
        bookingDate = d;
        bookingTime = "";
        timeSelect.disabled = false;

        // Fill time slots
        const slots = ["09:00","09:30","10:00","10:30","11:00","11:30",
          "13:30","14:00","14:30","15:00","15:30","16:00",
          "16:30","17:00","17:30"];

        timeSelect.innerHTML = `<option value="" selected disabled>Select a time</option>`;
        slots.forEach(t => {
          const opt = document.createElement("option");
          opt.value = t;
          opt.textContent = t;
          timeSelect.appendChild(opt);
        });

        updateSummary();
        renderCalendar();
      });

      calDays.appendChild(btn);
    }
  }

  function updateSummary() {
    const techInfo = selectedStaff ? selectedStaff.availability : "All days";

    // No date
    if (!bookingDate) {
      selectedDateText.textContent = `No date selected (Tech availability: ${techInfo})`;
      scheduleSummary.textContent = "No date/time chosen yet.";
      nextToStep4.disabled = true;
      if (step3BookingSummary) step3BookingSummary.style.display = "none";
      return;
    }

    selectedDateText.textContent = `Selected date: ${ymd(bookingDate)} (Tech availability: ${techInfo})`;

    // No time
    if (!bookingTime) {
      scheduleSummary.textContent = `Date: ${ymd(bookingDate)} — Time: (not selected)`;
      nextToStep4.disabled = true;
      if (step3BookingSummary) step3BookingSummary.style.display = "none";
      return;
    }

    // Date + time chosen
    scheduleSummary.textContent = `Date: ${ymd(bookingDate)} — Time: ${bookingTime}`;
    nextToStep4.disabled = false;

    // hide the persistent hint once date+time are chosen
    const hint4 = document.getElementById('hint-nextToStep4');
    if (hint4) hint4.classList.remove('visible');

    // announce readiness to screen readers
    announceToScreenReader(`Date ${ymd(bookingDate)} at ${bookingTime} selected. You can now continue to contact information.`);

    if (step3BookingSummary) step3BookingSummary.style.display = "block";

    if (step3SummaryService) step3SummaryService.textContent = selectedService ? selectedService.name : "";
    if (step3SummaryStaff) step3SummaryStaff.textContent = selectedStaff ? `${selectedStaff.name} (${selectedStaff.role})` : "";
    if (step3SummaryPrice) step3SummaryPrice.textContent = selectedService ? `$${selectedService.price}` : "";
    if (step3SummaryDuration) step3SummaryDuration.textContent = selectedService ? selectedService.duration : "";
    if (step3SummaryDate) step3SummaryDate.textContent = ymd(bookingDate);
    if (step3SummaryTime) step3SummaryTime.textContent = bookingTime;
  }

  // IMPORTANT: bind events
  timeSelect.addEventListener("change", (e) => {
    bookingTime = e.target.value || "";
    updateSummary();
  });

  calPrev.onclick = () => {
    view.setMonth(view.getMonth() - 1);
    renderCalendar();
  };

  calNext.onclick = () => {
    view.setMonth(view.getMonth() + 1);
    renderCalendar();
  };

  // IMPORTANT: initial render
  renderCalendar();
  updateSummary();
}

//I made these utility functions available globally for team developers
window.getBookingData = getBookingData;
window.debugState = debugState;
