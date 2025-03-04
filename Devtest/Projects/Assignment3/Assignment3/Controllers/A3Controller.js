const db = require('../db');
const bcrypt = require('bcryptjs');
const mail = require('../Util/emailA3');

const checkAppPermit = async (username, state, appid) => {
    try {
 
     if (state === "OPEN"){
         state = "Open";
     }
     else if (state === "TODO"){
         state = "toDoList";
     }
     else if (state === "DOING"){
         state = "Doing";
     }
     else if (state === "DONE"){
         state = "Done";
     }
     else if (state === "CREATE"){
         state = "Create";
     }
     else if (state === "CLOSED"){
         return false;
     }
 
     const query = `SELECT App_permit_${state} FROM application WHERE App_Acronym = ?`;
     const [appPermits] = await db.execute(query, [appid]);
 
     if (appPermits.length === 0) {
         return false;
     }
 
     let appPermit = "";
 
     switch(state) {
     case "Open":
         appPermit = appPermits[0].App_permit_Open;
         break;
     case "toDoList":
         appPermit = appPermits[0].App_permit_toDoList;
         break;
     case "Doing":
         appPermit = appPermits[0].App_permit_Doing;
         break;
     case "Done":
         appPermit = appPermits[0].App_permit_Done;
         break;
     case "Create":
         appPermit = appPermits[0].App_permit_Create;
         break;
     default:
         return false;
     }
     
     const [groups] = await db.execute(
         "SELECT user_group_groupName FROM user_group WHERE user_group_username = ?", [username]
     );
 
     const userGroups = groups.map(group => group.user_group_groupName);
 
     if (!userGroups.includes(appPermit)) {
         return false;
     }
 
     return true;
 
 
    }
     catch (err) {
      console.error("Error getting application permits:", err);
      throw err;
 };
 }

 const checkCredentials = async (username, password) => {
    try {

        const [users] = await db.execute("SELECT * FROM user WHERE username = ?", [username]);
        if (users.length === 0) {
            return false;
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        return isMatch;
    } catch (err) {
        console.error("Error checking credentials:", err);
        throw err;
    }
 }

 const createTask = async (req, res) => {
    const connection = await db.getConnection(); 
    try {
        await connection.beginTransaction();

        if (Object.keys(req.query).length > 0){
            await connection.rollback();
            return res.status(400).json({ code: 'E1002' }); 
        }

        // Check App Permit
        const { task_app_acronym, task_name, task_description, task_plan, username, password } = req.body;


        //PAYLOAD ERRORS 
        
        if (!task_app_acronym || typeof task_app_acronym !== 'string') {
            await connection.rollback();
            return res.status(400).json({ code: 'E2004' });
        }


        // Validate required fields

        if (!task_name || typeof task_name !== 'string') {
            await connection.rollback();
            return res.status(400).json({ code: 'E2003' });
        }
        if (task_plan && typeof task_plan !== 'string') {
            await connection.rollback();
            return res.status(400).json({ code: 'E2005' });
        }
        if (task_description && typeof task_description !== 'string') {
            await connection.rollback();
            return res.status(400).json({ code: 'E2006' });
        }

        
        
        // Validate formats
        const nameRegex = /^[a-zA-Z0-9 ]{1,50}$/;
        const planRegex = /^[a-zA-Z0-9_ -]{1,50}$/;
        if (!nameRegex.test(task_name)) {
            await connection.rollback();
            return res.status(400).json({ code: 'E2003' });
        }
        if (task_plan && !planRegex.test(task_plan)) {
            await connection.rollback();
            return res.status(400).json({ code: 'E2005' });
        }
        if (task_description && task_description.length > 65535) {
            await connection.rollback();
            return res.status(400).json({ code: 'E2006' });
        }


        //IAM ERRORS 

        if (!username || typeof username !== 'string') {
            await connection.rollback();
            return res.status(400).json({ code: 'E2001' });
        }
        if (!password || typeof password !== 'string') {
            await connection.rollback();
            return res.status(400).json({ code: 'E2002' });
        }

        // Check username and password
        const isMatch = await checkCredentials(username, password);
        if (!isMatch) {
            await connection.rollback();
            return res.status(401).json({ code: 'E3001' });
        }

        //TRANSACTION ERRORS 
        if (!(await checkAppPermit(username, "CREATE", task_app_acronym))) {
            await connection.rollback();
            return res.status(403).json({ code: 'E3002' });
        }
        
        const [app_r_number] = await connection.execute("SELECT App_RNumber FROM application WHERE App_Acronym = ?", [task_app_acronym]);
        if (app_r_number.length === 0) {
            await connection.rollback();
            return res.status(400).json({ code: 'E3002' });
        }        
        
        // Check if task plan exists (if provided)
        if (task_plan) {
            const [plan] = await connection.execute("SELECT * FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?", [task_plan, task_app_acronym]);
            if (plan.length === 0) {
                await connection.rollback();
                return res.status(400).json({ code: 'E4002' });
            }
        }

        // Create Task
        const app_r_number_value = app_r_number[0].App_RNumber;

        // Check if the max value for App_RNumber has been reached
        if (app_r_number_value === 2147483647) {
            await connection.rollback();
            return res.status(400).json({ code: 'E4004' });
        }
    
        // Generate the task_id using the current App_RNumber
        const task_id = `${task_app_acronym}_${app_r_number_value}`;
        
        const task_creator = username;
        const task_createDate = new Date();
        const task_state = "OPEN";

        // Check if the task_id already exists
        const [existingTask] = await connection.execute(
            'SELECT Task_id FROM task WHERE Task_id = ?',
            [task_id]
        );
    
        // If the task_id already exists, increment App_RNumber and retry
        if (existingTask.length > 0) {
            // Increment App_RNumber for the next task
            const new_app_r_number = app_r_number_value + 1;
    
            // Update the App_RNumber in the application table to reflect the increment
            await connection.execute(
                'UPDATE application SET App_RNumber = ? WHERE App_Acronym = ?',
                [new_app_r_number, task_app_acronym]
            );
    
            // Re-generate the Task_id after incrementing the App_RNumber
            const new_task_id = `${task_app_acronym}_${new_app_r_number}`;
    
            // Insert the task into the database with the updated Task_id
            await connection.execute(
                "INSERT INTO Task (Task_id, Task_name, Task_description, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [new_task_id, task_name, task_description || null, task_plan || null, task_app_acronym, task_state, task_creator, task_creator, task_createDate]
            );
        } else {
            // If the task_id doesn't exist, proceed with the initial task creation
            await connection.execute(
                "INSERT INTO Task (Task_id, Task_name, Task_description, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [task_id, task_name, task_description || null, task_plan || null, task_app_acronym, task_state, task_creator, task_creator, task_createDate]
            );
        }
    
        // Increment the App_RNumber for the next task
        const new_app_r_number = app_r_number_value + 1;
    
        // Update the App_RNumber in the application table to reflect the increment
        await connection.execute(
            'UPDATE application SET App_RNumber = ? WHERE App_Acronym = ?',
            [new_app_r_number, task_app_acronym]
        );
    
        // Commit the transaction if all operations succeed
        await connection.commit();
    
        res.json({ 
            code: 'S0001',
            task_id: task_id 
         });
         
    } catch (err) {
        await connection.rollback();
        console.error("Error creating task:", err);
        res.status(500).json({ message: 'Internal server error', error: err });
    } finally {
        connection.release();
    }
};

/*const getTaskbyState = async (req, res) => {
    //no transaction as it is a read operation
    const connection = await db.getConnection();
    try {
        const { username, password, task_app_acronym, state } = req.body;

        if (!state || typeof state !== 'string' || !['OPEN', 'TODO', 'DOING', 'DONE', 'CLOSED'].includes(state.toUpperCase())) {
            return res.status(400).json({ message: 'Invalid or missing task state' });
        }


        if (!task_app_acronym || typeof task_app_acronym !== 'string') {
            return res.status(400).json({ message: 'Invalid or missing task application acronym' });
        }

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ message: 'Invalid or missing username' });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Invalid or missing password' });
        }

        const isMatch = await checkCredentials(username, password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        try {
        const [tasks] = await connection.execute("SELECT * FROM task WHERE Task_state = ? AND Task_app_Acronym = ?", [state, task_app_acronym]);
        res.json(tasks);
        }
        catch (err) {
            //task app acronym not found
            return res.status(500).json({ message: 'Failed to get tasks' });
        }


    } catch (err) {
        console.error("Error getting tasks by state:", err);
        res.status(500).json({ message: 'Internal server error', error: err });
    } 
};*/

const getTaskbyState = async (req, res) => {
    //no transaction as it is a read operation
    const connection = await db.getConnection();
    try {
        const { username, password, task_app_acronym, state } = req.body;

        if (!state || typeof state !== 'string' || !['OPEN', 'TODO', 'DOING', 'DONE', 'CLOSED'].includes(state.toUpperCase())) {
            return res.status(400).json({ code: 'E2008' });
        }

        if (!task_app_acronym || typeof task_app_acronym !== 'string') {
            return res.status(400).json({ code: 'E2004' });
        }

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ code: 'E2001' });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ code: 'E2002' });
        }

        const isMatch = await checkCredentials(username, password);
        if (!isMatch) {
            return res.status(401).json({ code: 'E3001' });
        }

        
            const [tasks] = await connection.execute("SELECT * FROM task WHERE Task_state = ? AND Task_app_Acronym = ?", [state, task_app_acronym]);

            const formattedTasks = tasks.map(task => {
                console.log('Task notes:', task.Task_notes); // Debugging log

                let parsedNotes = {};  // Default to an empty object if the note is invalid or empty

                try {
                    // Check if the notes are valid JSON
                    if (task.Task_notes) {
                        parsedNotes = JSON.parse(task.Task_notes);
                    } else {
                        // If no notes are provided, set it as an empty JSON object
                        parsedNotes = { message: "[]" };
                    }
                } catch (error) {
                    // If JSON parsing fails, set the notes as a default object
                    console.error('Failed to parse task notes:', error);
                    parsedNotes = { message: "[]" }; // Indicate a parsing error
                }

                return {
                    task_id: task.Task_id,
                    task_app_acronym: task.Task_app_Acronym,
                    task_plan: task.Task_plan,
                    task_state: task.Task_state,
                    task_name: task.Task_name,
                    task_description: task.Task_description,
                    task_owner: task.Task_owner,
                    task_creator: task.Task_creator,
                    task_createDate: task.Task_createDate,
                    task_notes: parsedNotes // Ensure the notes are always returned as JSON
                };
            });

            res.json({
                code: 'S0001',
                tasks: formattedTasks
            });
        

    } catch (err) {
        console.error("Error getting tasks by state:", err);
        res.status(500).json({ message: 'Internal server error', error: err });
    }
};

const promoteTask2Done = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { username, password, task_id, notes } = req.body;

        
        if(!task_id || typeof task_id !== 'string') {
            await connection.rollback();
            return res.status(400).json({ code: 'E2007' });
        }

        if(notes && typeof notes !== 'string') {
            await connection.rollback();
            return res.status(400).json({ code: 'E2009' });
        }

        if (notes && notes.length > 4294967295) {
            await connection.rollback();
            return res.status(400).json({ code: 'E4004' });
        }

        if (!username || typeof username !== 'string') {
            await connection.rollback();
            return res.status(400).json({ code: 'E2001' });
        }
        if (!password || typeof password !== 'string') {
            await connection.rollback();
            return res.status(400).json({ code: 'E2002' });
        }
        
        const isMatch = await checkCredentials(username, password);
        if (!isMatch) {
            await connection.rollback();
            return res.status(401).json({ code: 'E3001' });
        }

        const [task] = await connection.execute("SELECT * FROM task WHERE Task_id = ?", [task_id]);
        if (task.length === 0) {
            await connection.rollback();
            return res.status(400).json({ code: 'E3002' });
        }

        const task_state = task[0].Task_state;
        if (task_state !== 'DOING') {
            await connection.rollback();
            return res.status(400).json({ code: '4002' });
        }

        /*const note = {
            text: notes,
            user: username,
            date_posted: new Date(),
            type: 'comment',
            currState: task[0].Task_state,
        }*/

        let parsedNotes = task[0]?.Task_notes ? JSON.parse(task[0].Task_notes) : [];

        if (notes){
            const note = {
                text: notes,
                user: username,
                date_posted: new Date(),
                type: "comment",
                currentState: task[0].Task_state,
            }

        parsedNotes.unshift(note);
        }

        //Don't need this??
        //parsedNotes = notes ? parsedNotes : null;

        const task_app_acronym = task[0].Task_app_Acronym;
        if (!(await checkAppPermit(username, 'DOING', task_app_acronym))) {
            await connection.rollback();
            return res.status(403).json({ code: 'E3002' });
        }

        await connection.execute("UPDATE task SET Task_state = 'DONE', Task_notes = ? WHERE Task_id = ?", [ parsedNotes, task_id]);
        mail({ app_acronym: task[0].Task_app_Acronym, task_id: task_id });


        await connection.commit();
        res.json({ code: 'S0002' });

    } catch (err) {
        await connection.rollback();
        console.error("Error promoting task to DONE:", err);
        res.status(500).json({ code: 'E5001'});
    } finally {
        connection.release();
    }
}


module.exports = {createTask, getTaskbyState, promoteTask2Done};