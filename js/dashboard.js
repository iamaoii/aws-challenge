async function loadEvents() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  const eventsContainer = document.getElementById("eventsContainer");
  const noEvents = document.getElementById("noEvents");

  try {
    loadingSpinner.style.display = "block";
    eventsContainer.style.display = "none";
    noEvents.style.display = "none";

    const events = await eventsAPI.getAll();
    if (events.length === 0) {
      loadingSpinner.style.display = "none";
      noEvents.style.display = "block";
      return;
    }

    renderEvents(events);
    loadingSpinner.style.display = "none";
    eventsContainer.style.display = "grid";
  } catch (error) {
    loadingSpinner.style.display = "none";
    showAlert("Failed to load events: " + error.message, "error");
  }
}

function renderEvents(events) {
  const container = document.getElementById("eventsContainer");
  container.innerHTML = "";

  events.forEach((event) => {
    const eventCard = createEventCard(event);
    container.appendChild(eventCard);
  });
}

function createEventCard(event) {
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
      ${!isPastEvent ? `
        <button class="btn btn-primary" onclick="registerForEvent('${event.id}')">
          Register
        </button>
      ` : ""}
    </div>
  `;

  return card;
}

async function registerForEvent(eventId) {
  try {
    await eventsAPI.register(eventId);
    showAlert("Registered successfully!", "success");
    loadEvents();
  } catch (error) {
    showAlert("Failed to register: " + error.message, "error");
  }
}

function filterEvents(searchTerm) {
  eventsAPI.getAll().then((events) => {
    const filteredEvents = events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderEvents(filteredEvents);
  });
}

function setupDashboard() {
  requireAuth();
  updateAuthUI();

  document.addEventListener("DOMContentLoaded", loadEvents);

  document.getElementById("searchInput").addEventListener("input", (e) => {
    filterEvents(e.target.value);
  });
}

// Initialize dashboard page
setupDashboard();