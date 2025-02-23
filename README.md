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
   git clone https://github.com/mathGoesRetro/MathGoesRetro.git
   ```

2. **Install dependencies:**

 - **Windows:**

   Download and install Node.js from nodejs.org. The npm package manager comes with it.
 - **macOS:**

    Install via Homebrew:
    ```bash
    brew install node
    ```
 - **Linux:**

    ```bash
    sudo apt update
    sudo apt install nodejs npm
    ```

   Once installed, proceed with:

    ```bash
    npm install
    ```

3. **Install PostgreSQL:**
   - **Windows:** 
   
     Download the installer from [PostgreSQL Official Website](https://www.postgresql.org/download/) and follow the setup instructions.

   - **Linux:**
     ```bash
     sudo apt update
     sudo apt install postgresql postgresql-contrib
     ```
   - **MacOS:** Install via Homebrew:
     ```bash
     brew install postgresql
     ```
   - After installation, start the PostgreSQL service:
     ```bash
     sudo systemctl start postgresql
     ```

4. **Database Configuration:**
    - Create a PostgreSQL database:
      Use the `databaseScript.sql` file in the `mathGoesRetro_database` directory to create the Database.

    - Create all needed tables:
      Use the same `databaseScript.sql` file in the `mathGoesRetro_database` directory to create all the tables needed for this project.
    - Add your database credentials to `mathGoesRetro_backend/src/config/dbConfig.json`:
      ```json
      {
        "host": "localhost",
        "port": 5432,
        "database": "your_db",
        "user": "your_db_user",
        "password": "your_db_password"
      }
      ```
5. **(OPTIONAL) Importing Tasks to the Database:**
    - We provided a JSON file called "intialTasks.json". You can find over 150 tasks that you can use for the game when imported.
    - Open your Database and view the table "Task". Import the mathGoesRetro_database/intialTasks.json into your table.

6. **Start the server:**
    - Open a new terminal in the `mathGoesRetro_backend` directory and run the following command:
      ```bash
      npm start
      ```
    - The server will run on: [http://localhost:3000](http://localhost:3000)

7. **Start the frontend:**
    - Open the `mathGoesRetro_frontend/AllUsers` directory.
    - Open `index.html` in a browser or use a local development server to view the game.

8. **Create an Admin:**
     1. Click on "Player" button.
     2. Click on "Register here".
     3. Create a Player account using the credentials you want to use for your Admin later.
     4. Open your Database. View the table "User"
     5. Change the role of your created Player from "P" to "A"
     6. Login as an Admin using the credentials of the created account.

9. **Create Host account:**
      1. Click on "Host" button.
      2. Click on "Register here".
      3. Create a Host account.
      4. The account is deactivated until the admin  approves it.

10. **Create Player:**
      1. Click on "Player" button.
      2. Click on "Register here".
      3. Create a Player account.

#### User Roles and Permissions

- **Player:** Can play levels one by one and save progress.
- **Host:** Can add new questions and skip levels.
- **Admin:** Can manage Players, Hosts, and Tasks.
