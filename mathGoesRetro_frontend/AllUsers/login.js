/**
 * Name: MathGoesRetro
 * Author: Melvyn Wilbert Tjandra, Zain Aldin Zaher Alnaem
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles user login by submitting credentials to the backend,
 * verifying user role, checking account status, and storing session data.
 * Redirects users to the main menu upon successful login.
 */

// Map full role names to their corresponding abbreviations
const roleMap = {
  'player': 'P',
  'host': 'H',
  'admin': 'A'
};

// Extract role from URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const role = urlParams.get('role'); // This will be 'P', 'H', or 'A'

// Store the role in localStorage to make it accessible across pages (optional)
if (role && roleMap[role]) {
  localStorage.setItem('selectedRole', roleMap[role]);
}


document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent default form submission

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Retrieve the expected role from localStorage
  const expectedRole = localStorage.getItem('selectedRole');

  try {
    const response = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (response.ok) {

      // Check if the account is deactivated
      if (result.user.account_status === 'd') {
        alert('Your account is deactivated. Please contact support for assistance.');
        return;
      }

      // Compare the role from backend with the expected role
      if (result.user.role !== expectedRole) {
        alert(`Access denied. You do not have the correct role (${expectedRole}) for this login.`);
        return;
      }

      alert(result.message); // Show success message
      // Store the user ID locally
      const userId = result.user.id;
      localStorage.setItem('user_id', userId); // Store in localStorage

      window.location.href = 'menu.html'; // Redirect to a secure page
    } else {
      alert(result.message || 'Login failed');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred during login');
  }
});