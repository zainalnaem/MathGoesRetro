-- This database schema manages users, tasks, games, and game statistics for a retro math game platform.

CREATE DATABASE MathGoesRetro;

-- Users Table
CREATE TABLE "User" (
    user_id SERIAL PRIMARY KEY, -- Changed to SERIAL for auto-increment
    username VARCHAR(250) NOT NULL,
    email VARCHAR(250) NOT NULL,
    password VARCHAR(250) NOT NULL,
    role CHAR NOT NULL,
    account_status CHAR NOT NULL
);

-- Tasks Table
CREATE TABLE "Task" (
    task_id SERIAL PRIMARY KEY,
    question VARCHAR(250) NOT NULL,
    wrong_answer1 VARCHAR(200) NOT NULL,
    wrong_answer2 VARCHAR(200) NOT NULL,
    wrong_answer3 VARCHAR(200) NOT NULL,
    correct_answer VARCHAR(200) NOT NULL,
    topic CHAR,
    difficulty INTEGER,
    points INTEGER,
    status CHAR,
    user_id INTEGER REFERENCES "User"(user_id) ON DELETE CASCADE
);

-- Games Table
CREATE TABLE "Game" (
    game_id INT PRIMARY KEY,
    game_name VARCHAR(250) NOT NULL,
    topic CHAR,
    level_num INTEGER,
    correct_per_level INTEGER
);

-- GameStats Table
CREATE TABLE "GameStats" (
    gamest_id SERIAL PRIMARY KEY,
    user_highscore INTEGER,
    max_level INTEGER,
    correct_answers INTEGER,
    multiplier DECIMAL(5, 2),
    user_id INTEGER REFERENCES "User"(user_id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES "Game"(game_id) ON DELETE CASCADE
);

-- Relationships (Optional for clarity)
ALTER TABLE "Task" ADD CONSTRAINT fk_user_task FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE;
ALTER TABLE "GameStats" ADD CONSTRAINT fk_user_stats FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE;
ALTER TABLE "GameStats" ADD CONSTRAINT fk_game_stats FOREIGN KEY (game_id) REFERENCES "Game"(game_id) ON DELETE CASCADE;