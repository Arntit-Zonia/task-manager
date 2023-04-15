const request = require("supertest");

const app = require("../src/app");
const { mockTaskOne, bearerToken, otherTaskMockId, setUpDatabase } = require("./fixtures/db");

const Task = require("../src/models/tasks");

describe("Tasks", () => {
  beforeEach(async () => {
    await setUpDatabase();
  });

  describe("GET", () => {
    it("should get a specific task for an authenticated user", async () => {
      const {
        status,
        body: { description },
      } = await request(app).get(`/tasks/${mockTaskOne._id}`).set("Authorization", bearerToken);

      expect(status).toBe(200);
      expect(description).toBe(mockTaskOne.description);
    });

    it("should not get a task for an unauthenticated user", async () => {
      const response = await request(app).get(`/tasks/${mockTaskOne._id}`);

      expect(response.status).toBe(401);
    });

    it("should get all tasks for an authenticated user", async () => {
      const { status, body } = await request(app).get("/tasks").set("Authorization", bearerToken);

      expect(status).toBe(200);
      expect(body.length).toBe(2);
    });

    it("should get filtered tasks with query parameters for an authenticated user", async () => {
      const { status, body } = await request(app)
        .get("/tasks?completed=false&limit=1&skip=1&sortBy=createdAt:desc")
        .set("Authorization", bearerToken);

      expect(status).toBe(200);
      expect(body.length).toBe(0);
    });

    it("should not get a task that belongs to another user", async () => {
      const otherTask = {
        _id: otherTaskMockId,
        description: "Task from another user",
        completed: false,
        owner: otherTaskMockId,
      };

      await new Task(otherTask).save();

      const { status } = await request(app).get(`/tasks/${otherTask._id}`).set("Authorization", bearerToken);
      expect(status).toBe(404);
    });
  });

  describe("POST", () => {
    it("should create task for user", async () => {
      const newTask = {
        description: "new-task",
        completed: true,
      };

      const { status } = await request(app).post("/tasks").send(newTask).set("Authorization", bearerToken);
      const task = await Task.findOne(newTask);

      expect(status).toBe(201);
      expect(task).not.toBeNull();
    });
  });

  describe("PATCH", () => {
    it("should update an existing task", async () => {
      const description = "updated-description";
      const { status } = await request(app)
        .patch(`/tasks/${mockTaskOne._id}`)
        .send({ description })
        .set("Authorization", bearerToken);
      const updatedTask = await Task.findById(mockTaskOne._id);

      expect(status).toBe(200);
      expect(updatedTask.description).toBe(description);
    });

    it("should not update a task with invalid field", async () => {
      const { status } = await request(app)
        .patch(`/tasks/${mockTaskOne._id}`)
        .send({ invalidField: "invalid-value" })
        .set("Authorization", bearerToken);

      expect(status).toBe(400);
    });

    it("should not update a task if it is not found", async () => {
      const { status } = await request(app)
        .patch(`/tasks/${otherTaskMockId}`)
        .send({ description: "updated-description" })
        .set("Authorization", bearerToken);

      expect(status).toBe(404);
    });

    it("should not update a task for an unauthenticated user", async () => {
      const { status } = await request(app)
        .patch(`/tasks/${mockTaskOne._id}`)
        .send({ description: "updated-description" });

      expect(status).toBe(401);
    });

    it("should not update a task that belongs to another user", async () => {
      const otherTask = {
        _id: otherTaskMockId,
        description: "Task from another user",
        completed: false,
        owner: otherTaskMockId,
      };

      await new Task(otherTask).save();

      const updatedDescription = "updated-description";
      const { status } = await request(app)
        .patch(`/tasks/${otherTask._id}`)
        .send({ description: updatedDescription })
        .set("Authorization", bearerToken);

      expect(status).toBe(404);
    });
  });

  describe("DELETE", () => {
    it("should delete a specific task for an authenticated user", async () => {
      const { status } = await request(app).delete(`/tasks/${mockTaskOne._id}`).set("Authorization", bearerToken);
      const deletedTask = await Task.findById(mockTaskOne._id);

      expect(status).toBe(200);
      expect(deletedTask).toBeNull();
    });

    it("should not delete a task for an unauthenticated user", async () => {
      const { status } = await request(app).delete(`/tasks/${mockTaskOne._id}`);

      expect(status).toBe(401);

      const notDeletedTask = await Task.findById(mockTaskOne._id);
      expect(notDeletedTask).not.toBeNull();
    });

    it("should not delete a task that belongs to another user", async () => {
      const otherTask = {
        _id: otherTaskMockId,
        description: "Task of another user",
        completed: false,
        owner: otherTaskMockId,
      };
      await new Task(otherTask).save();

      const { status } = await request(app).delete(`/tasks/${otherTask._id}`).set("Authorization", bearerToken);
      expect(status).toBe(404);
    });
  });
});
