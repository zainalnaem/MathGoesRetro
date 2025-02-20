/**
 * Name: MathGoesRetro
 * Author: Zain Aldin Zaher Alnaem
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles user profile editing, including enabling editing mode, saving changes,
 * canceling edits, and validating the input fields. Fetches the current user data 
 * on page load and provides functionality for updating the user's profile, 
 * including the password and email.
 */

function enableEditing() {
  document.getElementById('username').readOnly = false;
  document.getElementById('password').readOnly = false;
  document.getElementById('email').readOnly = false;
  document.getElementById('saveButton').disabled = false;
}

function saveChanges(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validate passwords match
  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }


  console.log("Updated User Info:", { username, password, email });

  document.getElementById('username').readOnly = true;
  document.getElementById('password').readOnly = true;
  document.getElementById('confirmPassword').readOnly = true;
  document.getElementById('email').readOnly = true;
  document.getElementById('saveButton').disabled = true;

  alert("Changes saved successfully!");
}// Store original values to allow cancellation
let originalUsername, originalPassword, originalConfirmPassword, originalEmail;

function enableEditing() {
  // Store the original values
  originalUsername = document.getElementById('username').value;
  originalPassword = document.getElementById('password').value;
  originalConfirmPassword = document.getElementById('confirmPassword').value;
  originalEmail = document.getElementById('email').value;

  // Enable editing
  document.getElementById('username').readOnly = false;
  document.getElementById('password').readOnly = false;
  document.getElementById('confirmPassword').readOnly = false;
  document.getElementById('email').readOnly = false;

  // Enable Save and Cancel buttons
  document.getElementById('saveButton').disabled = false;
  document.getElementById('cancelButton').disabled = false;

  alert('Editing enabled. Make changes and click Save or Cancel.');
}

async function saveChanges(event) {
  event.preventDefault();
  const userId = localStorage.getItem('user_id');
  // Retrieve the role dynamically
  let role = localStorage.getItem('selectedRole') || 'Player'; // Default to 'Player' if no role is set

  // Map role names to their codes
  if (role === 'player') {
    role = 'P';
  } else if (role === 'host') {
    role = 'H';
  }


  // Get updated values from the input fields
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const email = document.getElementById('email').value;
  const account_status = "a";

  // Validate required fields
  if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
    alert("Username, Password and email are required.");
    return;
  }


  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    document.getElementById('password').classList.add('error');
    document.getElementById('confirmPassword').classList.add('error');
    return;
  }

  document.getElementById('password').classList.remove('error');
  document.getElementById('confirmPassword').classList.remove('error');

  // Create an object for updated data
  const updatedData = {
    username,
    email,
    role,
    account_status,
  };

  // Include password only if the user has entered it
  if (password.trim()) {
    updatedData.password = password;
  }

  try {
    // Send the updated data to the backend
    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error('Failed to save changes');
    }

    const result = await response.json();
    console.log("Server Response:", result);

    // Disable editing and show success message
    document.getElementById('username').readOnly = true;
    document.getElementById('password').readOnly = true;
    document.getElementById('email').readOnly = true;
    document.getElementById('saveButton').disabled = true;
    document.getElementById('cancelButton').disabled = true;

    alert("Changes saved successfully!");
  } catch (error) {
    console.error("Error saving changes:", error);
    alert("Failed to save changes. Please try again.");
  }
}

function cancelEditing() {
  // Revert to original values
  document.getElementById('username').value = originalUsername;
  document.getElementById('password').value = originalPassword;
  document.getElementById('confirmPassword').value = originalConfirmPassword;
  document.getElementById('email').value = originalEmail;

  // Disable fields and buttons
  document.getElementById('username').readOnly = true;
  document.getElementById('password').readOnly = true;
  document.getElementById('confirmPassword').readOnly = true;
  document.getElementById('email').readOnly = true;
  document.getElementById('saveButton').disabled = true;
  document.getElementById('cancelButton').disabled = true;

  alert("Changes canceled.");
}



document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('user_id');
  fetchUserData(userId);
});

async function fetchUserData(userId) {
  try {
    const response = await fetch(`http://localhost:3000/api/users/ ${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const user = await response.json();

    // Populate the fields with the fetched data 
    document.getElementById('username').value = user.username;
    document.getElementById('password').value = "";
    document.getElementById('email').value = user.email;
  } catch (error) {
    console.error("Error fetching user data:", error);
    alert("Failed to load user data.");
  }
}

// Redirect if not logged in
const userId = localStorage.getItem('user_id');
if (!userId) {
  alert("You must be logged in to access this page.");
  window.location.href = 'index.html'; // Redirect to login page
}