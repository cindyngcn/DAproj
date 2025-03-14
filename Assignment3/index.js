/*const express = require("express");
var cookieParser = require('cookie-parser')
const app = express();
app.use(express.json());

//Delete cors and cookieParser
const cors = require("cors");
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};

require("dotenv").config();


app.use(cors(corsOptions));
app.use(cookieParser());


const routes = require('./Routers/A3Router.js');


app.use('/', routes);
  
  app.listen(8000, () => {
    console.log("Server started on port 8000");
  });*/

  const express = require("express");
const app = express();
app.use(express.json());

require("dotenv").config();

const routes = require('./Routers/A3Router.js');

app.use('/', routes);

app.listen(8000, () => {
  console.log("Server started on port 8000");
});
