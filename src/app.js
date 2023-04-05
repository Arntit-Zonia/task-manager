const express = require("express");

const userRouter = require("./routes/users");
const tasksRouter = require("./routes/tasks");

const initMongoose = require("./db/mongoose");

const app = express();
const port = 3000;

initMongoose();

app.use(express.json());

app.use(userRouter);
app.use(tasksRouter);

app.use((err, _req, res, _next) => {
  console.error({ err });

  res.status(err.status || 500).send({ error: err.message });
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
