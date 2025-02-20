/**
 * Name: MathGoesRetro
 * Author: Melvyn Wilbert Tjandra, Zain Aldin Zaher Alnaem
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Fetches and displays the leaderboard rankings.
 * - Retrieves top player scores from the API.
 * - Dynamically populates the leaderboard table.
 * - Handles errors with a user-friendly message.
 * - Redirects users to login if not authenticated.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const leaderboardBody = document.getElementById("leaderboard-body");

  try {
    // Fetch leaderboard data from the API
    const response = await fetch("http://localhost:3000/api/gameStats/leaderboard");
    if (!response.ok) throw new Error("Failed to fetch leaderboard data");

    const leaderboardData = await response.json();

    // Populate the leaderboard
    leaderboardBody.innerHTML = ""; // Clear existing entries
    leaderboardData.forEach((entry, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.username}</td>
        <td>${entry.total_score}</td>
      `;
      leaderboardBody.appendChild(row);
    });
  } catch (error) {
    console.error(error);
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="3" style="color: red; text-align: center;">Error loading leaderboard data.</td>
      </tr>
    `;
  }
});

// Redirect if not logged in
const userId = localStorage.getItem('user_id');
if (!userId) {
  alert("You must be logged in to access this page.");
  window.location.href = 'index.html'; // Redirect to login page
}
