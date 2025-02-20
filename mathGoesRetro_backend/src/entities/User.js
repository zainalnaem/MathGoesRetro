/**
 * Name: MathGoesRetro
 * Author: Zain Aldin Zaher Alnaem
 * Version: 0.1
 * License: GPLv3
 * Date: 20.02.2025
 */

/**
 * Handles user-related operations such as creating, updating, deleting users,
 * verifying credentials, and managing account statuses. It also includes methods
 * for password reset and sending reset emails, with support for random password generation.
 */

const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const saltRounds = 10;

// Method to generate a random password
function generateRandomPassword() {
  return crypto.randomBytes(3).toString('hex'); // 8-byte random password
}

const User = {
  async createUser({ username, email, password, role, account_status }) {
    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(
      `INSERT INTO "User" (username, email, password, role, account_status) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [username, email, hashedPassword, role, account_status]
    );
    return result.rows[0];
  },

  async getUserById(userId) {
    const result = await pool.query(`SELECT * FROM "User" WHERE user_id = $1`, [userId]);
    return result.rows[0];
  },

  async getAllUsers() {
    const result = await pool.query(`SELECT * FROM "User"`);
    return result.rows;
  },

  async updateUser(userId, { username, email, password, role, account_status }) {
    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(`UPDATE "User" 
       SET username = $1, email = $2, password = $3, role = $4, account_status = $5 
       WHERE user_id = $6 RETURNING *`,
      [username, email, hashedPassword, role, account_status, userId]
    );
    return result.rows[0];
  },

  async updateAccountStatus(userId, account_status) {
    const result = await pool.query(
      `UPDATE "User" SET account_status = $1 WHERE user_id = $2 RETURNING *`,
      [account_status, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  },

  async deleteUser(userId) {
    const result = await pool.query(`DELETE FROM "User" WHERE user_id = $1 RETURNING *`, [userId]);
    return result.rows[0];
  },

  async verifyUserCredentials(username, password) {
    // Fetch the user with the matching username
    const result = await pool.query('SELECT * FROM "User" WHERE username = $1', [username]);

    // If no user is found, return an error
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    // Get the first user
    const user = result.rows[0];

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (user.account_status === 'd') {
      throw new Error('Your account is deactivated. Please contact support for assistance.');
    }

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Return the user data, including the role
    return {
      id: user.user_id,
      username: user.username,
      role: user.role,
    };
  },

  // Method to get user by email
  async getUserByEmail(email) {
    const result = await pool.query(`SELECT * FROM "User" WHERE email = $1`, [email]);
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    return result.rows[0];
  },

  // Method to send an email
  async sendPasswordResetEmail(email, randomPassword) {
    const user = await this.getUserByEmail(email);


    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mathgoesretro@gmail.com',
        pass: 'wiov rlqx nssv uqgd',
      },

      // const transporter = nodemailer.createTransport({
      //   host: 'sandbox.smtp.mailtrap.io',
      //   port: 2525,
      //   auth: {
      //       user: '6b01dd332206d3',
      //       pass: '4783b280f48782',
      //   },
    });

    const mailOptions = {
      from: 'no_reply@support_MathGoesRetro.de', // Sender address
      to: user.email, // Recipient's email
      subject: 'Your New Password',
      text: `Hello ${user.username},\n\nWe would like to inform you that your password has been successfully reset. Your new password is: ${randomPassword}.\n\nFor your security, please log in as soon as possible and change your password to something more memorable.\n\nIf you did not request a password reset, please contact our support team immediately at [mathgoesretro@gmail.com]. We take the security of your account seriously and want to ensure everything is secure.\n\nIf you have any questions or need assistance, feel free to reach out to us.\n\nBest regards,\nThe MathGoesRetro Team`,
    };

    await transporter.sendMail(mailOptions);
    return `Password reset email sent to ${email}`;
  },

  // New method to update password
  async updatePasswordByUsername(email) {
    try {
      // Step 1: Fetch the user by username
      const user = await this.getUserByEmail(email); // Use email or username based on your requirement

      // Step 2: Generate a new random password
      const randomPassword = generateRandomPassword();

      // Step 4: Update the user's password in the database
      const updatedUser = await this.updateUser(user.user_id, {
        username: user.username,
        email: user.email,
        password: randomPassword,
        role: user.role,
        account_status: user.account_status,
      });

      // Step 5: Send the new password to the user
      await this.sendPasswordResetEmail(user.email, randomPassword);

      return `Password has been reset. A new password has been sent to ${user.email}.`;
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

};

module.exports = User;