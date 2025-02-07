const pool = require('../config/db');

const Task = {
    async createTask({ question, wrong_answer1, wrong_answer2, wrong_answer3, correct_answer, topic, difficulty, points, status, user_id }) {
        const result = await pool.query(
          `INSERT INTO "Task" (question, wrong_answer1, wrong_answer2, wrong_answer3, correct_answer, topic, difficulty, points, status, user_id ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
          [question, wrong_answer1, wrong_answer2, wrong_answer3, correct_answer, topic, difficulty, points, status, user_id ]
        );
        return result.rows[0];
      },
      async getAllTask() {
        const result = await pool.query(`SELECT * FROM "Task"`);
        return result.rows;
      },

      async updateTask(TaskId, { status }) {
        const result = await pool.query(`UPDATE "Task" 
           SET status = $1
           WHERE task_id = $2 RETURNING *`,
          [status, TaskId]
        );
        return result.rows[0];
      },

      async updateTaskStatus(taskId, task_status) {
        const result = await pool.query(
          `UPDATE "Task" SET status = $1 WHERE task_id = $2 RETURNING *`,
          [task_status, taskId]
        );

        if (result.rows.length === 0) {
          throw new Error('Task not found');
        }

        return result.rows[0];
      }

};  

module.exports = Task;