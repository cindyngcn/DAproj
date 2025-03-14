const nodemailer = require("nodemailer");
const db = require("../db");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function mail({ app_acronym, task_id }) {

    const [appPermit] = await db.execute("SELECT App_permit_Done FROM application WHERE App_Acronym = ?", [app_acronym]);

    const group = appPermit[0].App_permit_Done;

    const [users] = await db.execute("SELECT user_group_username FROM user_group WHERE user_group_groupName = ?", [group]);

    const usernames = users.map(user => user.user_group_username);

    const [emails] = await db.execute(
        `SELECT email FROM user WHERE username IN (${usernames.map(() => '?').join(',')}) AND enabled = 1`, 
        usernames
    );

    const emailList = emails.map(email => email.email);
    
    const subject = `${app_acronym} - New task in Done state for review! - ${task_id}`;
    const text = `New Task for review in ${app_acronym}! Log in to approve/reject`;

    let message = {
      from: '" TMS System 👻" <rossie.marks@ethereal.email>', // sender address
      to: emailList, // list of receivers
      subject: subject,
      text: text,
    };

    try{
      const info = await transporter.sendMail(message, (error, info) => {
      if (error) {
        return null;
      }
      console.log("Message sent: %s", info.messageId);
    });
    }
    catch (err) {
      console.log("Email error", err);
    }
}



module.exports = mail;