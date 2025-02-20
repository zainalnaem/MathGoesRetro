/**
 * Name: MathGoesRetro
 * Author: Gonçalo Oliveira Cardoso
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles admin login by mapping role names to abbreviations and extracting the expected role from URL parameters.
 * Processes the admin login form submission by sending credentials to the backend, 
 * verifying that the logged-in user has an Admin role, storing the user ID in localStorage, 
 * and redirecting to the admin management page.
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

document.getElementById('adminLoginForm').addEventListener('submit', async (event) => {
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
      // Compare the role from backend with the expected role
      if (result.user.role !== 'A') {
        alert(`Access denied. You do not have the correct role (${expectedRole}) for this login.`);
        return;
      }
      alert(result.message); // Show success message
      // Store the user ID locally
      const userId = result.user.id;
      localStorage.setItem('user_id', userId); // Store in localStorage

      window.location.href = 'adminManagement.html'; // Redirect to a secure page
    } else {
      alert(result.message || 'Login failed');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred during login');
  }
});