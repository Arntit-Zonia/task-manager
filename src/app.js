const express = require("express");

const usersRouter = require("./routes/users");
const tasksRouter = require("./routes/tasks");

const initMongoose = require("./db/mongoose");
const middlewareErrorHandler = require("./middleware/middlewareErrorHandler");

const app = express();
const port = 3000;

initMongoose();

app.use(express.json());

app.use(usersRouter);
app.use(tasksRouter);

app.use(middlewareErrorHandler);

app.listen(port, () => console.log(`Server listening on port ${port}`));
