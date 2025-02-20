/**
 * Name: MathGoesRetro
 * Author: Zain Aldin Zaher Alnaem
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles user registration by submitting form data to the backend,
 * creating user accounts, initializing game stats, and redirecting to login on success.
 */

document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get form data
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Retrieve the role dynamically
    let role = localStorage.getItem('selectedRole') || 'Player'; // Default to 'Player' if no role is set

    // Map role names to their codes
    if (role === 'player') {
        role = 'P';
    } else if (role === 'host') {
        role = 'H';
    }

    // Set account_status based on role
    const account_status = role === 'H' ? 'd' : 'a';

    try {
        // Send data to backend to register the user
        const userResponse = await fetch('http://localhost:3000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email,
                password,
                role,
                account_status,
            }),
        });

        const userResult = await userResponse.json();

        if (userResponse.ok) {
            // Successful registration
            alert('Registration successful');

            // Get the newly created user's ID
            const userId = userResult.user_id;

            // Create GameStats entries for the new user
            for (let gameId = 1; gameId <= 3; gameId++) {
                await fetch('http://localhost:3000/api/gameStats', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_highscore: '0', // Initial highscore
                        max_level: role === 'H' ? 9 : 1, // Unlock all levels for 'Host'
                        correct_answers: '0', // Initial correct answers
                        multiplier: 2.0,
                        user_id: userId, // Use the created user ID
                        game_id: gameId,
                    }),
                });
            }

            // Redirect to login page
            window.location.href = 'login.html';
        } else {
            // Backend returned an error
            alert(userResult.message || 'Registration failed');
        }
    } catch (error) {
        // Network or other errors
        console.error('Error:', error);
        alert('An error occurred during registration');
    }
});
