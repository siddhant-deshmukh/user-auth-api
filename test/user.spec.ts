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

  // afterEach(async () => {
  //   await User.deleteMany({});
  // })

  describe("GET /", async () => {
    let token = ""
    const createUser = { name: "duggu", email: "duggu@gmail.com", password: "password" }

    before(async () => {
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

      token = data01.token
    })

    it(`valid autherization`, async () => {
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
      const res = await request(app)
        .get("/")
        .set('Authorization', `Bearer${token}`);

      const data = res.body;
      expect(res.status).to.equal(401);
      expect(data).not.have.property("user");
    })

    it(`invalid autherization: wrong token syntax 02`, async () => {
      const res = await request(app)
        .get("/")
        .set('Authorization', `${token}`);

      const data = res.body;
      expect(res.status).to.equal(401);
      expect(data).not.have.property("user")
    })

    it(`invalid autherization: wrong token syntax 03`, async () => {
      const res = await request(app)
        .get("/")
        .set('Authorization', `meow`);

      const data = res.body;
      expect(res.status).to.equal(401);
      expect(data).not.have.property("user")
    })

    it(`invalid autherization: wrong token syntax 04`, async () => {
      const res = await request(app)
        .get("/")
        .set('Authorization', `${token}`);

      const data = res.body;
      expect(res.status).to.equal(401);
      expect(data).not.have.property("user")
    })

    it(`invalid autherization: invalid token`, async () => {
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

  describe("PUT /", async () => {
    let token = ""
    let createUser = { name: "duggu", email: "simon@meow.com", password: "password" }

    before(async () => {
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

      token = data01.token
    })

    const valid_user_test: { msg: string, new_user: { name?: string, email?: string, password?: string } }[] = [
      {
        msg: "Normal body",
        new_user: {
          name: "Duggu",
          email: "Meow@meowedit.com",
          password: "password"
        },
      },
      {
        msg: "Minimum password length",
        new_user: {
          password: "12345"
        },
      },
      {
        msg: "Maximum password length",
        new_user: {
          password: "12345123451234512345"
        },
      },
      {
        msg: "Maximum name length",
        new_user: {
          name: "12345678901234567890123456789012345678901234567890",
        },
      },
      {
        msg: "Minimum name length",
        new_user: {
          name: "1",
        },
      },
    ];
    valid_user_test.forEach(({ msg, new_user }) => {
      it(`update user valid:  ${msg}`, async () => {
        // console.log(token)
        const res = await request(app)
          .put("/")
          .send({ ...new_user } as IUserCreate)
          .set('Authorization', `Bearer ${token}`);

        createUser = { ...createUser, ...new_user }
        let expected_user = { ...createUser, ...new_user, password: undefined }
        const data = res.body;
        expect(res.status).to.equal(200);
        expect(data).not.have.property("token");

        const user = await User.findOne({ email: expected_user.email.toLowerCase() });
        expect(user?.name).to.equal(expected_user.name);
      })
    });

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
    invalid_user_test.forEach(({ msg, user: new_user }) => {
      it(`update user valid:  ${msg}`, async () => {
        // console.log(token)
        const res = await request(app)
          .put("/")
          .send({ ...new_user } as IUserCreate)
          .set('Authorization', `Bearer ${token}`);

        let expected_user = { ...createUser, ...new_user, password: undefined }
        const data = res.body;
        expect(res.status).to.equal(400);
        expect(data).not.have.property("token");
      })
    });

    const check_login_change = [
      { email: "uniquepro@gmail.com", password: "new_password" },
      { password: "brand_new" },
      { email: "latest@email.com" },
    ]
    check_login_change.forEach(({ email, password }, index) => {
      it(`checking login change: No. ${index}`, async () => {
        // console.log(token)
        const new_user : { email?: string, name?: string, password?: string } = {}
        if(email) new_user.email = email;
        if(password) new_user.password = password

        const res = await request(app)
          .put("/")
          .send({ ...new_user } as IUserCreate)
          .set('Authorization', `Bearer ${token}`);

        createUser = { ...createUser, ...new_user }
        let expected_user = { ...createUser, ...new_user, password: undefined }
        const data = res.body;
        expect(res.status).to.equal(200);
        expect(data).not.have.property("token");

        const loginRes = await request(app)
          .post("/login")
          .send({ ...createUser } as IUserCreate)
          
        expect(loginRes.status).to.equal(200)
      })
    });

    it(`email repeat error`, async () => {
      // console.log(token)
      const registerRes = await request(app)
        .post("/register")
        .send({ email: "togood@to.com", password: "password", name: "name" } as IUserCreate)
        .set('Authorization', `Bearer ${token}`);
        
      expect(registerRes.status).to.equal(201);

      const res = await request(app)
        .put("/")
        .send({ ...createUser, email: "togood@to.com" } as IUserCreate)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).to.equal(409);
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