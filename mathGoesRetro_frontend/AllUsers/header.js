/**
 * Name: MathGoesRetro
 * Author: Zain Aldin Zaher Alnaem
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Toggles the visibility of the side menu.
 * Opens the menu if it’s closed, and closes it if it’s open.
 */

function toggleMenu() {
    const sideMenu = document.getElementById('sideMenu');
    if (sideMenu.classList.contains('open')) {
      sideMenu.classList.remove('open'); // Close the menu
    } else {
      sideMenu.classList.add('open'); // Open the menu
    }
  }
  
  function goHome() {
    window.location.href = '/mathGoesRetro_frontend/AllUsers/menu.html';
  }

  function submitQuestion() {
    const userRole = localStorage.getItem('selectedRole');
      if (userRole === 'H') {
        console.log('Submit Button found');
        console.log('User Role:', userRole);
        window.location.href = 'submitQuestion.html';
      } else {
        alert("Only a Host can submit a question");
      }
    
  }

  function viewLeaderboard() {
    window.location.href = '/mathGoesRetro_frontend/AllUsers/leaderboard.html';
  }
  
  function stats() {
    window.location.href = '/mathGoesRetro_frontend/AllUsers/stats.html';
  }

  function logout() {
    // Clear any relevant data from localStorage
localStorage.removeItem('user_id');
localStorage.removeItem('selectedRole');

// Add headers to prevent caching (server-side headers are more reliable, but this is a client-side layer)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
  });
}


    window.location.href = '/mathGoesRetro_frontend/AllUsers/index.html';
  }

  function editProfile() {
    window.location.href = '/mathGoesRetro_frontend/AllUsers/editUser.html';
  }

  async function deleteProfile() {
    const userRole = localStorage.getItem('selectedRole');
      if (userRole === 'H') {
        alert("You can't delete your profile ");
      } else {
    const userId = localStorage.getItem('user_id');
  
    // Show a confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete your profile? This action cannot be undone.");
  
    if (!isConfirmed) {
      return; // If the user cancels, exit the function
    }
  
    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      const result = await response.json();
  
      if (response.ok) { // Check if the response status is 200-299
        // If the backend returns a success message
        if (result.success || result.message === "User deleted successfully") {
          alert("User profile deleted successfully.");
          // Optionally redirect the user to another page or log them out
          window.location.href = '/mathGoesRetro_frontend/AllUsers/login.html'; // Redirecting to login page
        } else {
          alert("Failed to delete the user profile.");
        }
      } else {
        alert("An error occurred while deleting the user profile.");
      }
    } catch (error) {
      console.error("Error deleting user profile:", error);
      alert("An error occurred while deleting the user profile.");
    }
  }
  }