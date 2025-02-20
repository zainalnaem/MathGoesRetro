# MathGoesRetro - Math Game Project

This project is an educational math game created using **Node.js**, **Express.js**, **JavaScript**, and **PostgreSQL**.
It allows users with different roles (Player, Host) to play math games and tracks their progress and high scores. The Admin is responsible for administration.

---

## Features
-  Play multiple math games with increasing difficulty.
-  Host role for submitting questions and unlocking all levels.
-  Highscore tracking and leaderboard.
-  RESTful API for user management and game statistics.
-  PostgreSQL database with JSON-based configuration.

---

## Getting Started

### Prerequisites
- Node.js
- PostgreSQL
- npm (comes with Node.js)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://gitlab.nt.fh-koeln.de/gitlab/syp24/team08.git

2. **Install dependencies:**
    npm install

3. **Database Configuration:**
    - Create a PostgreSQL database:
    Use the databaseScript.sql file in directory mathGoesRetro_database to create all the tables needed for this project.
    - Add your database credentials to dbConfig.json:
    {
    "host": "localhost",
    "port": 5432,
    "database": "your_db",
    "user": "your_db_user",
    "password": "your_db_password"
    }
4. **Start the server:**
    - Open a new terminal in the mathGoesRetro_backend directory and run the following command:
     • npm start
    - The server will run on: http://localhost:3000

5. **Start the frontend:**
    - Open the mathGoesRetro_frontend/AllUsers directory.
    - Open index.html in a browser or use a local development server to view the game.

#### User Roles and Permissions

	• Player: Can play levels one by one and save progress.
	• Host: Can add new questions and skip levels.
    • Admin: Can manage Players, Hosts and Tasks. To login into the Admin account use the following credentials:
     Username: Admin
     Password: 123


