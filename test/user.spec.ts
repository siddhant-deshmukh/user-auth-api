import { expect } from 'chai';
import request from "supertest"
import mongoose from "mongoose";

import '../src/global';
import app from "../src/app";
import User, { IUserCreate } from "../src/models/users";

describe("/", () => {
  before(async () => {
    mongoose.disconnect();

    const test_cs = process.env.MONGODB_CONNECTION_STRING_TEST
    if (test_cs)
      await mongoose.connect(test_cs);

    await User.deleteMany({});
  });

  after(async () => {
    mongoose.disconnect();
  });

  describe("GET /", async () => {
    it(`valid autherization`, async () => {
      const createUser = { name: "duggu", email: "duggu@gmail.com", password: "password" }
      const registerRes = await request(app)
        .post("/register")
        .send(createUser as IUserCreate)

      const data01 = registerRes.body;
      expect(registerRes.status).to.equal(201);
      expect(data01).to.have.property("token");
      expect(data01).to.have.property("user");
      expect(data01.user).not.have.property("password")
      expect(data01.user).to.have.property("_id");
      expect(data01.user).to.have.property("name", createUser.name);
      expect(data01.user).to.have.property("email", createUser.email.toLowerCase());

      const token = data01.token

      const res = await request(app)
        .get("/")
        .set('Authorization', `Bearer ${token}`);


      const data = res.body;
      expect(res.status).to.equal(200);
      expect(data).to.have.property("user");
      expect(data.user).not.have.property("password")
      expect(data.user).to.have.property("_id");
      expect(data.user).to.have.property("name", createUser.name);
      expect(data.user).to.have.property("email", createUser.email.toLowerCase());
    })

    it(`invalid autherization: wrong token syntax 01`, async () => {
      const createUser = { name: "duggu", email: "duggu1@gmail.com", password: "password" }
      const registerRes = await request(app)
        .post("/register")
        .send(createUser as IUserCreate)

      const data01 = registerRes.body;
      expect(registerRes.status).to.equal(201);
      expect(data01).to.have.property("token");
      expect(data01).to.have.property("user");
      expect(data01.user).not.have.property("password")
      expect(data01.user).to.have.property("_id");
      expect(data01.user).to.have.property("name", createUser.name);
      expect(data01.user).to.have.property("email", createUser.email.toLowerCase());

      const token = data01.token

      const res = await request(app)
        .get("/")
        .set('Authorization', `Bearer${token}`);


      const data = res.body;
      expect(res.status).to.equal(401);
      expect(data).not.have.property("user");
    })

    it(`invalid autherization: wrong token syntax 02`, async () => {
      const createUser = { name: "duggu", email: "duggu2@gmail.com", password: "password" }
      const registerRes = await request(app)
        .post("/register")
        .send(createUser as IUserCreate)

      const data01 = registerRes.body;
      expect(registerRes.status).to.equal(201);
      expect(data01).to.have.property("token");
      expect(data01).to.have.property("user");
      expect(data01.user).not.have.property("password")
      expect(data01.user).to.have.property("_id");
      expect(data01.user).to.have.property("name", createUser.name);
      expect(data01.user).to.have.property("email", createUser.email.toLowerCase());

      const token = data01.token

      const res = await request(app)
        .get("/")
        .set('Authorization', `${token}`);


      const data = res.body;
      expect(res.status).to.equal(401);
      expect(data).not.have.property("user")
    })

    it(`invalid autherization: wrong token syntax 03`, async () => {
      const createUser = { name: "duggu", email: "duggu3@gmail.com", password: "password" }
      const registerRes = await request(app)
        .post("/register")
        .send(createUser as IUserCreate)

      const data01 = registerRes.body;
      expect(registerRes.status).to.equal(201);
      expect(data01).to.have.property("token");
      expect(data01).to.have.property("user");
      expect(data01.user).not.have.property("password")
      expect(data01.user).to.have.property("_id");
      expect(data01.user).to.have.property("name", createUser.name);
      expect(data01.user).to.have.property("email", createUser.email.toLowerCase());

      const token = data01.token

      const res = await request(app)
        .get("/")
        .set('Authorization', `meow`);


      const data = res.body;
      expect(res.status).to.equal(401);
      expect(data).not.have.property("user")
    })

    it(`invalid autherization: wrong token syntax 04`, async () => {
      const createUser = { name: "duggu", email: "duggu5@gmail.com", password: "password" }
      const registerRes = await request(app)
        .post("/register")
        .send(createUser as IUserCreate)

      const data01 = registerRes.body;
      expect(registerRes.status).to.equal(201);
      expect(data01).to.have.property("token");
      expect(data01).to.have.property("user");
      expect(data01.user).not.have.property("password")
      expect(data01.user).to.have.property("_id");
      expect(data01.user).to.have.property("name", createUser.name);
      expect(data01.user).to.have.property("email", createUser.email.toLowerCase());

      const token = data01.token

      const res = await request(app)
        .get("/")
        .set('Authorization', `${token}`);


      const data = res.body;
      expect(res.status).to.equal(401);
      expect(data).not.have.property("user")
    })

    it(`invalid autherization: invalid token`, async () => {
      const createUser = { name: "duggu", email: "duggu10@gmail.com", password: "password" }
      const registerRes = await request(app)
        .post("/register")
        .send(createUser as IUserCreate)

      const data01 = registerRes.body;
      expect(registerRes.status).to.equal(201);
      expect(data01).to.have.property("token");
      expect(data01).to.have.property("user");
      expect(data01.user).not.have.property("password")
      expect(data01.user).to.have.property("_id");
      expect(data01.user).to.have.property("name", createUser.name);
      expect(data01.user).to.have.property("email", createUser.email.toLowerCase());

      const token = data01.token as string
      let newToken = token.slice()
      newToken = newToken.replace(newToken.slice(0, 10), newToken.slice(5, 10))

      const res = await request(app)
        .get("/")
        .set('Authorization', `Bearer ${newToken}`);


      const data = res.body;
      expect(res.status).to.equal(403);
      expect(data).not.have.property("user")
    })
  });

  describe("POST /login", () => {
    it(`valid login`, async () => {
      const createUser: IUserCreate = { name: "n", email: "unique@u.com", password: "password" }

      const resB = await request(app)
        .post("/register")
        .send({ ...createUser } as IUserCreate);
      const res = await request(app)
        .post("/login")
        .send({ ...createUser } as IUserCreate);

      const data = res.body;
      expect(res.status).to.equal(200);
      expect(data).to.have.property("token");
      expect(data).to.have.property("user");
      expect(data.user).not.have.property("password")
      expect(data.user).to.have.property("_id");
      expect(data.user).to.have.property("name", createUser.name);
      expect(data.user).to.have.property("email", createUser.email.toLowerCase());
    })

    it(`invalid login: incorrect email`, async () => {
      const createUser: IUserCreate = { name: "n", email: "unique1@u.com", password: "password" }

      const res = await request(app)
        .post("/login")
        .send({ ...createUser } as IUserCreate);

      const data = res.body;
      expect(res.status).to.equal(404);
      expect(data).not.have.property("token");
      expect(data).not.have.property("user");
    })

    it(`invalid login: incorrect password`, async () => {
      const createUser: IUserCreate = { name: "n", email: "unique2@u.com", password: "password" }

      const resB = await request(app)
        .post("/register")
        .send({ ...createUser } as IUserCreate);
      const res = await request(app)
        .post("/login")
        .send({ ...createUser, password: "newpassword" } as IUserCreate);

      const data = res.body;
      expect(resB.status).to.equal(201);
      expect(res.status).to.equal(406);
      expect(data).not.have.property("token");
      expect(data).not.have.property("user");
    })
  });

  describe("POST /register", () => {
    const valid_user_test: { msg: string, user: IUserCreate }[] = [
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
    valid_user_test.forEach(({ msg, user: createUser }) => {
      it(`register new valid user:  ${msg}`, async () => {
        const res = await request(app)
          .post("/register")
          .send({ ...createUser } as IUserCreate);

        const data = res.body;
        expect(res.status).to.equal(201);
        expect(data).to.have.property("token");
        expect(data).to.have.property("user");
        expect(data.user).not.have.property("password")
        expect(data.user).to.have.property("_id");
        expect(data.user).to.have.property("name", createUser.name);
        expect(data.user).to.have.property("email", createUser.email.toLowerCase());

        const user = await User.findOne({ email: createUser.email.toLowerCase() });
        expect(user?.password).not.equal(createUser.password);
      })
    })

    const invalid_user_test: { msg: string, user: IUserCreate }[] = [
      {
        msg: "Minimum password length",
        user: {
          name: "Duggu",
          email: "Meow1@meow.com",
          password: "1234"
        },
      },
      {
        msg: "Maximum password length",
        user: {
          name: "Duggu",
          email: "Meow2@meow.com",
          password: "123451234512345123451"
        },
      },
      {
        msg: "Maximum name length",
        user: {
          name: "123456789012345678901234567890123456789012345678901",
          email: "Meow3@meow.com",
          password: "password"
        },
      },
      {
        msg: "Minimum name length",
        user: {
          name: "",
          email: "Meow4@meow.com",
          password: "password"
        },
      },
      {
        msg: "Invalid email",
        user: {
          name: "Meow",
          email: "Meow4meow.com",
          password: "password"
        },
      },
      {
        msg: "Invalid email 2",
        user: {
          name: "Meow",
          email: "Meow4@meow",
          password: "password"
        },
      },
      {
        msg: "Invalid email 3",
        user: {
          name: "Meow",
          email: "Meow4@.com",
          password: "password"
        },
      },
      {
        msg: "Invalid email 4",
        user: {
          name: "Meow",
          email: "meow.com",
          password: "password"
        },
      },
    ];
    invalid_user_test.forEach(({ msg, user: createUser }) => {
      it(`register invalid user should give 400 error:  ${msg}`, async () => {
        const res = await request(app)
          .post("/register")
          .send({ ...createUser } as IUserCreate);

        const data = res.body;
        expect(res.status).to.equal(400);
        expect(data).not.have.property("token");
        expect(data).not.have.property("user");
      })
    })

    it(`register same mail twice 409 conflict error`, async () => {
      const resB = await request(app)
        .post("/register")
        .send({ name: "n", email: "uniqueUnique@u.com", password: "password" } as IUserCreate);
      const res = await request(app)
        .post("/register")
        .send({ name: "naruto", email: "uniqueUnique@u.com", password: "password" } as IUserCreate);

      const data = res.body;
      expect(resB.status).to.equal(201);
      expect(res.status).to.equal(409);
      expect(data).not.have.property("token");
      expect(data).not.have.property("user");
    })
  });
});