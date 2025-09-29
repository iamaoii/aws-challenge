function setupDashboard() {
    requireAuth();
    updateAuthUI();
  
    document.addEventListener('DOMContentLoaded', loadEvents);
  
    document.getElementById('searchInput').addEventListener('input', (e) => {
      filterEvents(e.target.value);
    });
  }
  
  // Initialize dashboard page
  setupDashboard();