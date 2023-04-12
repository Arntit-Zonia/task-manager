require("dotenv").config();
const express = require("express");

const usersRouter = require("./routes/users");
const tasksRouter = require("./routes/tasks");

const initMongoose = require("./db/mongoose");
const middlewareErrorHandler = require("./middleware/middlewareErrorHandler");

const app = express();

initMongoose();

app.use(express.json());

app.use(usersRouter);
app.use(tasksRouter);

app.use(middlewareErrorHandler);

app.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}`));
