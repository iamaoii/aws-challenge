let registeredEvents = [];
let createdEvents = [];
let currentTab = "registered";

function setupMyEvents() {
  requireAuth();
  updateAuthUI();

  document.addEventListener("DOMContentLoaded", () => {
    loadRegisteredEvents();
    loadCreatedEvents();
  });
}

function switchTab(tabName) {
  currentTab = tabName;

  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add("active");

  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });
  document.getElementById(tabName + "Tab").classList.add("active");
}

async function loadRegisteredEvents() {
  const loadingSpinner = document.getElementById("registeredLoadingSpinner");
  const eventsContainer = document.getElementById("registeredEventsContainer");
  const noEvents = document.getElementById("noRegisteredEvents");

  try {
    loadingSpinner.style.display = "block";
    eventsContainer.style.display = "none";
    noEvents.style.display = "none";

    const user = getCurrentUser();
    const events = await usersAPI.getMyEvents(user.id);
    registeredEvents = events.registered;

    if (registeredEvents.length === 0) {
      loadingSpinner.style.display = "none";
      noEvents.style.display = "block";
      return;
    }

    renderRegisteredEvents(registeredEvents);
    loadingSpinner.style.display = "none";
    eventsContainer.style.display = "grid";
  } catch (error) {
    loadingSpinner.style.display = "none";
    showAlert("Failed to load registered events: " + error.message, "error");
  }
}

async function loadCreatedEvents() {
  const loadingSpinner = document.getElementById("createdLoadingSpinner");
  const eventsContainer = document.getElementById("createdEventsContainer");
  const noEvents = document.getElementById("noCreatedEvents");

  try {
    loadingSpinner.style.display = "block";
    eventsContainer.style.display = "none";
    noEvents.style.display = "none";

    const user = getCurrentUser();
    const events = await usersAPI.getMyEvents(user.id);
    createdEvents = events.created;

    if (createdEvents.length === 0) {
      loadingSpinner.style.display = "none";
      noEvents.style.display = "block";
      return;
    }

    renderCreatedEvents(createdEvents);
    loadingSpinner.style.display = "none";
    eventsContainer.style.display = "grid";
  } catch (error) {
    loadingSpinner.style.display = "none";
    showAlert("Failed to load created events: " + error.message, "error");
  }
}

function renderRegisteredEvents(events) {
  const container = document.getElementById("registeredEventsContainer");
  container.innerHTML = "";

  events.forEach((event) => {
    const eventCard = createRegisteredEventCard(event);
    container.appendChild(eventCard);
  });
}

function renderCreatedEvents(events) {
  const container = document.getElementById("createdEventsContainer");
  container.innerHTML = "";

  events.forEach((event) => {
    const eventCard = createCreatedEventCard(event);
    container.appendChild(eventCard);
  });
}

function createRegisteredEventCard(event) {
  const card = document.createElement("div");
  card.className = "card";

  const eventDate = formatEventDate(event.date);
  const eventTime = event.time;
  const isPastEvent = new Date(event.date) < new Date();

  card.innerHTML = `
    <div class="card-title">${escapeHtml(event.title)}</div>
    <div class="card-meta">
      <div>📅 ${eventDate} at ${eventTime}</div>
      <div>📍 ${escapeHtml(event.location)}</div>
      ${isPastEvent ? '<div class="event-status past">Past Event</div>' : '<div class="event-status upcoming">Upcoming</div>'}
    </div>
    <div class="card-description">
      ${escapeHtml(event.description || "")}
    </div>
    <div class="card-actions">
      ${!isPastEvent ? `
        <button class="btn btn-danger" onclick="cancelRegistration('${event.id}')">
          Cancel Registration
        </button>
      ` : ""}
    </div>
  `;

  return card;
}

function createCreatedEventCard(event) {
  const card = document.createElement("div");
  card.className = "card";

  const eventDate = formatEventDate(event.date);
  const eventTime = event.time;
  const isPastEvent = new Date(event.date) < new Date();

  card.innerHTML = `
    <div class="card-title">${escapeHtml(event.title)}</div>
    <div class="card-meta">
      <div>📅 ${eventDate} at ${eventTime}</div>
      <div>📍 ${escapeHtml(event.location)}</div>
      <div>👥 ${event.attendees_count || 0} attendees</div>
      ${isPastEvent ? '<div class="event-status past">Past Event</div>' : '<div class="event-status upcoming">Upcoming</div>'}
    </div>
    <div class="card-description">
      ${escapeHtml(event.description || "")}
    </div>
    <div class="card-actions">
      <button class="btn btn-secondary" onclick="viewEventDetails('${event.id}')">
        View Details
      </button>
      ${!isPastEvent ? `
        <button class="btn btn-primary" onclick="editEvent('${event.id}')">
          Edit Event
        </button>
      ` : ""}
    </div>
  `;

  return card;
}

async function cancelRegistration(eventId) {
  if (!confirm("Are you sure you want to cancel your registration for this event?")) {
    return;
  }

  try {
    await eventsAPI.unregister(eventId);
    showAlert("Registration cancelled successfully!", "success");
    loadRegisteredEvents();
  } catch (error) {
    showAlert("Failed to cancel registration: " + error.message, "error");
  }
}

function filterRegisteredEvents() {
  const filter = document.getElementById("statusFilter").value;
  const now = new Date();

  let filteredEvents = registeredEvents;

  if (filter === "upcoming") {
    filteredEvents = registeredEvents.filter((event) => new Date(event.date) >= now);
  } else if (filter === "past") {
    filteredEvents = registeredEvents.filter((event) => new Date(event.date) < now);
  }

  renderRegisteredEvents(filteredEvents);
}

function viewEventDetails(eventId) {
  showAlert("Event details view coming soon!", "info");
}

function editEvent(eventId) {
  showAlert("Event editing coming soon!", "info");
}

// Initialize my-events page
setupMyEvents();