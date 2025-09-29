function setupSignupForm() {
    if (isAuthenticated()) {
      window.location.href = 'dashboard.html';
    }
  
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const formData = new FormData(e.target);
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');
  
      if (password !== confirmPassword) {
        showAlert('Passwords do not match!', 'error');
        return;
      }
  
      const userData = {
        full_name: formData.get('fullName'),
        email: formData.get('email'),
        password: password
      };
  
      await handleFormSubmit(e.target, async () => {
        await authAPI.signup(userData);
        showAlert('Account created successfully! Please login.', 'success');
  
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      });
    });
  }
  
  // Initialize signup form on page load
  document.addEventListener('DOMContentLoaded', setupSignupForm);