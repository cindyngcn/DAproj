const mysql = require("mysql2");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database!");
});

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

const notifyGroupOnTaskDone = (req, res) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ status: "error", message: "No token provided. Access denied." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: "error", message: "Invalid or expired token." });
    }

    const { Task_id, Task_state, Task_app_Acronym } = req.body;

    if (Task_state !== "DONE") {
      return res.status(200).json({ status: "success", message: "No notification needed." });
    }

    const getAppPermitQuery = `SELECT App_permit_Done FROM application WHERE App_Acronym = ?;`;

    connection.query(getAppPermitQuery, [Task_app_Acronym], (err, appResults) => {
      if (err) {
        console.error("Error fetching app permissions:", err);
        return res.status(500).json({ status: "error", message: "Internal server error." });
      }

      if (appResults.length === 0) {
        return res.status(404).json({ status: "error", message: "Application not found." });
      }

      const groupName = appResults[0].App_permit_Done;

      const getGroupEmailsQuery = `
        SELECT user.email FROM user
        JOIN user_group ON user.username = user_group.user_group_username
        WHERE user_group.user_group_groupName = ?;
      `;

      connection.query(getGroupEmailsQuery, [groupName], (err, userResults) => {
        if (err) {
          console.error("Error fetching user emails:", err);
          return res.status(500).json({ status: "error", message: "Internal server error." });
        }

        if (userResults.length === 0) {
          return res.status(404).json({ status: "error", message: "No users found in this group." });
        }

        const recipientEmails = userResults.map(user => user.email).join(",");

        const mailOptions = {
          from: `"Task Management System" <${process.env.ETHEREAL_USER}>`,
          to: recipientEmails,
          subject: `Task ${Task_id} has been moved to Done`,
          text: `Task ${Task_id} has been promoted to Done state. Please check the task board for more details.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            return res.status(500).json({ status: "error", message: "Failed to send notification email." });
          }

          console.log("Notification email sent:", info.messageId);
          res.status(200).json({ status: "success", message: "Notification email sent successfully." });
        });
      });
    });
  });
};

module.exports = notifyGroupOnTaskDone;
