const db = require('../db');  // Assuming you have your DB connection set up here

// Controller for getting all tasks
const getAllTasks = async (req, res) => {
  try {
    const query = `SELECT * FROM task`;
    const result = await db.query(query);  // Using your DB query method
    const tasks = result.rows;  // Assuming the rows are returned in an array format

    return res.status(200).json(tasks);  // Sending all tasks as JSON
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ message: 'Error fetching tasks' });
  }
};

module.exports = { getAllTasks };
