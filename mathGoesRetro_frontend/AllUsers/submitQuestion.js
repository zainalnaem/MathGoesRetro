/**
 * Name: MathGoesRetro
 * Author: Zain Aldin Zaher Alnaem
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles question submission and retrieval for the game,
 * including form validation, backend communication, and user question management.
 */

document.getElementById('questionForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get form data
    const question = document.getElementById('question').value;
    const correct_answer = document.getElementById('correctAnswer').value;
    const wrong_answer1 = document.getElementById('wrongAnswer1').value;
    const wrong_answer2 = document.getElementById('wrongAnswer2').value;
    const wrong_answer3 = document.getElementById('wrongAnswer3').value;
    const topic = document.getElementById('topic').value;
    const difficulty = document.getElementById('difficulty').value;

    let user_id = localStorage.getItem('user_id');

    console.log({
        question,
        correct_answer,
        wrong_answer1,
        wrong_answer2,
        wrong_answer3,
        topic,
        difficulty
    });

    // Map topic to backend values
    let topicMapped;
    if (topic === 'complex') topicMapped = 'c';
    else if (topic === 'derivative') topicMapped = 'd';
    else if (topic === 'radiant') topicMapped = 'r';

    // Map difficulty to backend values
    let difficultyMapped;
    if (difficulty === 'easy') difficultyMapped = 1;
    else if (difficulty === 'medium') difficultyMapped = 2;
    else if (difficulty === 'hard') difficultyMapped = 3;

    try {
        // Send data to backend
        const response = await fetch('http://localhost:3000/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question,
                wrong_answer1,
                wrong_answer2,
                wrong_answer3,
                correct_answer,
                topic: topicMapped,
                difficulty: difficultyMapped,
                points: 0,
                status: 'n',
                user_id
            }),
        });

        // Parse the response
        const result = await response.json();

        if (response.ok) {
            // Successful submission
            alert('Submission successful');
            window.location.href = 'menu.html';
        } else {
            // Backend returned an error
            alert(result.message || 'Submission failed');
        }
    } catch (error) {
        // Network or other errors
        console.error('Error:', error);
        alert('An error occurred during registration');
    }
});

function cancelForm() {
    window.location.href = 'menu.html'; // Redirect to the main menu
}

async function fetchUserQuestions() {
    const userId = localStorage.getItem('user_id'); // Get logged-in user ID

    if (!userId) {
        alert("You must be logged in to view your questions.");
        window.location.href = 'index.html'; // Redirect to login
        return;
    }

    try {
        // Fetch questions from the backend
        const response = await fetch(`http://localhost:3000/api/tasks`);
        const questions = await response.json();

        console.log("Fetched questions:", questions);
        console.log("Logged-in user ID:", userId);

        if (response.ok) {
            // Filter questions by user ID
            const userQuestions = questions.filter((question) => question.user_id == userId);
            console.log("Filtered questions for user:", userQuestions);

            const questionsList = document.getElementById('questionsList');
            questionsList.innerHTML = ''; // Clear any existing list

            if (userQuestions.length === 0) {
                questionsList.innerHTML = '<li>You have no questions added.</li>';
            } else {
                // Populate the list
                userQuestions.forEach((question) => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <strong>Question:</strong> ${question.question}<br>
                        <strong>Status:</strong> ${question.status === 'n' ? 'new ...Pending' : question.status === 'a' ? 'Approved' : 'Rejected'}
                    `;
                    questionsList.appendChild(listItem);
                });
            }

            // Show the questions display section
            document.getElementById('questionsDisplay').style.display = 'block';
        } else {
            alert("Failed to fetch questions. Please try again.");
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert("An error occurred while fetching your questions.");
    }
}

// Redirect if not logged in
const userId = localStorage.getItem('user_id');
if (!userId) {
    alert("You must be logged in to access this page.");
    window.location.href = 'index.html'; // Redirect to login page
}