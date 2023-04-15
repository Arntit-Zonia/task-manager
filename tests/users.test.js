const request = require("supertest");

const app = require("../src/app");
const { mockUserId, mockUser, bearerToken, setUpDatabase } = require("./fixtures/db");

const User = require("../src/models/users");

describe("Users", () => {
  beforeEach(async () => {
    await setUpDatabase();
  });

  describe("GET requests", () => {
    it("should get profile for user", async () => {
      const user = await request(app).get("/users/me").set("Authorization", bearerToken);

      expect(user.status).toBe(200);
    });

    it("should not get profile for unauthenticated user", async () => {
      const user = await request(app).get("/users/me");

      expect(user.status).toBe(401);
    });

    it("should get user's avatar image", async () => {
      const avatar = await request(app).get(`/users/${mockUserId}/avatar`).set("Authorization", bearerToken);

      expect(avatar.status).toBe(200);
      expect(avatar.header["content-type"]).toBe("image/png");
    });
  });

  describe("POST requests", () => {
    it("should create a new user", async () => {
      const newUser = {
        name: "fourth-user",
        password: "123456789",
        email: "fourth@random.com",
      };

      const response = await request(app).post("/users").send(newUser);

      expect(response.status).toBe(201);

      const user = await User.findOne({ name: newUser.name, email: newUser.email });

      expect(user.name).toBe(newUser.name);
      expect(user.email).toBe(newUser.email);
    });

    it("should login existing user", async () => {
      const {
        body: { token },
        status,
      } = await request(app).post("/users/login").send({
        email: mockUser.email,
        password: mockUser.password,
      });
      const newToken = await User.findById(mockUserId);

      expect(token).toBe(newToken.tokens[1].token);
      expect(status).toBe(200);
    });

    it("should not login nonexistent user", async () => {
      const user = await request(app).post("/users/login").send({
        email: "fourth@random.com",
        password: "12345",
      });

      expect(user.status).toBe(500);
    });

    it("should upload avatar image", async () => {
      const uploadedAvatar = await request(app)
        .post("/users/me/avatar")
        .set("Authorization", bearerToken)
        .attach("avatar", "tests/fixtures/assets/test.jpg");
      const user = await User.findById(mockUserId);

      expect(uploadedAvatar.status).toBe(200);
      expect(user.avatar).toEqual(expect.any(Buffer));
    });

    it("should logout the authenticated user from the current session", async () => {
      const loggedOutUser = await request(app).post("/users/logout").set("Authorization", bearerToken);

      expect(loggedOutUser.status).toBe(200);

      const user = await User.findById(mockUserId);
      expect(user.tokens.length).toBe(0);
    });

    it("should logout the authenticated user from all sessions", async () => {
      await User.findByIdAndUpdate(mockUserId, {
        $push: {
          tokens: {
            token: "mockToken",
          },
        },
      });

      const loggedOutUser = await request(app).post("/users/logoutAll").set("Authorization", bearerToken);

      expect(loggedOutUser.status).toBe(200);

      const user = await User.findById(mockUserId);
      expect(user.tokens.length).toBe(0);
    });
  });

  describe("PATCH requests", () => {
    it("should update valid user fields", async () => {
      const response = await request(app).patch("/users/me").set("Authorization", bearerToken).send({
        name: "updated-name",
      });
      const updatedField = await User.findById(mockUserId);

      expect(response.status).toBe(200);
      expect(updatedField.name).toBe("updated-name");
    });

    it("should not update invalid user fields", async () => {
      const updatedField = await request(app).patch("/users/me").set("Authorization", bearerToken).send({
        foo: "test",
      });

      expect(updatedField.status).toBe(400);
    });
  });

  describe("DELETE requests", () => {
    it("should delete user account", async () => {
      const user = await request(app).delete("/users/me").set("Authorization", bearerToken);
      const deletedUser = await User.findById(mockUserId);

      expect(user.status).toBe(200);
      expect(deletedUser).toBeNull();
    });

    it("should not delete user account for unauthenticated user", async () => {
      const user = await request(app).delete("/users/me");

      expect(user.status).toBe(401);
    });
  });

  it("should delete the avatar image for the authenticated user", async () => {
    const deletedAvatar = await request(app).delete("/users/me/avatar").set("Authorization", bearerToken);

    expect(deletedAvatar.status).toBe(200);

    const user = await User.findById(mockUserId);
    expect(user.avatar).toBeUndefined();
  });
});
