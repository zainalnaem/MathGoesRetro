/**
 * Name: MathGoesRetro
 * Author: Gonçalo Oliveira Cardoso
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles user registration when the confirm button is clicked.
 * Validates that passwords match and a role is selected, then sends the registration data to the backend.
 * If successful, it creates initial GameStats entries for the new user.
 */

document.getElementById('confirmButton').addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent default button behavior

    // Get form data
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const selectedType = document.querySelector('input[name="type"]:checked');

    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (!selectedType) {
        alert("Please, choose a role!");
        return;
    }

    const accountType = selectedType.value;
    let roleCode;

    if (accountType === 'player') {
        roleCode = 'P';
    } else if (accountType === 'host') {
        roleCode = 'H';
    }

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
                role: roleCode,
                account_status: 'a',
            }),
        });

        const userResult = await userResponse.json();

        if (userResponse.ok) {
            alert('User creation successful');
            const userId = userResult.user_id;

            // Create GameStats entries for the new user
            for (let gameId = 1; gameId <= 3; gameId++) {
                await fetch('http://localhost:3000/api/gameStats', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_highscore: '0',
                        max_level: 1,
                        correct_answers: '0',
                        multiplier: 2.0,
                        user_id: userId,
                        game_id: gameId,
                    }),
                });
            }
        } else {
            console.error('Backend error:', userResult);
            alert(userResult.message || 'Creation failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during creation');
    }
});