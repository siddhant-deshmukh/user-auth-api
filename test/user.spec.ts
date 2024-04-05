import mongoose from "mongoose";
import User from "../src/models/users";
import { expect } from 'chai';
import request from "supertest"
import app from "../src/app";

const env = process.env.NODE_ENV || 'development';

let userId = '';

describe("api/users", () => {
  before(async () => {
    await User.deleteMany({});
  });

  after(async () => {
    mongoose.disconnect();
  });

  it("should connect and disconnect to mongodb", async () => {
    // console.log(mongoose.connection.states);
    mongoose.disconnect();
    mongoose.connection.on('disconnected', () => {
      expect(mongoose.connection.readyState).to.equal(0);
    });
    mongoose.connection.on('connected', () => {
      expect(mongoose.connection.readyState).to.equal(1);
    });
    mongoose.connection.on('error', () => {
      expect(mongoose.connection.readyState).to.equal(99);
    });

    const test_cs = process.env.MONGODB_CONNECTION_STRING_TEST
    if (test_cs)
      await mongoose.connect(test_cs);
  });

  // describe("GET /", () => {
  //   it("should return all users", async () => {
  //     const users = [
  //       { name: "george", email: "geo@gmail.com", country: "romania" },
  //       { name: "maria", email: "maria@gmail.com", country: "spain" }
  //     ];
  //     await User.insertMany(users);
  //     const res = await request(app).get("/api/users");
  //     expect(res.status).to.equal(200);
  //     expect(res.body.length).to.equal(2);
  //   });
  // });

  // describe("GET/:id", () => {
  //   it("should return a user if valid id is passed", async () => {
  //     const user = new User({
  //       name: "florian",
  //       email: "florian@gmail.com",
  //       country: "germany"
  //     });
  //     await user.save();
  //     const res = await request(app).get("/api/users/" + user._id);
  //     expect(res.status).to.equal(200);
  //     expect(res.body).to.have.property("name", user.name);
  //   });

  //   it("should return 400 error when invalid object id is passed", async () => {
  //     const res = await request(app).get("/api/users/1");
  //     expect(res.status).to.equal(400);
  //   });

  //   it("should return 404 error when valid object id is passed but does not exist", async () => {
  //     const res = await request(app).get("/api/users/5f43ef20c1d4a133e4628181");
  //     expect(res.status).to.equal(404);
  //   });
  // });

  describe("POST /", () => {
    it("should add user to the database", async () => {
      const validUsers = [
        {
          msg: "Normal body",
          user: {
            name: "Duggu",
            email: "Meow@meow.com",
            password: "password"
          },
        },
        {
          msg: "Minimum password length",
          user: {
            name: "Duggu",
            email: "Meow1@meow.com",
            password: "12345"
          },
        },
        {
          msg: "Maximum password length",
          user: {
            name: "Duggu",
            email: "Meow2@meow.com",
            password: "12345123451234512345"
          },
        },
        {
          msg: "Maximum name length",
          user: {
            name: "12345678901234567890123456789012345678901234567890",
            email: "Meow3@meow.com",
            password: "password"
          },
        },
        {
          msg: "Minimum name length",
          user: {
            name: "1",
            email: "Meow4@meow.com",
            password: "password"
          },
        },
      ];
      const resPromiseArr = validUsers.map(async ({ msg, user }) => {
        return await request(app)
          .post("/register")
          .send(Object.assign({}, user));
      });
      const res = await Promise.all(resPromiseArr);
      const promiseArr = res.map(async (res, index) => {
        const realUser = validUsers[index].user;
        const data = res.body;
        expect(res.status).to.equal(201);
        expect(data).to.have.property("token");
        expect(data).to.have.property("user");
        expect(data.user).to.have.property("_id");
        expect(data.user).to.have.property("name", realUser.name);
        expect(data.user).to.have.property("email", realUser.email);

        const user = await User.findOne({ email: realUser.email.toLowerCase() });
        expect(user?.name).to.equal(realUser.name);
        expect(user?.email).to.equal(realUser.email.toLowerCase());
        expect(user?.password).not.equal(realUser.password);
      });

      await Promise.all(promiseArr);
    });
  });

  // describe("PUT /:id", () => {
  //   it("should update the existing user and return 200", async () => {
  //     const user = new User({
  //       name: "lola",
  //       email: "lola@gmail.com",
  //       country: "spain"
  //     });
  //     await user.save();

  //     const res = await request(app)
  //       .put("/api/users/" + user._id)
  //       .send({
  //         name: "juan",
  //         email: "juan@gmail.com",
  //         country: "spain"
  //       });

  //     expect(res.status).to.equal(200);
  //     expect(res.body).to.have.property("name", "juan");
  //     expect(res.body).to.have.property("email", "juan@gmail.com");
  //     expect(res.body).to.have.property("country", "spain");
  //   });
  // });

  // describe("DELETE /:id", () => {
  //   it("should delete requested id and return response 200", async () => {
  //     const user = new User({
  //       name: "george",
  //       email: "geo@gmail.com",
  //       country: "spain"
  //     });
  //     await user.save();
  //     userId = user._id;
  //     const res = await request(app).delete("/api/users/" + userId);
  //     expect(res.status).to.be.equal(200);
  //   });

  //   it("should return 404 when deleted user is requested", async () => {
  //     let res = await request(app).get("/api/users/" + userId);
  //     expect(res.status).to.be.equal(404);
  //   });
  // });
});