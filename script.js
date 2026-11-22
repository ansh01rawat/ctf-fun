/**
 * script.js — Aegis University Portal
 * Main application logic for the Student & Lab Portal UI
 *
 * Responsibilities:
 *  - Portal initialisation (session, cookie, theme)
 *  - Tab navigation switching
 *  - Course Registry table rendering and live search
 *  - System Diagnostics panel behaviour
 *  - Admin Gate clearance verification
 *  - Dark/Light theme toggle
 *
 * Dependencies: data.js (must be loaded before this file)
 *
 * Author: ITS Web Systems, Aegis University
 * Version: 3.4.1
 */


/* =============================================================
   GLOBAL STATE
   ============================================================= */

/**
 * isAdmin — controls access to the Admin Gate panel.
 * Default value is false. This flag can be elevated via URL
 * query parameter (?clearance=admin) for authorised staff.
 * The var keyword is intentional here: it makes the variable
 * accessible on the window object, which the clearance check reads.
 */
var isAdmin = false;
window.isAdmin = false;


/* =============================================================
   PORTAL INITIALISATION
   Runs once when the DOM is fully loaded.
   ============================================================= */
document.addEventListener("DOMContentLoaded", function () {

  // Print a styled startup message to the browser console.
  // Useful for developers debugging the portal in DevTools.
  console.log(
    "%c Aegis University Portal %c v3.4.1 — ITS Web Systems ",
    "background:#1d4ed8; color:#fff; font-weight:bold; padding:4px 8px; border-radius:4px 0 0 4px;",
    "background:#0f172a; color:#94a3b8; padding:4px 8px; border-radius:0 4px 4px 0;"
  );
  console.log(
    "%c Portal initialised. Session context loaded.",
    "color:#60a5fa; font-size:12px;"
  );

  // Establish a session identifier in localStorage so the portal
  // can correlate activity across page refreshes within this session.
  localStorage.setItem("session_id", "usr_sess_a8f2c1049");

  // Write a read-access tier cookie so the server can verify the
  // user's permission level on API calls that require it.
  document.cookie = "access_tier=student_read; path=/; SameSite=Lax";

  // Restore the user's saved theme preference, or default to dark.
  applyStoredTheme();

  // Check if a clearance parameter was provided in the URL.
  // This allows authorised staff to arrive at the Admin Gate pre-cleared.
  checkUrlClearance();

  // Attach the tab navigation click handlers.
  initTabs();

  // Populate the Course Registry table from data.js.
  renderRegistryTable(studentRecords);

  // Wire up the live search input.
  initRegistrySearch();

  // Wire up the System Diagnostics button.
  initDiagnostics();

  // Wire up the Admin Gate verify button.
  initAdminGate();

  // Wire up the theme toggle button in the header.
  initThemeToggle();
});


/* =============================================================
   THEME MANAGEMENT
   ============================================================= */

/**
 * applyStoredTheme
 * Reads the user's saved theme from localStorage and applies
 * it by setting the data-theme attribute on the <html> element.
 * If no preference is stored, the default is "dark".
 */
function applyStoredTheme() {
  var saved = localStorage.getItem("portal_theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
  updateThemeIcon(saved);
}

/**
 * updateThemeIcon
 * Swaps the icon shown on the theme toggle button to reflect
 * the currently active theme.
 * @param {string} theme — either "dark" or "light"
 */
function updateThemeIcon(theme) {
  var icon = document.getElementById("themeIcon");
  if (!icon) return;
  // Sun emoji for dark mode (clicking will switch to light),
  // moon emoji for light mode (clicking will switch to dark).
  icon.textContent = theme === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19";
}

/**
 * initThemeToggle
 * Attaches a click listener to the header toggle button.
 * Each click flips between dark and light, saves the choice
 * to localStorage, and updates the icon.
 */
function initThemeToggle() {
  var btn = document.getElementById("themeToggle");
  if (!btn) return;

  btn.addEventListener("click", function () {
    var current = document.documentElement.getAttribute("data-theme");
    var next = current === "dark" ? "light" : "dark";

    // Apply the new theme to the document root.
    document.documentElement.setAttribute("data-theme", next);

    // Persist the choice so it survives page refresh.
    localStorage.setItem("portal_theme", next);

    // Update the toggle button icon.
    updateThemeIcon(next);
  });
}


/* =============================================================
   URL CLEARANCE CHECK
   ============================================================= */

/**
 * checkUrlClearance
 * Reads the ?clearance query parameter from the current URL.
 * If its value is "admin", the global isAdmin flag is set to true,
 * enabling access to the Admin Gate panel content.
 *
 * Example: https://portal.aegisuniversity.ac.uk/?clearance=admin
 */
function checkUrlClearance() {
  var params = new URLSearchParams(window.location.search);
  var clearanceValue = params.get("clearance");

  if (clearanceValue === "admin") {
    // Elevate the access flag for this page session.
    isAdmin = true;
    window.isAdmin = true;
  }
}


/* =============================================================
   TAB NAVIGATION
   ============================================================= */

/**
 * initTabs
 * Finds all tab buttons and attaches click listeners.
 * Clicking a tab hides all panels and shows only the target one,
 * updating aria-selected attributes for accessibility.
 */
function initTabs() {
  var tabButtons = document.querySelectorAll(".tab-btn");

  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetTab = btn.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });
}

/**
 * switchTab
 * Activates a named tab: deactivates all others, activates the target.
 * @param {string} tabName — the data-tab value of the tab to show
 */
function switchTab(tabName) {
  // Deactivate all tab buttons.
  var allButtons = document.querySelectorAll(".tab-btn");
  allButtons.forEach(function (btn) {
    btn.classList.remove("active");
    btn.setAttribute("aria-selected", "false");
  });

  // Hide all tab panels.
  var allPanels = document.querySelectorAll(".tab-panel");
  allPanels.forEach(function (panel) {
    panel.hidden = true;
    panel.classList.remove("active");
  });

  // Activate the clicked tab button.
  var activeBtn = document.querySelector('[data-tab="' + tabName + '"]');
  if (activeBtn) {
    activeBtn.classList.add("active");
    activeBtn.setAttribute("aria-selected", "true");
  }

  // Show the corresponding tab panel.
  var activePanel = document.getElementById("tab-" + tabName);
  if (activePanel) {
    activePanel.hidden = false;
    activePanel.classList.add("active");
  }
}


/* =============================================================
   COURSE REGISTRY — TABLE RENDERING & SEARCH
   ============================================================= */

/**
 * renderRegistryTable
 * Builds and injects table rows from an array of student records.
 * Only four fields are displayed: id, name, course, status.
 * Fields like `department`, `year`, and `internal_audit` are
 * present in the data objects but are not placed in the DOM.
 *
 * @param {Array} records — array of student record objects from data.js
 */
function renderRegistryTable(records) {
  var tbody = document.getElementById("registryBody");
  var countEl = document.getElementById("registryCount");
  if (!tbody) return;

  // Clear any existing rows before re-rendering.
  tbody.innerHTML = "";

  if (records.length === 0) {
    // Show a friendly empty-state message when no records match.
    var emptyRow = document.createElement("tr");
    emptyRow.className = "empty-row";
    emptyRow.innerHTML = '<td colspan="4">No matching records found.</td>';
    tbody.appendChild(emptyRow);
  } else {
    // Build one row per record, exposing only the four approved columns.
    records.forEach(function (record) {
      var row = document.createElement("tr");

      // Determine which CSS class to apply to the status cell.
      var statusClass = getStatusClass(record.status);

      // Only four columns rendered — additional record fields
      // (department, year, internal_audit) are intentionally omitted.
      row.innerHTML =
        "<td>" + escapeHtml(record.id) + "</td>" +
        "<td>" + escapeHtml(record.name) + "</td>" +
        "<td>" + escapeHtml(record.course) + "</td>" +
        '<td><span class="badge ' + statusClass + '">' +
          escapeHtml(record.status) +
        "</span></td>";

      tbody.appendChild(row);
    });
  }

  // Update the row count display below the table.
  if (countEl) {
    countEl.textContent = "Showing " + records.length + " of " +
      studentRecords.length + " records";
  }
}

/**
 * getStatusClass
 * Maps a student status string to the corresponding badge CSS class.
 * @param {string} status — the student's enrolment status
 * @returns {string} CSS class name
 */
function getStatusClass(status) {
  switch (status) {
    case "Enrolled":  return "badge-active";
    case "On Leave":  return "badge-pending";
    case "Suspended": return "badge-cancelled";
    default:          return "badge-pending";
  }
}

/**
 * initRegistrySearch
 * Attaches a live "input" event listener to the search field.
 * On each keystroke, filters studentRecords by name or course
 * (case-insensitive) and re-renders the table.
 */
function initRegistrySearch() {
  var searchInput = document.getElementById("registrySearch");
  var hintEl = document.getElementById("searchHint");
  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    var query = searchInput.value.trim().toLowerCase();

    if (query === "") {
      // No filter active — show all records.
      renderRegistryTable(studentRecords);
      if (hintEl) hintEl.textContent = "Showing all records";
      return;
    }

    // Filter to records where name or course contains the query string.
    var filtered = studentRecords.filter(function (record) {
      return (
        record.name.toLowerCase().indexOf(query) !== -1 ||
        record.course.toLowerCase().indexOf(query) !== -1
      );
    });

    renderRegistryTable(filtered);
    if (hintEl) hintEl.textContent = 'Results for "' + searchInput.value.trim() + '"';
  });
}


/* =============================================================
   SYSTEM DIAGNOSTICS
   ============================================================= */

/**
 * initDiagnostics
 * Attaches a click handler to the "Run Diagnostics" button.
 * When clicked:
 *  1. Writes a session token to sessionStorage (key: diag_session).
 *     This key is written HERE, not at page load, so it only exists
 *     after the diagnostics tool has been activated.
 *  2. Populates and reveals the diagnostics results panel with
 *     simulated system health metrics.
 */
function initDiagnostics() {
  var runBtn = document.getElementById("runDiagBtn");
  if (!runBtn) return;

  runBtn.addEventListener("click", function () {
    // Write the diagnostic session token to sessionStorage.
    // This token is used by the backend health-check endpoint to
    // authenticate ephemeral diagnostics requests.
    sessionStorage.setItem("diag_session", "diag_auth_7f3c91");

    // Generate randomised-looking but plausible metric values.
    var memPercent = randomInt(42, 78);
    var cpuPercent = randomInt(12, 55);
    var uptimeDays = randomInt(14, 61);
    var uptimeHours = randomInt(0, 23);
    var nodeId = "au-portal-node-" + randomHex(4);

    // Populate the visible metric elements.
    setText("diagMem", memPercent + "%");
    setText("diagCpu", cpuPercent + "%");
    setText("diagUptime", uptimeDays + "d " + uptimeHours + "h");
    setText("diagNode", nodeId);
    setText("diagDb", "Connected \u2714");
    setText("diagAuth", "Online \u2714");

    // Animate the progress bars.
    animateBar("diagMemBar", memPercent);
    animateBar("diagCpuBar", cpuPercent);

    // Set a human-readable timestamp on the report.
    var now = new Date();
    var timestamp = now.toUTCString();
    setText("diagTimestamp", "Report generated: " + timestamp);

    // Reveal the results panel (it starts hidden to avoid showing
    // empty placeholders before the diagnostics have been run).
    var resultsPanel = document.getElementById("diagResults");
    if (resultsPanel) {
      resultsPanel.hidden = false;
    }

    // Change the button label to indicate the tool is refreshable.
    runBtn.textContent = "\u21BA Refresh Diagnostics";
  });
}

/**
 * animateBar
 * Sets the width of a diagnostics progress bar element.
 * Uses requestAnimationFrame timing for a smooth CSS transition.
 * @param {string} barId — the element ID of the .diag-bar element
 * @param {number} percent — target width percentage (0–100)
 */
function animateBar(barId, percent) {
  var bar = document.getElementById(barId);
  if (!bar) return;
  // Brief delay so the CSS transition visually animates from 0 to target.
  setTimeout(function () {
    bar.style.width = percent + "%";
  }, 50);
}


/* =============================================================
   ADMIN GATE
   ============================================================= */

/**
 * initAdminGate
 * Wires up the "Verify Clearance" button on the Admin Gate tab.
 * On click, checks the global isAdmin flag (which may have been
 * elevated by checkUrlClearance() on page load).
 */
function initAdminGate() {
  var verifyBtn = document.getElementById("verifyClearanceBtn");
  if (!verifyBtn) return;

  verifyBtn.addEventListener("click", function () {
    // Read both the local variable and the window property.
    // Either being true is sufficient to grant access.
    if (isAdmin === true || window.isAdmin === true) {
      // Access granted — inject the admin panel content into the DOM.
      injectAdminPanel();
    } else {
      // Access denied — show the rejection message.
      // Message deliberately does not reveal variable names or logic.
      showAdminError("Access denied. Officer clearance required.");
    }
  });
}

/**
 * injectAdminPanel
 * Dynamically builds and injects the authorised admin content
 * into the #adminPanelContainer element via innerHTML.
 * The panel content itself is a placeholder; actual restricted
 * data is served by the backend API after a separate auth check.
 */
function injectAdminPanel() {
  var container = document.getElementById("adminPanelContainer");
  var lockView = document.getElementById("adminLockView");
  if (!container) return;

  // Hide the lock/deny view.
  if (lockView) lockView.hidden = true;

  // Clear any previous error state.
  hideAdminError();

  // Inject the admin panel structure.
  // The placeholder text below is intentionally generic —
  // content is loaded from the restricted API endpoint on demand.
  container.innerHTML =
    '<div class="admin-panel-injected">' +
      '<h3>&#128275; Administrative Panel — Authorised Access</h3>' +
      '<p>Welcome. Your clearance has been verified for this session. ' +
         'Use the controls below to access administrative functions.</p>' +
      '<p class="text-muted" style="font-size:13px;">' +
         'Actions performed in this panel are logged and attributed to your ' +
         'officer account. Contact <a href="mailto:itsec@aegisuniversity.ac.uk">' +
         'itsec@aegisuniversity.ac.uk</a> to report unauthorised access.' +
      '</p>' +
      '<div class="admin-placeholder">' +
         '[ Authorized content loads here ]' +
      '</div>' +
    '</div>';
}

/**
 * showAdminError
 * Displays an error message in the Admin Gate panel.
 * @param {string} message — the error text to display
 */
function showAdminError(message) {
  var errorEl = document.getElementById("adminError");
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.hidden = false;
}

/**
 * hideAdminError
 * Hides the Admin Gate error message element.
 */
function hideAdminError() {
  var errorEl = document.getElementById("adminError");
  if (errorEl) errorEl.hidden = true;
}


/* =============================================================
   UTILITY HELPERS
   ============================================================= */

/**
 * escapeHtml
 * Prevents XSS by converting HTML special characters in a string
 * to their safe entity equivalents before inserting into the DOM.
 * Always use this when inserting user-supplied or external data as text.
 * @param {string} str — raw string to escape
 * @returns {string} HTML-safe string
 */
function escapeHtml(str) {
  if (typeof str !== "string") return String(str);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * setText
 * Sets the textContent of an element by ID.
 * Silently does nothing if the element doesn't exist.
 * @param {string} id — element ID
 * @param {string} text — text to set
 */
function setText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}

/**
 * randomInt
 * Returns a random integer between min and max (inclusive).
 * Used to generate varied diagnostics metric values on each run.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * randomHex
 * Returns a random hexadecimal string of a given character length.
 * Used to generate the portal node ID in the diagnostics panel.
 * @param {number} len — number of hex characters to generate
 * @returns {string}
 */
function randomHex(len) {
  var result = "";
  var chars = "0123456789abcdef";
  for (var i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
